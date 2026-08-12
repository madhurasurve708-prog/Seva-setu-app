from fastapi import APIRouter, Depends, File, UploadFile, status
from sqlalchemy.orm import Session
from app.dependencies.db import get_db
from app.dependencies.department_auth import (
    get_current_department_officer,
    DepartmentOfficerContext,
)
from app.models.department_officer import DepartmentOfficer
from app.schemas.department_officer import (
    DepartmentOfficerLogin,
    DepartmentOfficerLoginResponse,
    DepartmentOfficerUpdateName,
    DepartmentOfficerUpdatePhone,
    DepartmentOfficerChangePassword,
)
from app.services.department_officer_service import DepartmentOfficerService
from app.schemas.common import MessageResponse, ActionResponse

router = APIRouter(tags=["Department Officer Authentication & Profile"])


@router.post(
    "/api/department/login",
    response_model=DepartmentOfficerLoginResponse,
    status_code=status.HTTP_200_OK,
)
def login(login_data: DepartmentOfficerLogin, db: Session = Depends(get_db)):
    return DepartmentOfficerService.login(db, login_data)


@router.get(
    "/api/department/profile",
    response_model=DepartmentOfficerLoginResponse,
    status_code=status.HTTP_200_OK,
)
def get_profile(
    context: DepartmentOfficerContext = Depends(get_current_department_officer),
):
    """Returns the department identity decoded from the JWT.
    Once real officer accounts are provisioned, this will return full profile data.
    """
    return {
        "access_token": "",
        "token_type": "bearer",
        "department": context.department,
        "department_name": context.department_name,
        "display_name": "",
        "role": "department_officer",
    }


# The endpoints below are intentionally kept in place so the frontend contract
# is stable.  They will become active once real officer DB rows are provisioned.

@router.put("/api/department/profile/name", response_model=ActionResponse)
def update_name(
    data: DepartmentOfficerUpdateName,
    context: DepartmentOfficerContext = Depends(get_current_department_officer),
    db: Session = Depends(get_db),
):
    return {"message": "Profile updates are not available until real officer accounts are provisioned.", "success": False}


@router.put("/api/department/profile/phone", response_model=ActionResponse)
def update_phone(
    data: DepartmentOfficerUpdatePhone,
    context: DepartmentOfficerContext = Depends(get_current_department_officer),
    db: Session = Depends(get_db),
):
    return {"message": "Profile updates are not available until real officer accounts are provisioned.", "success": False}


@router.put("/api/department/profile/photo", response_model=ActionResponse)
def upload_profile_photo(
    image: UploadFile = File(...),
    context: DepartmentOfficerContext = Depends(get_current_department_officer),
    db: Session = Depends(get_db),
):
    return {"message": "Profile updates are not available until real officer accounts are provisioned.", "success": False}


@router.put(
    "/api/department/profile/password",
    response_model=ActionResponse,
    status_code=status.HTTP_200_OK,
)
def change_password(
    data: DepartmentOfficerChangePassword,
    context: DepartmentOfficerContext = Depends(get_current_department_officer),
    db: Session = Depends(get_db),
):
    from app.core.config import settings
    from app.core.security import get_password_hash

    dept_key = context.department
    email = f"{dept_key.lower()}@seva-setu.in"
    officer = db.query(DepartmentOfficer).filter(DepartmentOfficer.email == email).first()
    if not officer:
        dept_name = context.department_name
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

    DepartmentOfficerService.change_password(db, officer, data)
    return {"message": "Password changed successfully.", "success": True}

