from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class NagarsevakLogin(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str = Field(..., min_length=1, max_length=150, description="Display name of the Nagarsevak")
    ward_number: int = Field(..., gt=0, description="Ward number for login, for example 2")
    password: str = Field(..., min_length=1, max_length=100, description="Password")


class NagarsevakProfile(BaseModel):
    id: int
    name: str
    phone_number: str
    ward_id: int
    ward_name: str
    ward_number: str
    profile_photo_url: Optional[str] = None
    role: str = "nagarsevak"
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class NagarsevakLoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    nagarsevak: NagarsevakProfile


class NagarsevakUpdateName(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str = Field(..., min_length=1, max_length=150, description="New display name")


class NagarsevakUpdatePhone(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    phone_number: str = Field(..., pattern=r"^\+?[0-9]{10,15}$", description="New phone number")


class NagarsevakChangePassword(BaseModel):
    current_password: str = Field(..., min_length=1, max_length=100, description="Current password to verify identity")
    new_password: str = Field(..., min_length=8, max_length=100, description="New secure password")


class OfficialChangePassword(BaseModel):
    new_password: str = Field(..., min_length=8, max_length=100, description="New secure password")

