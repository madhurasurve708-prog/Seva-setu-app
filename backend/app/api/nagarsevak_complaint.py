from fastapi import APIRouter, Depends, File, Form, UploadFile, status
from sqlalchemy.orm import Session
from app.dependencies.db import get_db
from app.dependencies.auth import get_current_nagarsevak
from app.models.nagarsevak import Nagarsevak
from app.schemas.nagarsevak_complaint import (
    NagarsevakComplaintDashboard,
    NagarsevakComplaintListItem,
    NagarsevakComplaintDetail,
    ComplaintStatusUpdate,
    ComplaintEscalateRequest,
    ComplaintEscalationCreatedResponse,
    EscalatedComplaintResponse,
)
from app.schemas.complaint_history import ComplaintHistoryResponse
from app.services.nagarsevak_complaint_service import NagarsevakComplaintService

router = APIRouter(tags=["Nagarsevak Complaints"])


@router.get(
    "/api/nagarsevak/complaints/dashboard",
    response_model=NagarsevakComplaintDashboard,
    status_code=status.HTTP_200_OK,
)
def get_dashboard_counts(
    current_nagarsevak: Nagarsevak = Depends(get_current_nagarsevak),
    db: Session = Depends(get_db),
):
    return NagarsevakComplaintService.get_dashboard_counts(db, current_nagarsevak)


@router.get(
    "/api/nagarsevak/complaints",
    response_model=list[NagarsevakComplaintListItem],
    status_code=status.HTTP_200_OK,
)
def get_ward_complaints(
    current_nagarsevak: Nagarsevak = Depends(get_current_nagarsevak),
    db: Session = Depends(get_db),
):
    return NagarsevakComplaintService.get_ward_complaints(db, current_nagarsevak)

@router.get(
    "/api/nagarsevak/complaints/escalated",
    response_model=list[EscalatedComplaintResponse],
    status_code=status.HTTP_200_OK,
)
def get_escalated_complaints(
    current_nagarsevak: Nagarsevak = Depends(get_current_nagarsevak),
    db: Session = Depends(get_db),
):
    return NagarsevakComplaintService.get_escalated_complaints(db, current_nagarsevak)


@router.get(
    "/api/nagarsevak/complaints/{complaint_id}",
    response_model=NagarsevakComplaintDetail,
    status_code=status.HTTP_200_OK,
)
def get_complaint_detail(
    complaint_id: int,
    current_nagarsevak: Nagarsevak = Depends(get_current_nagarsevak),
    db: Session = Depends(get_db),
):
    return NagarsevakComplaintService.get_complaint_detail(db, current_nagarsevak, complaint_id)


@router.put(
    "/api/nagarsevak/complaints/{complaint_id}/status",
    response_model=NagarsevakComplaintDetail,
    status_code=status.HTTP_200_OK,
)
def update_complaint_status(
    complaint_id: int,
    status_update: ComplaintStatusUpdate,
    current_nagarsevak: Nagarsevak = Depends(get_current_nagarsevak),
    db: Session = Depends(get_db),
):
    return NagarsevakComplaintService.update_complaint_status(
        db, current_nagarsevak, complaint_id, status_update.status
    )


@router.post(
    "/api/nagarsevak/complaints/{complaint_id}/notes",
    response_model=ComplaintHistoryResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_complaint_note(
    complaint_id: int,
    note_text: str = Form(..., min_length=1, max_length=2000, description="Visible timeline note."),
    image: UploadFile = File(None),
    current_nagarsevak: Nagarsevak = Depends(get_current_nagarsevak),
    db: Session = Depends(get_db),
):
    file_bytes = None
    content_type = None
    if image is not None:
        file_bytes = image.file.read()
        content_type = image.content_type

    return NagarsevakComplaintService.add_complaint_note(
        db=db,
        nagarsevak=current_nagarsevak,
        complaint_id=complaint_id,
        note_text=note_text,
        file_bytes=file_bytes,
        content_type=content_type,
    )


@router.get(
    "/api/complaints/{complaint_id}/timeline",
    response_model=list[ComplaintHistoryResponse],
    status_code=status.HTTP_200_OK,
)
def get_complaint_timeline(
    complaint_id: int,
    current_nagarsevak: Nagarsevak = Depends(get_current_nagarsevak),
    db: Session = Depends(get_db),
):
    return NagarsevakComplaintService.get_complaint_timeline(db, current_nagarsevak, complaint_id)


@router.post(
    "/api/nagarsevak/complaints/{complaint_id}/escalate",
    response_model=ComplaintEscalationCreatedResponse,
    status_code=status.HTTP_200_OK,
)
def escalate_complaint(
    complaint_id: int,
    escalate_request: ComplaintEscalateRequest,
    current_nagarsevak: Nagarsevak = Depends(get_current_nagarsevak),
    db: Session = Depends(get_db),
):
    return NagarsevakComplaintService.escalate_complaint(
        db=db,
        nagarsevak=current_nagarsevak,
        complaint_id=complaint_id,
        escalation_target=escalate_request.escalation_target,
        escalation_note=escalate_request.escalation_note,
    )
