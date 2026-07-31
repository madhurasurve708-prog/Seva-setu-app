from sqlalchemy import desc, or_, and_
from sqlalchemy.orm import Session, joinedload
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
from app.schemas.citizen import CitizenProfileCreate


class CitizenRepository:
    @staticmethod
    def create_citizen(db: Session, citizen_in: CitizenProfileCreate) -> Citizen:
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

    @staticmethod
    def get_by_supabase_id(db: Session, supabase_user_id: str) -> Citizen | None:
        return db.query(Citizen).filter(Citizen.supabase_user_id == supabase_user_id).first()

    @staticmethod
    def get_by_phone_number(db: Session, phone_number: str) -> Citizen | None:
        return db.query(Citizen).filter(Citizen.phone_number == phone_number).first()

    @staticmethod
    def update_profile_photo_url(
        db: Session,
        citizen: Citizen,
        photo_url: str,
    ) -> Citizen:
        citizen.profile_photo_url = photo_url
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
        db_complaint = Complaint(
            citizen_id=citizen_id,
            ward_id=ward_id,
            category_id=category_id,
            title=title,
            description=description,
            manual_location=manual_location,
            status="Pending",  # Automatically determined on creation
        )
        db.add(db_complaint)
        db.commit()
        db.refresh(db_complaint)
        return db_complaint

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
        
        counts = {"Pending": 0, "In Progress": 0, "Resolved": 0}
        total = 0
        for status_val, count in results:
            if status_val in counts:
                counts[status_val] = count
            total += count
        return {
            "total_complaints": total,
            "pending": counts["Pending"],
            "in_progress": counts["In Progress"],
            "resolved": counts["Resolved"],
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
        counts = {"Pending": 0, "In Progress": 0, "Resolved": 0}
        total = 0
        for status_val, count in results:
            if status_val in counts:
                counts[status_val] = count
            total += count
        return {
            "total_complaints": total,
            "pending": counts["Pending"],
            "in_progress": counts["In Progress"],
            "resolved": counts["Resolved"],
        }


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


class WardRepository:
    @staticmethod
    def get_all_wards(db: Session) -> list[Ward]:
        return db.query(Ward).order_by(Ward.ward_number).all()


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
                Nagarsevak.ward_id == ward_id
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


class AnnouncementRepository:
    @staticmethod
    def get_announcements_for_nagarsevak(
        db: Session,
        ward_id: int,
    ) -> list[Announcement]:
        return (
            db.query(Announcement)
            .filter(
                or_(
                    Announcement.target_type == "everyone",
                    Announcement.target_type == "all_nagarsevaks",
                    and_(
                        Announcement.target_type == "ward_nagarsevaks",
                        Announcement.target_ward_id == ward_id,
                    ),
                )
            )
            .order_by(desc(Announcement.created_at))
            .all()
        )

    @staticmethod
    def get_announcement_by_id(db: Session, announcement_id: int) -> Announcement | None:
        return db.query(Announcement).filter(Announcement.id == announcement_id).first()

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
            .filter(DepartmentOfficer.id == officer_id)
            .first()
        )

    @staticmethod
    def get_by_email(db: Session, email: str) -> DepartmentOfficer | None:
        return (
            db.query(DepartmentOfficer)
            .filter(DepartmentOfficer.email == email.strip().lower())
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
