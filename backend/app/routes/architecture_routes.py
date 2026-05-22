from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.schemas import (
    ArchitectureRequest,
    ArchitectureResponse
)

from app.services.architecture_service_enhanced import ArchitectureService
from app.db import get_db
from app.db.crud import ArchitectureCRUD

class StatusUpdate(BaseModel):
    status: str

router = APIRouter(
    prefix="/architecture",
    tags=["Architecture"]
)

@router.post(
    "/generate",
    response_model=ArchitectureResponse
)
def generate(
    request: ArchitectureRequest,
    db: Session = Depends(get_db)
):
    """Generate architecture recommendations with LLM reasoning and persistence."""
    print("Using ENHANCED architecture service")
    result = ArchitectureService.generate_architecture_with_gemini(
        request.requirements,
        db=db
    )
    return result

@router.get("/history")
def get_history(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """Get architecture generation history from database."""
    return ArchitectureService.get_architecture_history(db, skip, limit)

@router.get("/{run_id}")
def get_run(
    run_id: int,
    db: Session = Depends(get_db)
):
    """Get details of a specific architecture run."""
    result = ArchitectureService.get_architecture_run(db, run_id)
    if result is None:
        return {"error": "Architecture run not found"}
    return result

@router.patch("/{run_id}/status")
def update_status(
    run_id: int,
    status_update: StatusUpdate,
    db: Session = Depends(get_db)
):
    """Update architecture status (Draft, Approved, Rejected)."""
    run = ArchitectureCRUD.get_architecture_run(db, run_id)
    if not run:
        return {"error": "Architecture run not found"}
    
    run.status = status_update.status
    db.commit()
    db.refresh(run)
    
    result = ArchitectureService.get_architecture_run(db, run_id)
    return result if result else {"error": "Failed to update status"}

@router.post("/{run_id}/regenerate")
def regenerate_architecture(
    run_id: int,
    db: Session = Depends(get_db)
):
    """Regenerate architecture with same requirements."""
    run = ArchitectureCRUD.get_architecture_run(db, run_id)
    if not run:
        return {"error": "Architecture run not found"}
    
    # Regenerate using the same requirements
    result = ArchitectureService.generate_architecture_with_gemini(
        run.requirements,
        db=db
    )
    return result

@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    """Get system statistics."""
    return ArchitectureService.get_system_stats(db)
