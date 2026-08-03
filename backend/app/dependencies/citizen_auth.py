from dataclasses import dataclass

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.db.repository import CitizenRepository
from app.dependencies.db import get_db
from app.models.citizen import Citizen
from app.utils.storage import get_supabase_anon_client


citizen_security = HTTPBearer()


@dataclass(frozen=True)
class SupabaseCitizen:
    user_id: str
    phone_number: str | None


def get_current_supabase_citizen(
    credentials: HTTPAuthorizationCredentials = Depends(citizen_security),
) -> SupabaseCitizen:
    """Validate a Supabase access token and return only its verified identity."""
    try:
        response = get_supabase_anon_client().auth.get_user(credentials.credentials)
        user = response.user
        if user is None or not user.id:
            raise ValueError("missing user")
        return SupabaseCitizen(user_id=str(user.id), phone_number=user.phone)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate citizen credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc


def get_current_citizen(
    identity: SupabaseCitizen = Depends(get_current_supabase_citizen),
    db: Session = Depends(get_db),
) -> Citizen:
    citizen = CitizenRepository.get_by_supabase_id(db, identity.user_id)
    if citizen is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Citizen profile not found. Complete your profile first.",
        )
    return citizen
