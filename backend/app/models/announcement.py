from __future__ import annotations
from datetime import datetime
from typing import TYPE_CHECKING, Optional
from sqlalchemy import String, Text, ForeignKey, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base_class import Base

if TYPE_CHECKING:
    from app.models.ward import Ward
    from app.models.announcement_read import AnnouncementRead


class Announcement(Base):
    __tablename__ = "announcements"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    priority: Mapped[str] = mapped_column(String(50), nullable=False)  # Emergency, High, Medium, Low
    # target_type controls which portals see this announcement:
    #   "everyone"           — all roles (citizens, nagarsevaks, officials)
    #   "all_nagarsevaks"    — all nagarsevaks across all wards
    #   "ward_nagarsevaks"   — nagarsevaks assigned to target_ward_id only
    target_type: Mapped[str] = mapped_column(String(50), nullable=False)
    target_ward_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("wards.id", ondelete="CASCADE"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relationships
    ward: Mapped[Optional[Ward]] = relationship("Ward")
    read_states: Mapped[list[AnnouncementRead]] = relationship(
        "AnnouncementRead",
        back_populates="announcement",
        cascade="all, delete-orphan",
    )
