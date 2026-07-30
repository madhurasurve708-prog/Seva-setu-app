from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.dependencies.db import get_db
from app.dependencies.auth import get_current_nagarsevak
from app.models.nagarsevak import Nagarsevak
from app.schemas.announcement import AnnouncementResponse
from app.services.announcement_service import AnnouncementService
from app.schemas.common import ActionResponse

router = APIRouter(tags=["Nagarsevak Announcements"])


@router.get(
    "/api/nagarsevak/announcements",
    response_model=list[AnnouncementResponse],
    status_code=status.HTTP_200_OK,
)
def get_announcements(
    current_nagarsevak: Nagarsevak = Depends(get_current_nagarsevak),
    db: Session = Depends(get_db),
):
    return AnnouncementService.get_announcements(db, current_nagarsevak)


@router.get(
    "/api/nagarsevak/announcements/{announcement_id}",
    response_model=AnnouncementResponse,
    status_code=status.HTTP_200_OK,
)
def get_announcement_detail(
    announcement_id: int,
    current_nagarsevak: Nagarsevak = Depends(get_current_nagarsevak),
    db: Session = Depends(get_db),
):
    return AnnouncementService.get_announcement_detail(db, current_nagarsevak, announcement_id)


@router.post(
    "/api/nagarsevak/announcements/{announcement_id}/read",
    response_model=ActionResponse,
    status_code=status.HTTP_200_OK,
)
def mark_announcement_as_read(
    announcement_id: int,
    current_nagarsevak: Nagarsevak = Depends(get_current_nagarsevak),
    db: Session = Depends(get_db),
):
    return AnnouncementService.mark_announcement_as_read(db, current_nagarsevak, announcement_id)
