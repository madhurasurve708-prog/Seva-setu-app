from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.dependencies.db import get_db
from app.core.security import decode_token_payload, get_password_hash
from app.core.constants import Role, Department
from app.core.config import settings
from app.db.repository import NagarsevakRepository, MainAdminRepository
from app.models.nagarsevak import Nagarsevak
from app.models.main_admin import MainAdmin
from app.models.department_officer import DepartmentOfficer

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
        if token_role is not None and token_role != Role.NAGARSEVAK:
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

    return nagarsevak


def get_current_official(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    token = credentials.credentials
    payload = decode_token_payload(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    role = payload.get("role")
    if role == Role.MAIN_ADMIN:
        admin_id = int(payload["sub"])
        admin = MainAdminRepository.get_by_id(db, admin_id)
        if not admin or not admin.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Main Admin not found or inactive",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return {"role": "main_admin", "user": admin}
        
    elif role == Role.DEPARTMENT_OFFICER:
        dept_key = str(payload["sub"])
        if dept_key not in Department.VALID_DEPARTMENTS:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid department key",
                headers={"WWW-Authenticate": "Bearer"},
            )
        dept_name = Department.VALID_DEPARTMENTS[dept_key]
        email = f"{dept_key.lower()}@seva-setu.in"
        officer = db.query(DepartmentOfficer).filter(DepartmentOfficer.email == email).first()
        if not officer:
            officer = DepartmentOfficer(
                full_name="Department Officer",
                phone_number="",
                email=email,
                department_name=dept_name,
                password_hash=get_password_hash(settings.DEPT_TEMP_PASSWORD),
                is_active=True
            )
            db.add(officer)
            db.commit()
            db.refresh(officer)
        
        if not officer.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This officer account is inactive",
            )
        return {"role": "department_officer", "user": officer}
        
    else: # nagarsevak
        nagarsevak_id = int(payload["sub"])
        nagarsevak = NagarsevakRepository.get_by_id(db, nagarsevak_id)
        if not nagarsevak or not nagarsevak.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Nagarsevak not found or inactive",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return {"role": "nagarsevak", "user": nagarsevak}

