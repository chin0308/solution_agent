"""Workflow state container used by the orchestration pipeline."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass
class WorkflowState:
    requirements: str
    analysis: dict[str, Any] = field(default_factory=dict)
    architecture: dict[str, Any] = field(default_factory=dict)
    services: list[dict[str, Any]] = field(default_factory=list)
    infrastructure: list[dict[str, Any]] = field(default_factory=list)
    governance: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        return {
            "requirements": self.requirements,
            "analysis": self.analysis,
            "architecture": self.architecture,
            "services": self.services,
            "infrastructure": self.infrastructure,
            "governance": self.governance,
        }