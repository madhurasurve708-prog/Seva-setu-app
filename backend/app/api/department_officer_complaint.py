from fastapi import APIRouter, Depends, status, File, UploadFile
from sqlalchemy.orm import Session
from app.dependencies.db import get_db
from app.dependencies.department_auth import get_current_department_officer, DepartmentOfficerContext
from app.schemas.department_officer_complaint import (
    DepartmentOfficerDashboard,
    DepartmentOfficerComplaintListItem,
    DepartmentOfficerComplaintDetail,
    DepartmentComplaintListFilter,
    ComplaintNoteCreate,
    ComplaintNoteResponse,
    ComplaintTimelineItem,
    ComplaintEscalationResponse,
)
from app.schemas.complaint_common import ComplaintStatusUpdate, ComplaintEscalateRequest
from app.services.department_officer_complaint_service import DepartmentOfficerComplaintService

router = APIRouter(tags=["Department Officer Complaints"])


@router.get(
    "/api/department/complaints/dashboard",
    response_model=DepartmentOfficerDashboard,
    status_code=status.HTTP_200_OK,
)
def get_dashboard_counts(
    context: DepartmentOfficerContext = Depends(get_current_department_officer),
    db: Session = Depends(get_db),
):
    """Get dashboard statistics for the logged-in department officer's department."""
    return DepartmentOfficerComplaintService.get_dashboard_counts(db, context)


@router.get(
    "/api/department/complaints",
    response_model=list[DepartmentOfficerComplaintListItem],
    status_code=status.HTTP_200_OK,
)
def get_department_complaints(
    status: str = None,
    priority: str = None,
    ward_id: int = None,
    search: str = None,
    sort_newest: bool = True,
    page: int = 1,
    page_size: int = 20,
    context: DepartmentOfficerContext = Depends(get_current_department_officer),
    db: Session = Depends(get_db),
):
    """Get complaints for the logged-in department officer's department with filtering and pagination."""
    return DepartmentOfficerComplaintService.get_department_complaints(
        db=db,
        context=context,
        status_filter=status,
        priority_filter=priority,
        ward_filter=ward_id,
        search_query=search,
        sort_newest=sort_newest,
        page=page,
        page_size=page_size,
    )


@router.get(
    "/api/department/complaints/{complaint_id}",
    response_model=DepartmentOfficerComplaintDetail,
    status_code=status.HTTP_200_OK,
)
def get_complaint_detail(
    complaint_id: int,
    context: DepartmentOfficerContext = Depends(get_current_department_officer),
    db: Session = Depends(get_db),
):
    """Get a specific complaint if it belongs to the logged-in department officer's department."""
    return DepartmentOfficerComplaintService.get_complaint_detail(db, context, complaint_id)


@router.put(
    "/api/department/complaints/{complaint_id}/status",
    response_model=DepartmentOfficerComplaintDetail,
    status_code=status.HTTP_200_OK,
)
def update_complaint_status(
    complaint_id: int,
    status_update: ComplaintStatusUpdate,
    context: DepartmentOfficerContext = Depends(get_current_department_officer),
    db: Session = Depends(get_db),
):
    """Update complaint status for the logged-in department officer's department."""
    return DepartmentOfficerComplaintService.update_complaint_status(
        db, context, complaint_id, status_update.status
    )


@router.post(
    "/api/department/complaints/{complaint_id}/notes",
    response_model=ComplaintNoteResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_complaint_note(
    complaint_id: int,
    note_data: ComplaintNoteCreate,
    context: DepartmentOfficerContext = Depends(get_current_department_officer),
    db: Session = Depends(get_db),
):
    """Add a note to a complaint for the logged-in department officer's department."""
    return DepartmentOfficerComplaintService.add_complaint_note(
        db, context, complaint_id, note_data.note_text
    )


@router.post(
    "/api/department/complaints/{complaint_id}/notes/with-photo",
    response_model=ComplaintNoteResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_complaint_note_with_photo(
    complaint_id: int,
    note_text: str = File(..., description="Note text content"),
    image: UploadFile = File(..., description="Note photo attachment"),
    context: DepartmentOfficerContext = Depends(get_current_department_officer),
    db: Session = Depends(get_db),
):
    """Add a note with photo to a complaint for the logged-in department officer's department."""
    file_bytes = image.file.read()
    content_type = image.content_type
    return DepartmentOfficerComplaintService.add_complaint_note(
        db, context, complaint_id, note_text, file_bytes, content_type
    )


@router.get(
    "/api/department/complaints/{complaint_id}/timeline",
    response_model=list[ComplaintTimelineItem],
    status_code=status.HTTP_200_OK,
)
def get_complaint_timeline(
    complaint_id: int,
    context: DepartmentOfficerContext = Depends(get_current_department_officer),
    db: Session = Depends(get_db),
):
    """Get complaint timeline for the logged-in department officer's department."""
    return DepartmentOfficerComplaintService.get_complaint_timeline(db, context, complaint_id)


@router.post(
    "/api/department/complaints/{complaint_id}/escalate",
    response_model=ComplaintEscalationResponse,
    status_code=status.HTTP_201_CREATED,
)
def escalate_complaint(
    complaint_id: int,
    escalation_request: ComplaintEscalateRequest,
    context: DepartmentOfficerContext = Depends(get_current_department_officer),
    db: Session = Depends(get_db),
):
    """Escalate a complaint for the logged-in department officer's department."""
    return DepartmentOfficerComplaintService.escalate_complaint(
        db,
        context,
        complaint_id,
        escalation_request.escalation_target,
        escalation_request.escalation_note,
    )
