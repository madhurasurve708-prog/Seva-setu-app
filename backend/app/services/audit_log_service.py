from datetime import datetime
from sqlalchemy.orm import Session
from app.db.repository import AuditLogRepository
from app.schemas.audit_log import AuditLogList, AuditLogFilter


class AuditLogService:
    """Service for audit log operations."""
    
    @staticmethod
    def create_log(
        db: Session,
        admin_name: str,
        admin_role: str,
        action: str,
        entity: str,
        entity_id: int | None = None,
        remarks: str | None = None,
    ):
        """Create a new audit log entry."""
        AuditLogRepository.create_log(
            db, admin_name, admin_role, action, entity, entity_id, remarks
        )
    
    @staticmethod
    def log_action(
        db: Session,
        admin,
        action: str,
        entity: str,
        entity_id: int | None = None,
        remarks: str | None = None,
    ):
        """Convenience method to log an action from an admin object."""
        AuditLogService.create_log(
            db,
            admin_name=admin.name,
            admin_role=admin.role,
            action=action,
            entity=entity,
            entity_id=entity_id,
            remarks=remarks,
        )
    
    @staticmethod
    def get_logs(
        db: Session,
        date_from: datetime | None = None,
        date_to: datetime | None = None,
        admin_name: str | None = None,
        action: str | None = None,
        entity: str | None = None,
        offset: int = 0,
        limit: int = 50,
    ) -> AuditLogList:
        """Get audit logs with optional filters."""
        logs = AuditLogRepository.get_logs(
            db, date_from, date_to, admin_name, action, entity, offset, limit
        )
        total_count = AuditLogRepository.get_logs_count(
            db, date_from, date_to, admin_name, action, entity
        )
        
        return AuditLogList(
            logs=logs,
            total_count=total_count,
            offset=offset,
            limit=limit,
        )
