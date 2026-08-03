from fastapi import APIRouter, Depends, File, Form, UploadFile, status
from sqlalchemy.orm import Session
from app.dependencies.db import get_db
from app.schemas.citizen import CitizenProfileCreate, CitizenProfileResponse
from app.services.citizen_service import CitizenService
from app.dependencies.citizen_auth import (
    SupabaseCitizen,
    get_current_citizen,
    get_current_supabase_citizen,
)
from app.models.citizen import Citizen

router = APIRouter(tags=["Citizen Profile"])


@router.post("/api/citizen/profile", response_model=CitizenProfileResponse, status_code=status.HTTP_201_CREATED)
def create_profile(
    citizen_in: CitizenProfileCreate,
    identity: SupabaseCitizen = Depends(get_current_supabase_citizen),
    db: Session = Depends(get_db),
):
    return CitizenService.create_profile(db, citizen_in, identity.user_id, identity.phone_number)


@router.get("/api/citizen/profile", response_model=CitizenProfileResponse)
def get_profile(current_citizen: Citizen = Depends(get_current_citizen)):
    return current_citizen


@router.put(
    "/api/citizen/profile/photo",
    response_model=CitizenProfileResponse,
    status_code=status.HTTP_200_OK,
)
def upload_profile_photo(
    image: UploadFile = File(...),
    current_citizen: Citizen = Depends(get_current_citizen),
    db: Session = Depends(get_db),
):
    file_bytes = image.file.read()
    content_type = image.content_type or ""

    return CitizenService.upload_profile_photo(
        db=db,
        citizen=current_citizen,
        file_bytes=file_bytes,
        content_type=content_type,
    )
