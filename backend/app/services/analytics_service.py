from sqlalchemy.orm import Session
from app.db.repository import AnalyticsRepository
from app.schemas.analytics import (
    DashboardStatistics,
    TodayStatistics,
    MonthlyStatistics,
    WardPerformanceList,
    DepartmentPerformanceList,
    MonthlyTrendList,
    CategoryAnalyticsList,
)


class AnalyticsService:
    """Service for analytics and reporting."""
    
    @staticmethod
    def get_dashboard_statistics(db: Session) -> DashboardStatistics:
        """Get municipality-wide complaint statistics."""
        stats = AnalyticsRepository.get_dashboard_statistics(db)
        return DashboardStatistics(**stats)
    
    @staticmethod
    def get_today_statistics(db: Session) -> TodayStatistics:
        """Get today's complaint statistics."""
        stats = AnalyticsRepository.get_today_statistics(db)
        return TodayStatistics(**stats)
    
    @staticmethod
    def get_monthly_statistics(db: Session) -> MonthlyStatistics:
        """Get current month complaint statistics."""
        stats = AnalyticsRepository.get_monthly_statistics(db)
        return MonthlyStatistics(**stats)
    
    @staticmethod
    def get_ward_performance(db: Session) -> WardPerformanceList:
        """Get ward performance statistics with ranking."""
        ward_stats = AnalyticsRepository.get_ward_performance(db)
        return WardPerformanceList(wards=ward_stats)
    
    @staticmethod
    def get_department_performance(db: Session) -> DepartmentPerformanceList:
        """Get department performance statistics."""
        dept_stats = AnalyticsRepository.get_department_performance(db)
        return DepartmentPerformanceList(departments=dept_stats)
    
    @staticmethod
    def get_monthly_trends(db: Session, months: int = 12) -> MonthlyTrendList:
        """Get monthly complaint trends."""
        trends = AnalyticsRepository.get_monthly_trends(db, months)
        return MonthlyTrendList(trends=trends)
    
    @staticmethod
    def get_category_analytics(db: Session) -> CategoryAnalyticsList:
        """Get category complaint statistics."""
        category_stats = AnalyticsRepository.get_category_analytics(db)
        return CategoryAnalyticsList(categories=category_stats)
