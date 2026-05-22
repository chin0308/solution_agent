"""Gemini AI client for architecture generation.

This module provides a production-ready interface to Google Gemini API
for enterprise architecture reasoning.
"""

import logging
import os
from typing import Optional

try:
    import google.generativeai as genai
except ImportError:
    genai = None

logger = logging.getLogger(__name__)


class GeminiClient:
    """Production-grade client for Gemini API interactions."""

    _instance: Optional['GeminiClient'] = None
    _model: Optional[object] = None

    def __new__(cls):
        """Singleton pattern for client initialization."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialize()
        return cls._instance

    @staticmethod
    def _initialize() -> None:
        """Initialize Gemini API."""
        if genai is None:
            logger.warning("google-generativeai not installed; Gemini features disabled")
            return

        api_key = os.getenv("GEMINI_API_KEY", "").strip()
        if not api_key:
            logger.warning("GEMINI_API_KEY not set; Gemini features disabled")
            return

        try:
            genai.configure(api_key=api_key)
            GeminiClient._model = genai.GenerativeModel("gemini-1.5-flash")
            logger.info("Gemini API initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Gemini API: {e}")
            GeminiClient._model = None

    @staticmethod
    def generate(prompt: str, max_tokens: int = 2000) -> Optional[str]:
        """Generate response from Gemini API.

        Args:
            prompt: The prompt to send to Gemini
            max_tokens: Maximum tokens in response

        Returns:
            Generated text response, or None if generation fails
        """
        if GeminiClient._model is None:
            logger.warning("Gemini model not initialized; skipping generation")
            return None

        try:
            response = GeminiClient._model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    max_output_tokens=max_tokens,
                    temperature=0.7,
                ),
            )

            if response and response.text:
                logger.debug(f"Gemini generation successful ({len(response.text)} chars)")
                return response.text

            logger.warning("Gemini returned empty response")
            return None

        except Exception as e:
            logger.error(f"Gemini generation failed: {e}")
            return None

    @staticmethod
    def is_available() -> bool:
        """Check if Gemini is available and configured."""
        return GeminiClient._model is not None


__all__ = ["GeminiClient"]