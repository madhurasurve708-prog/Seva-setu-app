from __future__ import annotations
from datetime import datetime
from typing import TYPE_CHECKING, Optional
from sqlalchemy import String, Text, ForeignKey, DateTime, Boolean, func
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
    image_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    # target_type controls which portals see this announcement:
    #   "everyone"           — all roles (citizens, nagarsevaks, officials)
    #   "all_citizens"       — all citizens across all wards
    #   "ward_citizens"      — citizens of target_ward_id only
    #   "all_nagarsevaks"    — all nagarsevaks across all wards
    #   "ward_nagarsevaks"   — nagarsevaks assigned to target_ward_id only
    #   "all_department_officers" — all department officers
    #   "department_officers" — officers of target_department only
    target_type: Mapped[str] = mapped_column(String(50), nullable=False)
    target_ward_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("wards.id", ondelete="CASCADE"), nullable=True
    )
    target_department: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    created_by: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
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
