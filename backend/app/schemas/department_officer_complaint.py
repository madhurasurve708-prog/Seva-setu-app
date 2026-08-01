from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, ConfigDict, Field
from app.core.constants import ComplaintStatus


class DepartmentOfficerDashboard(BaseModel):
    total_complaints: int
    pending: int
    in_progress: int
    resolved: int
    escalated: int


class DepartmentOfficerComplaintListItem(BaseModel):
    id: int
    citizen_name: str
    citizen_phone_number: str
    locality: str
    ward_number: str
    ward_name: str
    category: str
    priority: str
    status: str
    created_at: datetime
    image_url: Optional[str] = None

    class Config:
        from_attributes = True


class DepartmentOfficerComplaintDetail(BaseModel):
    id: int
    citizen_name: str
    citizen_phone_number: str
    ward_number: str
    ward_name: str
    locality: str
    category: str
    description: str
    manual_location: Optional[str] = None
    image_url: Optional[str] = None
    status: str
    priority: str
    created_at: datetime
    updated_at: datetime
    assigned_department: str

    class Config:
        from_attributes = True


class DepartmentComplaintListFilter(BaseModel):
    status: Optional[Literal[ComplaintStatus.PENDING, ComplaintStatus.IN_PROGRESS, ComplaintStatus.RESOLVED]] = Field(
        None, description="Filter by complaint status"
    )
    priority: Optional[Literal["Low", "Medium", "High"]] = Field(
        None, description="Filter by priority"
    )
    ward_id: Optional[int] = Field(None, description="Filter by ward ID")
    search: Optional[str] = Field(None, min_length=1, max_length=100, description="Search in title and description")
    sort_newest: bool = Field(True, description="Sort by newest first if true, oldest first if false")
    page: int = Field(1, ge=1, description="Page number for pagination")
    page_size: int = Field(20, ge=1, le=100, description="Number of items per page")


class ComplaintStatusUpdate(BaseModel):
    status: Literal[ComplaintStatus.PENDING, ComplaintStatus.IN_PROGRESS, ComplaintStatus.RESOLVED] = Field(
        ..., description="New status; transitions must move forward."
    )


class ComplaintNoteCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    
    note_text: str = Field(..., min_length=1, max_length=2000, description="Note content")


class ComplaintNoteResponse(BaseModel):
    author_name: str
    author_role: str
    created_at: datetime
    note_text: str
    image_url: Optional[str] = None

    class Config:
        from_attributes = True


class ComplaintTimelineItem(BaseModel):
    author_name: str
    author_role: str
    created_at: datetime
    note_text: str
    image_url: Optional[str] = None

    class Config:
        from_attributes = True


class ComplaintEscalateRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    escalation_target: Literal["Main Admin", "Department"] = Field(
        ..., description="Escalation destination."
    )
    escalation_note: str = Field(
        ..., min_length=1, max_length=2000, description="Reason for escalation."
    )


class ComplaintEscalationResponse(BaseModel):
    id: int
    complaint_id: int
    escalated_by_role: str
    escalated_by_id: int
    escalated_by_name: str
    escalated_to: str
    escalation_note: str
    created_at: datetime

    class Config:
        from_attributes = True
