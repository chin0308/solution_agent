"""Service generation helpers for the orchestration pipeline."""

from __future__ import annotations

from typing import Any


class ServiceAgent:
    @staticmethod
    def generate(analysis: dict[str, Any], architecture: dict[str, Any]) -> list[dict[str, Any]]:
        service_count = max(1, int(analysis.get("service_count", 1) or 1))
        style = architecture.get("style", "Modular Monolith")
        base_name = "core"

        if "microservices" in style.lower():
            base_name = "service"
        elif "event" in style.lower():
            base_name = "stream"

        services: list[dict[str, Any]] = []
        for index in range(service_count):
            services.append(
                {
                    "name": f"{base_name}-{index + 1}",
                    "description": f"{style} component {index + 1}",
                    "responsibilities": ["handle domain logic", "expose APIs"],
                    "technology_stack": ["Python", "FastAPI", "PostgreSQL"],
                    "scalability_info": "Stateless horizontally scalable service",
                }
            )

        return services