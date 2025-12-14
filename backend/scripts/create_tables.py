"""
Script to create all database tables from SQLAlchemy models.

This script uses the Declarative Base metadata to emit DDL statements
and create all tables in the database. It also ensures all indexes are created.

Note: If tables already exist, this will not modify them. Use add_indexes.py
to add missing indexes to existing tables, or use Alembic migrations for
proper schema versioning.
"""

import sys
from pathlib import Path

# Add the backend directory to the path so we can import models
# Get the backend directory (parent of scripts)
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from db.models import Base
from db.engine import create_sqlalchemy_engine


def create_tables():
    """Create all tables defined in the models with all indexes."""
    engine = create_sqlalchemy_engine()
    try:
        print("Creating database tables and indexes...")
        # create_all() will create tables and indexes if they don't exist
        # However, it won't modify existing tables, so indexes on existing
        # tables won't be added automatically
        Base.metadata.create_all(engine, checkfirst=True)
        print("✓ All tables created successfully!")
        print("\nNote: If tables already existed, run 'python scripts/add_indexes.py'")
        print("      to ensure all indexes from models are present in the database.")
    except Exception as e:
        print(f"✗ Failed to create tables: {e}")
        sys.exit(1)


if __name__ == "__main__":
    create_tables()
