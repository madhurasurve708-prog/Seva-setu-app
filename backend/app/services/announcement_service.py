from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.db.repository import AnnouncementRepository
from app.models.nagarsevak import Nagarsevak


class AnnouncementService:
    NAGARSEVAK_READER_ROLE = "NAGARSEVAK"

    @staticmethod
    def get_announcements(db: Session, nagarsevak: Nagarsevak) -> list[dict]:
        announcements = AnnouncementRepository.get_announcements_for_nagarsevak(db, nagarsevak.ward_id)
        read_ids = AnnouncementRepository.get_read_announcement_ids(
            db,
            reader_role=AnnouncementService.NAGARSEVAK_READER_ROLE,
            reader_id=nagarsevak.id,
        )

        return [
            {
                "id": a.id,
                "title": a.title,
                "description": a.description,
                "priority": a.priority,
                "image_url": a.image_url,
                "target_type": a.target_type,
                "target_ward_id": a.target_ward_id,
                "target_department": a.target_department,
                "created_by": a.created_by,
                "is_archived": a.is_archived,
                "is_deleted": a.is_deleted,
                "created_at": a.created_at,
                "updated_at": a.updated_at,
                "is_read": a.id in read_ids,
            }
            for a in announcements
        ]

    @staticmethod
    def get_announcement_detail(db: Session, nagarsevak: Nagarsevak, announcement_id: int) -> dict:
        announcement = AnnouncementRepository.get_announcement_by_id(db, announcement_id)
        if not announcement:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Announcement not found.",
            )

        # Check if targeted to this Nagarsevak
        is_targeted = (
            announcement.target_type == "everyone"
            or announcement.target_type == "all_nagarsevaks"
            or (announcement.target_type == "ward_nagarsevaks" and announcement.target_ward_id == nagarsevak.ward_id)
        )
        if not is_targeted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Announcement not found.",
            )

        read_state = AnnouncementRepository.get_read_state(
            db,
            reader_role=AnnouncementService.NAGARSEVAK_READER_ROLE,
            reader_id=nagarsevak.id,
            announcement_id=announcement_id,
        )

        return {
            "id": announcement.id,
            "title": announcement.title,
            "description": announcement.description,
            "priority": announcement.priority,
            "image_url": announcement.image_url,
            "target_type": announcement.target_type,
            "target_ward_id": announcement.target_ward_id,
            "target_department": announcement.target_department,
            "created_by": announcement.created_by,
            "is_archived": announcement.is_archived,
            "is_deleted": announcement.is_deleted,
            "created_at": announcement.created_at,
            "updated_at": announcement.updated_at,
            "is_read": read_state is not None,
        }

    @staticmethod
    def mark_announcement_as_read(db: Session, nagarsevak: Nagarsevak, announcement_id: int) -> dict:
        announcement = AnnouncementRepository.get_announcement_by_id(db, announcement_id)
        if not announcement:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Announcement not found.",
            )

        # Check target audience
        is_targeted = (
            announcement.target_type == "everyone"
            or announcement.target_type == "all_nagarsevaks"
            or (announcement.target_type == "ward_nagarsevaks" and announcement.target_ward_id == nagarsevak.ward_id)
        )
        if not is_targeted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Announcement not found.",
            )

        AnnouncementRepository.mark_as_read(
            db,
            reader_role=AnnouncementService.NAGARSEVAK_READER_ROLE,
            reader_id=nagarsevak.id,
            announcement_id=announcement_id,
        )
        return {"success": True, "message": "Announcement marked as read."}
