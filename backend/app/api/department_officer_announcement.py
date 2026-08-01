from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.dependencies.db import get_db
from app.dependencies.department_auth import get_current_department_officer, DepartmentOfficerContext
from app.schemas.announcement import AnnouncementResponse
from app.services.department_officer_announcement_service import DepartmentOfficerAnnouncementService
from app.schemas.common import ActionResponse

router = APIRouter(tags=["Department Officer Announcements"])


@router.get(
    "/api/department/announcements",
    response_model=list[AnnouncementResponse],
    status_code=status.HTTP_200_OK,
)
def get_announcements(
    context: DepartmentOfficerContext = Depends(get_current_department_officer),
    db: Session = Depends(get_db),
):
    """Get announcements for department officers."""
    return DepartmentOfficerAnnouncementService.get_announcements(db, context)


@router.get(
    "/api/department/announcements/{announcement_id}",
    response_model=AnnouncementResponse,
    status_code=status.HTTP_200_OK,
)
def get_announcement_detail(
    announcement_id: int,
    context: DepartmentOfficerContext = Depends(get_current_department_officer),
    db: Session = Depends(get_db),
):
    """Get announcement detail for department officers."""
    return DepartmentOfficerAnnouncementService.get_announcement_detail(db, context, announcement_id)


@router.post(
    "/api/department/announcements/{announcement_id}/read",
    response_model=ActionResponse,
    status_code=status.HTTP_200_OK,
)
def mark_announcement_as_read(
    announcement_id: int,
    context: DepartmentOfficerContext = Depends(get_current_department_officer),
    db: Session = Depends(get_db),
):
    """Mark announcement as read for department officers."""
    return DepartmentOfficerAnnouncementService.mark_announcement_as_read(db, context, announcement_id)