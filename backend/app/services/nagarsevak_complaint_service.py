import uuid
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.db.repository import ComplaintRepository, ComplaintHistoryRepository, ComplaintEscalationRepository

CATEGORY_TO_DEPARTMENT = {
    "Water": "पाणी पुरवठा विभाग",
    "Garbage": "स्वच्छता व घनकचरा विभाग",
    "Gutter": "स्वच्छता व घनकचरा विभाग",
    "Drainage": "बांधकाम विभाग",
    "Road": "बांधकाम विभाग",
    "Street Lights": "विद्युत विभाग",
    "Animals": "आरोग्य विभाग",
    "Tree": "उद्याने व बाग विभाग",
    "Traffic": "बांधकाम विभाग",
    "Other": "आरोग्य विभाग",
}
from app.models.nagarsevak import Nagarsevak
from app.utils.storage import upload_image_to_storage
from app.core.content_validation import ensure_appropriate_text
from app.core.constants import ComplaintStatus, ImageValidation


def _build_detail_dict(complaint) -> dict:
    """Shared projection from Complaint ORM object to the detail response shape."""
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
    }


class NagarsevakComplaintService:
    @staticmethod
    def get_dashboard_counts(db: Session, nagarsevak: Nagarsevak) -> dict:
        return ComplaintRepository.get_ward_status_counts(db, nagarsevak.ward_id)

    @staticmethod
    def get_ward_complaints(db: Session, nagarsevak: Nagarsevak) -> list[dict]:
        complaints = ComplaintRepository.get_complaints_by_ward(db, nagarsevak.ward_id)
        return [
            {
                "id": c.id,
                "citizen_name": c.citizen.full_name,
                "citizen_phone_number": c.citizen.phone_number,
                "locality": c.citizen.locality,
                "ward_number": c.ward.ward_number,
                "category": c.category.name,
                "priority": c.priority,
                "status": c.status,
                "created_at": c.created_at,
                "image_url": c.image_url,
            }
            for c in complaints
        ]

    @staticmethod
    def get_complaint_detail(db: Session, nagarsevak: Nagarsevak, complaint_id: int) -> dict:
        complaint = ComplaintRepository.get_complaint_by_id_and_ward(
            db, complaint_id, nagarsevak.ward_id
        )
        if not complaint:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Complaint not found.",
            )
        return _build_detail_dict(complaint)

    @staticmethod
    def update_complaint_status(
        db: Session, nagarsevak: Nagarsevak, complaint_id: int, new_status: str
    ) -> dict:
        if new_status not in ComplaintStatus.VALID_STATUSES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status '{new_status}'. Allowed: {', '.join(ComplaintStatus.VALID_STATUSES)}",
            )

        complaint = ComplaintRepository.get_complaint_by_id_and_ward(
            db, complaint_id, nagarsevak.ward_id
        )
        if not complaint:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Complaint not found.",
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
                author_role="Nagarsevak",
                author_name=nagarsevak.name,
                author_id=nagarsevak.id,
                note_text=f"Status updated from '{current_status}' to '{new_status}'",
            )

        return _build_detail_dict(complaint)

    @staticmethod
    def add_complaint_note(
        db: Session,
        nagarsevak: Nagarsevak,
        complaint_id: int,
        note_text: str,
        file_bytes: Optional[bytes] = None,
        content_type: Optional[str] = None,
    ) -> dict:
        complaint = ComplaintRepository.get_complaint_by_id_and_ward(
            db, complaint_id, nagarsevak.ward_id
        )
        if not complaint:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Complaint not found.",
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
            author_role="Nagarsevak",
            author_name=nagarsevak.name,
            author_id=nagarsevak.id,
            note_text=note_text.strip(),
            image_url=public_url,
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
        db: Session, nagarsevak: Nagarsevak, complaint_id: int
    ) -> list[dict]:
        complaint = ComplaintRepository.get_complaint_by_id_and_ward(
            db, complaint_id, nagarsevak.ward_id
        )
        if not complaint:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Complaint not found.",
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
        nagarsevak: Nagarsevak,
        complaint_id: int,
        escalation_target: str,
        escalation_note: str,
    ) -> dict:
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

        # Check that the complaint belongs to the Nagarsevak's ward
        complaint = ComplaintRepository.get_complaint_by_id_and_ward(
            db, complaint_id, nagarsevak.ward_id
        )
        if not complaint:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Complaint not found.",
            )

        # Resolve escalated_to
        if escalation_target == "Main Admin":
            escalated_to = "Main Admin"
        else:
            category_name = complaint.category.name
            escalated_to = CATEGORY_TO_DEPARTMENT.get(category_name)
            if not escalated_to:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"No department mapping found for category '{category_name}'.",
                )

        # Create escalation entry
        escalation = ComplaintEscalationRepository.create_escalation(
            db=db,
            complaint_id=complaint_id,
            escalated_by_role="Nagarsevak",
            escalated_by_id=nagarsevak.id,
            escalated_by_name=nagarsevak.name,
            escalated_to=escalated_to,
            escalation_note=escalation_note.strip(),
        )

        # Create note in history/timeline
        ComplaintHistoryRepository.create_note(
            db=db,
            complaint_id=complaint_id,
            author_role="Nagarsevak",
            author_name=nagarsevak.name,
            author_id=nagarsevak.id,
            note_text=f"Escalated to {escalated_to}. Reason: {escalation_note.strip()}",
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

    @staticmethod
    def get_escalated_complaints(db: Session, nagarsevak: Nagarsevak) -> list[dict]:
        escalations = ComplaintEscalationRepository.get_escalations_by_escalator(
            db=db,
            escalated_by_role="Nagarsevak",
            escalated_by_id=nagarsevak.id,
        )
        return [
            {
                "complaint_id": esc.complaint_id,
                "citizen_name": esc.complaint.citizen.full_name,
                "category": esc.complaint.category.name,
                "priority": esc.complaint.priority,
                "current_status": esc.complaint.status,
                "escalated_to": esc.escalated_to,
                "escalation_date": esc.created_at,
                "latest_escalation_note": esc.escalation_note,
            }
            for esc in escalations
        ]
