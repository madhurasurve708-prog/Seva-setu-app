import hashlib

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
        
        reader_id = DepartmentOfficerAnnouncementService._reader_id(context.department)
        
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

        reader_id = DepartmentOfficerAnnouncementService._reader_id(context.department)
        
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

        reader_id = DepartmentOfficerAnnouncementService._reader_id(context.department)

        AnnouncementRepository.mark_as_read(
            db,
            reader_role=DepartmentOfficerAnnouncementService.DEPARTMENT_READER_ROLE,
            reader_id=reader_id,
            announcement_id=announcement_id,
        )
        return {"success": True, "message": "Announcement marked as read."}
    @staticmethod
    def _reader_id(department: str) -> int:
        """Stable positive integer for shared department credentials.

        Python's built-in hash is randomized on every process start, which made
        read receipts disappear after a deployment or restart.
        """
        return int.from_bytes(hashlib.sha256(department.encode("utf-8")).digest()[:4], "big") & 0x7FFFFFFF
