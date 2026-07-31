import bcrypt
import jwt
from datetime import datetime, timedelta, timezone
from typing import Any, Union
from app.core.config import settings


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        # bcrypt requires bytes, verify checks if the plain password encodes matching the hash
        return bcrypt.checkpw(
            plain_password.encode("utf-8"), hashed_password.encode("utf-8")
        )
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    # bcrypt requires bytes, hashpw generates the hash
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def create_access_token(
    subject: Union[str, Any],
    expires_delta: Union[timedelta, None] = None,
    role: str | None = None,
) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode: dict[str, Any] = {"exp": expire, "sub": str(subject)}
    if role is not None:
        to_encode["role"] = role
    encoded_jwt = jwt.encode(
        to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM
    )
    return encoded_jwt


def decode_token(token: str) -> str | None:
    """Return the 'sub' claim, or None if the token is invalid."""
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM]
        )
        return payload.get("sub")
    except (jwt.PyJWTError, ValueError):
        return None


def decode_token_payload(token: str) -> dict | None:
    """Return the full decoded payload, or None if the token is invalid."""
    try:
        return jwt.decode(
            token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM]
        )
    except (jwt.PyJWTError, ValueError):
        return None
