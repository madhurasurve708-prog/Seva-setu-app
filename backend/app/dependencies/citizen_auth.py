from dataclasses import dataclass

from fastapi import Depends, HTTPException, status, Header
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.db.repository import CitizenRepository
from app.dependencies.db import get_db
from app.models.citizen import Citizen
from app.utils.storage import get_supabase_anon_client
from app.core.config import settings


citizen_security = HTTPBearer()


@dataclass(frozen=True)
class SupabaseCitizen:
    user_id: str
    phone_number: str | None


def get_current_supabase_citizen(
    x_dev_mode: str | None = Header(None),
    x_dev_phone: str | None = Header(None),
    x_dev_secret: str | None = Header(None),
    credentials: HTTPAuthorizationCredentials = Depends(citizen_security),
) -> SupabaseCitizen:
    """Validate a Supabase access token and return only its verified identity."""
    if x_dev_mode == "true":
        if not settings.ALLOW_DEV_MODE:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Development mode is not enabled on this server",
            )
        if not x_dev_secret or x_dev_secret != settings.DEV_MODE_SECRET:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid development mode secret",
            )
        if not x_dev_phone:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Phone number required in development mode",
            )
        return SupabaseCitizen(user_id=f"dev-user-{x_dev_phone}", phone_number=x_dev_phone)

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
    if citizen is None and identity.user_id.startswith("dev-user-"):
        # Fallback to phone number lookup in development mode
        citizen = CitizenRepository.get_by_phone_number(db, identity.phone_number)
        
    if citizen is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Citizen profile not found. Complete your profile first.",
        )
    return citizen
