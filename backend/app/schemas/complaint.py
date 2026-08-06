from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class ComplaintCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    supabase_user_id: str = Field(..., description="Unique Supabase Auth User ID of the complaining citizen")
    title: str = Field(..., min_length=1, max_length=200, description="Short summary of the complaint")
    description: str = Field(..., min_length=1, max_length=5000, description="Detailed explanation of the complaint")
    category_id: int = Field(..., gt=0, description="ID of the category this complaint falls under")
    manual_location: Optional[str] = Field(None, max_length=255, description="Free-text location entered by the citizen")


class ComplaintNoteCitizenResponse(BaseModel):
    author_role: str
    author_name: str
    note_text: str
    created_at: datetime
    image_url: Optional[str] = None

    class Config:
        from_attributes = True


class ComplaintResponse(BaseModel):
    id: int
    citizen_id: int
    ward_id: int
    category_id: int
    title: str
    description: str
    manual_location: Optional[str] = None
    image_url: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime
    notes: list[ComplaintNoteCitizenResponse] = []

    class Config:
        from_attributes = True
