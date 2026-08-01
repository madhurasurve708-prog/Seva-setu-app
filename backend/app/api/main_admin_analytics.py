from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.dependencies.db import get_db
from app.dependencies.main_admin_auth import get_current_main_admin
from app.models.main_admin import MainAdmin
from app.schemas.analytics import (
    DashboardStatistics,
    TodayStatistics,
    MonthlyStatistics,
    WardPerformanceList,
    DepartmentPerformanceList,
    MonthlyTrendList,
    CategoryAnalyticsList,
)
from app.services.analytics_service import AnalyticsService

router = APIRouter(tags=["Main Admin Analytics"])


# Dashboard Statistics
@router.get(
    "/api/main-admin/analytics/dashboard",
    response_model=DashboardStatistics,
    status_code=status.HTTP_200_OK,
)
def get_dashboard_statistics(
    current_admin: MainAdmin = Depends(get_current_main_admin),
    db: Session = Depends(get_db),
):
    """Get municipality-wide complaint statistics for dashboard."""
    return AnalyticsService.get_dashboard_statistics(db)


@router.get(
    "/api/main-admin/analytics/today",
    response_model=TodayStatistics,
    status_code=status.HTTP_200_OK,
)
def get_today_statistics(
    current_admin: MainAdmin = Depends(get_current_main_admin),
    db: Session = Depends(get_db),
):
    """Get today's complaint statistics."""
    return AnalyticsService.get_today_statistics(db)


@router.get(
    "/api/main-admin/analytics/monthly",
    response_model=MonthlyStatistics,
    status_code=status.HTTP_200_OK,
)
def get_monthly_statistics(
    current_admin: MainAdmin = Depends(get_current_main_admin),
    db: Session = Depends(get_db),
):
    """Get current month complaint statistics."""
    return AnalyticsService.get_monthly_statistics(db)


# Ward Performance
@router.get(
    "/api/main-admin/analytics/wards",
    response_model=WardPerformanceList,
    status_code=status.HTTP_200_OK,
)
def get_ward_performance(
    current_admin: MainAdmin = Depends(get_current_main_admin),
    db: Session = Depends(get_db),
):
    """Get ward performance statistics with ranking (best ward first)."""
    return AnalyticsService.get_ward_performance(db)


# Department Performance
@router.get(
    "/api/main-admin/analytics/departments",
    response_model=DepartmentPerformanceList,
    status_code=status.HTTP_200_OK,
)
def get_department_performance(
    current_admin: MainAdmin = Depends(get_current_main_admin),
    db: Session = Depends(get_db),
):
    """Get department performance statistics."""
    return AnalyticsService.get_department_performance(db)


# Monthly Trends
@router.get(
    "/api/main-admin/analytics/trends",
    response_model=MonthlyTrendList,
    status_code=status.HTTP_200_OK,
)
def get_monthly_trends(
    months: int = 12,
    current_admin: MainAdmin = Depends(get_current_main_admin),
    db: Session = Depends(get_db),
):
    """Get monthly complaint trends for the last N months."""
    return AnalyticsService.get_monthly_trends(db, months)


# Category Analytics
@router.get(
    "/api/main-admin/analytics/categories",
    response_model=CategoryAnalyticsList,
    status_code=status.HTTP_200_OK,
)
def get_category_analytics(
    current_admin: MainAdmin = Depends(get_current_main_admin),
    db: Session = Depends(get_db),
):
    """Get category complaint statistics."""
    return AnalyticsService.get_category_analytics(db)
