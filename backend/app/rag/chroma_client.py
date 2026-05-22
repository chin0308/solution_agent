"""ChromaDB client for vector storage and similarity search."""

import logging
from typing import Optional

import chromadb
from chromadb.api.models.Collection import Collection
from chromadb.config import Settings

logger = logging.getLogger(__name__)


class ChromaDBClient:
    """Singleton ChromaDB client."""

    _client = None
    _collection = None

    @classmethod
    def initialize(cls):
        """Initialize persistent ChromaDB."""

        if cls._client is not None:
            return

        try:
            logger.info(
                "Initializing persistent ChromaDB..."
            )

            cls._client = chromadb.PersistentClient(
                path="./chroma_db",
                settings=Settings(
                    anonymized_telemetry=False
                )
            )

            cls._collection = (
                cls._client.get_or_create_collection(
                    name="architecture_memory"
                )
            )

            logger.info(
                "ChromaDB initialized successfully"
            )

        except Exception as e:
            logger.error(
                f"Failed to initialize ChromaDB: {e}"
            )
            raise

    @classmethod
    def get_collection(cls) -> Optional[Collection]:
        """Get architecture collection."""

        if cls._collection is None:
            cls.initialize()

        return cls._collection

    @classmethod
    def is_available(cls) -> bool:
        """Check ChromaDB availability."""

        try:
            return cls.get_collection() is not None
        except Exception:
            return False