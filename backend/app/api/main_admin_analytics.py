from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.dependencies.db import get_db
from app.dependencies.main_admin_auth import get_current_main_admin
from app.models.main_admin import MainAdmin
from app.schemas.analytics import (
    DashboardStatistics,
    WardStatisticsList,
    DepartmentStatisticsList,
    BestWard,
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


# Ward Statistics
@router.get(
    "/api/main-admin/analytics/wards",
    response_model=WardStatisticsList,
    status_code=status.HTTP_200_OK,
)
def get_ward_statistics(
    current_admin: MainAdmin = Depends(get_current_main_admin),
    db: Session = Depends(get_db),
):
    """Get statistics for every ward."""
    return AnalyticsService.get_ward_statistics(db)


# Department Statistics
@router.get(
    "/api/main-admin/analytics/departments",
    response_model=DepartmentStatisticsList,
    status_code=status.HTTP_200_OK,
)
def get_department_statistics(
    current_admin: MainAdmin = Depends(get_current_main_admin),
    db: Session = Depends(get_db),
):
    """Get statistics for every department."""
    return AnalyticsService.get_department_statistics(db)


# Best Ward
@router.get(
    "/api/main-admin/analytics/best-ward",
    response_model=BestWard,
    status_code=status.HTTP_200_OK,
)
def get_best_ward(
    current_admin: MainAdmin = Depends(get_current_main_admin),
    db: Session = Depends(get_db),
):
    """Get the best ward (highest resolution percentage)."""
    best_ward = AnalyticsService.get_best_ward(db)
    if best_ward is None:
        raise status.HTTP_404_NOT_FOUND(detail="No wards found")
    return best_ward
