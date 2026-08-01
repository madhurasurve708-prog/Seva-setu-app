from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.dependencies.db import get_db
from app.core.security import decode_token_payload
from app.core.constants import Role
from app.db.repository import MainAdminRepository
from app.models.main_admin import MainAdmin
from app.dependencies.administrative import ensure_user_can_login

# Separate HTTPBearer instance so Swagger shows a distinct auth scheme
# independently of the Nagarsevak and Department Officer schemes.
main_admin_security = HTTPBearer()


def get_current_main_admin(
    credentials: HTTPAuthorizationCredentials = Depends(main_admin_security),
    db: Session = Depends(get_db),
) -> MainAdmin:
    token = credentials.credentials
    try:
        payload = decode_token_payload(token)
        if not payload:
            raise ValueError("empty payload")
        # Enforce role — rejects nagarsevak and department_officer tokens
        if payload.get("role") != Role.MAIN_ADMIN:
            raise ValueError("wrong role")
        admin_id = int(payload["sub"])
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    admin = MainAdminRepository.get_by_id(db, admin_id)
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Main Admin not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Main Admin uses standard is_active check (no is_restricted needed)
    if not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive account",
        )
    
    return admin
