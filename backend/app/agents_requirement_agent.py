"""Requirement analysis helpers for the orchestration pipeline."""

from __future__ import annotations

from typing import Any


class RequirementAgent:
    @staticmethod
    def analyze(requirements: str) -> dict[str, Any]:
        text = (requirements or "").strip()
        lower_text = text.lower()

        keywords = [
            keyword
            for keyword in (
                "microservices",
                "event streaming",
                "real-time",
                "compliance",
                "dashboard",
                "claims",
                "fraud",
                "notifications",
            )
            if keyword in lower_text
        ]

        service_count = 1
        if "microservices" in lower_text:
            service_count = 4
        elif any(keyword in lower_text for keyword in ("real-time", "event streaming", "streaming")):
            service_count = 3

        return {
            "requirements": text,
            "summary": text[:160],
            "keywords": keywords,
            "is_event_driven": any(keyword in lower_text for keyword in ("event streaming", "real-time", "streaming", "events")),
            "needs_compliance": any(keyword in lower_text for keyword in ("hipaa", "compliance", "pci", "sox", "gdpr")),
            "complexity": "high" if service_count > 2 else "medium" if text else "low",
            "service_count": service_count,
        }