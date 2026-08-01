from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class AuditLog(BaseModel):
    """Audit log entry."""
    id: int
    admin_name: str
    admin_role: str
    action: str
    entity: str
    entity_id: Optional[int] = None
    remarks: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AuditLogList(BaseModel):
    """List of audit logs with pagination."""
    logs: list[AuditLog]
    total_count: int
    offset: int
    limit: int


class AuditLogFilter(BaseModel):
    """Filter parameters for audit logs."""
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    admin_name: Optional[str] = None
    action: Optional[str] = None
    entity: Optional[str] = None
    offset: int = 0
    limit: int = 50
