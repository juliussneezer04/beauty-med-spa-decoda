"""
Script to add missing indexes to existing database tables.

This script checks for indexes defined in the SQLAlchemy models and creates
any that are missing from the database. This is useful when:
- Tables were created before indexes were added to models
- Indexes were manually dropped
- You want to ensure all model indexes exist in the database
"""

import sys
from pathlib import Path
from sqlalchemy import inspect, text
from sqlalchemy.exc import ProgrammingError

# Add the backend directory to the path so we can import models
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from db.models import Base
from db.engine import create_sqlalchemy_engine


def get_existing_indexes(engine, table_name: str):
    """Get all existing indexes for a table."""
    inspector = inspect(engine)
    indexes = inspector.get_indexes(table_name)
    return {idx["name"] for idx in indexes}


def get_model_indexes():
    """Extract all indexes defined in the models."""
    model_indexes = {}

    for table_name, table in Base.metadata.tables.items():
        indexes = []

        # Get all indexes (both from index=True on columns and from __table_args__)
        # SQLAlchemy automatically creates Index objects for columns with index=True
        for index in table.indexes:
            # Skip primary key indexes
            if index.name.startswith("pk_") or any(
                col.primary_key for col in index.columns
            ):
                continue

            indexes.append(
                {
                    "name": index.name,
                    "columns": [col.name for col in index.columns],
                    "unique": index.unique or False,
                }
            )

        model_indexes[table_name] = indexes

    return model_indexes


def create_index(engine, table_name: str, index_info: dict):
    """Create an index if it doesn't exist."""
    index_name = index_info["name"]
    columns = index_info["columns"]
    unique = index_info.get("unique", False)

    # Build the CREATE INDEX statement
    columns_str = ", ".join(columns)

    # PostgreSQL supports IF NOT EXISTS for CREATE INDEX
    if unique:
        create_sql = f'CREATE UNIQUE INDEX IF NOT EXISTS "{index_name}" ON "{table_name}" ({columns_str})'
    else:
        create_sql = f'CREATE INDEX IF NOT EXISTS "{index_name}" ON "{table_name}" ({columns_str})'

    try:
        with engine.connect() as conn:
            conn.execute(text(create_sql))
            conn.commit()
        return True
    except ProgrammingError as e:
        # Index might already exist or there's a constraint issue
        print(f"  ⚠ Warning creating index {index_name}: {e}")
        return False


def add_missing_indexes():
    """Add any missing indexes to the database."""
    engine = create_sqlalchemy_engine()

    try:
        print("Checking for missing indexes...")
        print("=" * 50)

        model_indexes = get_model_indexes()
        total_added = 0
        total_existing = 0

        for table_name, indexes in model_indexes.items():
            if not indexes:
                continue

            print(f"\nTable: {table_name}")
            existing_indexes = get_existing_indexes(engine, table_name)

            for index_info in indexes:
                index_name = index_info["name"]

                if index_name in existing_indexes:
                    print(f"  ✓ Index '{index_name}' already exists")
                    total_existing += 1
                else:
                    print(
                        f"  + Creating index '{index_name}' on {', '.join(index_info['columns'])}"
                    )
                    if create_index(engine, table_name, index_info):
                        total_added += 1
                    else:
                        total_existing += 1  # Count as existing if creation failed (likely already exists)

        print("\n" + "=" * 50)
        print(f"✓ Index check completed!")
        print(f"  - Existing indexes: {total_existing}")
        print(f"  - New indexes created: {total_added}")

    except Exception as e:
        print(f"✗ Failed to add indexes: {e}")
        import traceback

        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    add_missing_indexes()
