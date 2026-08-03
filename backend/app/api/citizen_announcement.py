from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.dependencies.citizen_auth import get_current_citizen
from app.dependencies.db import get_db
from app.models.citizen import Citizen
from app.schemas.announcement import AnnouncementResponse
from app.schemas.common import ActionResponse
from app.services.citizen_announcement_service import CitizenAnnouncementService


router = APIRouter(tags=["Citizen Announcements"])


@router.get("/api/citizen/announcements", response_model=list[AnnouncementResponse])
def list_announcements(current_citizen: Citizen = Depends(get_current_citizen), db: Session = Depends(get_db)):
    return CitizenAnnouncementService.list(db, current_citizen)


@router.get("/api/citizen/announcements/{announcement_id}", response_model=AnnouncementResponse)
def get_announcement(announcement_id: int, current_citizen: Citizen = Depends(get_current_citizen), db: Session = Depends(get_db)):
    return CitizenAnnouncementService.get_detail(db, current_citizen, announcement_id)


@router.post("/api/citizen/announcements/{announcement_id}/read", response_model=ActionResponse, status_code=status.HTTP_200_OK)
def mark_announcement_read(announcement_id: int, current_citizen: Citizen = Depends(get_current_citizen), db: Session = Depends(get_db)):
    return CitizenAnnouncementService.mark_read(db, current_citizen, announcement_id)
