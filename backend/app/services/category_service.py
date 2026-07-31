from sqlalchemy.orm import Session
from app.db.repository import CategoryRepository
from app.models.category import Category


class CategoryService:
    @staticmethod
    def get_all_categories(db: Session) -> list[Category]:
        return CategoryRepository.get_all_categories(db)
