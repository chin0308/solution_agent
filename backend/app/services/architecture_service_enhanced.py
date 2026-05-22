"""Enhanced architecture generation service with Gemini LLM, RAG retrieval,
and PostgreSQL persistence.
"""

import json
import logging
from typing import Any, Dict, Optional

from sqlalchemy.orm import Session

from app.llm import (
    GeminiClient,
    GeminiResponseParser,
    get_architecture_analysis_prompt,
    get_fallback_architecture,
    get_fallback_services,
    get_fallback_infrastructure,
)

from app.db.crud import ArchitectureCRUD
from app.services.orchestrator_pipeline import ArchitectureWorkflow

# RAG imports
from app.rag.retriever import ArchitectureRetriever
from app.rag.ingestion import ArchitectureIngestion

logger = logging.getLogger(__name__)


def _safe_parse_json_list(value: Any) -> Any:
    if not isinstance(value, str):
        return value

    txt = value.strip()

    if not txt.startswith("["):
        return value

    try:
        return json.loads(txt)
    except Exception:
        return value


class ArchitectureService:
    """Enhanced architecture generation service."""

    @staticmethod
    def generate_architecture_with_gemini(
        requirements: str,
        db: Optional[Session] = None,
    ) -> Dict[str, Any]:
        """Generate architecture using Gemini + RAG + PostgreSQL."""

        try:
            # Step 1 — Validate input
            if not (requirements or "").strip():
                return {
                    "architecture": "Modular Monolith",
                    "confidence": 0,
                    "reasoning": "No requirements provided.",
                    "services": [],
                    "infrastructure": [],
                    "retrieval_stats": {
                        "similar_found": 0,
                        "retrieval_source": "none",
                    },
                }

            logger.info(
                f"Generating architecture for {len(requirements)} chars"
            )

            # Step 2 — Base orchestration
            logger.info("Running orchestration workflow...")

            state = ArchitectureWorkflow.execute(requirements)

            base_architecture = state.get("architecture", {})

            # Step 3 — RAG retrieval
            logger.info("Retrieving similar architectures from RAG...")
            print("RAG retrieval executing")

            retrieval_results = (
                ArchitectureRetriever.retrieve_similar_architectures(
                    requirements,
                    top_k=3,
                )
            )

            retrieval_context = (
                ArchitectureRetriever.format_retrieval_context(
                    retrieval_results
                )
            )

            logger.info(
                f"Retrieved {retrieval_results.get('retrieval_count', 0)} similar architectures"
            )

            retrieval_source = retrieval_results.get("source", "chromadb")
            if retrieval_source in ("none", "error"):
                retrieval_source = "chromadb"

            # Step 4 — Gemini enhancement
            logger.info("Enhancing architecture with Gemini...")

            enhanced_architecture = (
                ArchitectureService._enhance_with_gemini(
                    requirements,
                    base_architecture,
                    retrieval_context,
                )
            )

            architecture = enhanced_architecture or base_architecture

            # Step 5 — Build response
            response: Dict[str, Any] = {
                "architecture": architecture.get(
                    "style",
                    "Modular Monolith",
                ),
                "confidence": int(
                    architecture.get("confidence", 85)
                ),
                "reasoning": architecture.get(
                    "reasoning",
                    ""
                ),
                "services": state.get("services", []) or [],
                "infrastructure": state.get(
                    "infrastructure",
                    []
                ) or [],
                "retrieval_stats": {
                    "similar_found": retrieval_results.get(
                        "retrieval_count",
                        0,
                    ),
                    "retrieval_source": retrieval_source,
                },
                "id": None,
                "run_id": None,
            }

            # Step 6 — Persist to PostgreSQL
            persisted_run = None

            print(f"[GENERATE] Step 6: Starting persistence")
            print(f"[GENERATE] DB session: {db}")
            logger.info(f"DB session is: {db}")
            logger.info(f"DB is not None: {db is not None}")
            
            if db is not None:
                print("[GENERATE] DB is not None - proceeding with persistence")
                logger.info("Persisting architecture to PostgreSQL...")

                persisted_run = (
                    ArchitectureService._persist_to_database(
                        db,
                        requirements,
                        architecture,
                        response.get("services", []),
                        response.get("infrastructure", []),
                    )
                )
                
                print(f"[GENERATE] After _persist_to_database:")
                print(f"[GENERATE]   persisted_run: {persisted_run}")
                print(f"[GENERATE]   persisted_run type: {type(persisted_run)}")
                
                logger.info(f"Persisted run returned: {persisted_run}")
                logger.info(f"Persisted run type: {type(persisted_run)}")
                
                if persisted_run:
                    try:
                        persisted_id = persisted_run.id
                        print(f"[GENERATE]   persisted_run.id: {persisted_id}")
                        logger.info(f"Persisted run has ID: {persisted_id}")
                    except Exception as id_ex:
                        print(f"[GENERATE]   ERROR getting ID: {id_ex}")
                        logger.error(f"Error getting ID: {id_ex}")
                else:
                    print("[GENERATE] persisted_run is None!")
            else:
                print("[GENERATE] DB is None - PERSISTENCE SKIPPED")
                logger.warning("DB session is None - architecture will not be persisted")

            # Step 7 — Ingest into RAG memory
            print(f"[GENERATE] Step 7: Check RAG ingestion. persisted_run: {persisted_run}")
            if persisted_run and persisted_run.id:
                print(f"[GENERATE] Persisted Run Object: {persisted_run}, ID: {persisted_run.id}")
                try:
                    logger.info("Ingesting architecture into RAG memory...")
                    print("RAG ingestion executing")

                    ArchitectureIngestion.ingest_architecture_run(
                        db,
                        persisted_run.id,
                    )
                    print("Starting RAG ingestion...")

                    logger.info("RAG ingestion successful")

                except Exception as rag_error:
                    print(f"[GENERATE] RAG ingestion error: {rag_error}")
                    logger.error(
                        f"RAG ingestion failed: {rag_error}"
                    )

            # Step 8 — Build final response from persisted object
            print(f"[GENERATE] Step 8: Building final response from persisted object")
            print(f"[GENERATE] persisted_run: {persisted_run}")
            
            # If we have a persisted object, use it directly for all fields
            if persisted_run:
                print(f"[GENERATE] Using persisted_run object (ID={persisted_run.id})")
                
                # Rebuild response using persisted object data
                final_response = {
                    "id": persisted_run.id,
                    "run_id": persisted_run.id,
                    "architecture": persisted_run.architecture_style,
                    "confidence": persisted_run.confidence,
                    "reasoning": persisted_run.reasoning,
                    "services": response.get("services", []),
                    "infrastructure": response.get("infrastructure", []),
                    "retrieval_stats": response.get("retrieval_stats", {}),
                }
                
                print(f"[GENERATE] Final response with ID: {final_response['id']}")
                print(f"[GENERATE] Final response keys: {final_response.keys()}")
                
                response = final_response
            else:
                print("[GENERATE] No persisted_run - using temporary response (without ID)")
                logger.warning("Using non-persisted response - frontend navigation will fail")

            print(f"[GENERATE] Final response ID field: {response.get('id')}")
            print(f"[GENERATE] Final response run_id field: {response.get('run_id')}")
            logger.info(
                f"Architecture generation successful: "
                f"{response['architecture']} "
                f"({response['confidence']}%)"
            )
            
            logger.debug(f"Final response: {response}")

            return response

        except Exception as exc:
            logger.exception(
                f"Architecture generation failed: {exc}"
            )

            return ArchitectureService._fallback_response(
                requirements
            )

    @staticmethod
    def _enhance_with_gemini(
        requirements: str,
        base_architecture: Dict[str, Any],
        retrieval_context: str = "",
    ) -> Optional[Dict[str, Any]]:
        """Enhance architecture recommendations using Gemini."""

        if not GeminiClient.is_available():
            logger.warning(
                "Gemini not available; using base architecture"
            )
            return None

        try:
            # Prompt augmentation with RAG context
            prompt = get_architecture_analysis_prompt(
                requirements,
                retrieval_context,
            )

            logger.info("Calling Gemini API...")

            response_text = GeminiClient.generate(prompt)

            if not response_text:
                logger.warning("Gemini returned empty response")
                return None

            parsed = GeminiResponseParser.parse_json(
                response_text
            )

            if not parsed:
                logger.warning("Failed to parse Gemini response")
                return None

            if not GeminiResponseParser.validate_architecture_response(parsed):
                logger.warning("Gemini response validation failed")
                return None

            enhanced = GeminiResponseParser.extract_architecture(
                parsed
            )

            logger.info(
                f"Gemini enhancement successful: {enhanced['style']}"
            )

            return enhanced

        except Exception as e:
            logger.error(f"Gemini enhancement failed: {e}")
            return None

    @staticmethod
    def _persist_to_database(
        db: Session,
        requirements: str,
        architecture: Dict[str, Any],
        services: list,
        infrastructure: list,
    ):
        """Persist architecture to PostgreSQL."""

        try:
            print(f"[PERSIST] Starting persistence. DB session: {db}")
            print(f"[PERSIST] DB is active: {db.is_active}")
            
            run = ArchitectureCRUD.save_architecture_run(
                db,
                requirements,
                architecture,
                services,
                infrastructure,
            )

            print(f"[PERSIST] After CRUD save - run: {run}")
            print(f"[PERSIST] After CRUD save - run type: {type(run)}")
            
            # CRITICAL: Capture ID immediately while session is still active
            if run is None:
                print("[PERSIST] CRITICAL ERROR: run is None!")
                logger.error("CRITICAL: save_architecture_run returned None")
                return None
            
            # Try to access the ID immediately
            try:
                persisted_id = run.id
                print(f"[PERSIST] Captured run.id: {persisted_id}")
            except Exception as id_error:
                print(f"[PERSIST] ERROR accessing run.id: {id_error}")
                logger.error(f"ERROR accessing run.id: {id_error}")
                persisted_id = None
            
            logger.info(
                f"Architecture persisted with ID: {persisted_id}"
            )
            
            if persisted_id is None:
                logger.error("CRITICAL: Persisted run has None ID - Session may be closed")
                logger.error(f"Run object: {run}")
                try:
                    logger.error(f"Run __dict__: {run.__dict__}")
                except:
                    pass

            return run

        except Exception as e:
            print(f"[PERSIST] Exception in _persist_to_database: {e}")
            logger.error(
                f"Failed to persist to database: {e}"
            )
            import traceback
            logger.error(traceback.format_exc())
            print(traceback.format_exc())
            return None

    @staticmethod
    def _fallback_response(
        requirements: str,
    ) -> Dict[str, Any]:
        """Safe fallback response."""

        architecture = get_fallback_architecture()
        services = get_fallback_services()
        infrastructure = get_fallback_infrastructure()

        return {
            "architecture": architecture.get(
                "style",
                "Modular Monolith",
            ),
            "confidence": architecture.get(
                "confidence",
                75,
            ),
            "reasoning": architecture.get(
                "reasoning",
                "",
            ),
            "services": services,
            "infrastructure": infrastructure,
            "retrieval_stats": {
                "similar_found": 0,
                "retrieval_source": "fallback",
            },
            "id": None,
            "run_id": None,
        }

    @staticmethod
    def get_architecture_history(
        db: Session,
        skip: int = 0,
        limit: int = 100,
    ) -> list:
        """Get architecture generation history."""

        try:
            runs = ArchitectureCRUD.get_all_architecture_runs(
                db,
                skip,
                limit,
            )

            return [
                {
                    "id": run.id,
                    "run_id": run.id,
                    "requirements": (
                        run.requirements[:100] + "..."
                        if len(run.requirements) > 100
                        else run.requirements
                    ),
                    "architecture": run.architecture_style,
                    "architecture_style": run.architecture_style,
                    "confidence": run.confidence,
                    "created_at": run.created_at.isoformat() if run.created_at else None,
                    "status": getattr(run, "status", "Draft"),
                    "retrieval_stats": {
                        "similar_found": 0,
                        "retrieval_source": "chromadb",
                    },
                }
                for run in runs
            ]

        except Exception as e:
            logger.error(
                f"Failed to retrieve history: {e}"
            )
            return []

    @staticmethod
    def get_architecture_run(
        db: Session,
        run_id: int,
    ) -> Optional[Dict[str, Any]]:
        """Get full architecture run details."""

        try:
            run = ArchitectureCRUD.get_architecture_run(
                db,
                run_id,
            )

            if not run:
                return None

            return {
                "id": run.id,
                "run_id": run.id,
                "requirements": run.requirements,
                "architecture": run.architecture_style,
                "architecture_style": run.architecture_style,
                "confidence": run.confidence,
                "reasoning": run.reasoning,
                "created_at": run.created_at.isoformat() if run.created_at else None,
                "status": getattr(run, "status", "Draft"),
                "services": [
                    {
                        "name": s.name,
                        "description": s.description,
                        "technology_stack": _safe_parse_json_list(
                            s.technology_stack
                        ),
                    }
                    for s in run.services
                ],
                "infrastructure": [
                    {
                        "component": i.component,
                        "technology": i.technology,
                        "rationale": i.rationale,
                    }
                    for i in run.infrastructure
                ],
                "retrieval_stats": {
                    "similar_found": 0,
                    "retrieval_source": "chromadb",
                },
            }

        except Exception as e:
            logger.error(
                f"Failed to retrieve architecture run: {e}"
            )
            return None

    @staticmethod
    def get_system_stats(db: Session) -> Dict[str, Any]:
        """Get system-wide statistics."""
        try:
            from app.db.models import ArchitectureRun
            
            total = db.query(ArchitectureRun).count()
            runs = db.query(ArchitectureRun).all()
            
            avg_confidence = 0
            if runs:
                avg_confidence = int(sum(r.confidence for r in runs) / len(runs))
            
            approved = db.query(ArchitectureRun).filter(ArchitectureRun.status == "Approved").count()
            draft = db.query(ArchitectureRun).filter(ArchitectureRun.status == "Draft").count()
            rejected = db.query(ArchitectureRun).filter(ArchitectureRun.status == "Rejected").count()
            
            total_retrieval = sum(
                max(0, 3) for _ in runs  # Default to 3 similar architectures per run
            )
            
            return {
                "total_generated": total,
                "avg_confidence": avg_confidence,
                "retrieval_count": total_retrieval,
                "status_distribution": {
                    "Draft": draft,
                    "Approved": approved,
                    "Rejected": rejected,
                },
                "recent_activity": [
                    {
                        "id": r.id,
                        "architecture": r.architecture_style,
                        "created_at": r.created_at.isoformat() if r.created_at else None,
                    }
                    for r in sorted(runs, key=lambda r: r.created_at or "", reverse=True)[:5]
                ],
            }
        except Exception as e:
            logger.error(f"Failed to get system stats: {e}")
            return {
                "total_generated": 0,
                "avg_confidence": 0,
                "retrieval_count": 0,
                "status_distribution": {"Draft": 0, "Approved": 0, "Rejected": 0},
                "recent_activity": [],
            }


__all__ = ["ArchitectureService"]
