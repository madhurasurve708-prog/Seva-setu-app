from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, Field


class ReportRequest(BaseModel):
    """Request schema for report generation."""
    report_type: Literal["municipality", "ward", "department"] = Field(
        ..., description="Type of report to generate"
    )
    format: Literal["pdf", "excel"] = Field(..., description="Report format")
    ward_id: Optional[int] = Field(None, description="Ward ID (required for ward reports)")
    department: Optional[str] = Field(None, description="Department name (required for department reports)")
    date_from: Optional[datetime] = Field(None, description="Start date for report period")
    date_to: Optional[datetime] = Field(None, description="End date for report period")


class ReportResponse(BaseModel):
    """Response schema for report generation."""
    report_url: str
    report_type: str
    format: str
    generated_at: datetime
    file_size_bytes: Optional[int] = None
