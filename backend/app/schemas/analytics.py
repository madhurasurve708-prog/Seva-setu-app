from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


# Dashboard Statistics
class DashboardStatistics(BaseModel):
    """Municipality-wide complaint statistics."""
    total_complaints: int
    pending: int
    in_progress: int
    resolved: int
    closed: int
    escalated: int


class TodayStatistics(BaseModel):
    """Today's complaint statistics."""
    registered_today: int
    resolved_today: int
    closed_today: int
    escalated_today: int


class MonthlyStatistics(BaseModel):
    """Current month complaint statistics."""
    registered_month: int
    resolved_month: int
    closed_month: int
    escalated_month: int


# Ward Performance
class WardPerformance(BaseModel):
    """Ward performance statistics."""
    ward_id: int
    ward_number: str
    ward_name: str
    total_complaints: int
    resolved: int
    pending: int
    avg_resolution_days: float
    resolution_percentage: float


class WardPerformanceList(BaseModel):
    """List of ward performance statistics."""
    wards: list[WardPerformance]


# Department Performance
class DepartmentPerformance(BaseModel):
    """Department performance statistics."""
    department_name: str
    total_complaints: int
    pending: int
    in_progress: int
    resolved: int
    closed: int
    escalated: int
    avg_resolution_days: float


class DepartmentPerformanceList(BaseModel):
    """List of department performance statistics."""
    departments: list[DepartmentPerformance]


# Monthly Trends
class MonthlyTrend(BaseModel):
    """Monthly complaint trend data."""
    month: str
    month_name: str
    total_complaints: int
    resolved: int
    closed: int


class MonthlyTrendList(BaseModel):
    """List of monthly trends."""
    trends: list[MonthlyTrend]


# Category Analytics
class CategoryAnalytics(BaseModel):
    """Category complaint statistics."""
    category_id: int
    category_name: str
    total_complaints: int
    pending: int
    resolved: int
    closed: int


class CategoryAnalyticsList(BaseModel):
    """List of category analytics."""
    categories: list[CategoryAnalytics]
