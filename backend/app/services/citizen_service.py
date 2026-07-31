from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.db.repository import CitizenRepository
from app.models.citizen import Citizen
from app.models.ward import Ward
from app.schemas.citizen import CitizenProfileCreate
from app.utils.storage import upload_image_to_storage, PROFILE_PHOTOS_BUCKET

# Allowed MIME types and their canonical file extensions
ALLOWED_IMAGE_TYPES: dict[str, str] = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
}

MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB


class CitizenService:
    @staticmethod
    def create_profile(db: Session, citizen_in: CitizenProfileCreate) -> Citizen:
        # 1. Verify ward exists
        ward_exists = db.query(Ward).filter(Ward.id == citizen_in.ward_id).first()
        if not ward_exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Ward with ID {citizen_in.ward_id} does not exist.",
            )

        # 2. Reject duplicate supabase_user_id
        duplicate_user = CitizenRepository.get_by_supabase_id(db, citizen_in.supabase_user_id)
        if duplicate_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Citizen profile already exists for this Supabase user.",
            )

        # 3. Reject duplicate phone_number
        duplicate_phone = CitizenRepository.get_by_phone_number(db, citizen_in.phone_number)
        if duplicate_phone:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Phone number is already registered by another citizen.",
            )

        # 4. Create citizen profile
        return CitizenRepository.create_citizen(db, citizen_in)

    @staticmethod
    def get_profile(db: Session, supabase_user_id: str) -> Citizen:
        citizen = CitizenRepository.get_by_supabase_id(db, supabase_user_id)
        if not citizen:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Citizen profile not found.",
            )
        return citizen

    @staticmethod
    def upload_profile_photo(
        db: Session,
        supabase_user_id: str,
        file_bytes: bytes,
        content_type: str,
    ) -> Citizen:
        # 1. Find the citizen using supabase_user_id
        citizen = CitizenRepository.get_by_supabase_id(db, supabase_user_id)
        if not citizen:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Citizen profile not found.",
            )

        # 2. Reject empty uploads
        if not file_bytes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is empty.",
            )

        # 3. Enforce maximum file size
        if len(file_bytes) > MAX_IMAGE_SIZE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File size exceeds the maximum allowed limit of {MAX_IMAGE_SIZE_BYTES // (1024 * 1024)} MB.",
            )

        # 4. Reject unsupported MIME types
        if content_type not in ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail=f"Unsupported file type '{content_type}'. Allowed types: JPEG, PNG, WebP.",
            )

        # 5. Upload to Supabase Storage.
        #    Object path is deterministic per citizen — re-uploading replaces the
        #    existing photo (upsert=true inside upload_image_to_storage).
        extension = ALLOWED_IMAGE_TYPES[content_type]
        object_path = f"citizens/{citizen.id}.{extension}"

        photo_url = upload_image_to_storage(
            file_bytes=file_bytes,
            content_type=content_type,
            object_path=object_path,
            bucket_name=PROFILE_PHOTOS_BUCKET,
        )

        # 6. Persist the URL and return the updated citizen profile
        return CitizenRepository.update_profile_photo_url(
            db=db,
            citizen=citizen,
            photo_url=photo_url,
        )
