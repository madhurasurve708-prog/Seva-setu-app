from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.core.constants import ComplaintStatus


class NagarsevakComplaintDashboard(BaseModel):
    total_complaints: int
    pending: int
    in_progress: int
    resolved: int


class NagarsevakComplaintListItem(BaseModel):
    id: int
    citizen_name: str
    citizen_phone_number: str
    locality: str
    ward_number: str
    category: str
    priority: str
    status: str
    created_at: datetime
    image_url: Optional[str] = None

    class Config:
        from_attributes = True


class NagarsevakComplaintDetail(BaseModel):
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

    class Config:
        from_attributes = True


class ComplaintStatusUpdate(BaseModel):
    status: Literal[ComplaintStatus.PENDING, ComplaintStatus.IN_PROGRESS, ComplaintStatus.RESOLVED] = Field(
        ..., description="New status; transitions must move forward."
    )


class ComplaintEscalateRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    escalation_target: Literal["Main Admin", "Department"] = Field(
        ..., description="Escalation destination."
    )
    escalation_note: str = Field(
        ..., min_length=1, max_length=2000, description="Reason for escalation."
    )


class EscalatedComplaintResponse(BaseModel):
    complaint_id: int
    citizen_name: str
    category: str
    priority: str
    current_status: str
    escalated_to: str
    escalation_date: datetime
    latest_escalation_note: str

    class Config:
        from_attributes = True


class ComplaintEscalationCreatedResponse(BaseModel):
    id: int
    complaint_id: int
    escalated_by_role: str
    escalated_by_id: int
    escalated_by_name: str
    escalated_to: str
    escalation_note: str
    created_at: datetime
