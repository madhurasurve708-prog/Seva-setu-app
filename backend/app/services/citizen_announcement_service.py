from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.db.repository import AnnouncementRepository
from app.models.citizen import Citizen


class CitizenAnnouncementService:
    READER_ROLE = "CITIZEN"

    @staticmethod
    def _is_targeted(announcement, citizen: Citizen) -> bool:
        return announcement.target_type in {"everyone", "all_citizens"} or (
            announcement.target_type == "ward_citizens"
            and announcement.target_ward_id == citizen.ward_id
        )

    @classmethod
    def _serialize(cls, db: Session, citizen: Citizen, announcement) -> dict:
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
            "is_read": AnnouncementRepository.get_read_state(
                db, cls.READER_ROLE, citizen.id, announcement.id
            ) is not None,
        }

    @classmethod
    def list(cls, db: Session, citizen: Citizen) -> list[dict]:
        announcements = AnnouncementRepository.get_announcements_for_citizen(db, citizen.ward_id)
        return [cls._serialize(db, citizen, announcement) for announcement in announcements]

    @classmethod
    def get_detail(cls, db: Session, citizen: Citizen, announcement_id: int) -> dict:
        announcement = AnnouncementRepository.get_announcement_by_id(db, announcement_id)
        if announcement is None or announcement.is_archived or announcement.is_deleted or not cls._is_targeted(announcement, citizen):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Announcement not found.")
        return cls._serialize(db, citizen, announcement)

    @classmethod
    def mark_read(cls, db: Session, citizen: Citizen, announcement_id: int) -> dict:
        cls.get_detail(db, citizen, announcement_id)
        AnnouncementRepository.mark_as_read(db, cls.READER_ROLE, citizen.id, announcement_id)
        return {"success": True, "message": "Announcement marked as read."}
