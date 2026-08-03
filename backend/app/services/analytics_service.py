from sqlalchemy.orm import Session
from app.db.repository import AnalyticsRepository
from app.schemas.analytics import (
    DashboardStatistics,
    WardStatisticsList,
    DepartmentStatisticsList,
    BestWard,
)


class AnalyticsService:
    """Service for analytics."""
    
    @staticmethod
    def get_dashboard_statistics(db: Session) -> DashboardStatistics:
        """Get municipality-wide complaint statistics."""
        stats = AnalyticsRepository.get_dashboard_statistics(db)
        return DashboardStatistics(**stats)
    
    @staticmethod
    def get_ward_statistics(db: Session) -> WardStatisticsList:
        """Get statistics for every ward."""
        ward_stats = AnalyticsRepository.get_ward_statistics(db)
        return WardStatisticsList(wards=ward_stats)
    
    @staticmethod
    def get_department_statistics(db: Session) -> DepartmentStatisticsList:
        """Get statistics for every department."""
        dept_stats = AnalyticsRepository.get_department_statistics(db)
        return DepartmentStatisticsList(departments=dept_stats)
    
    @staticmethod
    def get_best_ward(db: Session) -> BestWard | None:
        """Get the best ward (highest resolution percentage)."""
        best_ward = AnalyticsRepository.get_best_ward(db)
        if best_ward:
            return BestWard(**best_ward)
        return None
