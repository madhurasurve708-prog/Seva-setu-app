from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class CitizenProfileCreate(BaseModel):
    supabase_user_id: str = Field(..., description="Unique Supabase Auth User ID")
    full_name: str = Field(..., min_length=1, max_length=150, description="Citizen's full name")
    phone_number: str = Field(..., min_length=5, max_length=20, description="Citizen's contact number")
    ward_number: int = Field(..., description="Ward number (1, 2, 3, etc.) - not the database ID")
    locality: str = Field(..., min_length=1, max_length=255, description="Citizen's neighborhood/locality")


class CitizenProfileResponse(BaseModel):
    id: int
    supabase_user_id: str
    full_name: str
    phone_number: str
    ward_id: int
    locality: str
    profile_photo_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
