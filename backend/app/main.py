"""
ValueMomentum AI Architecture Agent
FastAPI Backend Application
"""

from datetime import datetime

from dotenv import load_dotenv

from fastapi import (
    FastAPI,
    UploadFile,
    File,
    HTTPException,
    BackgroundTasks,
    Depends,
)

from fastapi.middleware.cors import CORSMiddleware

# Load environment variables
load_dotenv()

# Internal imports
from app.config import settings
from app.document_parser import DocumentParser
from app.agents import (
    RequirementExtractor,
)

from app.schemas import (
    UploadResponse,
    ArchitectureApiRequest,
    ArchitectureApiResponse,
    ServiceRecommendation,
    InfrastructureRecommendation,
)

from app.routes.architecture_routes import (
    router as architecture_router,
)
from app.services.architecture_service_enhanced import ArchitectureService

# Database initialization
from app.db import init_db, get_db
from sqlalchemy.orm import Session

# =============================================================================
# IN-MEMORY STORAGE (Demo Only)
# Replace with PostgreSQL later
# =============================================================================

uploads_store: dict[str, dict] = {}
architectures_store: dict[str, dict] = {}

# =============================================================================
# FASTAPI APP
# =============================================================================

app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered architecture recommendation platform for ValueMomentum",
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)

# =============================================================================
# STARTUP EVENTS
# =============================================================================

@app.on_event("startup")
def startup_event():
    """Log active database URL on startup."""
    try:
        from app.db.database import _masked_database_url

        active_url = _masked_database_url()
        print(f"Active database URL on startup: {active_url}")
    except Exception as e:
        print(f"Database startup warning: {e}")

# =============================================================================
# CORS CONFIGURATION
# =============================================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =============================================================================
# ROUTERS
# =============================================================================

app.include_router(architecture_router)

# =============================================================================
# HEALTH ROUTES
# =============================================================================


@app.get("/", tags=["Health"])
def root():
    return {
        "message": "ValueMomentum Architecture Agent Running"
    }


@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
    }


# =============================================================================
# DOCUMENT UPLOAD
# =============================================================================


@app.post(
    "/api/upload",
    response_model=UploadResponse,
    tags=["Upload"],
)
async def upload_document(
    file: UploadFile = File(...)
):
    """
    Upload and parse PDF/DOCX/TXT documents.
    """

    try:

        allowed_extensions = [
            "pdf",
            "docx",
            "txt",
        ]

        file_ext = file.filename.split(".")[-1].lower()

        if file_ext not in allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type. Allowed: {allowed_extensions}",
            )

        file_bytes = await file.read()

        if len(file_bytes) == 0:
            raise HTTPException(
                status_code=400,
                detail="File is empty",
            )

        # Parse document
        extracted_text, doc_type = DocumentParser.parse(
            file_bytes,
            file.filename,
        )

        if not extracted_text.strip():
            raise HTTPException(
                status_code=400,
                detail="No text found in document",
            )

        # Create upload ID
        upload_id = (
            f"upload_{datetime.now().timestamp()}"
        )

        # Store upload
        uploads_store[upload_id] = {
            "filename": file.filename,
            "document_type": doc_type,
            "extracted_text": extracted_text,
            "timestamp": datetime.now().isoformat(),
        }

        return UploadResponse(
            id=upload_id,
            filename=file.filename,
            document_type=doc_type,
            extracted_text=extracted_text,
            timestamp=datetime.now().isoformat(),
            text_length=len(extracted_text),
        )

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Upload failed: {str(e)}",
        )


# =============================================================================
# ARCHITECTURE GENERATION
# =============================================================================


@app.post(
    "/api/architecture",
    response_model=ArchitectureApiResponse,
    tags=["Architecture"],
)
async def generate_architecture(
    request: ArchitectureApiRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """
    Generate architecture recommendations.
    """

    try:

        if request.upload_id not in uploads_store:
            raise HTTPException(
                status_code=404,
                detail="Upload not found",
            )

        upload = uploads_store[request.upload_id]

        extracted_text = upload["extracted_text"]

        print("Using ENHANCED architecture service")

        enhanced_response = (
            ArchitectureService.generate_architecture_with_gemini(
                extracted_text,
                db=db,
            )
        )

        # Parse services for API response shape
        services = [
            ServiceRecommendation(
                name=svc.get("name", ""),
                description=svc.get("description", ""),
                technology_stack=(
                    svc.get("technology_stack", [])
                    if isinstance(svc.get("technology_stack", []), list)
                    else [svc.get("technology_stack", "")]
                ),
            )
            for svc in enhanced_response.get("services", [])
            if isinstance(svc, dict) and svc.get("name")
        ]

        # Parse infrastructure for API response shape
        infrastructure = [
            InfrastructureRecommendation(
                component=inf.get("component", ""),
                technology=inf.get("technology", ""),
                rationale=inf.get("rationale", ""),
            )
            for inf in enhanced_response.get("infrastructure", [])
            if isinstance(inf, dict) and inf.get("component")
        ]

        # Store architecture
        architecture_id = (
            f"architecture_{datetime.now().timestamp()}"
        )

        architectures_store[
            architecture_id
        ] = enhanced_response

        return ArchitectureApiResponse(
            architecture_style=enhanced_response.get(
                "architecture",
                "Microservices",
            ),
            reasoning=enhanced_response.get(
                "reasoning",
                "",
            ),
            services=services,
            integrations=[],
            infrastructure=infrastructure,
            security=[],
            scalability=[],
            event_driven_components=[],
            databases=[],
            retrieval_stats=enhanced_response.get(
                "retrieval_stats",
                {
                    "similar_found": 0,
                    "retrieval_source": "chromadb",
                },
            ),
        )

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Architecture generation failed: {str(e)}",
        )


# =============================================================================
# REQUIREMENTS ANALYSIS
# =============================================================================


@app.post(
    "/api/requirements-analysis",
    tags=["Analysis"],
)
async def analyze_requirements(
    request: ArchitectureApiRequest
):
    """
    Extract structured requirements from uploaded documents.
    """

    try:

        if request.upload_id not in uploads_store:
            raise HTTPException(
                status_code=404,
                detail="Upload not found",
            )

        upload = uploads_store[
            request.upload_id
        ]

        extracted_text = upload[
            "extracted_text"
        ]

        analysis = (
            RequirementExtractor.extract(
                extracted_text
            )
        )

        return {
            "upload_id": request.upload_id,
            "analysis": analysis,
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}",
        )


# =============================================================================
# STARTUP EVENTS
# =============================================================================


@app.on_event("startup")
async def startup_event():

    print("\n" + "=" * 60)

    print(
        f"Starting {settings.APP_NAME}"
    )

    print(
        f"Environment: {settings.ENVIRONMENT}"
    )

    print(
        f"Version: {settings.APP_VERSION}"
    )

    try:
        from app.db.database import _masked_database_url

        print(f"Active database URL: {_masked_database_url()}")
    except Exception as e:
        print(f"⚠ Could not determine active database URL: {e}")

    if settings.GEMINI_API_KEY:
        print("✓ GEMINI API configured")

    else:
        print(
            "⚠ GEMINI_API_KEY not configured"
        )

    # Initialize database
    try:
        init_db()
        print("✓ Database initialized without dropping existing data")
    except Exception as e:
        print(f"⚠ Database initialization warning: {e}")

    print("=" * 60 + "\n")


@app.on_event("shutdown")
async def shutdown_event():

    print("\n" + "=" * 60)

    print(
        f"Shutting down {settings.APP_NAME}"
    )

    print("=" * 60 + "\n")


# =============================================================================
# LOCAL DEVELOPMENT
# =============================================================================

if __name__ == "__main__":

    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
