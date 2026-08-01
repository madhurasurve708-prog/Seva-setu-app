from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, ConfigDict, Field
from app.core.constants import AnnouncementTarget


# Announcement Schemas
class MainAdminAnnouncementCreate(BaseModel):
    """Request schema for creating an announcement."""
    title: str = Field(..., min_length=1, max_length=200, description="Announcement title")
    description: str = Field(..., min_length=1, max_length=5000, description="Announcement description")
    priority: Literal["Emergency", "High", "Medium", "Low"] = Field("Medium", description="Announcement priority")
    image_url: Optional[str] = Field(None, description="Optional image URL")
    target_type: Literal[
        AnnouncementTarget.EVERYONE,
        AnnouncementTarget.ALL_CITIZENS,
        AnnouncementTarget.WARD_CITIZENS,
        AnnouncementTarget.ALL_NAGARSEVAKS,
        AnnouncementTarget.WARD_NAGARSEVAKS,
        AnnouncementTarget.ALL_DEPARTMENTS,
        AnnouncementTarget.SINGLE_DEPARTMENT,
    ] = Field(..., description="Target audience for the announcement")
    target_ward_id: Optional[int] = Field(None, description="Target ward ID (required for ward-specific targets)")
    target_department: Optional[str] = Field(None, description="Target department (required for department-specific targets)")


class MainAdminAnnouncementUpdate(BaseModel):
    """Request schema for updating an announcement."""
    title: Optional[str] = Field(None, min_length=1, max_length=200, description="Announcement title")
    description: Optional[str] = Field(None, min_length=1, max_length=5000, description="Announcement description")
    priority: Optional[Literal["Emergency", "High", "Medium", "Low"]] = Field(None, description="Announcement priority")
    image_url: Optional[str] = Field(None, description="Optional image URL")


class MainAdminAnnouncementResponse(BaseModel):
    """Response schema for announcement."""
    id: int
    title: str
    description: str
    priority: str
    image_url: Optional[str] = None
    target_type: str
    target_ward_id: Optional[int] = None
    target_department: Optional[str] = None
    created_by: Optional[str] = None
    is_archived: bool
    is_deleted: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MainAdminAnnouncementListResponse(BaseModel):
    """Response schema for announcement list."""
    announcements: list[MainAdminAnnouncementResponse]
    total_count: int


# User Management Schemas
class MainAdminUserListItem(BaseModel):
    """Generic user list item for Main Admin."""
    id: int
    name: str
    phone_number: Optional[str] = None
    email: Optional[str] = None
    ward_id: Optional[int] = None
    ward_name: Optional[str] = None
    ward_number: Optional[str] = None
    department: Optional[str] = None
    is_active: bool
    is_blocked: bool
    is_restricted: bool
    is_archived: bool
    is_deleted: bool
    created_at: datetime


class MainAdminUserListResponse(BaseModel):
    """Response schema for user list."""
    users: list[MainAdminUserListItem]
    total_count: int
    offset: int
    limit: int


class MainAdminCitizenProfile(BaseModel):
    """Complete citizen profile for Main Admin."""
    id: int
    supabase_user_id: str
    full_name: str
    phone_number: str
    ward_id: int
    ward_name: str
    ward_number: str
    locality: str
    profile_photo_url: Optional[str] = None
    is_active: bool
    is_blocked: bool
    is_restricted: bool
    is_archived: bool
    is_deleted: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MainAdminNagarsevakProfile(BaseModel):
    """Complete nagarsevak profile for Main Admin."""
    id: int
    name: str
    phone_number: str
    ward_id: int
    ward_name: str
    ward_number: str
    profile_photo_url: Optional[str] = None
    is_active: bool
    is_blocked: bool
    is_restricted: bool
    is_archived: bool
    is_deleted: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MainAdminDepartmentOfficerProfile(BaseModel):
    """Complete department officer profile for Main Admin."""
    id: int
    full_name: str
    phone_number: str
    email: str
    department_name: str
    profile_photo_url: Optional[str] = None
    is_active: bool
    is_blocked: bool
    is_restricted: bool
    is_archived: bool
    is_deleted: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# User Action Schemas
class MainAdminUserActionRequest(BaseModel):
    """Request schema for user management actions."""
    action: Literal["block", "unblock", "archive", "unarchive", "delete", "restrict", "unrestrict"] = Field(
        ..., description="Action to perform on the user"
    )
    reason: Optional[str] = Field(None, description="Optional reason for the action")


class MainAdminUserActionResponse(BaseModel):
    """Response schema for user management actions."""
    message: str


# Citizen Search Filter
class MainAdminCitizenSearchFilter(BaseModel):
    """Filter parameters for citizen search."""
    search_query: Optional[str] = Field(None, description="Search by name or phone number")
    ward_id: Optional[int] = Field(None, description="Filter by ward ID")
    status: Optional[Literal["active", "blocked", "restricted", "archived", "deleted"]] = Field(None, description="Filter by user status")
    is_active: Optional[bool] = Field(None, description="Filter by active status")
    is_blocked: Optional[bool] = Field(None, description="Filter by blocked status")
    is_restricted: Optional[bool] = Field(None, description="Filter by restricted status")
    is_archived: Optional[bool] = Field(None, description="Filter by archived status")
    offset: int = Field(0, ge=0, description="Pagination offset")
    limit: int = Field(50, ge=1, le=100, description="Results per page (max 100)")


# Nagarsevak Search Filter
class MainAdminNagarsevakSearchFilter(BaseModel):
    """Filter parameters for nagarsevak search."""
    search_query: Optional[str] = Field(None, description="Search by name or phone number")
    ward_id: Optional[int] = Field(None, description="Filter by ward ID")
    status: Optional[Literal["active", "blocked", "restricted", "archived", "deleted"]] = Field(None, description="Filter by user status")
    is_active: Optional[bool] = Field(None, description="Filter by active status")
    is_blocked: Optional[bool] = Field(None, description="Filter by blocked status")
    is_restricted: Optional[bool] = Field(None, description="Filter by restricted status")
    is_archived: Optional[bool] = Field(None, description="Filter by archived status")
    offset: int = Field(0, ge=0, description="Pagination offset")
    limit: int = Field(50, ge=1, le=100, description="Results per page (max 100)")


# Department Officer Search Filter
class MainAdminDepartmentOfficerSearchFilter(BaseModel):
    """Filter parameters for department officer search."""
    search_query: Optional[str] = Field(None, description="Search by name, phone number, or email")
    department: Optional[str] = Field(None, description="Filter by department")
    status: Optional[Literal["active", "blocked", "restricted", "archived", "deleted"]] = Field(None, description="Filter by user status")
    is_active: Optional[bool] = Field(None, description="Filter by active status")
    is_blocked: Optional[bool] = Field(None, description="Filter by blocked status")
    is_restricted: Optional[bool] = Field(None, description="Filter by restricted status")
    is_archived: Optional[bool] = Field(None, description="Filter by archived status")
    offset: int = Field(0, ge=0, description="Pagination offset")
    limit: int = Field(50, ge=1, le=100, description="Results per page (max 100)")
