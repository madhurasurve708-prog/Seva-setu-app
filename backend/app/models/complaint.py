from __future__ import annotations
from datetime import datetime
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Text, ForeignKey, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base_class import Base
from app.core.constants import ComplaintStatus

if TYPE_CHECKING:
    from app.models.citizen import Citizen
    from app.models.ward import Ward
    from app.models.category import Category
    from app.models.complaint_history import ComplaintHistory
    from app.models.complaint_escalation import ComplaintEscalation


class Complaint(Base):
    __tablename__ = "complaints"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    citizen_id: Mapped[int] = mapped_column(ForeignKey("citizens.id", ondelete="CASCADE"), nullable=False, index=True)
    ward_id: Mapped[int] = mapped_column(ForeignKey("wards.id", ondelete="RESTRICT"), nullable=False, index=True)
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id", ondelete="RESTRICT"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    manual_location: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    image_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default=ComplaintStatus.PENDING, server_default=ComplaintStatus.PENDING, nullable=False)
    priority: Mapped[str] = mapped_column(String(50), default="Medium", server_default="Medium", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relationships
    citizen: Mapped[Citizen] = relationship("Citizen", back_populates="complaints")
    ward: Mapped[Ward] = relationship("Ward", back_populates="complaints")
    category: Mapped[Category] = relationship("Category", back_populates="complaints")
    history: Mapped[list[ComplaintHistory]] = relationship(
        "ComplaintHistory",
        back_populates="complaint",
        order_by="ComplaintHistory.created_at.asc()",
        cascade="all, delete-orphan",
    )
    escalations: Mapped[list[ComplaintEscalation]] = relationship(
        "ComplaintEscalation",
        back_populates="complaint",
        order_by="ComplaintEscalation.created_at.asc()",
        cascade="all, delete-orphan",
    )
