"""Pydantic schemas for database models."""

from datetime import datetime
from typing import List, Optional, Dict, Any

from pydantic import BaseModel


class ServiceSchema(BaseModel):
    """Service recommendation schema."""

    name: str
    description: str
    responsibilities: Optional[List[str]] = None
    technology_stack: Optional[List[str]] = None
    scalability_info: Optional[str] = None

    class Config:
        from_attributes = True


class ServiceCreateSchema(ServiceSchema):
    """Schema for creating services."""

    pass


class ServiceResponseSchema(ServiceSchema):
    """Schema for service responses."""

    id: int
    architecture_run_id: int
    created_at: datetime


class InfrastructureSchema(BaseModel):
    """Infrastructure component schema."""

    component: str
    technology: str
    rationale: str
    criticality: Optional[str] = "medium"
    config_notes: Optional[str] = None

    class Config:
        from_attributes = True


class InfrastructureCreateSchema(InfrastructureSchema):
    """Schema for creating infrastructure."""

    pass


class InfrastructureResponseSchema(InfrastructureSchema):
    """Schema for infrastructure responses."""

    id: int
    architecture_run_id: int
    created_at: datetime


class ArchitectureRunSchema(BaseModel):
    """Architecture run schema for creation."""

    requirements: str
    architecture_style: str
    confidence: int
    reasoning: str
    key_signals: Optional[List[str]] = None
    patterns: Optional[List[str]] = None
    risks: Optional[List[str]] = None
    scalability_strategy: Optional[str] = None
    technology_recommendations: Optional[Dict[str, Any]] = None


class ArchitectureRunCreateSchema(ArchitectureRunSchema):
    """Schema for creating architecture runs with nested services/infrastructure."""

    services: Optional[List[ServiceCreateSchema]] = None
    infrastructure: Optional[List[InfrastructureCreateSchema]] = None


class ArchitectureRunResponseSchema(ArchitectureRunSchema):
    """Schema for architecture run responses."""

    id: int
    created_at: datetime
    services: Optional[List[ServiceResponseSchema]] = None
    infrastructure: Optional[List[InfrastructureResponseSchema]] = None

    class Config:
        from_attributes = True


__all__ = [
    "ServiceSchema",
    "ServiceCreateSchema",
    "ServiceResponseSchema",
    "InfrastructureSchema",
    "InfrastructureCreateSchema",
    "InfrastructureResponseSchema",
    "ArchitectureRunSchema",
    "ArchitectureRunCreateSchema",
    "ArchitectureRunResponseSchema",
]
