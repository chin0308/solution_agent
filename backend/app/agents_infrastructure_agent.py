"""Infrastructure recommendation helpers for the orchestration pipeline."""

from __future__ import annotations

from typing import Any


class InfrastructureAgent:
    @staticmethod
    def recommend(analysis: dict[str, Any], architecture: dict[str, Any]) -> dict[str, Any]:
        is_event_driven = bool(analysis.get("is_event_driven"))
        needs_compliance = bool(analysis.get("needs_compliance"))

        infrastructure = [
            {
                "component": "API Layer",
                "technology": "FastAPI",
                "rationale": "Serve application requests through a thin HTTP boundary",
                "criticality": "high",
            },
            {
                "component": "Data Store",
                "technology": "PostgreSQL",
                "rationale": "Store structured workflow and architecture data",
                "criticality": "high",
            },
        ]

        if is_event_driven:
            infrastructure.append(
                {
                    "component": "Event Bus",
                    "technology": "Kafka",
                    "rationale": "Support asynchronous workflow processing",
                    "criticality": "medium",
                }
            )

        security = ["TLS everywhere", "Least-privilege access"]
        if needs_compliance:
            security.append("Audit logging for regulated workflows")

        scalability = ["Horizontal scaling for stateless services"]
        if is_event_driven:
            scalability.append("Partition consumers by domain workload")

        return {
            "infrastructure": infrastructure,
            "security": security,
            "scalability": scalability,
            "event_driven_components": ["Event Bus"] if is_event_driven else [],
            "databases": ["PostgreSQL"],
        }