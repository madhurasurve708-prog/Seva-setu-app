from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.dependencies.db import get_db
from app.core.security import decode_token_payload
from app.db.repository import NagarsevakRepository
from app.models.nagarsevak import Nagarsevak

security = HTTPBearer()


def get_current_nagarsevak(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> Nagarsevak:
    token = credentials.credentials
    try:
        payload = decode_token_payload(token)
        if not payload:
            raise ValueError("empty payload")
        # Reject tokens issued for a different role (e.g. department_officer).
        # Nagarsevak tokens carry no 'role' claim (legacy); any explicit role
        # other than 'nagarsevak' is refused.
        token_role = payload.get("role")
        if token_role is not None and token_role != "nagarsevak":
            raise ValueError("wrong role")
        nagarsevak_id = int(payload["sub"])
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    nagarsevak = NagarsevakRepository.get_by_id(db, nagarsevak_id)
    if not nagarsevak:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nagarsevak not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not nagarsevak.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive account",
        )
    return nagarsevak
