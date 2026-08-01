from fastapi import HTTPException, status
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.citizen import Citizen
    from app.models.nagarsevak import Nagarsevak
    from app.models.department_officer import DepartmentOfficer


def ensure_user_can_login(user: "Citizen | Nagarsevak | DepartmentOfficer") -> None:
    """Check if user can login.
    
    Login is denied if:
    - is_deleted = True
    - is_archived = True
    - is_blocked = True
    
    Login is allowed if:
    - is_restricted = True (user can login but cannot perform actions)
    - is_active = True or False (restriction is independent of activation)
    
    Raises:
        HTTPException 401 if user cannot login
    """
    if getattr(user, 'is_deleted', False):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Your account has been deleted.",
        )
    
    if getattr(user, 'is_archived', False):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Your account has been archived.",
        )
    
    if getattr(user, 'is_blocked', False):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Your account has been blocked.",
        )


def ensure_user_can_perform_actions(user: "Citizen | Nagarsevak | DepartmentOfficer") -> None:
    """Check if user can perform actions.
    
    Actions are denied if:
    - is_restricted = True
    
    This should be called after authentication in action endpoints.
    
    Raises:
        HTTPException 403 if user is restricted
    """
    if getattr(user, 'is_restricted', False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is currently restricted. You can view data but cannot perform actions.",
        )


def get_user_status(user: "Citizen | Nagarsevak | DepartmentOfficer") -> str:
    """Get user status for display and filtering.
    
    Status precedence (highest to lowest):
    - deleted
    - archived
    - blocked
    - restricted
    - active
    """
    if getattr(user, 'is_deleted', False):
        return "deleted"
    if getattr(user, 'is_archived', False):
        return "archived"
    if getattr(user, 'is_blocked', False):
        return "blocked"
    if getattr(user, 'is_restricted', False):
        return "restricted"
    return "active"
