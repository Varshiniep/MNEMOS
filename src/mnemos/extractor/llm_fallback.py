"""
extractor/llm_fallback.py - Optional LLM-based extraction fallback.

Only invoked when the deterministic extractor cannot confidently parse
an observation. The application works fully without this.
"""

from __future__ import annotations

import json
import logging
from typing import Optional

from mnemos.extractor.models import ExtractedFact, ExtractionResult

logger = logging.getLogger(__name__)


class LLMFallbackExtractor:
    """
    Uses a local Ollama model to extract structured facts when
    deterministic parsing yields insufficient results.
    """

    def __init__(self, ollama_client=None):
        self._client = ollama_client

    def extract(
        self,
        observation: str,
        deterministic_result: ExtractionResult,
        context: Optional[dict] = None,
    ) -> ExtractionResult:
        """
        Attempt to augment the deterministic result using the LLM.
        Returns the deterministic result unchanged if the LLM is
        unavailable or fails.
        """
        if self._client is None:
            logger.debug("LLM fallback disabled — no client provided.")
            return deterministic_result

        prompt = self._build_prompt(observation, deterministic_result)
        try:
            raw = self._client.generate(prompt, max_tokens=512)
            extra_facts = self._parse_response(raw, observation)
            if extra_facts:
                combined = list(deterministic_result.facts) + extra_facts
                return deterministic_result.model_copy(
                    update={"facts": combined, "used_llm_fallback": True}
                )
        except Exception as exc:
            logger.warning("LLM fallback failed: %s", exc)

        return deterministic_result

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _build_prompt(self, observation: str, prior: ExtractionResult) -> str:
        already = [f"{f.entity}.{f.attribute}" for f in prior.facts]
        return (
            "You are a fact extractor for a text adventure game.\n"
            "Extract additional structured facts from the observation below.\n"
            "Return ONLY a JSON array of objects with keys: "
            "entity, attribute, value, confidence (0-1), source_text.\n"
            f"Already extracted: {already}\n\n"
            f"Observation:\n{observation}\n\n"
            "JSON array:"
        )

    def _parse_response(self, raw: str, source: str) -> list:
        """Try to parse JSON facts from the LLM response."""
        try:
            # Find first JSON array in the response
            start = raw.find("[")
            end = raw.rfind("]") + 1
            if start == -1 or end == 0:
                return []
            data = json.loads(raw[start:end])
            facts = []
            for item in data:
                if isinstance(item, dict) and "entity" in item and "attribute" in item:
                    facts.append(ExtractedFact(
                        entity=str(item.get("entity", "unknown")),
                        attribute=str(item.get("attribute", "unknown")),
                        value=item.get("value"),
                        confidence=float(item.get("confidence", 0.6)),
                        source_text=str(item.get("source_text", source[:60])),
                        source="llm_fallback",
                    ))
            return facts
        except Exception:
            return []
