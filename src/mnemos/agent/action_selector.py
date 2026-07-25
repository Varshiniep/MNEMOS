"""
agent/action_selector.py - Selects one TextWorld command per turn.

Input:  objective + bounded world slice + valid commands list.
Output: a single valid TextWorld command string.

Rejects: explanations, Markdown, JSON wrappers, multiple commands, empty strings.
Retries once with a correction prompt when the response is invalid.
Falls back to a deterministic command when Ollama is unavailable.
"""

from __future__ import annotations

import logging
import re
from typing import List, Optional

from mnemos.agent.ollama_client import OllamaClient, OllamaError
from mnemos.query.bounded_context import BoundedContext

logger = logging.getLogger(__name__)

_SYSTEM_PROMPT = (
    "You are an agent playing a text adventure game. "
    "Your job is to output ONE valid game command per turn — nothing else. "
    "Do not explain, do not use Markdown, do not wrap in JSON. "
    "Just output the command, e.g.: go north"
)

_FALLBACK_COMMANDS = [
    "look",
    "inventory",
    "go north",
    "go south",
    "go east",
    "go west",
    "examine surroundings",
]

# Commands we should avoid repeating
_BORING_COMMANDS = {"look", "inventory", "examine surroundings", "wait"}


def _clean_response(raw: str) -> str:
    """Strip Markdown, quotes, prefixes, and extra lines from the LLM response."""
    text = raw.strip()

    # Extract content from a code fence first (before removing it)
    # Language tag is optional and only a single word on its own line
    fence_match = re.search(r"```(?:[a-zA-Z0-9_\-]*\n)?(.*?)```", text, flags=re.DOTALL)
    if fence_match:
        text = fence_match.group(1).strip()
    else:
        # Remove any remaining backtick sequences
        text = re.sub(r"`+", "", text).strip()

    # Remove leading/trailing quotes
    text = text.strip("\"'")

    # Take only the first non-empty line
    for line in text.splitlines():
        line = line.strip().rstrip(".")
        if line:
            # Remove common prefixes like "Action: go north"
            line = re.sub(r"^(?:action|command|output)\s*[:>]\s*", "", line, flags=re.IGNORECASE)
            return line.strip()
    return ""


def _is_valid_command(cmd: str, valid_commands: List[str]) -> bool:
    """
    Return True if the command looks like a valid text adventure command.
    If valid_commands is provided, check against that list.
    """
    if not cmd or len(cmd) > 80:
        return False
    # Must not be multi-line
    if "\n" in cmd:
        return False
    # Must be mostly ASCII printable
    if not re.match(r"^[\x20-\x7E]+$", cmd):
        return False
    if valid_commands:
        # Allow fuzzy match — lower-case comparison
        lower_valid = [v.lower() for v in valid_commands]
        return cmd.lower() in lower_valid
    # Without a list, accept any simple command-looking string
    return bool(re.match(r"^[a-z][\w\s']*$", cmd, re.IGNORECASE))


class ActionSelector:
    """
    Uses the Ollama client to select one valid TextWorld command.
    Degrades gracefully when Ollama is unavailable.
    """

    def __init__(self, ollama_client: Optional[OllamaClient] = None):
        self._client = ollama_client

    def select(
        self,
        context: BoundedContext,
        recent_actions: Optional[List[str]] = None,
    ) -> str:
        """
        Select the next action for the agent.

        Args:
            context:        The bounded world slice.
            recent_actions: Last few actions taken (for loop detection).

        Returns:
            A single command string.
        """
        recent_actions = recent_actions or []

        # Build prompt
        prompt = self._build_prompt(context, recent_actions)

        # Attempt LLM
        if self._client and self._client.is_available():
            try:
                return self._query_with_retry(prompt, context.valid_commands)
            except OllamaError as exc:
                logger.warning("Ollama error — using deterministic fallback: %s", exc)

        # Deterministic fallback
        return self._fallback(context, recent_actions)

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _build_prompt(self, context: BoundedContext, recent_actions: List[str]) -> str:
        lines = [context.to_prompt_string()]
        if recent_actions:
            lines.append(f"\nRecent actions (avoid repeating): {', '.join(recent_actions[-3:])}")
        lines.append("\nWhat is your next command?")
        return "\n".join(lines)

    def _query_with_retry(self, prompt: str, valid_commands: List[str]) -> str:
        """Call Ollama, validate response, retry once if invalid."""
        raw = self._client.generate(prompt, system=_SYSTEM_PROMPT, max_tokens=32)
        cmd = _clean_response(raw)

        if _is_valid_command(cmd, valid_commands):
            logger.debug("Action selected (first attempt): %s", cmd)
            return cmd

        # Retry with correction
        correction_prompt = (
            f"{prompt}\n\n"
            f"Your previous response was not a valid command: '{raw}'\n"
            "Output ONLY the command, nothing else. Example: go north"
        )
        raw2 = self._client.generate(correction_prompt, system=_SYSTEM_PROMPT, max_tokens=32)
        cmd2 = _clean_response(raw2)

        if _is_valid_command(cmd2, valid_commands):
            logger.debug("Action selected (retry): %s", cmd2)
            return cmd2

        logger.warning(
            "Both LLM attempts produced invalid commands ('%s', '%s') — falling back.",
            cmd, cmd2,
        )
        return self._fallback_from_context(valid_commands)

    def _fallback(self, context: BoundedContext, recent_actions: List[str]) -> str:
        """Deterministic fallback when Ollama is unavailable."""
        return self._fallback_from_context(context.valid_commands, recent_actions)

    def _fallback_from_context(
        self,
        valid_commands: List[str],
        recent_actions: Optional[List[str]] = None,
    ) -> str:
        """Pick a sensible fallback command."""
        recent = set(a.lower() for a in (recent_actions or []))

        if valid_commands:
            # Prefer non-boring, non-recent commands
            for cmd in valid_commands:
                if cmd.lower() not in recent and cmd.lower() not in _BORING_COMMANDS:
                    return cmd
            # Accept boring ones if nothing better
            for cmd in valid_commands:
                if cmd.lower() not in recent:
                    return cmd
            return valid_commands[0]

        # Generic fallbacks
        for cmd in _FALLBACK_COMMANDS:
            if cmd not in recent:
                return cmd
        return "look"
