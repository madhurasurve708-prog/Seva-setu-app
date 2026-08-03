from __future__ import annotations
from datetime import datetime
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import String, ForeignKey, DateTime, Boolean, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base_class import Base

if TYPE_CHECKING:
    from app.models.ward import Ward
    from app.models.complaint import Complaint


class Citizen(Base):
    __tablename__ = "citizens"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    supabase_user_id: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    phone_number: Mapped[str] = mapped_column(String(20), nullable=False)
    ward_id: Mapped[int] = mapped_column(ForeignKey("wards.id", ondelete="RESTRICT"), nullable=False, index=True)
    locality: Mapped[str] = mapped_column(String(255), nullable=False)
    profile_photo_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_blocked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_restricted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relationships
    ward: Mapped[Ward] = relationship("Ward", back_populates="citizens")
    complaints: Mapped[List[Complaint]] = relationship(
        "Complaint", back_populates="citizen", cascade="all, delete-orphan"
    )
