"""Retrieve similar architectures from ChromaDB."""

import json
import logging
from typing import Any, Dict, List, Optional

from app.rag.chroma_client import ChromaDBClient
from app.rag.embeddings import EmbeddingGenerator

logger = logging.getLogger(__name__)


class ArchitectureRetriever:
    """Retrieve similar architectures from vector store."""

    @staticmethod
    def retrieve_similar_architectures(
        requirements: str,
        top_k: int = 3,
    ) -> Dict[str, Any]:
        """Retrieve similar architectures from ChromaDB.

        Args:
            requirements: User requirements text
            top_k: Number of similar architectures to retrieve

        Returns:
            Dict with retrieved architectures and metadata
        """
        try:
            if not ChromaDBClient.is_available():
                logger.info("ChromaDB not available, skipping retrieval")
                return {
                    "source": "none",
                    "retrieval_count": 0,
                    "results": [],
                }

            if not EmbeddingGenerator.is_available():
                logger.info("Embedding generator not available, skipping retrieval")
                return {
                    "source": "none",
                    "retrieval_count": 0,
                    "results": [],
                }

            # Generate embedding for requirements
            embedding = EmbeddingGenerator.generate_embedding(requirements)
            if not embedding:
                logger.warning("Failed to generate embedding for requirements")
                return {
                    "source": "none",
                    "retrieval_count": 0,
                    "results": [],
                }

            # Query ChromaDB
            collection = ChromaDBClient.get_collection()
            if not collection:
                logger.warning("ChromaDB collection not available")
                return {
                    "source": "none",
                    "retrieval_count": 0,
                    "results": [],
                }

            # Check if collection has data
            count = collection.count()
            if count == 0:
                logger.info("ChromaDB collection is empty, no similar architectures available")
                return {
                    "source": "none",
                    "retrieval_count": 0,
                    "results": [],
                }

            # Query for similar documents
            results = collection.query(
                query_embeddings=[embedding],
                n_results=min(top_k, count),
                include=["documents", "metadatas", "distances"],
            )

            # Process results
            architectures = []
            if results and results.get("documents"):
                for i, doc in enumerate(results["documents"][0]):
                    metadata = results["metadatas"][0][i] if results["metadatas"] else {}
                    distance = results["distances"][0][i] if results["distances"] else 0

                    # Convert distance to similarity (lower distance = higher similarity)
                    similarity = 1 / (1 + distance)

                    architectures.append({
                        "requirements": doc,
                        "style": metadata.get("style", "Unknown"),
                        "confidence": float(metadata.get("confidence", 0)),
                        "reasoning": metadata.get("reasoning", ""),
                        "similarity": round(similarity, 3),
                    })

            logger.info(f"Retrieved {len(architectures)} similar architectures")

            return {
                "source": "chromadb",
                "retrieval_count": len(architectures),
                "results": architectures,
            }

        except Exception as e:
            logger.error(f"Failed to retrieve similar architectures: {e}")
            return {
                "source": "error",
                "retrieval_count": 0,
                "results": [],
            }

    @staticmethod
    def format_retrieval_context(retrieval_results: Dict[str, Any]) -> str:
        """Format retrieval results for prompt injection.

        Args:
            retrieval_results: Results from retrieve_similar_architectures

        Returns:
            Formatted context string for Gemini prompt
        """
        if not retrieval_results.get("results"):
            return ""

        context_lines = []
        for i, arch in enumerate(retrieval_results["results"], 1):
            context_lines.append(f"### Reference Architecture {i}")
            context_lines.append(f"**Style**: {arch['style']}")
            context_lines.append(
                f"**Confidence**: {arch['confidence']}% (Similarity: {arch['similarity']})"
            )
            context_lines.append(f"**Reasoning**: {arch['reasoning']}")
            context_lines.append(f"**Original Requirements**: {arch['requirements']}")
            context_lines.append("")

        return "\n".join(context_lines)
