from pydantic import BaseModel


# Dashboard Statistics
class DashboardStatistics(BaseModel):
    """Municipality-wide complaint statistics."""
    total_complaints: int
    pending: int
    in_progress: int
    resolved: int
    escalated: int


# Ward Statistics
class WardStatistics(BaseModel):
    """Ward statistics."""
    ward_id: int
    ward_number: str
    ward_name: str
    total_complaints: int
    pending: int
    in_progress: int
    resolved: int
    resolution_percentage: float


class WardStatisticsList(BaseModel):
    """List of ward statistics."""
    wards: list[WardStatistics]


# Department Statistics
class DepartmentStatistics(BaseModel):
    """Department statistics."""
    department_name: str
    total_complaints: int
    pending: int
    in_progress: int
    resolved: int


class DepartmentStatisticsList(BaseModel):
    """List of department statistics."""
    departments: list[DepartmentStatistics]


# Best Ward
class BestWard(BaseModel):
    """Best ward (highest resolution percentage)."""
    ward_id: int
    ward_number: str
    ward_name: str
    total_complaints: int
    resolved_complaints: int
    resolution_percentage: float
