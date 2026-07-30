from __future__ import annotations
from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import String, Text, ForeignKey, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base_class import Base

if TYPE_CHECKING:
    from app.models.complaint import Complaint


class ComplaintEscalation(Base):
    __tablename__ = "complaint_escalations"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    complaint_id: Mapped[int] = mapped_column(
        ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False, index=True
    )
    escalated_by_role: Mapped[str] = mapped_column(String(50), nullable=False)
    escalated_by_id: Mapped[int] = mapped_column(nullable=False)
    escalated_by_name: Mapped[str] = mapped_column(String(150), nullable=False)
    escalated_to: Mapped[str] = mapped_column(String(100), nullable=False)
    escalation_note: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationship back to complaint
    complaint: Mapped[Complaint] = relationship("Complaint", back_populates="escalations")
