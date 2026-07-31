from __future__ import annotations
from datetime import datetime
from typing import Optional, TYPE_CHECKING
from sqlalchemy import Integer, String, Text, ForeignKey, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base_class import Base

if TYPE_CHECKING:
    from app.models.complaint import Complaint


class ComplaintHistory(Base):
    __tablename__ = "complaint_history"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    complaint_id: Mapped[int] = mapped_column(
        ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False, index=True
    )

    # Who wrote this entry.
    # author_role  — human-readable role string: "Nagarsevak", "Department",
    #                "Admin", "System".  Used by all portals to label the entry.
    # author_name  — display name at the time of writing (denormalised so the
    #                entry remains readable even if the actor is later renamed).
    # author_id    — PK from the relevant actor table (nagarsevaks.id,
    #                department_officers.id, admins.id, etc.).  Nullable because
    #                system-generated entries (e.g. auto status transitions) have
    #                no actor row.  Not a FK constraint because it is polymorphic
    #                — the role column identifies which table it references.
    author_role: Mapped[str] = mapped_column(String(50), nullable=False)
    author_name: Mapped[str] = mapped_column(String(150), nullable=False)
    author_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    note_text: Mapped[str] = mapped_column(Text, nullable=False)
    image_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationship back to complaint
    complaint: Mapped[Complaint] = relationship("Complaint", back_populates="history")
