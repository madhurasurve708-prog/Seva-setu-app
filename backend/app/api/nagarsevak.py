from fastapi import APIRouter, Depends, File, UploadFile, status
from sqlalchemy.orm import Session
from app.dependencies.db import get_db
from app.dependencies.auth import get_current_nagarsevak
from app.models.nagarsevak import Nagarsevak
from app.schemas.nagarsevak import (
    NagarsevakLogin,
    NagarsevakLoginResponse,
    NagarsevakProfile,
    NagarsevakUpdateName,
    NagarsevakUpdatePhone,
    NagarsevakChangePassword,
)
from app.services.nagarsevak_service import NagarsevakService
from app.schemas.common import MessageResponse

router = APIRouter(tags=["Nagarsevak Authentication & Profile"])


@router.post(
    "/api/nagarsevak/login",
    response_model=NagarsevakLoginResponse,
    status_code=status.HTTP_200_OK,
)
def login(login_data: NagarsevakLogin, db: Session = Depends(get_db)):
    return NagarsevakService.login(db, login_data)


@router.get("/api/nagarsevak/profile", response_model=NagarsevakProfile)
def get_profile(current_nagarsevak: Nagarsevak = Depends(get_current_nagarsevak)):
    return NagarsevakService.get_profile(current_nagarsevak)


@router.put("/api/nagarsevak/profile/name", response_model=NagarsevakProfile)
def update_name(
    data: NagarsevakUpdateName,
    current_nagarsevak: Nagarsevak = Depends(get_current_nagarsevak),
    db: Session = Depends(get_db),
):
    return NagarsevakService.update_name(db, current_nagarsevak, data.name)


@router.put("/api/nagarsevak/profile/phone", response_model=NagarsevakProfile)
def update_phone(
    data: NagarsevakUpdatePhone,
    current_nagarsevak: Nagarsevak = Depends(get_current_nagarsevak),
    db: Session = Depends(get_db),
):
    return NagarsevakService.update_phone(db, current_nagarsevak, data.phone_number)


@router.put("/api/nagarsevak/profile/photo", response_model=NagarsevakProfile)
def upload_profile_photo(
    image: UploadFile = File(...),
    current_nagarsevak: Nagarsevak = Depends(get_current_nagarsevak),
    db: Session = Depends(get_db),
):
    file_bytes = image.file.read()
    content_type = image.content_type or ""
    return NagarsevakService.upload_profile_photo(
        db=db,
        nagarsevak=current_nagarsevak,
        file_bytes=file_bytes,
        content_type=content_type,
    )


@router.put(
    "/api/nagarsevak/profile/password",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
)
def change_password(
    data: NagarsevakChangePassword,
    current_nagarsevak: Nagarsevak = Depends(get_current_nagarsevak),
    db: Session = Depends(get_db),
):
    NagarsevakService.change_password(db, current_nagarsevak, data)
    return {"message": "Password changed successfully."}
