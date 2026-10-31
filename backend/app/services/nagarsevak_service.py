from fastapi import HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session
from app.db.repository import NagarsevakRepository
from app.models.nagarsevak import Nagarsevak
from app.core.security import verify_password, get_password_hash, create_access_token
from app.schemas.nagarsevak import NagarsevakLogin, NagarsevakChangePassword
from app.utils.storage import upload_image_to_storage, PROFILE_PHOTOS_BUCKET
from app.utils.phone import normalize_phone_number

ALLOWED_IMAGE_TYPES: dict[str, str] = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
}
MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB

_INVALID_CREDENTIALS_MSG = "Invalid credentials or password."


class NagarsevakService:
    @staticmethod
    def login(db: Session, login_data: NagarsevakLogin) -> dict:
        """
        Authenticate a Nagarsevak exclusively by registered mobile number and password.

        The identity and assigned ward are always retrieved from the authenticated database record.
        A generic 401 message is returned for both an unknown phone number and an incorrect password.
        Inactive accounts are rejected with 403.
        No demo bypasses or name-based fallbacks are permitted.
        """
        nagarsevak = NagarsevakRepository.get_by_phone_number(
            db, login_data.phone_number
        )

        if not nagarsevak:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=_INVALID_CREDENTIALS_MSG,
            )

        # Verify password strictly against stored bcrypt hash — no demo bypass
        if not verify_password(login_data.password, nagarsevak.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=_INVALID_CREDENTIALS_MSG,
            )

        # Reject inactive accounts
        if not nagarsevak.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This Nagarsevak account is inactive.",
            )

        # Issue JWT — subject is the Nagarsevak's database ID with explicit role
        token = create_access_token(subject=nagarsevak.id, role="nagarsevak")

        return {
            "access_token": token,
            "token_type": "bearer",
            "nagarsevak": nagarsevak,
        }

    @staticmethod
    def get_profile(nagarsevak: Nagarsevak) -> Nagarsevak:
        return nagarsevak

    @staticmethod
    def update_name(db: Session, nagarsevak: Nagarsevak, name: str) -> Nagarsevak:
        return NagarsevakRepository.update_name(db, nagarsevak, name)

    @staticmethod
    def update_phone(db: Session, nagarsevak: Nagarsevak, phone_number: str) -> Nagarsevak:
        normalized = normalize_phone_number(phone_number)
        if not normalized or len(normalized) < 10 or not normalized.isdigit():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid phone number format. Must contain at least 10 digits.",
            )

        # Uniqueness validation across other Nagarsevak accounts
        existing = (
            db.query(Nagarsevak)
            .filter(
                Nagarsevak.id != nagarsevak.id,
                or_(
                    Nagarsevak.phone_number == normalized,
                    Nagarsevak.phone_number == f"+91{normalized}",
                ),
            )
            .first()
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Phone number is already registered to another account.",
            )

        return NagarsevakRepository.update_phone(db, nagarsevak, normalized)

    @staticmethod
    def change_password(
        db: Session, nagarsevak: Nagarsevak, data: NagarsevakChangePassword
    ) -> None:
        # Verify current password before accepting the change
        if not verify_password(data.current_password, nagarsevak.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incorrect current password.",
            )
        # Hash and persist the new password
        new_hash = get_password_hash(data.new_password)
        NagarsevakRepository.update_password_hash(db, nagarsevak, new_hash)

    @staticmethod
    def upload_profile_photo(
        db: Session,
        nagarsevak: Nagarsevak,
        file_bytes: bytes,
        content_type: str,
    ) -> Nagarsevak:
        # Reject empty uploads
        if not file_bytes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is empty.",
            )

        # Enforce maximum file size
        if len(file_bytes) > MAX_IMAGE_SIZE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File size exceeds the maximum allowed limit of "
                       f"{MAX_IMAGE_SIZE_BYTES // (1024 * 1024)} MB.",
            )

        # Reject unsupported MIME types
        if content_type not in ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail=f"Unsupported file type '{content_type}'. "
                       f"Allowed types: JPEG, PNG, WebP.",
            )

        # Deterministic object path per nagarsevak — upsert overwrites on re-upload
        extension = ALLOWED_IMAGE_TYPES[content_type]
        object_path = f"nagarsevaks/{nagarsevak.id}.{extension}"

        photo_url = upload_image_to_storage(
            file_bytes=file_bytes,
            content_type=content_type,
            object_path=object_path,
            bucket_name=PROFILE_PHOTOS_BUCKET,
        )

        return NagarsevakRepository.update_profile_photo_url(
            db=db,
            nagarsevak=nagarsevak,
            photo_url=photo_url,
        )
