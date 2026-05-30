"""Safe JSON parsing for Gemini responses."""

import json
import logging
import re
from typing import Any, Dict, Optional

logger = logging.getLogger(__name__)


class GeminiResponseParser:
    """Parse and validate Gemini API responses safely."""

    @staticmethod
    def parse_json(response_text: str) -> Optional[Dict[str, Any]]:
        """Parse JSON from Gemini response, handling markdown and formatting.

        Args:
            response_text: Raw response from Gemini API

        Returns:
            Parsed JSON dict, or None if parsing fails
        """
        if not response_text:
            logger.warning("Empty response text")
            return None

        try:
            # Remove markdown code blocks if present
            cleaned = GeminiResponseParser._extract_json(response_text)

            # Attempt to parse
            parsed = json.loads(cleaned)
            logger.debug(f"Successfully parsed JSON ({len(cleaned)} chars)")
            return parsed

        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing error: {e}")
            logger.debug(f"Attempted to parse: {response_text[:200]}...")
            return None
        except Exception as e:
            logger.error(f"Unexpected parsing error: {e}")
            return None

    @staticmethod
    def _extract_json(text: str) -> str:
        """Extract JSON from text, handling markdown code blocks.

        Args:
            text: Raw text possibly containing markdown

        Returns:
            Cleaned JSON string
        """
        # Remove markdown code block markers
        patterns = [
            (r'```json\s*(.*?)\s*```', r'\1'),  # ```json...```
            (r'```\s*(.*?)\s*```', r'\1'),       # ```...```
            (r'`([^`]+)`', r'\1'),               # inline backticks
        ]

        result = text
        for pattern, replacement in patterns:
            result = re.sub(pattern, replacement, result, flags=re.DOTALL)

        return result.strip()

    @staticmethod
    def validate_architecture_response(data: Dict[str, Any]) -> bool:
        """Validate architecture response has required fields.

        Args:
            data: Parsed JSON response

        Returns:
            True if valid, False otherwise
        """
        # Accept either `architecture_style` or legacy `style` key for backwards compatibility
        if "architecture_style" in data:
            style_key = "architecture_style"
        elif "style" in data:
            style_key = "style"
        else:
            logger.warning("Missing required field: architecture_style or style")
            return False

        # Validate types
        if not isinstance(data.get(style_key, ""), str):
            logger.warning(f"Field {style_key} has wrong type: expected str")
            return False

        confidence = data.get("confidence")
        if not isinstance(confidence, (int, float)):
            logger.warning("Field confidence missing or wrong type")
            return False

        if not isinstance(data.get("reasoning", ""), str):
            logger.warning("Field reasoning missing or wrong type")
            return False

        # Validate confidence is in valid range
        confidence = data.get("confidence", 0)
        if not (0 <= confidence <= 100):
            logger.warning(f"Confidence out of range: {confidence}")
            return False

        return True

    @staticmethod
    def extract_architecture(response: Dict[str, Any]) -> Dict[str, Any]:
        """Extract and normalize architecture from Gemini response.

        Args:
            response: Parsed Gemini response

        Returns:
            Normalized architecture dict
        """
        # Support both `architecture_style` and legacy `style` keys; normalize to both `style` and `architecture_style`
        arch_style = response.get("architecture_style") or response.get("style") or "Modular Monolith"

        return {
            "style": arch_style,
            "architecture_style": arch_style,
            "confidence": int(response.get("confidence", 80)),
            "reasoning": response.get("reasoning", ""),
            "key_signals": response.get("key_signals_detected", []),
            "patterns": response.get("recommended_patterns", []),
            "risks": response.get("risk_considerations", []),
            "scalability": response.get("scalability_strategy", ""),
            "technology": response.get("technology_recommendations", {}),
        }

    @staticmethod
    def extract_services(response: Dict[str, Any]) -> list:
        """Extract services from Gemini response.

        Args:
            response: Parsed Gemini response

        Returns:
            List of service dicts
        """
        services = response.get("services", [])
        if not isinstance(services, list):
            logger.warning("Services field is not a list")
            return []

        normalized = []
        for service in services:
            if isinstance(service, dict):
                normalized.append({
                    "name": service.get("name", "Unknown Service"),
                    "description": service.get("description", ""),
                    "responsibilities": service.get("responsibilities", []),
                    "technology_stack": service.get("technology_stack", []),
                })

        return normalized

    @staticmethod
    def extract_infrastructure(response: Dict[str, Any]) -> list:
        """Extract infrastructure from Gemini response.

        Args:
            response: Parsed Gemini response

        Returns:
            List of infrastructure dicts
        """
        components = response.get("infrastructure_components", [])
        if not isinstance(components, list):
            logger.warning("Infrastructure components field is not a list")
            return []

        normalized = []
        for component in components:
            if isinstance(component, dict):
                normalized.append({
                    "component": component.get("component", "Unknown Component"),
                    "technology": component.get("technology", ""),
                    "rationale": component.get("rationale", ""),
                    "criticality": component.get("criticality", "medium"),
                })

        return normalized


__all__ = ["GeminiResponseParser"]
