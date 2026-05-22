"""Ingest architectures into ChromaDB for RAG."""

import logging
from typing import Optional

from sqlalchemy.orm import Session

from app.db.models import ArchitectureRun
from app.rag.chroma_client import ChromaDBClient
from app.rag.embeddings import EmbeddingGenerator

logger = logging.getLogger(__name__)


class ArchitectureIngestion:
    """Ingest architecture runs into ChromaDB."""

    @staticmethod
    def ingest_architecture_run(
        db: Session,
        architecture_run_id: int,
    ) -> bool:
        """Ingest a single architecture run into ChromaDB.

        Args:
            db: Database session
            architecture_run_id: ID of architecture run to ingest

        Returns:
            True if ingestion successful, False otherwise
        """
        try:
            if not ChromaDBClient.is_available():
                logger.warning("ChromaDB not available for ingestion")
                return False

            if not EmbeddingGenerator.is_available():
                logger.warning("Embedding generator not available for ingestion")
                return False

            # Fetch architecture run
            run = db.query(ArchitectureRun).filter(
                ArchitectureRun.id == architecture_run_id
            ).first()

            if not run:
                logger.warning(f"Architecture run {architecture_run_id} not found")
                return False

            # Generate embedding
            text_to_embed = run.requirements
            embedding = EmbeddingGenerator.generate_embedding(text_to_embed)

            if not embedding:
                logger.warning(f"Failed to generate embedding for run {architecture_run_id}")
                return False

            # Store in ChromaDB
            collection = ChromaDBClient.get_collection()
            if not collection:
                logger.warning("ChromaDB collection not available")
                return False

            # Prepare metadata
            metadata = {
                "style": run.architecture_style or "Unknown",
                "confidence": str(run.confidence or 0),
                "reasoning": run.reasoning or "",
                "architecture_run_id": str(run.id),
            }

            # Add to collection
            print("Adding vectors to ChromaDB")
            collection.upsert(
                ids=[f"arch_{run.id}"],
                embeddings=[embedding],
                documents=[run.requirements],
                metadatas=[metadata],
            )

            logger.info(f"Ingested architecture run {architecture_run_id} into ChromaDB")
            return True

        except Exception as e:
            logger.error(f"Failed to ingest architecture run {architecture_run_id}: {e}")
            return False

    @staticmethod
    def ingest_all_architectures(db: Session) -> dict:
        """Ingest all architecture runs into ChromaDB.

        Args:
            db: Database session

        Returns:
            Dict with ingestion stats
        """
        try:
            if not ChromaDBClient.is_available():
                logger.warning("ChromaDB not available for bulk ingestion")
                return {"total": 0, "successful": 0, "failed": 0}

            if not EmbeddingGenerator.is_available():
                logger.warning("Embedding generator not available for bulk ingestion")
                return {"total": 0, "successful": 0, "failed": 0}

            # Fetch all architecture runs
            runs = db.query(ArchitectureRun).all()
            total = len(runs)

            logger.info(f"Starting ingestion of {total} architecture runs")

            successful = 0
            failed = 0

            for run in runs:
                success = ArchitectureIngestion.ingest_architecture_run(db, run.id)
                if success:
                    successful += 1
                else:
                    failed += 1

            logger.info(
                f"Ingestion complete: {successful}/{total} successful, {failed} failed"
            )

            return {
                "total": total,
                "successful": successful,
                "failed": failed,
            }

        except Exception as e:
            logger.error(f"Failed to ingest all architectures: {e}")
            return {"total": 0, "successful": 0, "failed": 0}

    @staticmethod
    def is_collection_empty(db: Session) -> bool:
        """Check if ChromaDB collection is empty.

        Args:
            db: Database session (unused, for API consistency)

        Returns:
            True if collection is empty or unavailable
        """
        try:
            if not ChromaDBClient.is_available():
                return True

            collection = ChromaDBClient.get_collection()
            if not collection:
                return True

            return collection.count() == 0

        except Exception as e:
            logger.error(f"Failed to check collection status: {e}")
            return True
