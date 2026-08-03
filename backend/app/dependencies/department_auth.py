from dataclasses import dataclass
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.security import decode_token_payload
from app.core.constants import Role, Department

# Separate HTTPBearer instance so Swagger shows a distinct auth scheme
# independently of the Nagarsevak scheme.
department_security = HTTPBearer()


@dataclass
class DepartmentOfficerContext:
    """Lightweight context object injected into protected department endpoints.

    While real officer accounts are not yet provisioned, this carries only the
    department key decoded from the JWT.  Once real accounts exist, this will be
    replaced by the full DepartmentOfficer ORM object.
    """
    department: str
    department_name: str


def get_current_department_officer(
    credentials: HTTPAuthorizationCredentials = Depends(department_security),
) -> DepartmentOfficerContext:
    token = credentials.credentials
    try:
        payload = decode_token_payload(token)
        if not payload:
            raise ValueError("empty payload")
        # Enforce role — rejects nagarsevak tokens sharing the same secret
        if payload.get("role") != Role.DEPARTMENT_OFFICER:
            raise ValueError("wrong role")
        department = str(payload["sub"])
        if department not in Department.VALID_DEPARTMENTS:
            raise ValueError("unknown department")
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return DepartmentOfficerContext(
        department=department,
        department_name=Department.VALID_DEPARTMENTS[department],
    )
