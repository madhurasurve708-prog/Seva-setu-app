from typing import Literal
from pydantic import BaseModel, Field
from app.core.constants import ComplaintStatus


class ComplaintStatusUpdate(BaseModel):
    """Schema for updating complaint status."""
    status: Literal[ComplaintStatus.PENDING, ComplaintStatus.IN_PROGRESS, ComplaintStatus.RESOLVED] = Field(
        ..., description="New status; transitions must move forward."
    )


class ComplaintEscalateRequest(BaseModel):
    """Schema for escalating complaints."""
    escalation_target: Literal["Main Admin", "Department"] = Field(..., description="Target for escalation")
    escalation_note: str = Field(..., min_length=1, max_length=2000, description="Reason for escalation")
