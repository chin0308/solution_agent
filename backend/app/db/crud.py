"""CRUD operations for architecture persistence."""

import json
import logging
from typing import Dict, List, Any, Optional

from sqlalchemy.orm import Session

from app.db.models import ArchitectureRun, Service, Infrastructure
from app.schemas.schemas import (
    ArchitectureRunCreateSchema,
    ArchitectureRunResponseSchema,
    ServiceCreateSchema,
    InfrastructureCreateSchema,
)

logger = logging.getLogger(__name__)


class ArchitectureCRUD:
    """CRUD operations for architecture data."""

    @staticmethod
    def save_architecture_run(
        db: Session,
        requirements: str,
        architecture: Dict[str, Any],
        services: List[Dict[str, Any]],
        infrastructure: List[Dict[str, Any]],
        retrieval_count: int = 0,
        retrieval_source: str = "chromadb",
        retrieved_architectures: Optional[List[Dict[str, Any]]] = None,
    ) -> ArchitectureRun:
        """Save a complete architecture run to database.

        Args:
            db: Database session
            requirements: Original requirements text
            architecture: Architecture analysis result
            services: List of recommended services
            infrastructure: List of infrastructure components

        Returns:
            Persisted ArchitectureRun object
        """
        try:
            print(f"[CRUD] Starting save_architecture_run")
            print(f"[CRUD] DB session: {db}")
            print(f"[CRUD] Requirements: {requirements[:50]}...")
            print(f"[CRUD] Architecture: {architecture}")
            
            # Create architecture run (ONLY fields that exist on ArchitectureRun)
            run = ArchitectureRun(
                requirements=requirements,
                architecture_style=architecture.get("style", "Unknown"),
                confidence=int(architecture.get("confidence", 80)),
                reasoning=architecture.get("reasoning", ""),
                retrieval_count=max(0, int(retrieval_count or 0)),
                retrieval_source=retrieval_source or "chromadb",
                retrieved_architectures=json.dumps(retrieved_architectures or []),
            )
            
            print(f"[CRUD] Created ArchitectureRun object: {run}")
            print(f"[CRUD] Before add - run.id: {run.id}")

            logger.debug(f"Before add - run.id: {run.id}")
            
            db.add(run)
            print(f"[CRUD] After add - run.id: {run.id}")
            logger.debug(f"After add - run.id: {run.id}")
            
            db.flush()  # Get the ID
            print(f"[CRUD] After flush - run.id: {run.id}")
            logger.debug(f"After flush - run.id: {run.id}")
            
            if run.id is None:
                print("[CRUD] CRITICAL: ID is still None after flush!")
                logger.error("CRITICAL: ID is still None after flush!")
                logger.error(f"run.__dict__: {run.__dict__}")

            # Add services
            print(f"[CRUD] Adding {len(services)} services")
            for service_data in services:
                tech_stack = service_data.get("technology_stack")
                if isinstance(tech_stack, (list, dict)):
                    tech_stack_value = json.dumps(tech_stack)
                else:
                    tech_stack_value = tech_stack or ""

                service = Service(
                    architecture_run_id=run.id,
                    name=service_data.get("name", "Unknown"),
                    description=service_data.get("description", ""),
                    technology_stack=tech_stack_value,
                )
                db.add(service)

            # Add infrastructure
            print(f"[CRUD] Adding {len(infrastructure)} infrastructure components")
            for infra_data in infrastructure:
                infra = Infrastructure(
                    architecture_run_id=run.id,
                    component=infra_data.get("component", "Unknown"),
                    technology=infra_data.get("technology", ""),
                    rationale=infra_data.get("rationale", ""),
                )
                db.add(infra)

            print(f"[CRUD] Before commit - run.id: {run.id}")
            logger.debug(f"Before commit - run.id: {run.id}")
            
            db.commit()
            print(f"[CRUD] After commit - run.id: {run.id}")
            logger.debug(f"After commit - run.id: {run.id}")
            
            db.refresh(run)
            print(f"[CRUD] After refresh - run.id: {run.id}")
            logger.debug(f"After refresh - run.id: {run.id}")
            
            if run.id is None:
                print("[CRUD] CRITICAL: ID is None after refresh!")
                logger.error("CRITICAL: ID is None after refresh!")
                logger.error(f"run.__dict__: {run.__dict__}")
            
            print(f"[CRUD] SUCCESS: Persisted architecture run {run.id}: {run.architecture_style}")
            logger.info(f"Persisted architecture run {run.id}: {run.architecture_style}")
            return run

        except Exception as e:
            print(f"[CRUD] EXCEPTION in save_architecture_run: {e}")
            db.rollback()
            logger.error(f"Failed to persist architecture run: {e}")
            import traceback
            print(traceback.format_exc())
            logger.error(traceback.format_exc())
            raise

    @staticmethod
    def get_architecture_run(db: Session, run_id: int) -> Optional[ArchitectureRun]:
        """Get a specific architecture run by ID.

        Args:
            db: Database session
            run_id: Architecture run ID

        Returns:
            ArchitectureRun or None if not found
        """
        return db.query(ArchitectureRun).filter(ArchitectureRun.id == run_id).first()

    @staticmethod
    def get_all_architecture_runs(
        db: Session,
        skip: int = 0,
        limit: int = 100,
    ) -> List[ArchitectureRun]:
        """Get all architecture runs with pagination.

        Args:
            db: Database session
            skip: Offset for pagination
            limit: Max results to return

        Returns:
            List of ArchitectureRun objects
        """
        return (
            db.query(ArchitectureRun)
            .order_by(ArchitectureRun.created_at.desc(), ArchitectureRun.id.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    @staticmethod
    def search_architecture_runs(
        db: Session,
        architecture_style: Optional[str] = None,
        min_confidence: Optional[int] = None,
    ) -> List[ArchitectureRun]:
        """Search architecture runs by criteria.

        Args:
            db: Database session
            architecture_style: Filter by architecture style
            min_confidence: Filter by minimum confidence

        Returns:
            List of matching ArchitectureRun objects
        """
        query = db.query(ArchitectureRun)

        if architecture_style:
            query = query.filter(ArchitectureRun.architecture_style == architecture_style)

        if min_confidence is not None:
            query = query.filter(ArchitectureRun.confidence >= min_confidence)

        return query.order_by(ArchitectureRun.created_at.desc()).all()

    @staticmethod
    def delete_architecture_run(db: Session, run_id: int) -> bool:
        """Delete an architecture run and its children.

        Args:
            db: Database session
            run_id: Architecture run ID

        Returns:
            True if deleted, False if not found
        """
        try:
            run = db.query(ArchitectureRun).filter(ArchitectureRun.id == run_id).first()
            if not run:
                return False

            db.delete(run)
            db.commit()
            logger.info(f"Deleted architecture run {run_id}")
            return True

        except Exception as e:
            db.rollback()
            logger.error(f"Failed to delete architecture run {run_id}: {e}")
            raise

    @staticmethod
    def get_services_for_run(db: Session, run_id: int) -> List[Service]:
        """Get all services for a specific architecture run.

        Args:
            db: Database session
            run_id: Architecture run ID

        Returns:
            List of Service objects
        """
        return db.query(Service).filter(Service.architecture_run_id == run_id).all()

    @staticmethod
    def get_infrastructure_for_run(db: Session, run_id: int) -> List[Infrastructure]:
        """Get all infrastructure for a specific architecture run.

        Args:
            db: Database session
            run_id: Architecture run ID

        Returns:
            List of Infrastructure objects
        """
        return (
            db.query(Infrastructure)
            .filter(Infrastructure.architecture_run_id == run_id)
            .all()
        )


__all__ = ["ArchitectureCRUD"]
