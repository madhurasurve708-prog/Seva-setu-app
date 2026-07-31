from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.dependencies.db import get_db
from app.dependencies.department_auth import get_current_department_officer, DepartmentOfficerContext
from app.schemas.department_officer_complaint import (
    DepartmentOfficerDashboard,
    DepartmentOfficerComplaintListItem,
    DepartmentOfficerComplaintDetail,
    DepartmentComplaintListFilter,
)
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
