from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.db.repository import CitizenRepository, ComplaintRepository, CategoryRepository
from app.models.complaint import Complaint
from app.schemas.complaint import ComplaintCreate
from app.utils.storage import upload_image_to_storage
from app.core.content_validation import ensure_appropriate_text

# Allowed MIME types and their canonical file extensions
ALLOWED_IMAGE_TYPES: dict[str, str] = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
}

MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB


class ComplaintService:
    @staticmethod
    def create_complaint(db: Session, complaint_in: ComplaintCreate, citizen) -> Complaint:
        ensure_appropriate_text(complaint_in.description, "Complaint description")

        # 1. Verify selected category exists
        category_exists = CategoryRepository.get_by_id(db, complaint_in.category_id)
        if not category_exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Category with ID {complaint_in.category_id} does not exist.",
            )

        # 2. Read ward_id from the authenticated citizen profile.
        return ComplaintRepository.create_complaint(
            db=db,
            citizen_id=citizen.id,
            ward_id=citizen.ward_id,
            category_id=complaint_in.category_id,
            title=complaint_in.title,
            description=complaint_in.description,
            manual_location=complaint_in.manual_location,
        )

    @staticmethod
    def get_my_complaints(db: Session, citizen) -> list[Complaint]:
        return ComplaintRepository.get_complaints_by_supabase_user(db, citizen.supabase_user_id)

    @staticmethod
    def get_complaint_detail(db: Session, citizen, complaint_id: int) -> Complaint:
        complaint = ComplaintRepository.get_complaint_by_id_for_citizen(
            db=db,
            complaint_id=complaint_id,
            citizen_id=citizen.id,
        )
        if not complaint:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Complaint not found.",
            )

        return complaint

    @staticmethod
    def upload_complaint_image(
        db: Session,
        citizen,
        complaint_id: int,
        file_bytes: bytes,
        content_type: str,
    ) -> Complaint:
        # 1. Verify the complaint exists and belongs to this citizen
        complaint = ComplaintRepository.get_complaint_by_id_for_citizen(
            db=db,
            complaint_id=complaint_id,
            citizen_id=citizen.id,
        )
        if not complaint:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Complaint not found.",
            )

        # 3. Reject empty uploads
        if not file_bytes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is empty.",
            )

        # 4. Enforce maximum file size
        if len(file_bytes) > MAX_IMAGE_SIZE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File size exceeds the maximum allowed limit of {MAX_IMAGE_SIZE_BYTES // (1024 * 1024)} MB.",
            )

        # 5. Reject unsupported MIME types
        if content_type not in ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail=f"Unsupported file type '{content_type}'. Allowed types: JPEG, PNG, WebP.",
            )

        # 6. Upload to Supabase Storage.
        #    The object path is deterministic per complaint — uploading again
        #    overwrites the previous image (upsert=true in the storage utility).
        extension = ALLOWED_IMAGE_TYPES[content_type]
        object_path = f"complaints/{complaint_id}.{extension}"

        public_url = upload_image_to_storage(
            file_bytes=file_bytes,
            content_type=content_type,
            object_path=object_path,
        )

        # 7. Persist the public URL on the complaint record and return it
        return ComplaintRepository.update_complaint_image_url(
            db=db,
            complaint=complaint,
            image_url=public_url,
        )
