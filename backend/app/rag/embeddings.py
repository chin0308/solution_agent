"""Embedding generation for RAG."""

import logging
from typing import List, Optional

from sentence_transformers import SentenceTransformer

logger = logging.getLogger(__name__)


class EmbeddingGenerator:
    """Generate embeddings using sentence-transformers."""

    _instance: Optional["EmbeddingGenerator"] = None
    _model: Optional[SentenceTransformer] = None

    def __new__(cls) -> "EmbeddingGenerator":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    @classmethod
    def _initialize_model(cls) -> None:
        """Lazy-load embedding model only when needed."""
        if cls._model is not None:
            return

        try:
            model_name = "all-MiniLM-L6-v2"

            logger.info(
                f"Loading embedding model: {model_name}"
            )

            cls._model = SentenceTransformer(model_name)

            logger.info(
                "Embedding model loaded successfully"
            )

        except Exception as e:
            logger.error(
                f"Failed to initialize embedding model: {e}"
            )
            raise

    @classmethod
    def generate_embedding(
        cls,
        text: str
    ) -> Optional[List[float]]:
        """Generate embedding for text."""

        try:
            if not text or not text.strip():
                return None

            # Lazy initialization
            cls._initialize_model()

            if cls._model is None:
                logger.error(
                    "Embedding model not initialized"
                )
                return None

            embedding = cls._model.encode(
                text,
                convert_to_numpy=False
            )

            return (
                embedding.tolist()
                if hasattr(embedding, "tolist")
                else list(embedding)
            )

        except Exception as e:
            logger.error(
                f"Failed to generate embedding: {e}"
            )
            return None

    @classmethod
    def is_available(cls) -> bool:
        """Check if embedding model can load."""

        try:
            cls._initialize_model()
            return cls._model is not None
        except Exception:
            return False