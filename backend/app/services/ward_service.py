from sqlalchemy.orm import Session
from app.db.repository import WardRepository
from app.models.ward import Ward


class WardService:
    @staticmethod
    def get_all_wards(db: Session) -> list[Ward]:
        return WardRepository.get_all_wards(db)
