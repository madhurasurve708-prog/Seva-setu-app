from fastapi import APIRouter, Depends, File, UploadFile, status
from sqlalchemy.orm import Session
from app.dependencies.db import get_db
from app.schemas.complaint import ComplaintCreate, ComplaintResponse
from app.services.complaint_service import ComplaintService
from app.dependencies.citizen_auth import get_current_citizen
from app.models.citizen import Citizen

router = APIRouter(tags=["Citizen Complaints"])


@router.post("/api/citizen/complaints", response_model=ComplaintResponse, status_code=status.HTTP_201_CREATED)
def create_complaint(
    complaint_in: ComplaintCreate,
    current_citizen: Citizen = Depends(get_current_citizen),
    db: Session = Depends(get_db),
):
    return ComplaintService.create_complaint(db, complaint_in, current_citizen)


@router.get("/api/citizen/complaints", response_model=list[ComplaintResponse], status_code=status.HTTP_200_OK)
def get_my_complaints(current_citizen: Citizen = Depends(get_current_citizen), db: Session = Depends(get_db)):
    return ComplaintService.get_my_complaints(db, current_citizen)


@router.get("/api/citizen/complaints/{complaint_id}", response_model=ComplaintResponse, status_code=status.HTTP_200_OK)
def get_complaint_detail(complaint_id: int, current_citizen: Citizen = Depends(get_current_citizen), db: Session = Depends(get_db)):
    return ComplaintService.get_complaint_detail(db, current_citizen, complaint_id)


@router.put(
    "/api/citizen/complaints/{complaint_id}/image",
    response_model=ComplaintResponse,
    status_code=status.HTTP_200_OK,
)
def upload_complaint_image(
    complaint_id: int,
    image: UploadFile = File(...),
    current_citizen: Citizen = Depends(get_current_citizen),
    db: Session = Depends(get_db),
):
    file_bytes = image.file.read()
    content_type = image.content_type or ""

    return ComplaintService.upload_complaint_image(
        db=db,
        citizen=current_citizen,
        complaint_id=complaint_id,
        file_bytes=file_bytes,
        content_type=content_type,
    )
