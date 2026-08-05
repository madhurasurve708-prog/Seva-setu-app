from fastapi import APIRouter, Depends, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.dependencies.db import get_db
from app.dependencies.main_admin_auth import get_current_main_admin
from app.models.main_admin import MainAdmin
from app.schemas.main_admin_complaint import (
    MainAdminComplaintFilter,
    MainAdminComplaintListResponse,
    MainAdminComplaintDetail,
    MainAdminStatusUpdateRequest,
    MainAdminResolveRequest,
    MainAdminCloseRequest,
    MainAdminActionResponse,
)
from app.schemas.department_officer_complaint import ComplaintNoteResponse
from app.services.main_admin_complaint_service import MainAdminComplaintService
from app.services.audit_log_service import AuditLogService

router = APIRouter(tags=["Main Admin Complaint Management"])


@router.get(
    "/api/main-admin/complaints",
    response_model=MainAdminComplaintListResponse,
    status_code=status.HTTP_200_OK,
)
def get_complaint_list(
    ward_id: int | None = None,
    category_id: int | None = None,
    department: str | None = None,
    status: str | None = None,
    sort_newest: bool = True,
    offset: int = 0,
    limit: int = 50,
    current_admin: MainAdmin = Depends(get_current_main_admin),
    db: Session = Depends(get_db),
):
    """Get complaint list for Main Admin with optional filters.
    
    Filters:
    - ward_id: Filter by specific ward
    - category_id: Filter by specific category
    - department: Filter by department key (DEPT_PANI, DEPT_SWACHHTA, etc.)
    - status: Filter by complaint status (Pending, In Progress, Resolved)
    
    Pagination:
    - offset: Number of results to skip (default 0)
    - limit: Number of results per page (default 50, max 100)
    
    Sorting:
    - sort_newest: True for newest first (default), False for oldest first
    """
    filters = MainAdminComplaintFilter(
        ward_id=ward_id,
        category_id=category_id,
        department=department,
        status=status,
        sort_newest=sort_newest,
        offset=offset,
        limit=limit,
    )
    return MainAdminComplaintService.get_complaint_list(db, filters)


@router.get(
    "/api/main-admin/complaints/{complaint_id}",
    response_model=MainAdminComplaintDetail,
    status_code=status.HTTP_200_OK,
)
def get_complaint_detail(
    complaint_id: int,
    current_admin: MainAdmin = Depends(get_current_main_admin),
    db: Session = Depends(get_db),
):
    """Get complete complaint detail for Main Admin.
    
    Includes:
    - Complaint information
    - Citizen details
    - Ward and category information
    - Department mapping
    - Complete history timeline
    - Escalation information
    """
    return MainAdminComplaintService.get_complaint_detail(db, complaint_id)


@router.put(
    "/api/main-admin/complaints/{complaint_id}/status",
    response_model=MainAdminActionResponse,
    status_code=status.HTTP_200_OK,
)
def update_complaint_status(
    complaint_id: int,
    status_update: MainAdminStatusUpdateRequest,
    current_admin: MainAdmin = Depends(get_current_main_admin),
    db: Session = Depends(get_db),
):
    """Update complaint status for Main Admin.
    
    Valid status transitions:
    - Pending -> In Progress
    - In Progress -> Resolved
    - Resolved -> Closed
    - Any status -> Closed (Main Admin authority)
    
    Cannot update closed complaints.
    """
    return MainAdminComplaintService.update_complaint_status(
        db, current_admin, complaint_id, status_update.status
    )


@router.put(
    "/api/main-admin/complaints/{complaint_id}/resolve",
    response_model=MainAdminActionResponse,
    status_code=status.HTTP_200_OK,
)
def resolve_complaint(
    complaint_id: int,
    resolve_request: MainAdminResolveRequest,
    current_admin: MainAdmin = Depends(get_current_main_admin),
    db: Session = Depends(get_db),
):
    """Resolve a complaint for Main Admin.
    
    - Updates complaint status to 'Resolved'
    - Records who resolved it and when
    - Creates ComplaintHistory entry
    - Optional resolution note can be provided
    
    Cannot resolve closed complaints.
    """
    result = MainAdminComplaintService.resolve_complaint(
        db, current_admin, complaint_id, resolve_request.resolution_note
    )
    
    # Audit log
    AuditLogService.log_action(
        db, current_admin, "resolve", "complaint", complaint_id, f"Resolved complaint ID {complaint_id}"
    )
    
    return result


@router.put(
    "/api/main-admin/complaints/{complaint_id}/close",
    response_model=MainAdminActionResponse,
    status_code=status.HTTP_200_OK,
)
def close_complaint(
    complaint_id: int,
    close_request: MainAdminCloseRequest,
    current_admin: MainAdmin = Depends(get_current_main_admin),
    db: Session = Depends(get_db),
):
    """Close a complaint for Main Admin.
    
    - Updates complaint status to 'Closed'
    - Records who closed it and when
    - Creates ComplaintHistory entry
    - Optional closing note can be provided
    
    Closed complaints become read-only.
    Cannot close already closed complaints.
    """
    result = MainAdminComplaintService.close_complaint(
        db, current_admin, complaint_id, close_request.closing_note
    )
    
    # Audit log
    AuditLogService.log_action(
        db, current_admin, "close", "complaint", complaint_id, f"Closed complaint ID {complaint_id}"
    )
    
    return result


@router.post(
    "/api/main-admin/complaints/{complaint_id}/notes",
    response_model=ComplaintNoteResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_complaint_note(
    complaint_id: int,
    note_text: str = Form(..., min_length=1, max_length=2000),
    image: UploadFile | None = File(None),
    current_admin: MainAdmin = Depends(get_current_main_admin),
    db: Session = Depends(get_db),
):
    """Add a note to a complaint for Main Admin.
    
    - Note text is required
    - Optional image can be uploaded (JPEG, PNG, WebP, max 5MB)
    - Creates ComplaintHistory entry
    - Author name and role are recorded
    
    Cannot add notes to closed complaints.
    
    Note: Use GET /api/main-admin/complaints/{complaint_id} to view the complete
    complaint history/timeline including all notes.
    """
    file_bytes = None
    content_type = None
    if image:
        file_bytes = image.file.read()
        content_type = image.content_type
    
    result = MainAdminComplaintService.add_complaint_note(
        db, current_admin, complaint_id, note_text, file_bytes, content_type
    )
    
    # Audit log
    AuditLogService.log_action(
        db, current_admin, "add_note", "complaint", complaint_id, f"Added note to complaint ID {complaint_id}"
    )
    
    return result
