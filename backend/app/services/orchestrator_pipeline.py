"""Orchestration pipeline for architecture generation.

This module now uses LangChain Runnable chains to compose specialized agents
while preserving the existing WorkflowState and agent logic.

The workflow is now a composable, extensible, enterprise-grade chain
that can evolve to include LLMs, RAG, and autonomous agents in future phases.
"""

from __future__ import annotations

import logging
from typing import Any

from langchain_core.runnables import (
    RunnableLambda,
    RunnableSequence,
)

from app.orchestrator_state import WorkflowState

from app.agents_requirement_agent import RequirementAgent
from app.agents_architecture_agent import ArchitectureDecisionAgent
from app.agents_service_agent import ServiceAgent
from app.agents_infrastructure_agent import InfrastructureAgent
from app.agents_governance_agent import GovernanceAgent

logger = logging.getLogger(__name__)


def _requirement_step(state: WorkflowState) -> WorkflowState:
    """Step 1: Requirement analysis."""
    state.analysis = RequirementAgent.analyze(state.requirements)
    logger.debug("Requirement analysis complete")
    return state


def _architecture_step(state: WorkflowState) -> WorkflowState:
    """Step 2: Architecture decision."""
    state.architecture = ArchitectureDecisionAgent.decide(state.analysis)
    logger.debug("Architecture decision complete: %s", state.architecture.get("style"))
    return state


def _service_step(state: WorkflowState) -> WorkflowState:
    """Step 3: Service generation."""
    state.services = ServiceAgent.generate(state.analysis, state.architecture)
    logger.debug("Service generation complete: %d services", len(state.services))
    return state


def _infrastructure_step(state: WorkflowState) -> WorkflowState:
    """Step 4: Infrastructure + security/scalability recommendations."""
    infra_bundle = InfrastructureAgent.recommend(state.analysis, state.architecture)
    state.infrastructure = infra_bundle.get("infrastructure", [])
    state.analysis["security"] = infra_bundle.get("security", [])
    state.analysis["scalability"] = infra_bundle.get("scalability", [])
    state.analysis["event_driven_components"] = infra_bundle.get("event_driven_components", [])
    state.analysis["databases"] = infra_bundle.get("databases", [])
    logger.debug("Infrastructure recommendations complete")
    return state


def _governance_step(state: WorkflowState) -> WorkflowState:
    """Step 5: Governance & approval metadata."""
    state.governance = GovernanceAgent.evaluate(state.to_dict())
    logger.debug("Governance evaluation complete")
    return state


class ArchitectureWorkflow:
    """LangChain-based orchestration for architecture generation.

    This workflow composes modular agents as a RunnableSequence chain,
    maintaining state throughout the pipeline and providing a foundation
    for future enhancements (LLMs, RAG, autonomous agents, etc.).
    """

    _chain: RunnableSequence | None = None

    @classmethod
    def _build_chain(cls) -> RunnableSequence:
        """Build the LangChain orchestration chain.

        Returns a RunnableSequence that flows state through all agents.
        """
        if cls._chain is not None:
            return cls._chain

        chain = (
            RunnableLambda(_requirement_step)
            | RunnableLambda(_architecture_step)
            | RunnableLambda(_service_step)
            | RunnableLambda(_infrastructure_step)
            | RunnableLambda(_governance_step)
        )

        cls._chain = chain
        return chain

    @staticmethod
    def execute(requirements: str) -> dict:
        """Execute the architecture generation workflow.

        Args:
            requirements: Raw requirements text.

        Returns:
            Workflow state as a dictionary.
        """
        state = WorkflowState(requirements=requirements)

        chain = ArchitectureWorkflow._build_chain()

        final_state = chain.invoke(state)

        logger.info(
            "ArchitectureWorkflow complete: style=%s confidence=%s",
            final_state.architecture.get("style"),
            final_state.architecture.get("confidence"),
        )

        return final_state.to_dict()
