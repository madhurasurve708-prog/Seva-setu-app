from sqlalchemy import desc, or_, and_, func, case
from sqlalchemy.orm import Session, joinedload
from datetime import date
from app.models.citizen import Citizen
from app.models.complaint import Complaint
from app.models.category import Category
from app.models.ward import Ward
from app.models.nagarsevak import Nagarsevak
from app.models.complaint_history import ComplaintHistory
from app.models.complaint_escalation import ComplaintEscalation
from app.models.announcement import Announcement
from app.models.announcement_read import AnnouncementRead
from app.models.notification import Notification
from app.models.department_officer import DepartmentOfficer
from app.models.main_admin import MainAdmin
from app.models.audit_log import AuditLog
from app.schemas.citizen import CitizenProfileCreate
from app.core.constants import ComplaintStatus


class CitizenRepository:
    @staticmethod
    def create_citizen(db: Session, citizen_in: CitizenProfileCreate) -> Citizen:
        try:
            db_citizen = Citizen(
                supabase_user_id=citizen_in.supabase_user_id,
                full_name=citizen_in.full_name,
                phone_number=citizen_in.phone_number,
                ward_id=citizen_in.ward_id,
                locality=citizen_in.locality,
            )
            db.add(db_citizen)
            db.commit()
            db.refresh(db_citizen)
            return db_citizen
        except Exception:
            db.rollback()
            raise

    @staticmethod
    def get_by_supabase_id(db: Session, supabase_user_id: str) -> Citizen | None:
        return db.query(Citizen).filter(Citizen.supabase_user_id == supabase_user_id).first()

    @staticmethod
    def get_by_phone_number(db: Session, phone_number: str) -> Citizen | None:
        return db.query(Citizen).filter(Citizen.phone_number == phone_number).first()

    @staticmethod
    def get_by_id(db: Session, citizen_id: int) -> Citizen | None:
        return db.query(Citizen).options(joinedload(Citizen.ward)).filter(Citizen.id == citizen_id).first()

    @staticmethod
    def update_profile_photo_url(
        db: Session,
        citizen: Citizen,
        photo_url: str,
    ) -> Citizen:
        try:
            citizen.profile_photo_url = photo_url
            db.commit()
            db.refresh(citizen)
            return citizen
        except Exception:
            db.rollback()
            raise

    @staticmethod
    def search_citizens(
        db: Session,
        search_query: str | None = None,
        ward_id: int | None = None,
        offset: int = 0,
        limit: int = 50,
    ) -> list[Citizen]:
        """Search citizens with filters for Main Admin."""
        query = db.query(Citizen)

        if search_query:
            search_pattern = f"%{search_query}%"
            query = query.filter(
                or_(
                    Citizen.full_name.ilike(search_pattern),
                    Citizen.phone_number.ilike(search_pattern),
                )
            )

        if ward_id:
            query = query.filter(Citizen.ward_id == ward_id)

        return query.offset(offset).limit(limit).all()

    @staticmethod
    def search_citizens_count(
        db: Session,
        search_query: str | None = None,
        ward_id: int | None = None,
    ) -> int:
        """Get count of citizens matching search filters."""
        query = db.query(Citizen)

        if search_query:
            search_pattern = f"%{search_query}%"
            query = query.filter(
                or_(
                    Citizen.full_name.ilike(search_pattern),
                    Citizen.phone_number.ilike(search_pattern),
                )
            )

        if ward_id:
            query = query.filter(Citizen.ward_id == ward_id)

        return query.count()

    @staticmethod
    def update_user_state(
        db: Session,
        citizen: Citizen,
        is_active: bool | None = None,
        is_blocked: bool | None = None,
        is_restricted: bool | None = None,
        is_archived: bool | None = None,
        is_deleted: bool | None = None,
    ) -> Citizen:
        """Update citizen state flags with validation."""
        if is_active is not None:
            citizen.is_active = is_active
        if is_blocked is not None:
            citizen.is_blocked = is_blocked
        if is_restricted is not None:
            citizen.is_restricted = is_restricted
        if is_archived is not None:
            citizen.is_archived = is_archived
        if is_deleted is not None:
            citizen.is_deleted = is_deleted
            # If deleted, ensure user is blocked, archived, and inactive
            if is_deleted:
                citizen.is_blocked = True
                citizen.is_archived = True
                citizen.is_active = False
                citizen.is_restricted = False

        db.commit()
        db.refresh(citizen)
        return citizen


class ComplaintRepository:
    @staticmethod
    def create_complaint(
        db: Session,
        citizen_id: int,
        ward_id: int,
        category_id: int,
        title: str,
        description: str,
        manual_location: str | None = None,
    ) -> Complaint:
        try:
            db_complaint = Complaint(
                citizen_id=citizen_id,
                ward_id=ward_id,
                category_id=category_id,
                title=title,
                description=description,
                manual_location=manual_location,
                status=ComplaintStatus.PENDING,  # Automatically determined on creation
            )
            db.add(db_complaint)
            db.commit()
            db.refresh(db_complaint)
            return db_complaint
        except Exception:
            db.rollback()
            raise

    @staticmethod
    def get_department_status_counts(db: Session, category_names: list[str]) -> dict[str, int]:
        """Get complaint counts for categories belonging to a department."""
        from sqlalchemy import func
        
        # Get category IDs for the department
        category_ids = [c.id for c in db.query(Category).filter(Category.name.in_(category_names)).all()]
        
        if not category_ids:
            return {
                "total_complaints": 0,
                "pending": 0,
                "in_progress": 0,
                "resolved": 0,
            }
        
        results = (
            db.query(Complaint.status, func.count(Complaint.id))
            .filter(Complaint.category_id.in_(category_ids))
            .group_by(Complaint.status)
            .all()
        )
        
        counts = {ComplaintStatus.PENDING: 0, ComplaintStatus.IN_PROGRESS: 0, ComplaintStatus.RESOLVED: 0}
        total = 0
        for status_val, count in results:
            if status_val in counts:
                counts[status_val] = count
            total += count
        return {
            "total_complaints": total,
            "pending": counts[ComplaintStatus.PENDING],
            "in_progress": counts[ComplaintStatus.IN_PROGRESS],
            "resolved": counts[ComplaintStatus.RESOLVED],
        }

    @staticmethod
    def get_department_complaints(
        db: Session,
        category_names: list[str],
        status_filter: str | None = None,
        priority_filter: str | None = None,
        ward_filter: int | None = None,
        search_query: str | None = None,
        sort_newest: bool = True,
        offset: int = 0,
        limit: int = 50,
    ) -> list[Complaint]:
        """Get complaints for a department with filtering and pagination."""
        from sqlalchemy import or_
        
        # Get category IDs for the department
        category_ids = [c.id for c in db.query(Category).filter(Category.name.in_(category_names)).all()]
        
        if not category_ids:
            return []
        
        query = (
            db.query(Complaint)
            .options(
                joinedload(Complaint.citizen),
                joinedload(Complaint.ward),
                joinedload(Complaint.category),
            )
            .filter(Complaint.category_id.in_(category_ids))
        )
        
        if status_filter:
            query = query.filter(Complaint.status == status_filter)
        
        if priority_filter:
            query = query.filter(Complaint.priority == priority_filter)
        
        if ward_filter:
            query = query.filter(Complaint.ward_id == ward_filter)
        
        if search_query:
            search_pattern = f"%{search_query}%"
            query = query.filter(
                or_(
                    Complaint.title.ilike(search_pattern),
                    Complaint.description.ilike(search_pattern),
                )
            )
        
        order_clause = desc(Complaint.created_at) if sort_newest else Complaint.created_at.asc()
        query = query.order_by(order_clause)
        
        return query.offset(offset).limit(limit).all()

    @staticmethod
    def get_complaint_by_id_for_department(
        db: Session,
        complaint_id: int,
        category_names: list[str],
    ) -> Complaint | None:
        """Get a specific complaint if it belongs to the department's categories."""
        # Get category IDs for the department
        category_ids = [c.id for c in db.query(Category).filter(Category.name.in_(category_names)).all()]
        
        if not category_ids:
            return None
        
        return (
            db.query(Complaint)
            .options(
                joinedload(Complaint.citizen),
                joinedload(Complaint.ward),
                joinedload(Complaint.category),
            )
            .filter(
                Complaint.id == complaint_id,
                Complaint.category_id.in_(category_ids)
            )
            .first()
        )

    @staticmethod
    def get_department_escalated_count(db: Session, category_names: list[str]) -> int:
        """Get count of escalated complaints for a department."""
        # Get category IDs for the department
        category_ids = [c.id for c in db.query(Category).filter(Category.name.in_(category_names)).all()]
        
        if not category_ids:
            return 0
        
        # Count unique complaints that have escalations
        return (
            db.query(ComplaintEscalation.complaint_id)
            .join(Complaint)
            .filter(Complaint.category_id.in_(category_ids))
            .distinct()
            .count()
        )

    @staticmethod
    def get_complaints_by_supabase_user(
        db: Session,
        supabase_user_id: str,
    ) -> list[Complaint]:
        citizen = db.query(Citizen).filter(Citizen.supabase_user_id == supabase_user_id).first()
        if not citizen:
            return []

        return (
            db.query(Complaint)
            .filter(Complaint.citizen_id == citizen.id)
            .order_by(desc(Complaint.created_at))
            .all()
        )

    @staticmethod
    def get_complaint_by_id_for_citizen(
        db: Session,
        complaint_id: int,
        citizen_id: int,
    ) -> Complaint | None:
        return (
            db.query(Complaint)
            .filter(
                Complaint.id == complaint_id,
                Complaint.citizen_id == citizen_id,
            )
            .first()
        )

    @staticmethod
    def update_complaint_image_url(
        db: Session,
        complaint: Complaint,
        image_url: str,
    ) -> Complaint:
        complaint.image_url = image_url
        db.commit()
        db.refresh(complaint)
        return complaint

    @staticmethod
    def get_complaints_by_ward(
        db: Session,
        ward_id: int,
    ) -> list[Complaint]:
        return (
            db.query(Complaint)
            .options(
                joinedload(Complaint.citizen),
                joinedload(Complaint.ward),
                joinedload(Complaint.category),
            )
            .filter(Complaint.ward_id == ward_id)
            .order_by(desc(Complaint.created_at))
            .all()
        )

    @staticmethod
    def get_complaint_by_id_and_ward(
        db: Session,
        complaint_id: int,
        ward_id: int,
    ) -> Complaint | None:
        return (
            db.query(Complaint)
            .options(
                joinedload(Complaint.citizen),
                joinedload(Complaint.ward),
                joinedload(Complaint.category),
            )
            .filter(
                Complaint.id == complaint_id,
                Complaint.ward_id == ward_id,
            )
            .first()
        )

    @staticmethod
    def update_complaint_status(
        db: Session,
        complaint: Complaint,
        new_status: str,
    ) -> Complaint:
        complaint.status = new_status
        db.commit()
        db.refresh(complaint)
        return complaint

    @staticmethod
    def get_ward_status_counts(
        db: Session,
        ward_id: int,
    ) -> dict[str, int]:
        from sqlalchemy import func
        results = (
            db.query(Complaint.status, func.count(Complaint.id))
            .filter(Complaint.ward_id == ward_id)
            .group_by(Complaint.status)
            .all()
        )
        counts = {ComplaintStatus.PENDING: 0, ComplaintStatus.IN_PROGRESS: 0, ComplaintStatus.RESOLVED: 0}
        total = 0
        for status_val, count in results:
            if status_val in counts:
                counts[status_val] = count
            total += count
        return {
            "total_complaints": total,
            "pending": counts[ComplaintStatus.PENDING],
            "in_progress": counts[ComplaintStatus.IN_PROGRESS],
            "resolved": counts[ComplaintStatus.RESOLVED],
        }

    @staticmethod
    def get_all_complaints(
        db: Session,
        ward_filter: int | None = None,
        category_filter: int | None = None,
        status_filter: str | None = None,
        sort_newest: bool = True,
        offset: int = 0,
        limit: int = 50,
    ) -> list[Complaint]:
        """Get all complaints for Main Admin with optional filters and pagination."""
        from sqlalchemy import or_
        
        query = (
            db.query(Complaint)
            .options(
                joinedload(Complaint.citizen),
                joinedload(Complaint.ward),
                joinedload(Complaint.category),
            )
        )
        
        if ward_filter:
            query = query.filter(Complaint.ward_id == ward_filter)
        
        if category_filter:
            query = query.filter(Complaint.category_id == category_filter)
        
        if status_filter:
            query = query.filter(Complaint.status == status_filter)
        
        order_clause = desc(Complaint.created_at) if sort_newest else Complaint.created_at.asc()
        query = query.order_by(order_clause)
        
        return query.offset(offset).limit(limit).all()

    @staticmethod
    def get_all_complaints_count(
        db: Session,
        ward_filter: int | None = None,
        category_filter: int | None = None,
        status_filter: str | None = None,
    ) -> int:
        """Get total count of complaints for Main Admin with optional filters."""
        query = db.query(Complaint)
        
        if ward_filter:
            query = query.filter(Complaint.ward_id == ward_filter)
        
        if category_filter:
            query = query.filter(Complaint.category_id == category_filter)
        
        if status_filter:
            query = query.filter(Complaint.status == status_filter)
        
        return query.count()

    @staticmethod
    def get_complaint_by_id(
        db: Session,
        complaint_id: int,
    ) -> Complaint | None:
        """Generic complaint lookup - reusable across all user types."""
        return (
            db.query(Complaint)
            .options(
                joinedload(Complaint.citizen),
                joinedload(Complaint.ward),
                joinedload(Complaint.category),
            )
            .filter(Complaint.id == complaint_id)
            .first()
        )


class ComplaintHistoryRepository:
    @staticmethod
    def create_note(
        db: Session,
        complaint_id: int,
        author_role: str,
        author_name: str,
        note_text: str,
        author_id: int | None = None,
        image_url: str | None = None,
    ) -> ComplaintHistory:
        db_note = ComplaintHistory(
            complaint_id=complaint_id,
            author_role=author_role,
            author_name=author_name,
            author_id=author_id,
            note_text=note_text,
            image_url=image_url,
        )
        db.add(db_note)
        db.commit()
        db.refresh(db_note)
        return db_note

    @staticmethod
    def get_history_for_complaint(
        db: Session,
        complaint_id: int,
    ) -> list[ComplaintHistory]:
        return (
            db.query(ComplaintHistory)
            .filter(ComplaintHistory.complaint_id == complaint_id)
            .order_by(ComplaintHistory.created_at.asc())
            .all()
        )



class CategoryRepository:
    @staticmethod
    def get_all_categories(db: Session) -> list[Category]:
        return db.query(Category).order_by(Category.name).all()

    @staticmethod
    def get_by_id(db: Session, category_id: int) -> Category | None:
        return db.query(Category).filter(Category.id == category_id).first()


class WardRepository:
    @staticmethod
    def get_all_wards(db: Session) -> list[Ward]:
        return db.query(Ward).order_by(Ward.ward_number).all()

    @staticmethod
    def get_by_id(db: Session, ward_id: int) -> Ward | None:
        return db.query(Ward).filter(Ward.id == ward_id).first()

    @staticmethod
    def get_by_ward_number(db: Session, ward_number: str) -> Ward | None:
        return (
            db.query(Ward)
            .filter(Ward.ward_number == str(ward_number).strip())
            .first()
        )


class NagarsevakRepository:
    @staticmethod
    def get_by_id(db: Session, nagarsevak_id: int) -> Nagarsevak | None:
        return (
            db.query(Nagarsevak)
            .options(joinedload(Nagarsevak.ward))
            .filter(Nagarsevak.id == nagarsevak_id)
            .first()
        )

    @staticmethod
    def get_by_name_and_ward(db: Session, name: str, ward_id: int) -> Nagarsevak | None:
        return (
            db.query(Nagarsevak)
            .options(joinedload(Nagarsevak.ward))
            .filter(
                Nagarsevak.name.ilike(name.strip()),
                Nagarsevak.ward_id == ward_id,
            )
            .first()
        )

    @staticmethod
    def update_name(db: Session, nagarsevak: Nagarsevak, name: str) -> Nagarsevak:
        nagarsevak.name = name.strip()
        db.commit()
        db.refresh(nagarsevak)
        return nagarsevak

    @staticmethod
    def update_phone(db: Session, nagarsevak: Nagarsevak, phone_number: str) -> Nagarsevak:
        nagarsevak.phone_number = phone_number.strip()
        db.commit()
        db.refresh(nagarsevak)
        return nagarsevak

    @staticmethod
    def update_profile_photo_url(db: Session, nagarsevak: Nagarsevak, photo_url: str) -> Nagarsevak:
        nagarsevak.profile_photo_url = photo_url
        db.commit()
        db.refresh(nagarsevak)
        return nagarsevak

    @staticmethod
    def update_password_hash(db: Session, nagarsevak: Nagarsevak, password_hash: str) -> Nagarsevak:
        nagarsevak.password_hash = password_hash
        db.commit()
        db.refresh(nagarsevak)
        return nagarsevak

    @staticmethod
    def search_nagarsevaks(
        db: Session,
        search_query: str | None = None,
        ward_id: int | None = None,
        is_active: bool | None = None,
        offset: int = 0,
        limit: int = 50,
    ) -> list[Nagarsevak]:
        """Search nagarsevaks with filters for Main Admin."""
        query = db.query(Nagarsevak)

        if search_query:
            search_pattern = f"%{search_query}%"
            query = query.filter(
                or_(
                    Nagarsevak.name.ilike(search_pattern),
                    Nagarsevak.phone_number.ilike(search_pattern),
                )
            )

        if ward_id:
            query = query.filter(Nagarsevak.ward_id == ward_id)

        if is_active is not None:
            query = query.filter(Nagarsevak.is_active == is_active)

        return query.offset(offset).limit(limit).all()

    @staticmethod
    def search_nagarsevaks_count(
        db: Session,
        search_query: str | None = None,
        ward_id: int | None = None,
        is_active: bool | None = None,
    ) -> int:
        """Get count of nagarsevaks matching search filters."""
        query = db.query(Nagarsevak)

        if search_query:
            search_pattern = f"%{search_query}%"
            query = query.filter(
                or_(
                    Nagarsevak.name.ilike(search_pattern),
                    Nagarsevak.phone_number.ilike(search_pattern),
                )
            )

        if ward_id:
            query = query.filter(Nagarsevak.ward_id == ward_id)

        if is_active is not None:
            query = query.filter(Nagarsevak.is_active == is_active)

        return query.count()

    @staticmethod
    def update_user_state(
        db: Session,
        nagarsevak: Nagarsevak,
        is_active: bool | None = None,
    ) -> Nagarsevak:
        """Update nagarsevak account state with validation."""
        if is_active is not None:
            nagarsevak.is_active = is_active

        db.commit()
        db.refresh(nagarsevak)
        return nagarsevak


class ComplaintEscalationRepository:
    @staticmethod
    def create_escalation(
        db: Session,
        complaint_id: int,
        escalated_by_role: str,
        escalated_by_id: int,
        escalated_by_name: str,
        escalated_to: str,
        escalation_note: str,
    ) -> ComplaintEscalation:
        db_escalation = ComplaintEscalation(
            complaint_id=complaint_id,
            escalated_by_role=escalated_by_role,
            escalated_by_id=escalated_by_id,
            escalated_by_name=escalated_by_name,
            escalated_to=escalated_to,
            escalation_note=escalation_note,
        )
        db.add(db_escalation)
        db.commit()
        db.refresh(db_escalation)
        return db_escalation

    @staticmethod
    def get_escalations_by_escalator(
        db: Session,
        escalated_by_role: str,
        escalated_by_id: int,
    ) -> list[ComplaintEscalation]:
        return (
            db.query(ComplaintEscalation)
            .options(
                joinedload(ComplaintEscalation.complaint).joinedload(Complaint.citizen),
                joinedload(ComplaintEscalation.complaint).joinedload(Complaint.category),
            )
            .filter(
                ComplaintEscalation.escalated_by_role == escalated_by_role,
                ComplaintEscalation.escalated_by_id == escalated_by_id,
            )
            .order_by(desc(ComplaintEscalation.created_at))
            .all()
        )

    @staticmethod
    def get_escalated_ids_by_complaint_ids(
        db: Session,
        complaint_ids: list[int],
    ) -> set[int]:
        """Get set of complaint IDs that have been escalated."""
        if not complaint_ids:
            return set()
        
        results = (
            db.query(ComplaintEscalation.complaint_id)
            .filter(ComplaintEscalation.complaint_id.in_(complaint_ids))
            .distinct()
            .all()
        )
        return {row[0] for row in results}

    @staticmethod
    def get_escalated_complaints_count(db: Session) -> int:
        """Get count of distinct escalated complaints (for Main Admin dashboard)."""
        return (
            db.query(ComplaintEscalation.complaint_id)
            .distinct()
            .count()
        )

    @staticmethod
    def get_escalations_by_complaint_id(
        db: Session,
        complaint_id: int,
    ) -> list[ComplaintEscalation]:
        """Get all escalations for a specific complaint."""
        return (
            db.query(ComplaintEscalation)
            .filter(ComplaintEscalation.complaint_id == complaint_id)
            .order_by(desc(ComplaintEscalation.created_at))
            .all()
        )


class AnnouncementRepository:
    @staticmethod
    def get_announcements_for_citizen(db: Session, ward_id: int) -> list[Announcement]:
        return (
            db.query(Announcement)
            .filter(
                and_(
                    Announcement.is_deleted == False,
                    Announcement.is_archived == False,
                    or_(
                        Announcement.target_type == "everyone",
                        Announcement.target_type == "all_citizens",
                        and_(
                            Announcement.target_type == "ward_citizens",
                            Announcement.target_ward_id == ward_id,
                        ),
                    ),
                )
            )
            .order_by(desc(Announcement.created_at))
            .all()
        )

    @staticmethod
    def get_announcements_for_nagarsevak(
        db: Session,
        ward_id: int,
    ) -> list[Announcement]:
        return (
            db.query(Announcement)
            .filter(
                and_(
                    Announcement.is_deleted == False,
                    Announcement.is_archived == False,
                    or_(
                        Announcement.target_type == "everyone",
                        Announcement.target_type == "all_nagarsevaks",
                        and_(
                            Announcement.target_type == "ward_nagarsevaks",
                            Announcement.target_ward_id == ward_id,
                        ),
                    ),
                )
            )
            .order_by(desc(Announcement.created_at))
            .all()
        )

    @staticmethod
    def get_announcements_for_department_officer(
        db: Session,
    ) -> list[Announcement]:
        """Get announcements targeted at department officers or everyone."""
        return (
            db.query(Announcement)
            .filter(
                and_(
                    Announcement.is_deleted == False,
                    Announcement.is_archived == False,
                    or_(
                        Announcement.target_type == "everyone",
                        Announcement.target_type == "all_department_officers",
                    ),
                )
            )
            .order_by(desc(Announcement.created_at))
            .all()
        )

    @staticmethod
    def get_all_announcements(
        db: Session,
        include_archived: bool = False,
        include_deleted: bool = False,
    ) -> list[Announcement]:
        """Get all announcements for Main Admin with optional filters."""
        query = db.query(Announcement)

        if not include_deleted:
            query = query.filter(Announcement.is_deleted == False)
        if not include_archived:
            query = query.filter(Announcement.is_archived == False)

        return query.order_by(Announcement.created_at.desc()).all()

    @staticmethod
    def get_all_announcements_count(
        db: Session,
        include_archived: bool = False,
        include_deleted: bool = False,
    ) -> int:
        """Get total count of announcements for Main Admin with optional filters."""
        query = db.query(Announcement)

        if not include_deleted:
            query = query.filter(Announcement.is_deleted == False)
        if not include_archived:
            query = query.filter(Announcement.is_archived == False)

        return query.count()

    @staticmethod
    def get_announcement_by_id(db: Session, announcement_id: int) -> Announcement | None:
        return db.query(Announcement).filter(Announcement.id == announcement_id).first()

    @staticmethod
    def archive_announcement(db: Session, announcement: Announcement) -> Announcement:
        announcement.is_archived = True
        db.commit()
        db.refresh(announcement)
        return announcement

    @staticmethod
    def unarchive_announcement(db: Session, announcement: Announcement) -> Announcement:
        announcement.is_archived = False
        db.commit()
        db.refresh(announcement)
        return announcement

    @staticmethod
    def update_announcement(
        db: Session,
        announcement: Announcement,
        title: str | None = None,
        description: str | None = None,
        priority: str | None = None,
        image_url: str | None = None,
    ) -> Announcement:
        """Update announcement fields (soft update, no history)."""
        if title is not None:
            announcement.title = title
        if description is not None:
            announcement.description = description
        if priority is not None:
            announcement.priority = priority
        if image_url is not None:
            announcement.image_url = image_url

        db.commit()
        db.refresh(announcement)
        return announcement

    @staticmethod
    def delete_announcement(db: Session, announcement: Announcement) -> Announcement:
        announcement.is_deleted = True
        db.commit()
        db.refresh(announcement)
        return announcement

    @staticmethod
    def get_read_state(
        db: Session,
        reader_role: str,
        reader_id: int,
        announcement_id: int,
    ) -> AnnouncementRead | None:
        return (
            db.query(AnnouncementRead)
            .filter(
                AnnouncementRead.reader_role == reader_role,
                AnnouncementRead.reader_id == reader_id,
                AnnouncementRead.announcement_id == announcement_id,
            )
            .first()
        )

    @staticmethod
    def get_read_announcement_ids(
        db: Session,
        reader_role: str,
        reader_id: int,
    ) -> set[int]:
        reads = (
            db.query(AnnouncementRead.announcement_id)
            .filter(
                AnnouncementRead.reader_role == reader_role,
                AnnouncementRead.reader_id == reader_id,
            )
            .all()
        )
        return {r[0] for r in reads}

    @staticmethod
    def mark_as_read(
        db: Session,
        reader_role: str,
        reader_id: int,
        announcement_id: int,
    ) -> AnnouncementRead:
        existing = AnnouncementRepository.get_read_state(
            db, reader_role, reader_id, announcement_id
        )
        if existing:
            return existing

        db_read = AnnouncementRead(
            announcement_id=announcement_id,
            reader_role=reader_role,
            reader_id=reader_id,
        )
        db.add(db_read)
        db.commit()
        db.refresh(db_read)
        return db_read


class NotificationRepository:
    """Generic persistence primitive for future portal notification services."""

    @staticmethod
    def create(
        db: Session,
        recipient_role: str,
        recipient_id: int,
        title: str,
        body: str,
        reference_type: str | None = None,
        reference_id: int | None = None,
    ) -> Notification:
        notification = Notification(
            recipient_role=recipient_role,
            recipient_id=recipient_id,
            title=title,
            body=body,
            reference_type=reference_type,
            reference_id=reference_id,
        )
        db.add(notification)
        db.commit()
        db.refresh(notification)
        return notification


class DepartmentOfficerRepository:
    @staticmethod
    def get_by_id(db: Session, officer_id: int) -> DepartmentOfficer | None:
        return (
            db.query(DepartmentOfficer)
            .filter(DepartmentOfficer.id == officer_id, DepartmentOfficer.is_deleted == False)
            .first()
        )

    @staticmethod
    def get_by_email(db: Session, email: str) -> DepartmentOfficer | None:
        return (
            db.query(DepartmentOfficer)
            .filter(
                DepartmentOfficer.email == email.strip().lower(),
                DepartmentOfficer.is_deleted == False
            )
            .first()
        )

    @staticmethod
    def update_full_name(
        db: Session, officer: DepartmentOfficer, full_name: str
    ) -> DepartmentOfficer:
        officer.full_name = full_name.strip()
        db.commit()
        db.refresh(officer)
        return officer

    @staticmethod
    def update_phone(
        db: Session, officer: DepartmentOfficer, phone_number: str
    ) -> DepartmentOfficer:
        officer.phone_number = phone_number.strip()
        db.commit()
        db.refresh(officer)
        return officer

    @staticmethod
    def update_password_hash(
        db: Session, officer: DepartmentOfficer, password_hash: str
    ) -> DepartmentOfficer:
        officer.password_hash = password_hash
        db.commit()
        db.refresh(officer)
        return officer

    @staticmethod
    def update_profile_photo_url(
        db: Session, officer: DepartmentOfficer, photo_url: str
    ) -> DepartmentOfficer:
        officer.profile_photo_url = photo_url
        db.commit()
        db.refresh(officer)
        return officer

    @staticmethod
    def search_department_officers(
        db: Session,
        search_query: str | None = None,
        department: str | None = None,
        is_active: bool | None = None,
        is_blocked: bool | None = None,
        is_restricted: bool | None = None,
        is_archived: bool | None = None,
        offset: int = 0,
        limit: int = 50,
    ) -> list[DepartmentOfficer]:
        """Search department officers with filters for Main Admin."""
        query = db.query(DepartmentOfficer).filter(DepartmentOfficer.is_deleted == False)

        if search_query:
            search_pattern = f"%{search_query}%"
            query = query.filter(
                or_(
                    DepartmentOfficer.full_name.ilike(search_pattern),
                    DepartmentOfficer.phone_number.ilike(search_pattern),
                    DepartmentOfficer.email.ilike(search_pattern),
                )
            )

        if department:
            query = query.filter(DepartmentOfficer.department_name == department)

        if is_active is not None:
            query = query.filter(DepartmentOfficer.is_active == is_active)

        if is_blocked is not None:
            query = query.filter(DepartmentOfficer.is_blocked == is_blocked)

        if is_restricted is not None:
            query = query.filter(DepartmentOfficer.is_restricted == is_restricted)

        if is_archived is not None:
            query = query.filter(DepartmentOfficer.is_archived == is_archived)

        return query.offset(offset).limit(limit).all()

    @staticmethod
    def search_department_officers_count(
        db: Session,
        search_query: str | None = None,
        department: str | None = None,
        is_active: bool | None = None,
        is_blocked: bool | None = None,
        is_restricted: bool | None = None,
        is_archived: bool | None = None,
    ) -> int:
        """Get count of department officers matching search filters."""
        query = db.query(DepartmentOfficer).filter(DepartmentOfficer.is_deleted == False)

        if search_query:
            search_pattern = f"%{search_query}%"
            query = query.filter(
                or_(
                    DepartmentOfficer.full_name.ilike(search_pattern),
                    DepartmentOfficer.phone_number.ilike(search_pattern),
                    DepartmentOfficer.email.ilike(search_pattern),
                )
            )

        if department:
            query = query.filter(DepartmentOfficer.department_name == department)

        if is_active is not None:
            query = query.filter(DepartmentOfficer.is_active == is_active)

        if is_blocked is not None:
            query = query.filter(DepartmentOfficer.is_blocked == is_blocked)

        if is_restricted is not None:
            query = query.filter(DepartmentOfficer.is_restricted == is_restricted)

        if is_archived is not None:
            query = query.filter(DepartmentOfficer.is_archived == is_archived)

        return query.count()

    @staticmethod
    def update_user_state(
        db: Session,
        officer: DepartmentOfficer,
        is_active: bool | None = None,
        is_blocked: bool | None = None,
        is_restricted: bool | None = None,
        is_archived: bool | None = None,
        is_deleted: bool | None = None,
    ) -> DepartmentOfficer:
        """Update department officer state flags with validation."""
        if is_active is not None:
            officer.is_active = is_active
        if is_blocked is not None:
            officer.is_blocked = is_blocked
        if is_restricted is not None:
            officer.is_restricted = is_restricted
        if is_archived is not None:
            officer.is_archived = is_archived
        if is_deleted is not None:
            officer.is_deleted = is_deleted
            # If deleted, ensure user is blocked, archived, and inactive
            if is_deleted:
                officer.is_blocked = True
                officer.is_archived = True
                officer.is_active = False
                officer.is_restricted = False

        db.commit()
        db.refresh(officer)
        return officer


class MainAdminRepository:
    @staticmethod
    def get_by_id(db: Session, admin_id: int) -> MainAdmin | None:
        return db.query(MainAdmin).filter(MainAdmin.id == admin_id).first()

    @staticmethod
    def get_by_name(db: Session, name: str) -> MainAdmin | None:
        # Trim whitespace for consistent lookups
        normalized_name = name.strip()
        if not normalized_name:
            return None
        return db.query(MainAdmin).filter(MainAdmin.name == normalized_name).first()

    @staticmethod
    def update_password_hash(
        db: Session, admin: MainAdmin, password_hash: str
    ) -> MainAdmin:
        admin.password_hash = password_hash
        db.commit()
        db.refresh(admin)
        return admin


class AnalyticsRepository:
    """Repository for analytics queries."""
    
    @staticmethod
    def get_dashboard_statistics(db: Session) -> dict:
        """Get municipality-wide complaint statistics."""
        # Status counts
        status_counts = (
            db.query(Complaint.status, func.count(Complaint.id))
            .group_by(Complaint.status)
            .all()
        )
        
        counts = {
            ComplaintStatus.PENDING: 0,
            ComplaintStatus.IN_PROGRESS: 0,
            ComplaintStatus.RESOLVED: 0,
        }
        total = 0
        for status_val, count in status_counts:
            if status_val in counts:
                counts[status_val] = count
            total += count
        
        # Escalated count
        escalated_count = (
            db.query(ComplaintEscalation.complaint_id)
            .distinct()
            .count()
        )
        
        return {
            "total_complaints": total,
            "pending": counts[ComplaintStatus.PENDING],
            "in_progress": counts[ComplaintStatus.IN_PROGRESS],
            "resolved": counts[ComplaintStatus.RESOLVED],
            "escalated": escalated_count,
        }
    
    @staticmethod
    def get_ward_statistics(db: Session) -> list[dict]:
        """Get statistics for every ward."""
        results = (
            db.query(
                Ward.id,
                Ward.ward_number,
                Ward.ward_name,
                func.count(Complaint.id).label("total_complaints"),
                func.sum(case((Complaint.status == ComplaintStatus.PENDING, 1), else_=0)).label("pending"),
                func.sum(case((Complaint.status == ComplaintStatus.IN_PROGRESS, 1), else_=0)).label("in_progress"),
                func.sum(case((Complaint.status == ComplaintStatus.RESOLVED, 1), else_=0)).label("resolved"),
            )
            .join(Complaint, Ward.id == Complaint.ward_id)
            .group_by(Ward.id, Ward.ward_number, Ward.ward_name)
            .all()
        )
        
        ward_stats = []
        for result in results:
            total = result.total_complaints or 0
            resolved = result.resolved or 0
            resolution_percentage = (resolved / total * 100) if total > 0 else 0
            
            ward_stats.append({
                "ward_id": result.id,
                "ward_number": result.ward_number,
                "ward_name": result.ward_name,
                "total_complaints": total,
                "pending": result.pending or 0,
                "in_progress": result.in_progress or 0,
                "resolved": resolved,
                "resolution_percentage": round(resolution_percentage, 2),
            })
        
        return ward_stats
    
    @staticmethod
    def get_department_statistics(db: Session) -> list[dict]:
        """Get statistics for every department."""
        from app.core.constants import CATEGORY_TO_DEPARTMENT, Department
        
        # Get all departments from Category → Department mapping
        department_keys = set(CATEGORY_TO_DEPARTMENT.values())
        
        department_stats = []
        for dept_key in department_keys:
            # Get Marathi name for display
            dept_name = Department.VALID_DEPARTMENTS.get(dept_key, dept_key)
            
            # Get categories for this department
            dept_categories = [cat for cat, dept in CATEGORY_TO_DEPARTMENT.items() if dept == dept_key]
            
            if not dept_categories:
                continue
            
            # Get category IDs from names
            category_ids = [c.id for c in db.query(Category).filter(Category.name.in_(dept_categories)).all()]
            
            if not category_ids:
                continue
            
            # Count complaints for this department
            total = (
                db.query(func.count(Complaint.id))
                .filter(Complaint.category_id.in_(category_ids))
                .scalar()
            )
            
            if total == 0:
                continue
            
            # Status breakdown
            status_counts = (
                db.query(Complaint.status, func.count(Complaint.id))
                .filter(Complaint.category_id.in_(category_ids))
                .group_by(Complaint.status)
                .all()
            )
            
            counts = {
                ComplaintStatus.PENDING: 0,
                ComplaintStatus.IN_PROGRESS: 0,
                ComplaintStatus.RESOLVED: 0,
            }
            for status_val, count in status_counts:
                if status_val in counts:
                    counts[status_val] = count
            
            department_stats.append({
                "department_name": dept_name,
                "total_complaints": total,
                "pending": counts[ComplaintStatus.PENDING],
                "in_progress": counts[ComplaintStatus.IN_PROGRESS],
                "resolved": counts[ComplaintStatus.RESOLVED],
            })
        
        return department_stats
    
    @staticmethod
    def get_best_ward(db: Session) -> dict | None:
        """Get the best ward (highest resolution percentage)."""
        ward_stats = AnalyticsRepository.get_ward_statistics(db)
        
        if not ward_stats:
            return None
        
        # Sort by resolution percentage (highest first)
        ward_stats.sort(key=lambda x: x["resolution_percentage"], reverse=True)
        
        best_ward = ward_stats[0]
        
        return {
            "ward_id": best_ward["ward_id"],
            "ward_number": best_ward["ward_number"],
            "ward_name": best_ward["ward_name"],
            "total_complaints": best_ward["total_complaints"],
            "resolved_complaints": best_ward["resolved"],
            "resolution_percentage": best_ward["resolution_percentage"],
        }


class AuditLogRepository:
    """Repository for audit log operations."""
    
    @staticmethod
    def create_log(
        db: Session,
        admin_name: str,
        admin_role: str,
        action: str,
        entity: str,
        entity_id: int | None = None,
        remarks: str | None = None,
    ) -> AuditLog:
        """Create a new audit log entry."""
        log = AuditLog(
            admin_name=admin_name,
            admin_role=admin_role,
            action=action,
            entity=entity,
            entity_id=entity_id,
            remarks=remarks,
        )
        db.add(log)
        db.commit()
        db.refresh(log)
        return log
    
    @staticmethod
    def create_audit_log(
        db: Session,
        action: str,
        entity_type: str,
        entity_id: int | None = None,
        actor_role: str | None = None,
        actor_id: int | None = None,
        actor_name: str | None = None,
        details: str | None = None,
    ) -> AuditLog:
        """Create a new audit log entry with flexible actor information."""
        log = AuditLog(
            admin_name=actor_name or "System",
            admin_role=actor_role or "System",
            action=action,
            entity=entity_type,
            entity_id=entity_id,
            remarks=details,
        )
        db.add(log)
        db.commit()
        db.refresh(log)
        return log
    
    @staticmethod
    def get_logs(
        db: Session,
        date_from: date | None = None,
        date_to: date | None = None,
        admin_name: str | None = None,
        action: str | None = None,
        entity: str | None = None,
        offset: int = 0,
        limit: int = 50,
    ) -> list[AuditLog]:
        """Get audit logs with optional filters."""
        query = db.query(AuditLog)
        
        if date_from:
            query = query.filter(AuditLog.created_at >= date_from)
        if date_to:
            query = query.filter(AuditLog.created_at <= date_to)
        if admin_name:
            query = query.filter(AuditLog.admin_name.ilike(f"%{admin_name}%"))
        if action:
            query = query.filter(AuditLog.action.ilike(f"%{action}%"))
        if entity:
            query = query.filter(AuditLog.entity.ilike(f"%{entity}%"))
        
        return query.order_by(AuditLog.created_at.desc()).offset(offset).limit(limit).all()
    
    @staticmethod
    def get_logs_count(
        db: Session,
        date_from: date | None = None,
        date_to: date | None = None,
        admin_name: str | None = None,
        action: str | None = None,
        entity: str | None = None,
    ) -> int:
        """Get total count of audit logs with optional filters."""
        query = db.query(AuditLog)
        
        if date_from:
            query = query.filter(AuditLog.created_at >= date_from)
        if date_to:
            query = query.filter(AuditLog.created_at <= date_to)
        if admin_name:
            query = query.filter(AuditLog.admin_name.ilike(f"%{admin_name}%"))
        if action:
            query = query.filter(AuditLog.action.ilike(f"%{action}%"))
        if entity:
            query = query.filter(AuditLog.entity.ilike(f"%{entity}%"))
        
        return query.count()


# Add dashboard statistics method to ComplaintRepository for Main Admin
ComplaintRepository.get_global_status_counts = staticmethod(
    lambda db: ComplaintRepository._get_global_status_counts(db)
)

@staticmethod
def _get_global_status_counts(db: Session) -> dict[str, int]:
    """Get complaint counts for all complaints (Main Admin dashboard)."""
    from sqlalchemy import func
    
    results = (
        db.query(Complaint.status, func.count(Complaint.id))
        .group_by(Complaint.status)
        .all()
    )
    
    counts = {ComplaintStatus.PENDING: 0, ComplaintStatus.IN_PROGRESS: 0, ComplaintStatus.RESOLVED: 0}
    total = 0
    for status_val, count in results:
        if status_val in counts:
            counts[status_val] = count
        total += count
    
    # Count escalated complaints (complaints that have escalation records)
    escalated_count = (
        db.query(ComplaintEscalation.complaint_id)
        .distinct()
        .count()
    )
    
    return {
        "total_complaints": total,
        "pending": counts[ComplaintStatus.PENDING],
        "in_progress": counts[ComplaintStatus.IN_PROGRESS],
        "resolved": counts[ComplaintStatus.RESOLVED],
        "escalated": escalated_count,
    }
