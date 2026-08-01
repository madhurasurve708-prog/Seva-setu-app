from datetime import datetime
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.dependencies.db import get_db
from app.dependencies.main_admin_auth import get_current_main_admin
from app.models.main_admin import MainAdmin
from app.schemas.audit_log import AuditLogList
from app.services.audit_log_service import AuditLogService

router = APIRouter(tags=["Main Admin Audit Logs"])


@router.get(
    "/api/main-admin/audit-logs",
    response_model=AuditLogList,
    status_code=status.HTTP_200_OK,
)
def get_audit_logs(
    date_from: datetime | None = None,
    date_to: datetime | None = None,
    admin_name: str | None = None,
    action: str | None = None,
    entity: str | None = None,
    offset: int = 0,
    limit: int = 50,
    current_admin: MainAdmin = Depends(get_current_main_admin),
    db: Session = Depends(get_db),
):
    """Get audit logs with optional filters.
    
    Filters:
    - date_from: Start date for log entries
    - date_to: End date for log entries
    - admin_name: Filter by admin name (partial match)
    - action: Filter by action (partial match)
    - entity: Filter by entity type (partial match)
    
    Sorting:
    - Newest first
    
    Pagination:
    - offset: Number of results to skip (default 0)
    - limit: Number of results per page (default 50, max 100)
    """
    return AuditLogService.get_logs(
        db, date_from, date_to, admin_name, action, entity, offset, limit
    )
