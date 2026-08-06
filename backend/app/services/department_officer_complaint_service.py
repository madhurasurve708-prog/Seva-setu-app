import uuid
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.db.repository import ComplaintRepository, ComplaintHistoryRepository, ComplaintEscalationRepository, AuditLogRepository
from app.dependencies.department_auth import DepartmentOfficerContext
from app.utils.storage import upload_image_to_storage
from app.core.content_validation import ensure_appropriate_text
from app.core.constants import ComplaintStatus, ImageValidation, CATEGORY_TO_DEPARTMENT
from app.schemas.complaint_common import ComplaintStatusUpdate as ComplaintStatusUpdateSchema, ComplaintEscalateRequest as ComplaintEscalateRequestSchema


def _get_category_names_for_department(department: str) -> list[str]:
    """Get category names that belong to a department."""
    return [category for category, dept in CATEGORY_TO_DEPARTMENT.items() if dept == department]


def _build_detail_dict(complaint, department_name: str) -> dict:
    """Build detail response dict from Complaint ORM object."""
    return {
        "id": complaint.id,
        "citizen_name": complaint.citizen.full_name,
        "citizen_phone_number": complaint.citizen.phone_number,
        "ward_number": complaint.ward.ward_number,
        "ward_name": complaint.ward.ward_name,
        "locality": complaint.citizen.locality,
        "category": complaint.category.name,
        "description": complaint.description,
        "manual_location": complaint.manual_location,
        "image_url": complaint.image_url,
        "status": complaint.status,
        "priority": complaint.priority,
        "created_at": complaint.created_at,
        "updated_at": complaint.updated_at,
        "assigned_department": department_name,
    }


class DepartmentOfficerComplaintService:
    @staticmethod
    def get_dashboard_counts(db: Session, context: DepartmentOfficerContext) -> dict:
        """Get dashboard statistics for the department officer's department."""
        category_names = _get_category_names_for_department(context.department)
        
        if not category_names:
            return {
                "total_complaints": 0,
                "pending": 0,
                "in_progress": 0,
                "resolved": 0,
                "escalated": 0,
            }
        
        status_counts = ComplaintRepository.get_department_status_counts(db, category_names)
        escalated_count = ComplaintRepository.get_department_escalated_count(db, category_names)
        
        return {
            **status_counts,
            "escalated": escalated_count,
        }

    @staticmethod
    def get_department_complaints(
        db: Session,
        context: DepartmentOfficerContext,
        status_filter: Optional[str] = None,
        priority_filter: Optional[str] = None,
        ward_filter: Optional[int] = None,
        search_query: Optional[str] = None,
        sort_newest: bool = True,
        page: int = 1,
        page_size: int = 20,
    ) -> list[dict]:
        """Get complaints for the department officer's department with filtering."""
        category_names = _get_category_names_for_department(context.department)
        
        if not category_names:
            return []
        
        offset = (page - 1) * page_size
        complaints = ComplaintRepository.get_department_complaints(
            db=db,
            category_names=category_names,
            status_filter=status_filter,
            priority_filter=priority_filter,
            ward_filter=ward_filter,
            search_query=search_query,
            sort_newest=sort_newest,
            offset=offset,
            limit=page_size,
        )
        
        return [
            {
                "id": c.id,
                "citizen_name": c.citizen.full_name,
                "citizen_phone_number": c.citizen.phone_number,
                "locality": c.citizen.locality,
                "ward_number": c.ward.ward_number,
                "ward_name": c.ward.ward_name,
                "category": c.category.name,
                "priority": c.priority,
                "status": c.status,
                "created_at": c.created_at,
                "image_url": c.image_url,
                "assigned_department": context.department_name,
                "manual_location": c.manual_location,
            }
            for c in complaints
        ]

    @staticmethod
    def get_complaint_detail(
        db: Session,
        context: DepartmentOfficerContext,
        complaint_id: int,
    ) -> dict:
        """Get a specific complaint if it belongs to the department officer's department."""
        category_names = _get_category_names_for_department(context.department)
        
        if not category_names:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No categories found for this department.",
            )
        
        complaint = ComplaintRepository.get_complaint_by_id_for_department(
            db=db,
            complaint_id=complaint_id,
            category_names=category_names,
        )
        
        if not complaint:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Complaint not found or does not belong to your department.",
            )
        
        return _build_detail_dict(complaint, context.department_name)

    @staticmethod
    def update_complaint_status(
        db: Session,
        context: DepartmentOfficerContext,
        complaint_id: int,
        new_status: str,
    ) -> dict:
        """Update complaint status for department officer's department."""
        if new_status not in ComplaintStatus.VALID_STATUSES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status '{new_status}'. Allowed: {', '.join(ComplaintStatus.VALID_STATUSES)}",
            )

        category_names = _get_category_names_for_department(context.department)
        
        if not category_names:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No categories found for this department.",
            )

        complaint = ComplaintRepository.get_complaint_by_id_for_department(
            db=db,
            complaint_id=complaint_id,
            category_names=category_names,
        )

        if not complaint:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Complaint not found or does not belong to your department.",
            )

        current_status = complaint.status

        # Enforce forward-only status transitions
        if current_status == ComplaintStatus.IN_PROGRESS and new_status == ComplaintStatus.PENDING:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid status transition. Cannot go back from In Progress.",
            )
        if current_status == ComplaintStatus.RESOLVED and new_status != ComplaintStatus.RESOLVED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid status transition. Resolved complaints cannot be changed.",
            )

        if current_status != new_status:
            ComplaintRepository.update_complaint_status(db, complaint, new_status)
            ComplaintHistoryRepository.create_note(
                db=db,
                complaint_id=complaint.id,
                author_role="Department",
                author_name=context.department_name,
                author_id=None,  # Department officers don't have individual IDs yet
                note_text=f"Status updated from '{current_status}' to '{new_status}'",
            )
            # Create audit log for status update
            AuditLogRepository.create_audit_log(
                db=db,
                action="UPDATE",
                entity_type="Complaint",
                entity_id=complaint.id,
                actor_role="Department",
                actor_id=None,
                actor_name=context.department_name,
                details=f"Updated complaint status from '{current_status}' to '{new_status}'",
            )

        return _build_detail_dict(complaint, context.department_name)

    @staticmethod
    def add_complaint_note(
        db: Session,
        context: DepartmentOfficerContext,
        complaint_id: int,
        note_text: str,
        file_bytes: Optional[bytes] = None,
        content_type: Optional[str] = None,
    ) -> dict:
        """Add a note to a complaint for department officer's department."""
        category_names = _get_category_names_for_department(context.department)
        
        if not category_names:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No categories found for this department.",
            )

        complaint = ComplaintRepository.get_complaint_by_id_for_department(
            db=db,
            complaint_id=complaint_id,
            category_names=category_names,
        )

        if not complaint:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Complaint not found or does not belong to your department.",
            )

        if not note_text or not note_text.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Note text cannot be empty.",
            )
        ensure_appropriate_text(note_text, "Note text")

        public_url = None
        if file_bytes:
            if len(file_bytes) > ImageValidation.MAX_IMAGE_SIZE_BYTES:
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail=f"File size exceeds the maximum allowed limit of "
                           f"{ImageValidation.MAX_IMAGE_SIZE_BYTES // (1024 * 1024)} MB.",
                )
            if content_type not in ImageValidation.ALLOWED_IMAGE_TYPES:
                raise HTTPException(
                    status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                    detail=f"Unsupported file type '{content_type}'. "
                           f"Allowed types: JPEG, PNG, WebP.",
                )
            extension = ImageValidation.ALLOWED_IMAGE_TYPES[content_type]
            object_path = f"complaints/{complaint_id}/notes/{uuid.uuid4().hex}.{extension}"
            public_url = upload_image_to_storage(
                file_bytes=file_bytes,
                content_type=content_type,
                object_path=object_path,
            )

        note = ComplaintHistoryRepository.create_note(
            db=db,
            complaint_id=complaint_id,
            author_role="Department",
            author_name=context.department_name,
            author_id=None,  # Department officers don't have individual IDs yet
            note_text=note_text.strip(),
            image_url=public_url,
        )
        
        # Create audit log for note creation
        AuditLogRepository.create_audit_log(
            db=db,
            action="CREATE",
            entity_type="ComplaintNote",
            entity_id=note.id,
            actor_role="Department",
            actor_id=None,
            actor_name=context.department_name,
            details=f"Added note to complaint {complaint_id}",
        )

        return {
            "author_name": note.author_name,
            "author_role": note.author_role,
            "created_at": note.created_at,
            "note_text": note.note_text,
            "image_url": note.image_url,
        }

    @staticmethod
    def get_complaint_timeline(
        db: Session,
        context: DepartmentOfficerContext,
        complaint_id: int,
    ) -> list[dict]:
        """Get complaint timeline for department officer's department."""
        category_names = _get_category_names_for_department(context.department)
        
        if not category_names:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No categories found for this department.",
            )

        complaint = ComplaintRepository.get_complaint_by_id_for_department(
            db=db,
            complaint_id=complaint_id,
            category_names=category_names,
        )

        if not complaint:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Complaint not found or does not belong to your department.",
            )

        history = ComplaintHistoryRepository.get_history_for_complaint(db, complaint_id)
        return [
            {
                "author_name": item.author_name,
                "author_role": item.author_role,
                "created_at": item.created_at,
                "note_text": item.note_text,
                "image_url": item.image_url,
            }
            for item in history
        ]

    @staticmethod
    def escalate_complaint(
        db: Session,
        context: DepartmentOfficerContext,
        complaint_id: int,
        escalation_target: str,
        escalation_note: str,
    ) -> dict:
        """Escalate a complaint for department officer's department."""
        # Validate target
        if escalation_target not in {"Main Admin", "Department"}:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid escalation target '{escalation_target}'. Allowed targets are 'Main Admin' or 'Department'.",
            )

        if not escalation_note or not escalation_note.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Escalation note cannot be empty.",
            )
        ensure_appropriate_text(escalation_note, "Escalation note")

        category_names = _get_category_names_for_department(context.department)
        
        if not category_names:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No categories found for this department.",
            )

        complaint = ComplaintRepository.get_complaint_by_id_for_department(
            db=db,
            complaint_id=complaint_id,
            category_names=category_names,
        )

        if not complaint:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Complaint not found or does not belong to your department.",
            )

        # Create escalation record
        escalation = ComplaintEscalationRepository.create_escalation(
            db=db,
            complaint_id=complaint_id,
            escalated_by_role="Department",
            escalated_by_id=0,  # Department officers don't have individual IDs yet
            escalated_by_name=context.department_name,
            escalated_to=escalation_target,
            escalation_note=escalation_note.strip(),
        )

        # Create history entry
        ComplaintHistoryRepository.create_note(
            db=db,
            complaint_id=complaint_id,
            author_role="Department",
            author_name=context.department_name,
            author_id=None,
            note_text=f"Escalated to {escalation_target}: {escalation_note.strip()}",
        )
        
        # Create audit log for escalation
        AuditLogRepository.create_audit_log(
            db=db,
            action="ESCALATE",
            entity_type="Complaint",
            entity_id=complaint_id,
            actor_role="Department",
            actor_id=None,
            actor_name=context.department_name,
            details=f"Escalated complaint to {escalation_target}: {escalation_note.strip()}",
        )

        return {
            "id": escalation.id,
            "complaint_id": escalation.complaint_id,
            "escalated_by_role": escalation.escalated_by_role,
            "escalated_by_id": escalation.escalated_by_id,
            "escalated_by_name": escalation.escalated_by_name,
            "escalated_to": escalation.escalated_to,
            "escalation_note": escalation.escalation_note,
            "created_at": escalation.created_at,
        }
