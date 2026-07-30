from fastapi import APIRouter, Depends, File, Form, UploadFile, status
from sqlalchemy.orm import Session
from app.dependencies.db import get_db
from app.schemas.citizen import CitizenProfileCreate, CitizenProfileResponse
from app.services.citizen_service import CitizenService

router = APIRouter(tags=["Citizen Profile"])


@router.post("/api/citizen/profile", response_model=CitizenProfileResponse, status_code=status.HTTP_201_CREATED)
def create_profile(citizen_in: CitizenProfileCreate, db: Session = Depends(get_db)):
    return CitizenService.create_profile(db, citizen_in)


@router.get("/api/citizen/profile/{supabase_user_id}", response_model=CitizenProfileResponse)
def get_profile(supabase_user_id: str, db: Session = Depends(get_db)):
    return CitizenService.get_profile(db, supabase_user_id)


@router.put(
    "/api/citizen/profile/photo",
    response_model=CitizenProfileResponse,
    status_code=status.HTTP_200_OK,
)
def upload_profile_photo(
    supabase_user_id: str = Form(...),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    file_bytes = image.file.read()
    content_type = image.content_type or ""

    return CitizenService.upload_profile_photo(
        db=db,
        supabase_user_id=supabase_user_id,
        file_bytes=file_bytes,
        content_type=content_type,
    )
