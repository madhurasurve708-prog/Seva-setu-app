from __future__ import annotations
from datetime import datetime
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, ForeignKey, DateTime, Boolean, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base_class import Base

if TYPE_CHECKING:
    from app.models.ward import Ward


class Nagarsevak(Base):
    __tablename__ = "nagarsevaks"
    __table_args__ = (
        # Prevents duplicate nagarsevak entries for the same ward.
        # Also used as the ON CONFLICT target in the seed script.
        UniqueConstraint("name", "ward_id", name="uq_nagarsevak_name_ward"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    phone_number: Mapped[str] = mapped_column(String(20), nullable=False)
    ward_id: Mapped[int] = mapped_column(ForeignKey("wards.id", ondelete="RESTRICT"), nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    profile_photo_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relationships
    ward: Mapped[Ward] = relationship("Ward", back_populates="nagarsevaks")

    # Convenience properties so the service layer can return the ORM object
    # directly without constructing a raw dict.  These mirror the same pattern
    # Pydantic uses when from_attributes=True reads nested relationships.
    @property
    def ward_name(self) -> str:
        return self.ward.ward_name

    @property
    def ward_number(self) -> str:
        return self.ward.ward_number
