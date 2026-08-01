from __future__ import annotations
from datetime import datetime
from typing import Optional
from sqlalchemy import String, DateTime, Integer, func
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base_class import Base


class AuditLog(Base):
    """Audit log for Main Admin actions."""
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    admin_name: Mapped[str] = mapped_column(String(150), nullable=False, index=True)
    admin_role: Mapped[str] = mapped_column(String(50), nullable=False)  # nagaradhyaksha, upnagaradhyaksha, ceo
    action: Mapped[str] = mapped_column(String(100), nullable=False, index=True)  # login, create, update, delete, etc.
    entity: Mapped[str] = mapped_column(String(100), nullable=False, index=True)  # complaint, announcement, user, etc.
    entity_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, index=True)
    remarks: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False, index=True
    )
