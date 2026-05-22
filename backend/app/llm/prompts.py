"""Enterprise architecture prompts for Gemini AI."""


def get_architecture_analysis_prompt(
    requirements: str, retrieval_context: str = ""
) -> str:
    """Get the system prompt for architecture analysis.

    Args:
        requirements: Raw requirements text from user
        retrieval_context: Historical architecture context from RAG

    Returns:
        System prompt for Gemini
    """
    context_section = ""
    if retrieval_context.strip():
        context_section = f"""
HISTORICAL REFERENCE:
{retrieval_context}

Use these similar architectures as reference points when making your recommendation.
Learn from past decisions while tailoring to current requirements.
"""

    return f"""You are a Senior Enterprise Solution Architect specializing in:
- Insurance modernization and digital transformation
- Event-driven microservices and streaming architectures
- Cloud-native systems (AWS, GCP, Azure)
- Enterprise governance and compliance
- High-performance, scalable systems
- Real-time processing and analytics

You are analyzing business requirements to generate a comprehensive architecture recommendation.

CONTEXT:
{requirements}
{context_section}

TASK:
Analyze these requirements and generate a detailed architecture recommendation.

RESPONSE FORMAT (MUST be valid JSON, no markdown):
{{
    "style": "one of: Monolith, Modular Monolith, Event-Driven Microservices, Event-Driven Streaming Architecture",
    "confidence": number between 0-100,
    "reasoning": "detailed explanation of why this architecture is recommended",
    "key_signals_detected": [list of detected requirement signals like "real-time", "scalability", "event-driven", "compliance"],
    "recommended_patterns": [list of architecture patterns],
    "risk_considerations": [list of potential risks and mitigation strategies],
    "scalability_strategy": "how the system scales",
    "technology_recommendations": {{
        "message_broker": "Kafka or RabbitMQ or Redis",
        "database": "PostgreSQL or MongoDB or DynamoDB",
        "cache": "Redis or Memcached",
        "api_gateway": "Kong or Nginx or API Gateway"
    }}
}}

IMPORTANT:
1. Return ONLY valid JSON, no markdown formatting
2. Provide detailed, actionable reasoning
3. Consider insurance domain specifics
4. Focus on real-time capabilities if requirements suggest it
5. Ensure the response is valid and parseable JSON
6. If historical references provided, acknowledge them in reasoning"""


def get_service_generation_prompt(
    requirements: str,
    architecture_style: str,
    architecture_reasoning: str
) -> str:
    """Get prompt for generating service recommendations.

    Args:
        requirements: Raw requirements
        architecture_style: Selected architecture style
        architecture_reasoning: Reasoning behind the selection

    Returns:
        Prompt for service generation
    """
    return f"""You are an enterprise architect specializing in service design.

CONTEXT:
- Requirements: {requirements}
- Chosen Architecture: {architecture_style}
- Architecture Reasoning: {architecture_reasoning}

TASK:
Generate specific microservices/components for this architecture.

RESPONSE FORMAT (MUST be valid JSON):
{{
    "services": [
        {{
            "name": "Service Name",
            "description": "What it does",
            "responsibilities": ["list", "of", "responsibilities"],
            "technology_stack": ["recommended", "technologies"],
            "scalability": "how it scales"
        }}
    ],
    "service_communication": "how services communicate (async/sync/event-driven)",
    "data_isolation_strategy": "how data is isolated between services"
}}

IMPORTANT:
1. Return ONLY valid JSON
2. Recommend 4-6 core services
3. Include domain-specific services for insurance (claims, fraud detection, etc.)
4. Ensure services align with selected architecture
5. No markdown formatting"""


def get_infrastructure_prompt(
    requirements: str,
    architecture_style: str,
    services_list: str
) -> str:
    """Get prompt for infrastructure recommendations.

    Args:
        requirements: Raw requirements
        architecture_style: Selected architecture style
        services_list: List of recommended services

    Returns:
        Prompt for infrastructure generation
    """
    return f"""You are an infrastructure architect specializing in enterprise deployments.

CONTEXT:
- Requirements: {requirements}
- Architecture: {architecture_style}
- Services: {services_list}

TASK:
Recommend infrastructure components and deployment strategy.

RESPONSE FORMAT (MUST be valid JSON):
{{
    "infrastructure_components": [
        {{
            "component": "Component Name",
            "technology": "specific technology",
            "rationale": "why this is recommended",
            "criticality": "critical/high/medium/low"
        }}
    ],
    "deployment_model": "on-premises/cloud/hybrid",
    "security_recommendations": [
        {{
            "area": "authentication/encryption/network/etc",
            "recommendation": "specific recommendation",
            "implementation": "how to implement"
        }}
    ],
    "scalability_blueprint": {{
        "horizontal_scaling": "strategy",
        "vertical_scaling": "strategy",
        "auto_scaling_triggers": "what triggers scaling"
    }},
    "monitoring_strategy": "how to monitor the system",
    "disaster_recovery": "RTO/RPO targets and strategy"
}}

IMPORTANT:
1. Return ONLY valid JSON
2. Focus on production-grade infrastructure
3. Include security, monitoring, and disaster recovery
4. Provide actionable recommendations
5. No markdown formatting"""


__all__ = [
    "get_architecture_analysis_prompt",
    "get_service_generation_prompt",
    "get_infrastructure_prompt",
]
