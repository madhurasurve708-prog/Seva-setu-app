from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.db.repository import AnnouncementRepository
from app.dependencies.department_auth import DepartmentOfficerContext


class DepartmentOfficerAnnouncementService:
    DEPARTMENT_READER_ROLE = "DEPARTMENT_OFFICER"

    @staticmethod
    def get_announcements(db: Session, context: DepartmentOfficerContext) -> list[dict]:
        """Get announcements for department officers."""
        announcements = AnnouncementRepository.get_announcements_for_department_officer(db)
        
        # Since department officers don't have individual IDs yet, we'll use department key as reader_id
        # Convert department key to a numeric ID for consistency
        reader_id = hash(context.department) % 1000000  # Simple hash for demo purposes
        
        read_ids = AnnouncementRepository.get_read_announcement_ids(
            db,
            reader_role=DepartmentOfficerAnnouncementService.DEPARTMENT_READER_ROLE,
            reader_id=reader_id,
        )

        return [
            {
                "id": a.id,
                "title": a.title,
                "description": a.description,
                "priority": a.priority,
                "created_at": a.created_at,
                "is_read": a.id in read_ids,
            }
            for a in announcements
        ]

    @staticmethod
    def get_announcement_detail(db: Session, context: DepartmentOfficerContext, announcement_id: int) -> dict:
        """Get announcement detail for department officer."""
        announcement = AnnouncementRepository.get_announcement_by_id(db, announcement_id)
        if not announcement:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Announcement not found.",
            )

        # Check if targeted to department officers or everyone
        is_targeted = (
            announcement.target_type == "everyone"
            or announcement.target_type == "all_department_officers"
        )
        if not is_targeted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Announcement not found.",
            )

        # Use department key as reader_id
        reader_id = hash(context.department) % 1000000
        
        read_state = AnnouncementRepository.get_read_state(
            db,
            reader_role=DepartmentOfficerAnnouncementService.DEPARTMENT_READER_ROLE,
            reader_id=reader_id,
            announcement_id=announcement_id,
        )

        return {
            "id": announcement.id,
            "title": announcement.title,
            "description": announcement.description,
            "priority": announcement.priority,
            "created_at": announcement.created_at,
            "is_read": read_state is not None,
        }

    @staticmethod
    def mark_announcement_as_read(db: Session, context: DepartmentOfficerContext, announcement_id: int) -> dict:
        """Mark announcement as read for department officer."""
        announcement = AnnouncementRepository.get_announcement_by_id(db, announcement_id)
        if not announcement:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Announcement not found.",
            )

        # Check target audience
        is_targeted = (
            announcement.target_type == "everyone"
            or announcement.target_type == "all_department_officers"
        )
        if not is_targeted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Announcement not found.",
            )

        # Use department key as reader_id
        reader_id = hash(context.department) % 1000000

        AnnouncementRepository.mark_as_read(
            db,
            reader_role=DepartmentOfficerAnnouncementService.DEPARTMENT_READER_ROLE,
            reader_id=reader_id,
            announcement_id=announcement_id,
        )
        return {"success": True, "message": "Announcement marked as read."}