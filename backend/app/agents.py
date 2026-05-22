"""Requirement extraction and architecture generation helpers."""

from __future__ import annotations

from typing import Any, Dict


class RequirementExtractor:
    @staticmethod
    def extract(extracted_text: str) -> Dict[str, Any]:
        text = (extracted_text or "").strip()
        lower_text = text.lower()

        requirements = {
            "summary": text[:240],
            "keywords": [
                keyword
                for keyword in (
                    "microservices",
                    "event streaming",
                    "real-time",
                    "compliance",
                    "dashboard",
                    "api",
                    "analytics",
                    "notifications",
                )
                if keyword in lower_text
            ],
            "length": len(text),
            "is_long_form": len(text) > 500,
        }

        return requirements


class ArchitectureGenerator:
    @staticmethod
    def generate(requirements: Dict[str, Any]) -> Dict[str, Any]:
        keywords = requirements.get("keywords", [])

        if "microservices" in keywords:
            style = "Microservices"
            confidence = 92
        elif any(keyword in keywords for keyword in ("event streaming", "real-time")):
            style = "Event-Driven Modular Monolith"
            confidence = 88
        else:
            style = "Modular Monolith"
            confidence = 84

        return {
            "architecture_style": style,
            "confidence": confidence,
            "reasoning": f"Selected {style.lower()} based on extracted requirements.",
            "key_signals_detected": keywords,
            "recommended_patterns": ["API Gateway"] if style == "Microservices" else ["Modular Boundaries"],
            "risk_considerations": [],
            "scalability_strategy": "Horizontal scaling for stateless services",
            "technology_recommendations": {},
        }


__all__ = ["RequirementExtractor", "ArchitectureGenerator"]
