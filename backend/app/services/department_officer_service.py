from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.db.repository import DepartmentOfficerRepository
from app.models.department_officer import DepartmentOfficer
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.config import settings
from app.schemas.department_officer import (
    DepartmentOfficerLogin,
    DepartmentOfficerChangePassword,
    VALID_DEPARTMENT_KEYS,
)
from app.utils.storage import upload_image_to_storage, PROFILE_PHOTOS_BUCKET

ALLOWED_IMAGE_TYPES: dict[str, str] = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
}
MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB


class DepartmentOfficerService:
    @staticmethod
    def login(login_data: DepartmentOfficerLogin) -> dict:
        # 1. Validate department key
        department_name = VALID_DEPARTMENT_KEYS.get(login_data.department)
        if department_name is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid department or password.",
            )

        # 2. Validate temporary shared password (plain string comparison —
        #    no DB row exists yet, so bcrypt is not used here)
        if login_data.password != settings.DEPT_TEMP_PASSWORD:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid department or password.",
            )

        # 3. Issue JWT — subject is the department key; role claim isolates
        #    these tokens from nagarsevak tokens.
        token = create_access_token(
            subject=login_data.department,
            role="department_officer",
        )

        return {
            "access_token": token,
            "token_type": "bearer",
            "department": login_data.department,
            "department_name": department_name,
            "display_name": login_data.name,
            "role": "department_officer",
        }

    @staticmethod
    def get_profile(officer: DepartmentOfficer) -> DepartmentOfficer:
        return officer

    @staticmethod
    def update_full_name(
        db: Session, officer: DepartmentOfficer, full_name: str
    ) -> DepartmentOfficer:
        return DepartmentOfficerRepository.update_full_name(db, officer, full_name)

    @staticmethod
    def update_phone(
        db: Session, officer: DepartmentOfficer, phone_number: str
    ) -> DepartmentOfficer:
        return DepartmentOfficerRepository.update_phone(db, officer, phone_number)

    @staticmethod
    def change_password(
        db: Session,
        officer: DepartmentOfficer,
        data: DepartmentOfficerChangePassword,
    ) -> None:
        if not verify_password(data.current_password, officer.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incorrect current password.",
            )
        new_hash = get_password_hash(data.new_password)
        DepartmentOfficerRepository.update_password_hash(db, officer, new_hash)

    @staticmethod
    def upload_profile_photo(
        db: Session,
        officer: DepartmentOfficer,
        file_bytes: bytes,
        content_type: str,
    ) -> DepartmentOfficer:
        if not file_bytes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is empty.",
            )

        if len(file_bytes) > MAX_IMAGE_SIZE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File size exceeds the maximum allowed limit of "
                       f"{MAX_IMAGE_SIZE_BYTES // (1024 * 1024)} MB.",
            )

        if content_type not in ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail=f"Unsupported file type '{content_type}'. "
                       f"Allowed types: JPEG, PNG, WebP.",
            )

        extension = ALLOWED_IMAGE_TYPES[content_type]
        object_path = f"department_officers/{officer.id}.{extension}"

        photo_url = upload_image_to_storage(
            file_bytes=file_bytes,
            content_type=content_type,
            object_path=object_path,
            bucket_name=PROFILE_PHOTOS_BUCKET,
        )

        return DepartmentOfficerRepository.update_profile_photo_url(
            db=db,
            officer=officer,
            photo_url=photo_url,
        )
