from __future__ import annotations
from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import Integer, String, ForeignKey, DateTime, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base_class import Base

if TYPE_CHECKING:
    from app.models.announcement import Announcement


class AnnouncementRead(Base):
    """
    Tracks which actor has read which announcement.

    Polymorphic read-tracking — reusable by every portal:
      reader_role  — "NAGARSEVAK", "CITIZEN", "DEPARTMENT_OFFICER", "MAIN_ADMIN"
      reader_id    — PK from the relevant actor table (no FK constraint
                     because it is polymorphic; role identifies the table)

    The unique constraint on (reader_role, reader_id, announcement_id)
    guarantees one read record per actor per announcement.
    """

    __tablename__ = "announcement_reads"
    __table_args__ = (
        UniqueConstraint(
            "reader_role", "reader_id", "announcement_id",
            name="uq_announcement_read",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    announcement_id: Mapped[int] = mapped_column(
        ForeignKey("announcements.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    reader_role: Mapped[str] = mapped_column(String(50), nullable=False)
    reader_id: Mapped[int] = mapped_column(Integer, nullable=False)
    read_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationship back to announcement
    announcement: Mapped[Announcement] = relationship(
        "Announcement", back_populates="read_states"
    )
