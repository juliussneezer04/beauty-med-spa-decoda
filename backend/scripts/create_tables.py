"""
Script to create all database tables from SQLAlchemy models.

This script uses the Declarative Base metadata to emit DDL statements
and create all tables in the database.
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
    """Create all tables defined in the models."""
    engine = create_sqlalchemy_engine()
    try:
        print("Creating database tables...")
        Base.metadata.create_all(engine)
        print("✓ All tables created successfully!")
    except Exception as e:
        print(f"✗ Failed to create tables: {e}")
        sys.exit(1)


if __name__ == "__main__":
    create_tables()
