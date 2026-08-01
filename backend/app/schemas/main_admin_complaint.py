from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, ConfigDict, Field
from app.core.constants import ComplaintStatus


# Department enum values (reused from department_officer schema)
VALID_DEPARTMENT_KEYS = {
    "DEPT_PANI": "पाणी पुरवठा विभाग",
    "DEPT_SWACHHTA": "स्वच्छता व घनकचरा विभाग",
    "DEPT_BANDHKAM": "बांधकाम विभाग",
    "DEPT_VIDYUT": "विद्युत विभाग",
    "DEPT_AROGYA": "आरोग्य विभाग",
    "DEPT_UDYAN": "उद्याने व बाग विभाग",
}

# Category to Department Key mapping (using enum values instead of localized names)
CATEGORY_TO_DEPARTMENT_KEY = {
    "Water": "DEPT_PANI",
    "Garbage": "DEPT_SWACHHTA",
    "Gutter": "DEPT_SWACHHTA",
    "Drainage": "DEPT_BANDHKAM",
    "Road": "DEPT_BANDHKAM",
    "Street Lights": "DEPT_VIDYUT",
    "Animals": "DEPT_AROGYA",
    "Tree": "DEPT_UDYAN",
    "Traffic": "DEPT_BANDHKAM",
    "Other": "DEPT_AROGYA",
}


class MainAdminComplaintFilter(BaseModel):
    """Filter parameters for Main Admin complaint list."""
    ward_id: Optional[int] = Field(None, description="Filter by ward ID")
    category_id: Optional[int] = Field(None, description="Filter by category ID")
    department: Optional[Literal["DEPT_PANI", "DEPT_SWACHHTA", "DEPT_BANDHKAM", "DEPT_VIDYUT", "DEPT_AROGYA", "DEPT_UDYAN"]] = Field(
        None, description="Filter by department key (e.g., DEPT_PANI)"
    )
    status: Optional[Literal[ComplaintStatus.PENDING, ComplaintStatus.IN_PROGRESS, ComplaintStatus.RESOLVED, ComplaintStatus.CLOSED]] = Field(
        None, description="Filter by complaint status"
    )
    sort_newest: bool = Field(True, description="Sort by newest first (default) or oldest first")
    offset: int = Field(0, ge=0, description="Pagination offset")
    limit: int = Field(50, ge=1, le=100, description="Results per page (max 100)")


class MainAdminComplaintListItem(BaseModel):
    """Lightweight complaint item for list view."""
    id: int
    citizen_name: str
    citizen_phone_number: str
    ward_number: str
    category: str
    department_key: str
    department_name: str
    status: str
    priority: str
    created_at: datetime
    images: list[str] = []
    is_escalated: bool = False


class MainAdminComplaintEscalationInfo(BaseModel):
    """Simple escalation information for complaint detail."""
    is_escalated: bool
    escalated_by: Optional[str] = None
    escalation_reason: Optional[str] = None
    escalated_at: Optional[datetime] = None
    current_status: Optional[str] = None


class MainAdminComplaintHistoryItem(BaseModel):
    """History item for complaint timeline."""
    author_role: str
    author_name: str
    author_id: Optional[int] = None
    created_at: datetime
    note_text: str
    image_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class MainAdminComplaintDetail(BaseModel):
    """Complete complaint detail for Main Admin."""
    id: int
    citizen_name: str
    citizen_phone_number: str
    ward_number: str
    ward_name: str
    locality: str
    category: str
    department_key: str
    department_name: str
    title: str
    description: str
    manual_location: Optional[str] = None
    images: list[str] = []
    status: str
    priority: str
    created_at: datetime
    updated_at: datetime
    history: list[MainAdminComplaintHistoryItem] = []
    escalation: MainAdminComplaintEscalationInfo


class MainAdminComplaintListResponse(BaseModel):
    """Response wrapper for complaint list with pagination info."""
    complaints: list[MainAdminComplaintListItem]
    total_count: int
    offset: int
    limit: int


# Request schemas for complaint actions
class MainAdminStatusUpdateRequest(BaseModel):
    """Request schema for updating complaint status."""
    status: Literal[ComplaintStatus.PENDING, ComplaintStatus.IN_PROGRESS, ComplaintStatus.RESOLVED, ComplaintStatus.CLOSED]


class MainAdminResolveRequest(BaseModel):
    """Request schema for resolving a complaint."""
    resolution_note: Optional[str] = Field(None, description="Optional note explaining the resolution")


class MainAdminCloseRequest(BaseModel):
    """Request schema for closing a complaint."""
    closing_note: Optional[str] = Field(None, description="Optional note explaining the closure")


class MainAdminActionResponse(BaseModel):
    """Generic response schema for complaint actions."""
    message: str
