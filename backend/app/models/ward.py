from __future__ import annotations
from datetime import datetime
from typing import List, TYPE_CHECKING
from sqlalchemy import String, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base_class import Base

if TYPE_CHECKING:
    from app.models.citizen import Citizen
    from app.models.complaint import Complaint
    from app.models.nagarsevak import Nagarsevak


class Ward(Base):
    __tablename__ = "wards"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    ward_number: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    ward_name: Mapped[str] = mapped_column(String(100), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    citizens: Mapped[List[Citizen]] = relationship(
        "Citizen", back_populates="ward", cascade="all, delete-orphan"
    )
    complaints: Mapped[List[Complaint]] = relationship(
        "Complaint", back_populates="ward", cascade="all, delete-orphan"
    )
    nagarsevaks: Mapped[List[Nagarsevak]] = relationship(
        "Nagarsevak", back_populates="ward", cascade="all, delete-orphan"
    )
