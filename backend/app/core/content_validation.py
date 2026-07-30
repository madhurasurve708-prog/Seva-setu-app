"""Shared, configurable validation for user-authored text."""

import re

from fastapi import HTTPException, status

from app.core.config import settings


DEFAULT_BLOCKED_WORDS = ("asshole", "bitch", "fuck", "shit")


def _blocked_words() -> tuple[str, ...]:
    configured = tuple(
        word.strip().casefold()
        for word in settings.BAD_WORDS.split(",")
        if word.strip()
    )
    return configured or DEFAULT_BLOCKED_WORDS


def ensure_appropriate_text(value: str, field_name: str) -> None:
    """Reject configured whole-word matches without changing the submitted text."""
    normalized = value.casefold()
    for word in _blocked_words():
        if re.search(rf"(?<!\w){re.escape(word)}(?!\w)", normalized):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"{field_name} contains inappropriate language.",
            )
