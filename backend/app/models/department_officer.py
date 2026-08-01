from __future__ import annotations
from datetime import datetime
from typing import Optional
from sqlalchemy import String, DateTime, Boolean, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base_class import Base


# Canonical department name strings — must match CATEGORY_TO_DEPARTMENT values
# used in nagarsevak_complaint_service.py so complaint routing stays consistent.
VALID_DEPARTMENTS = frozenset({
    "पाणी पुरवठा विभाग",
    "स्वच्छता व घनकचरा विभाग",
    "बांधकाम विभाग",
    "विद्युत विभाग",
    "आरोग्य विभाग",
    "उद्याने व बाग विभाग",
})


class DepartmentOfficer(Base):
    __tablename__ = "department_officers"
    __table_args__ = (
        # email is the login identifier and must be unique across all officers
        UniqueConstraint("email", name="uq_department_officer_email"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    phone_number: Mapped[str] = mapped_column(String(20), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    department_name: Mapped[str] = mapped_column(String(200), nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_blocked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_restricted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    profile_photo_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
