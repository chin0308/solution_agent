"""PostgreSQL database connection and session management."""

import logging
from typing import Generator

from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
from sqlalchemy.orm import sessionmaker, Session, declarative_base

from app.config import settings

logger = logging.getLogger(__name__)

# SQLAlchemy declarative base for models
Base = declarative_base()

# Construct database URL
DATABASE_URL = settings.DATABASE_URL_POSTGRES


def _masked_database_url() -> str:
    """Return a safe representation of the active database URL."""

    try:
        return engine.url.render_as_string(hide_password=True)
    except Exception:
        return str(DATABASE_URL)

# Create engine
engine = create_engine(
    DATABASE_URL,
    echo=settings.ENVIRONMENT == "development",
    pool_pre_ping=True,
    pool_recycle=3600,
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_conn, connection_record):
    """Enable foreign keys for SQLite (no-op for PostgreSQL)."""
    if "sqlite" in str(engine.url):
        cursor = dbapi_conn.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()


def init_db():
    """Initialize database by creating all tables.

    NOTE: models must be imported before create_all so SQLAlchemy registers them.
    """
    logger.info("Initializing database...")
    # Ensure model modules are imported and registered with Base.metadata
    import app.db.models  # noqa: F401

    active_url = _masked_database_url()
    logger.info(f"Active database URL: {active_url}")
    print(f"Active database URL: {active_url}")

    if "sqlite" in active_url.lower():
        logger.warning("SQLite is active; persistent PostgreSQL storage is not in use.")
        print("⚠ SQLite is active; persistent PostgreSQL storage is not in use.")

    # Create tables if they do not exist; never drop existing data on startup.
    print("🔄 Ensuring tables exist without dropping existing data...")
    Base.metadata.create_all(bind=engine)
    print("✅ Database schema ensured without destructive reset")
    logger.info("Database initialization complete")


def get_db() -> Generator[Session, None, None]:
    """Get database session for dependency injection.

    Yields:
        SQLAlchemy session

    Example:
        @app.get("/items")
        def get_items(db: Session = Depends(get_db)):
            return db.query(Item).all()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


__all__ = ["Base", "engine", "SessionLocal", "init_db", "get_db"]
