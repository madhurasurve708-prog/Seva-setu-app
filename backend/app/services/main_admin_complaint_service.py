import uuid
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.db.repository import (
    ComplaintRepository,
    ComplaintHistoryRepository,
    ComplaintEscalationRepository,
    CategoryRepository,
)
from app.models.complaint import Complaint
from app.models.complaint_escalation import ComplaintEscalation
from app.models.main_admin import MainAdmin
from app.schemas.main_admin_complaint import (
    MainAdminComplaintFilter,
    MainAdminComplaintListItem,
    MainAdminComplaintHistoryItem,
    MainAdminComplaintEscalationInfo,
    CATEGORY_TO_DEPARTMENT_KEY,
    VALID_DEPARTMENT_KEYS,
)
from app.schemas.department_officer_complaint import ComplaintNoteResponse
from app.utils.storage import upload_image_to_storage
from app.core.content_validation import ensure_appropriate_text
from app.core.constants import ComplaintStatus, ImageValidation
from app.services.audit_log_service import AuditLogService


class MainAdminComplaintService:
    @staticmethod
    def get_complaint_list(
        db: Session,
        filters: MainAdminComplaintFilter,
    ) -> dict:
        """Get complaint list for Main Admin with filters and pagination."""
        
        # Determine category filter based on department key if provided
        category_filter = filters.category_id
        if filters.department:
            # Map department key to categories
            category_names = [
                cat_name for cat_name, dept_key in CATEGORY_TO_DEPARTMENT_KEY.items()
                if dept_key == filters.department
            ]
            if category_names:
                categories = CategoryRepository.get_all_categories(db)
                category_ids = [
                    cat.id for cat in categories if cat.name in category_names
                ]
                if category_ids:
                    category_filter = category_ids[0]  # Use first matching category ID
        
        # Get complaints with filters
        complaints = ComplaintRepository.get_all_complaints(
            db=db,
            ward_filter=filters.ward_id,
            category_filter=category_filter,
            status_filter=filters.status,
            sort_newest=filters.sort_newest,
            offset=filters.offset,
            limit=filters.limit,
        )
        
        # Get total count with same filters
        total_count = ComplaintRepository.get_all_complaints_count(
            db=db,
            ward_filter=filters.ward_id,
            category_filter=category_filter,
            status_filter=filters.status,
        )
        
        # Get escalated complaint IDs for is_escalated flag
        escalated_ids = set()
        if complaints:
            complaint_ids = [c.id for c in complaints]
            if complaint_ids:
                escalated_query = (
                    db.query(ComplaintEscalation.complaint_id)
                    .filter(ComplaintEscalation.complaint_id.in_(complaint_ids))
                    .distinct()
                    .all()
                )
                escalated_ids = {row[0] for row in escalated_query}
        
        # Build lightweight response items with department mapping
        complaint_items = []
        for complaint in complaints:
            department_key = CATEGORY_TO_DEPARTMENT_KEY.get(complaint.category.name, "DEPT_AROGYA")
            department_name = VALID_DEPARTMENT_KEYS.get(department_key, "Unknown")
            
            # Convert single image_url to images array for future-proofing
            images = []
            if complaint.image_url:
                images.append(complaint.image_url)
            
            complaint_items.append(MainAdminComplaintListItem(
                id=complaint.id,
                citizen_name=complaint.citizen.full_name,
                citizen_phone_number=complaint.citizen.phone_number,
                ward_number=complaint.ward.ward_number,
                category=complaint.category.name,
                department_key=department_key,
                department_name=department_name,
                priority=complaint.priority,
                status=complaint.status,
                created_at=complaint.created_at,
                images=images,
                is_escalated=complaint.id in escalated_ids,
            ))
        
        return {
            "complaints": complaint_items,
            "total_count": total_count,
            "offset": filters.offset,
            "limit": filters.limit,
        }

    @staticmethod
    def get_complaint_detail(
        db: Session,
        complaint_id: int,
    ) -> dict:
        """Get complete complaint detail for Main Admin."""
        
        # Get complaint using generic lookup
        complaint = ComplaintRepository.get_complaint_by_id(db, complaint_id)
        if not complaint:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Complaint not found",
            )
        
        # Get complaint history (single source of truth for timeline)
        history = ComplaintHistoryRepository.get_history_for_complaint(db, complaint_id)
        
        # Get complaint escalations
        escalations = ComplaintEscalationRepository.get_escalations_by_complaint_id(db, complaint_id)
        
        # Map category to department key and name
        department_key = CATEGORY_TO_DEPARTMENT_KEY.get(complaint.category.name, "DEPT_AROGYA")
        department_name = VALID_DEPARTMENT_KEYS.get(department_key, "Unknown")
        
        # Convert single image_url to images array for future-proofing
        images = []
        if complaint.image_url:
            images.append(complaint.image_url)
        
        # Build history items (chronological timeline)
        history_items = [
            MainAdminComplaintHistoryItem(
                author_role=h.author_role,
                author_name=h.author_name,
                author_id=h.author_id,
                created_at=h.created_at,
                note_text=h.note_text,
                image_url=h.image_url,
            )
            for h in history
        ]
        
        # Build escalation info (simplified structure - single object)
        if escalations:
            # Get the most recent escalation
            latest_escalation = escalations[-1]
            escalation_info = MainAdminComplaintEscalationInfo(
                is_escalated=True,
                escalated_by=f"{latest_escalation.escalated_by_name} ({latest_escalation.escalated_by_role})",
                escalation_reason=latest_escalation.escalation_note,
                escalated_at=latest_escalation.created_at,
                current_status="Pending Review",  # Can be updated in Prompt 3
            )
        else:
            escalation_info = MainAdminComplaintEscalationInfo(
                is_escalated=False,
                escalated_by=None,
                escalation_reason=None,
                escalated_at=None,
                current_status=None,
            )
        
        # Build response
        return {
            "id": complaint.id,
            "citizen_name": complaint.citizen.full_name,
            "citizen_phone_number": complaint.citizen.phone_number,
            "ward_number": complaint.ward.ward_number,
            "ward_name": complaint.ward.ward_name,
            "locality": complaint.citizen.locality,
            "category": complaint.category.name,
            "department_key": department_key,
            "department_name": department_name,
            "title": complaint.title,
            "description": complaint.description,
            "manual_location": complaint.manual_location,
            "images": images,
            "status": complaint.status,
            "priority": complaint.priority,
            "created_at": complaint.created_at,
            "updated_at": complaint.updated_at,
            "history": history_items,
            "escalation": escalation_info,
        }

    @staticmethod
    def update_complaint_status(
        db: Session,
        admin: MainAdmin,
        complaint_id: int,
        new_status: str,
        note_text: Optional[str] = None,
    ) -> dict:
        """Update complaint status for Main Admin (single source of truth for status changes)."""
        if new_status not in ComplaintStatus.VALID_STATUSES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status '{new_status}'. Allowed: {', '.join(ComplaintStatus.VALID_STATUSES)}",
            )

        complaint = ComplaintRepository.get_complaint_by_id(db, complaint_id)
        if not complaint:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Complaint not found.",
            )

        current_status = complaint.status

        # Prevent updates on closed complaints
        if current_status == ComplaintStatus.CLOSED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot update status of a closed complaint.",
            )

        # Enforce forward-only status transitions
        # Valid transitions: Pending -> In Progress -> Resolved -> Closed
        status_order = {
            ComplaintStatus.PENDING: 0,
            ComplaintStatus.IN_PROGRESS: 1,
            ComplaintStatus.RESOLVED: 2,
            ComplaintStatus.CLOSED: 3,
        }
        current_order = status_order.get(current_status, -1)
        new_order = status_order.get(new_status, -1)

        if current_order == -1 or new_order == -1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid status value.",
            )

        # Allow moving forward, don't allow going backwards
        if new_order < current_order:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status transition. Cannot go from '{current_status}' to '{new_status}'.",
            )

        if current_status != new_status:
            ComplaintRepository.update_complaint_status(db, complaint, new_status)
            
            # Use provided note_text or generate default status update message
            history_note = note_text if note_text else f"Status updated from '{current_status}' to '{new_status}'"
            
            ComplaintHistoryRepository.create_note(
                db=db,
                complaint_id=complaint.id,
                author_role="Main Admin",
                author_name=admin.name,
                author_id=admin.id,
                note_text=history_note,
            )

        # Audit log
        AuditLogService.log_action(
            db, admin, "update_status", "complaint", complaint_id, f"Updated complaint status to {new_status}"
        )

        return {"message": "Complaint status updated successfully."}

    @staticmethod
    def resolve_complaint(
        db: Session,
        admin: MainAdmin,
        complaint_id: int,
        resolution_note: Optional[str] = None,
    ) -> dict:
        """Resolve a complaint for Main Admin."""
        complaint = ComplaintRepository.get_complaint_by_id(db, complaint_id)
        if not complaint:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Complaint not found.",
            )

        current_status = complaint.status

        # Prevent resolving closed complaints
        if current_status == ComplaintStatus.CLOSED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot resolve a closed complaint.",
            )

        # If already resolved, just add a note if provided
        if current_status == ComplaintStatus.RESOLVED:
            if resolution_note and resolution_note.strip():
                ComplaintHistoryRepository.create_note(
                    db=db,
                    complaint_id=complaint.id,
                    author_role="Main Admin",
                    author_name=admin.name,
                    author_id=admin.id,
                    note_text=f"Resolution note: {resolution_note.strip()}",
                )
            return {"message": "Complaint is already resolved."}

        # Build resolution note for history
        note_text = "Complaint resolved by Main Admin."
        if resolution_note and resolution_note.strip():
            note_text = f"Complaint resolved by Main Admin. Resolution note: {resolution_note.strip()}"

        # Call the unified status update method
        return MainAdminComplaintService.update_complaint_status(
            db, admin, complaint_id, ComplaintStatus.RESOLVED, note_text
        )

    @staticmethod
    def close_complaint(
        db: Session,
        admin: MainAdmin,
        complaint_id: int,
        closing_note: Optional[str] = None,
    ) -> dict:
        """Close a complaint for Main Admin."""
        complaint = ComplaintRepository.get_complaint_by_id(db, complaint_id)
        if not complaint:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Complaint not found.",
            )

        current_status = complaint.status

        # Prevent closing already closed complaints
        if current_status == ComplaintStatus.CLOSED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Complaint is already closed.",
            )

        # Build closing note for history
        note_text = "Complaint closed by Main Admin."
        if closing_note and closing_note.strip():
            note_text = f"Complaint closed by Main Admin. Closing note: {closing_note.strip()}"

        # Call the unified status update method
        return MainAdminComplaintService.update_complaint_status(
            db, admin, complaint_id, ComplaintStatus.CLOSED, note_text
        )

    @staticmethod
    def add_complaint_note(
        db: Session,
        admin: MainAdmin,
        complaint_id: int,
        note_text: str,
        file_bytes: Optional[bytes] = None,
        content_type: Optional[str] = None,
    ) -> ComplaintNoteResponse:
        """Add a note to a complaint for Main Admin."""
        complaint = ComplaintRepository.get_complaint_by_id(db, complaint_id)
        if not complaint:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Complaint not found.",
            )

        # Prevent adding notes to closed complaints
        if complaint.status == ComplaintStatus.CLOSED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot add notes to a closed complaint.",
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
            author_role="Main Admin",
            author_name=admin.name,
            author_id=admin.id,
            note_text=note_text.strip(),
            image_url=public_url,
        )

        return ComplaintNoteResponse(
            author_name=note.author_name,
            author_role=note.author_role,
            created_at=note.created_at,
            note_text=note.note_text,
            image_url=note.image_url,
        )
