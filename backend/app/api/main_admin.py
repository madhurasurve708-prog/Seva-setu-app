from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.dependencies.db import get_db
from app.dependencies.main_admin_auth import get_current_main_admin
from app.models.main_admin import MainAdmin
from app.schemas.main_admin import (
    MainAdminLogin,
    MainAdminLoginResponse,
    MainAdminAnnouncementCreate,
    MainAdminAnnouncementUpdate,
    MainAdminAnnouncementResponse,
    MainAdminAnnouncementListResponse,
    MainAdminUserListResponse,
    MainAdminCitizenProfile,
    MainAdminNagarsevakProfile,
    MainAdminDepartmentOfficerProfile,
    MainAdminUserActionRequest,
    MainAdminUserActionResponse,
    MainAdminCitizenSearchFilter,
    MainAdminNagarsevakSearchFilter,
    MainAdminDepartmentOfficerSearchFilter,
)
from app.services.main_admin_service import MainAdminService

router = APIRouter(tags=["Main Admin Administration"])


# Authentication Endpoints
@router.post(
    "/api/main-admin/login",
    response_model=MainAdminLoginResponse,
    status_code=status.HTTP_200_OK,
)
def login(login_data: MainAdminLogin, db: Session = Depends(get_db)):
    """Login Main Admin with name and password."""
    return MainAdminService.login(db, login_data)


# Announcement Endpoints
@router.post(
    "/api/main-admin/announcements",
    response_model=MainAdminAnnouncementResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_announcement(
    announcement_in: MainAdminAnnouncementCreate,
    current_admin: MainAdmin = Depends(get_current_main_admin),
    db: Session = Depends(get_db),
):
    """Create a new announcement as Main Admin."""
    return MainAdminService.create_announcement(db, current_admin, announcement_in)


@router.get(
    "/api/main-admin/announcements",
    response_model=MainAdminAnnouncementListResponse,
    status_code=status.HTTP_200_OK,
)
def get_announcements(
    include_archived: bool = False,
    include_deleted: bool = False,
    offset: int = 0,
    limit: int = 50,
    current_admin: MainAdmin = Depends(get_current_main_admin),
    db: Session = Depends(get_db),
):
    """Get all announcements for Main Admin."""
    return MainAdminService.get_announcements(db, include_archived, include_deleted, offset, limit)


@router.get(
    "/api/main-admin/announcements/{announcement_id}",
    response_model=MainAdminAnnouncementResponse,
    status_code=status.HTTP_200_OK,
)
def get_announcement_detail(
    announcement_id: int,
    current_admin: MainAdmin = Depends(get_current_main_admin),
    db: Session = Depends(get_db),
):
    """Get announcement detail for Main Admin."""
    return MainAdminService.get_announcement_detail(db, announcement_id)


@router.put(
    "/api/main-admin/announcements/{announcement_id}",
    response_model=MainAdminAnnouncementResponse,
    status_code=status.HTTP_200_OK,
)
def update_announcement(
    announcement_id: int,
    announcement_in: MainAdminAnnouncementUpdate,
    current_admin: MainAdmin = Depends(get_current_main_admin),
    db: Session = Depends(get_db),
):
    """Update an existing announcement (soft update, no history)."""
    return MainAdminService.update_announcement(db, announcement_id, announcement_in, current_admin)


@router.put(
    "/api/main-admin/announcements/{announcement_id}/archive",
    response_model=MainAdminAnnouncementResponse,
    status_code=status.HTTP_200_OK,
)
def archive_announcement(
    announcement_id: int,
    current_admin: MainAdmin = Depends(get_current_main_admin),
    db: Session = Depends(get_db),
):
    """Archive an announcement."""
    return MainAdminService.archive_announcement(db, announcement_id, current_admin)


@router.put(
    "/api/main-admin/announcements/{announcement_id}/unarchive",
    response_model=MainAdminAnnouncementResponse,
    status_code=status.HTTP_200_OK,
)
def unarchive_announcement(
    announcement_id: int,
    current_admin: MainAdmin = Depends(get_current_main_admin),
    db: Session = Depends(get_db),
):
    """Unarchive an announcement."""
    return MainAdminService.unarchive_announcement(db, announcement_id, current_admin)


@router.delete(
    "/api/main-admin/announcements/{announcement_id}",
    status_code=status.HTTP_200_OK,
)
def delete_announcement(
    announcement_id: int,
    current_admin: MainAdmin = Depends(get_current_main_admin),
    db: Session = Depends(get_db),
):
    """Soft delete an announcement."""
    return MainAdminService.delete_announcement(db, announcement_id, current_admin)


# User Management Endpoints - Citizens
@router.get(
    "/api/main-admin/citizens",
    response_model=MainAdminUserListResponse,
    status_code=status.HTTP_200_OK,
)
def search_citizens(
    search_query: str | None = None,
    ward_id: int | None = None,
    status: str | None = None,
    is_active: bool | None = None,
    is_blocked: bool | None = None,
    is_restricted: bool | None = None,
    is_archived: bool | None = None,
    offset: int = 0,
    limit: int = 50,
    current_admin: MainAdmin = Depends(get_current_main_admin),
    db: Session = Depends(get_db),
):
    """Search citizens with filters.
    
    Filters:
    - search_query: Search by name or phone number
    - ward_id: Filter by ward ID
    - status: Filter by status (active, blocked, restricted, archived, deleted)
    - is_active: Filter by active status
    - is_blocked: Filter by blocked status
    - is_restricted: Filter by restricted status
    - is_archived: Filter by archived status
    
    Pagination:
    - offset: Number of results to skip (default 0)
    - limit: Number of results per page (default 50, max 100)
    """
    filters = MainAdminCitizenSearchFilter(
        search_query=search_query,
        ward_id=ward_id,
        status=status,
        is_active=is_active,
        is_blocked=is_blocked,
        is_restricted=is_restricted,
        is_archived=is_archived,
        offset=offset,
        limit=limit,
    )
    return MainAdminService.search_citizens(
        db,
        filters.search_query,
        filters.ward_id,
        filters.status,
        filters.is_active,
        filters.is_blocked,
        filters.is_restricted,
        filters.is_archived,
        filters.offset,
        filters.limit,
    )


@router.get(
    "/api/main-admin/citizens/{citizen_id}",
    response_model=MainAdminCitizenProfile,
    status_code=status.HTTP_200_OK,
)
def get_citizen_profile(
    citizen_id: int,
    current_admin: MainAdmin = Depends(get_current_main_admin),
    db: Session = Depends(get_db),
):
    """Get complete citizen profile for Main Admin."""
    return MainAdminService.get_citizen_profile(db, citizen_id)


# User Management Endpoints - Nagarsevaks
@router.get(
    "/api/main-admin/nagarsevaks",
    response_model=MainAdminUserListResponse,
    status_code=status.HTTP_200_OK,
)
def search_nagarsevaks(
    search_query: str | None = None,
    ward_id: int | None = None,
    is_active: bool | None = None,
    offset: int = 0,
    limit: int = 50,
    current_admin: MainAdmin = Depends(get_current_main_admin),
    db: Session = Depends(get_db),
):
    """Search nagarsevaks with filters.
    
    Filters:
    - search_query: Search by name or phone number
    - ward_id: Filter by ward ID
    - is_active: Filter by active status
    
    Pagination:
    - offset: Number of results to skip (default 0)
    - limit: Number of results per page (default 50, max 100)
    """
    filters = MainAdminNagarsevakSearchFilter(
        search_query=search_query,
        ward_id=ward_id,
        is_active=is_active,
        offset=offset,
        limit=limit,
    )
    return MainAdminService.search_nagarsevaks(
        db,
        filters.search_query,
        filters.ward_id,
        None,
        filters.is_active,
        None,
        None,
        None,
        filters.offset,
        filters.limit,
    )


@router.get(
    "/api/main-admin/nagarsevaks/{nagarsevak_id}",
    response_model=MainAdminNagarsevakProfile,
    status_code=status.HTTP_200_OK,
)
def get_nagarsevak_profile(
    nagarsevak_id: int,
    current_admin: MainAdmin = Depends(get_current_main_admin),
    db: Session = Depends(get_db),
):
    """Get complete nagarsevak profile for Main Admin."""
    return MainAdminService.get_nagarsevak_profile(db, nagarsevak_id)


# User Management Endpoints - Department Officers
@router.get(
    "/api/main-admin/department-officers",
    response_model=MainAdminUserListResponse,
    status_code=status.HTTP_200_OK,
)
def search_department_officers(
    search_query: str | None = None,
    department: str | None = None,
    status: str | None = None,
    is_active: bool | None = None,
    is_blocked: bool | None = None,
    is_restricted: bool | None = None,
    is_archived: bool | None = None,
    offset: int = 0,
    limit: int = 50,
    current_admin: MainAdmin = Depends(get_current_main_admin),
    db: Session = Depends(get_db),
):
    """Search department officers with filters.
    
    Filters:
    - search_query: Search by name, phone number, or email
    - department: Filter by department
    - status: Filter by status (active, blocked, restricted, archived, deleted)
    - is_active: Filter by active status
    - is_blocked: Filter by blocked status
    - is_restricted: Filter by restricted status
    - is_archived: Filter by archived status
    
    Pagination:
    - offset: Number of results to skip (default 0)
    - limit: Number of results per page (default 50, max 100)
    """
    filters = MainAdminDepartmentOfficerSearchFilter(
        search_query=search_query,
        department=department,
        status=status,
        is_active=is_active,
        is_blocked=is_blocked,
        is_restricted=is_restricted,
        is_archived=is_archived,
        offset=offset,
        limit=limit,
    )
    return MainAdminService.search_department_officers(
        db,
        filters.search_query,
        filters.department,
        filters.status,
        filters.is_active,
        filters.is_blocked,
        filters.is_restricted,
        filters.is_archived,
        filters.offset,
        filters.limit,
    )


@router.get(
    "/api/main-admin/department-officers/{officer_id}",
    response_model=MainAdminDepartmentOfficerProfile,
    status_code=status.HTTP_200_OK,
)
def get_department_officer_profile(
    officer_id: int,
    current_admin: MainAdmin = Depends(get_current_main_admin),
    db: Session = Depends(get_db),
):
    """Get complete department officer profile for Main Admin."""
    return MainAdminService.get_department_officer_profile(db, officer_id)


# User Action Endpoints
@router.put(
    "/api/main-admin/citizens/{citizen_id}/action",
    response_model=MainAdminUserActionResponse,
    status_code=status.HTTP_200_OK,
)
def perform_citizen_action(
    citizen_id: int,
    action_request: MainAdminUserActionRequest,
    current_admin: MainAdmin = Depends(get_current_main_admin),
    db: Session = Depends(get_db),
):
    """Perform management action on a citizen.
    
    Actions:
    - block: Temporarily stop user from accessing the system
    - unblock: Restore complete access
    - restrict: Allow login but prevent actions (useful during investigations)
    - unrestrict: Remove restriction
    - archive: Hide from normal lists, prevent login
    - unarchive: Restore archived user
    - delete: Soft delete user (hide from UI, prevent login/actions)
    """
    return MainAdminService.perform_user_action(db, "citizen", citizen_id, action_request, current_admin)


@router.put(
    "/api/main-admin/nagarsevaks/{nagarsevak_id}/action",
    response_model=MainAdminUserActionResponse,
    status_code=status.HTTP_200_OK,
)
def perform_nagarsevak_action(
    nagarsevak_id: int,
    action_request: MainAdminUserActionRequest,
    current_admin: MainAdmin = Depends(get_current_main_admin),
    db: Session = Depends(get_db),
):
    """Perform management action on a nagarsevak.
    
    Actions:
    - block: Temporarily stop user from accessing the system
    - unblock: Restore complete access
    - restrict: Allow login but prevent actions (useful during investigations)
    - unrestrict: Remove restriction
    - archive: Hide from normal lists, prevent login
    - unarchive: Restore archived user
    - delete: Soft delete user (hide from UI, prevent login/actions)
    """
    return MainAdminService.perform_user_action(db, "nagarsevak", nagarsevak_id, action_request, current_admin)


@router.put(
    "/api/main-admin/department-officers/{officer_id}/action",
    response_model=MainAdminUserActionResponse,
    status_code=status.HTTP_200_OK,
)
def perform_department_officer_action(
    officer_id: int,
    action_request: MainAdminUserActionRequest,
    current_admin: MainAdmin = Depends(get_current_main_admin),
    db: Session = Depends(get_db),
):
    """Perform management action on a department officer.
    
    Actions:
    - block: Temporarily stop user from accessing the system
    - unblock: Restore complete access
    - restrict: Allow login but prevent actions (useful during investigations)
    - unrestrict: Remove restriction
    - archive: Hide from normal lists, prevent login
    - unarchive: Restore archived user
    - delete: Soft delete user (hide from UI, prevent login/actions)
    """
    return MainAdminService.perform_user_action(db, "department_officer", officer_id, action_request, current_admin)
