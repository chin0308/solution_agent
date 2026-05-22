"""Schema exports for the API layer."""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field

from .schemas import *
from .schemas import __all__ as _db_schema_exports


class UploadResponse(BaseModel):
	id: str
	filename: str
	document_type: Any
	extracted_text: str
	timestamp: str
	text_length: int


class ArchitectureApiRequest(BaseModel):
	upload_id: str


class ServiceRecommendation(BaseModel):
	name: str
	description: str
	technology_stack: List[str] = Field(default_factory=list)


class InfrastructureRecommendation(BaseModel):
	component: str
	technology: str
	rationale: str


class ArchitectureApiResponse(BaseModel):
	architecture_style: str
	reasoning: str
	services: List[ServiceRecommendation] = Field(default_factory=list)
	integrations: List[Any] = Field(default_factory=list)
	infrastructure: List[InfrastructureRecommendation] = Field(default_factory=list)
	security: List[Any] = Field(default_factory=list)
	scalability: List[Any] = Field(default_factory=list)
	event_driven_components: List[Any] = Field(default_factory=list)
	databases: List[Any] = Field(default_factory=list)
	retrieval_stats: Dict[str, Any] = Field(default_factory=dict)


class ArchitectureRequest(BaseModel):
	requirements: str


class ArchitectureResponse(BaseModel):
	architecture: str
	confidence: int
	reasoning: str
	services: List[Dict[str, Any]] = Field(default_factory=list)
	infrastructure: List[Dict[str, Any]] = Field(default_factory=list)
	retrieval_stats: Dict[str, Any] = Field(default_factory=dict)
	id: Optional[int] = None
	run_id: Optional[int] = None


__all__ = [
	*_db_schema_exports,
	"UploadResponse",
	"ArchitectureApiRequest",
	"ArchitectureApiResponse",
	"ServiceRecommendation",
	"InfrastructureRecommendation",
	"ArchitectureRequest",
	"ArchitectureResponse",
]
