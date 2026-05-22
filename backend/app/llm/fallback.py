"""Fallback responses for when Gemini fails or is unavailable."""

from typing import Dict, Any


def get_fallback_architecture() -> Dict[str, Any]:
    """Get a safe fallback architecture response.

    Used when Gemini is unavailable or fails.

    Returns:
        Fallback architecture dict
    """
    return {
        "style": "Modular Monolith",
        "confidence": 75,
        "reasoning": (
            "Fallback architecture due to LLM unavailability. "
            "A modular monolith is recommended as a stable baseline with clear module boundaries, "
            "allowing future migration to microservices as requirements mature."
        ),
        "key_signals": ["fallback_mode"],
        "patterns": ["Modular Design", "Clear Boundaries", "Domain-Driven Design"],
        "risks": [
            "Single point of deployment",
            "Limited independent scalability",
            "Potential for tight coupling without discipline",
        ],
        "scalability": "Horizontal scaling through load balancing",
        "technology": {
            "message_broker": "RabbitMQ (or Kafka for high-throughput)",
            "database": "PostgreSQL",
            "cache": "Redis",
            "api_gateway": "Kong or Nginx",
        },
    }


def get_fallback_services() -> list:
    """Get fallback service recommendations.

    Returns:
        List of fallback services
    """
    return [
        {
            "name": "User Service",
            "description": "Authentication, authorization, and user management",
            "responsibilities": ["user authentication", "role-based access control"],
            "technology_stack": ["FastAPI", "Python", "PostgreSQL"],
        },
        {
            "name": "Core Domain Service",
            "description": "Primary business logic and domain operations",
            "responsibilities": ["business logic", "domain models", "workflows"],
            "technology_stack": ["FastAPI", "Python", "PostgreSQL"],
        },
        {
            "name": "Integration Service",
            "description": "External system integrations and API adapters",
            "responsibilities": ["third-party integrations", "webhook handling"],
            "technology_stack": ["FastAPI", "Python", "httpx"],
        },
        {
            "name": "Notification Service",
            "description": "Email, SMS, and push notification delivery",
            "responsibilities": ["notification delivery", "template management"],
            "technology_stack": ["Celery", "Python", "Redis"],
        },
        {
            "name": "Reporting Service",
            "description": "Analytics, dashboards, and business intelligence",
            "responsibilities": ["data aggregation", "report generation"],
            "technology_stack": ["FastAPI", "PostgreSQL", "Python"],
        },
    ]


def get_fallback_infrastructure() -> list:
    """Get fallback infrastructure recommendations.

    Returns:
        List of fallback infrastructure components
    """
    return [
        {
            "component": "Load Balancer",
            "technology": "Nginx or HAProxy",
            "rationale": "Distribute traffic across application instances",
            "criticality": "critical",
        },
        {
            "component": "API Gateway",
            "technology": "Kong or Traefik",
            "rationale": "Centralized API management and rate limiting",
            "criticality": "high",
        },
        {
            "component": "Cache Layer",
            "technology": "Redis",
            "rationale": "Session management and application caching",
            "criticality": "high",
        },
        {
            "component": "Primary Database",
            "technology": "PostgreSQL",
            "rationale": "Main transactional database with ACID guarantees",
            "criticality": "critical",
        },
        {
            "component": "Message Broker",
            "technology": "RabbitMQ",
            "rationale": "Asynchronous processing and service communication",
            "criticality": "high",
        },
        {
            "component": "Container Orchestration",
            "technology": "Kubernetes",
            "rationale": "Service orchestration, scaling, and high availability",
            "criticality": "high",
        },
    ]


__all__ = [
    "get_fallback_architecture",
    "get_fallback_services",
    "get_fallback_infrastructure",
]
