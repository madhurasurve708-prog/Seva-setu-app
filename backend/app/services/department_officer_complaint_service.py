from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.db.repository import ComplaintRepository
from app.dependencies.department_auth import DepartmentOfficerContext

# Reuse the existing category-to-department mapping from nagarsevak_complaint_service
CATEGORY_TO_DEPARTMENT = {
    "Water": "पाणी पुरवठा विभाग",
    "Garbage": "स्वच्छता व घनकचरा विभाग",
    "Gutter": "स्वच्छता व घनकचरा विभाग",
    "Drainage": "बांधकाम विभाग",
    "Road": "बांधकाम विभाग",
    "Street Lights": "विद्युत विभाग",
    "Animals": "आरोग्य विभाग",
    "Tree": "उद्याने व बाग विभाग",
    "Traffic": "बांधकाम विभाग",
    "Other": "आरोग्य विभाग",
}


def _get_category_names_for_department(department_name: str) -> list[str]:
    """Get category names that belong to a department."""
    return [category for category, dept in CATEGORY_TO_DEPARTMENT.items() if dept == department_name]


def _build_detail_dict(complaint, department_name: str) -> dict:
    """Build detail response dict from Complaint ORM object."""
    return {
        "id": complaint.id,
        "citizen_name": complaint.citizen.full_name,
        "citizen_phone_number": complaint.citizen.phone_number,
        "ward_number": complaint.ward.ward_number,
        "ward_name": complaint.ward.ward_name,
        "locality": complaint.citizen.locality,
        "category": complaint.category.name,
        "description": complaint.description,
        "manual_location": complaint.manual_location,
        "image_url": complaint.image_url,
        "status": complaint.status,
        "priority": complaint.priority,
        "created_at": complaint.created_at,
        "updated_at": complaint.updated_at,
        "assigned_department": department_name,
    }


class DepartmentOfficerComplaintService:
    @staticmethod
    def get_dashboard_counts(db: Session, context: DepartmentOfficerContext) -> dict:
        """Get dashboard statistics for the department officer's department."""
        category_names = _get_category_names_for_department(context.department_name)
        
        if not category_names:
            return {
                "total_complaints": 0,
                "pending": 0,
                "in_progress": 0,
                "resolved": 0,
                "escalated": 0,
            }
        
        status_counts = ComplaintRepository.get_department_status_counts(db, category_names)
        escalated_count = ComplaintRepository.get_department_escalated_count(db, category_names)
        
        return {
            **status_counts,
            "escalated": escalated_count,
        }

    @staticmethod
    def get_department_complaints(
        db: Session,
        context: DepartmentOfficerContext,
        status_filter: Optional[str] = None,
        priority_filter: Optional[str] = None,
        ward_filter: Optional[int] = None,
        search_query: Optional[str] = None,
        sort_newest: bool = True,
        page: int = 1,
        page_size: int = 20,
    ) -> list[dict]:
        """Get complaints for the department officer's department with filtering."""
        category_names = _get_category_names_for_department(context.department_name)
        
        if not category_names:
            return []
        
        offset = (page - 1) * page_size
        complaints = ComplaintRepository.get_department_complaints(
            db=db,
            category_names=category_names,
            status_filter=status_filter,
            priority_filter=priority_filter,
            ward_filter=ward_filter,
            search_query=search_query,
            sort_newest=sort_newest,
            offset=offset,
            limit=page_size,
        )
        
        return [
            {
                "id": c.id,
                "citizen_name": c.citizen.full_name,
                "citizen_phone_number": c.citizen.phone_number,
                "locality": c.citizen.locality,
                "ward_number": c.ward.ward_number,
                "ward_name": c.ward.ward_name,
                "category": c.category.name,
                "priority": c.priority,
                "status": c.status,
                "created_at": c.created_at,
                "image_url": c.image_url,
            }
            for c in complaints
        ]

    @staticmethod
    def get_complaint_detail(
        db: Session,
        context: DepartmentOfficerContext,
        complaint_id: int,
    ) -> dict:
        """Get a specific complaint if it belongs to the department officer's department."""
        category_names = _get_category_names_for_department(context.department_name)
        
        if not category_names:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No categories found for this department.",
            )
        
        complaint = ComplaintRepository.get_complaint_by_id_for_department(
            db=db,
            complaint_id=complaint_id,
            category_names=category_names,
        )
        
        if not complaint:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Complaint not found or does not belong to your department.",
            )
        
        return _build_detail_dict(complaint, context.department_name)
