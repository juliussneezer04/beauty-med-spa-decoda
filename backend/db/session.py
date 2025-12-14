"""
Database session management for FastAPI dependency injection.
"""

from collections.abc import Generator
from sqlalchemy.orm import Session, sessionmaker
from db.engine import create_sqlalchemy_engine

# Create engine and session factory
engine = create_sqlalchemy_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """
    Dependency that provides a database session.
    Yields a session and ensures it's closed after use.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
