"""Architecture decision helpers for the orchestration pipeline."""

from __future__ import annotations

from typing import Any


class ArchitectureDecisionAgent:
    @staticmethod
    def decide(analysis: dict[str, Any]) -> dict[str, Any]:
        keywords = analysis.get("keywords", [])
        service_count = int(analysis.get("service_count", 1) or 1)
        is_event_driven = bool(analysis.get("is_event_driven"))
        needs_compliance = bool(analysis.get("needs_compliance"))

        if "microservices" in keywords or service_count >= 4:
            style = "Microservices"
            confidence = 92
        elif is_event_driven:
            style = "Event-Driven Modular Monolith"
            confidence = 88
        else:
            style = "Modular Monolith"
            confidence = 84

        reasoning_parts = [f"Selected {style.lower()} based on requirement signals."]
        if is_event_driven:
            reasoning_parts.append("The workload benefits from asynchronous event handling.")
        if needs_compliance:
            reasoning_parts.append("Compliance-sensitive workloads need explicit governance boundaries.")

        return {
            "style": style,
            "confidence": confidence,
            "reasoning": " ".join(reasoning_parts),
            "key_signals": keywords,
            "patterns": ["API Gateway", "Domain Services"] if style == "Microservices" else ["Modular Boundaries"],
        }