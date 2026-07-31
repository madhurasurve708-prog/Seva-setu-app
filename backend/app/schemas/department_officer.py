from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


# Valid department keys accepted in the login request.
# Values must match VALID_DEPARTMENTS in the DepartmentOfficer model.
VALID_DEPARTMENT_KEYS: dict[str, str] = {
    "DEPT_PANI":        "पाणी पुरवठा विभाग",
    "DEPT_SWACHHTA":    "स्वच्छता व घनकचरा विभाग",
    "DEPT_BANDHKAM":    "बांधकाम विभाग",
    "DEPT_VIDYUT":      "विद्युत विभाग",
    "DEPT_AROGYA":      "आरोग्य विभाग",
    "DEPT_UDYAN":       "उद्याने व बाग विभाग",
}


class DepartmentOfficerLogin(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    department: str = Field(
        ...,
        description=(
            "Department key, e.g. DEPT_PANI. "
            f"Valid values: {', '.join(VALID_DEPARTMENT_KEYS)}"
        ),
    )
    name: str = Field(
        ...,
        min_length=1,
        max_length=150,
        description="Display name of the officer (not used for authentication)",
    )
    password: str = Field(..., min_length=1, max_length=100, description="Department password")


class DepartmentOfficerLoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    department: str
    department_name: str
    display_name: str
    role: str = "department_officer"


# Profile schema — returned by GET /department/profile once real officers exist.
# Kept intact so the endpoint contract is stable for the frontend.
class DepartmentOfficerProfile(BaseModel):
    id: int
    full_name: str
    phone_number: str
    email: str
    department_name: str
    profile_photo_url: Optional[str] = None
    role: str = "department_officer"
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class DepartmentOfficerUpdateName(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    full_name: str = Field(..., min_length=1, max_length=150, description="New full name")


class DepartmentOfficerUpdatePhone(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    phone_number: str = Field(
        ..., pattern=r"^\+?[0-9]{10,15}$", description="New phone number"
    )


class DepartmentOfficerChangePassword(BaseModel):
    current_password: str = Field(
        ..., min_length=1, max_length=100, description="Current password to verify identity"
    )
    new_password: str = Field(
        ..., min_length=8, max_length=100, description="New secure password"
    )
