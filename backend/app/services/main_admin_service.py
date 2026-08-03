from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.db.repository import (
    AnnouncementRepository,
    CitizenRepository,
    NagarsevakRepository,
    DepartmentOfficerRepository,
    WardRepository,
    MainAdminRepository,
)
from app.models.announcement import Announcement
from app.models.citizen import Citizen
from app.models.nagarsevak import Nagarsevak
from app.models.department_officer import DepartmentOfficer
from app.models.main_admin import MainAdmin
from app.core.constants import Department
from app.schemas.main_admin import (
    MainAdminAnnouncementCreate,
    MainAdminAnnouncementUpdate,
    MainAdminAnnouncementResponse,
    MainAdminAnnouncementListResponse,
    MainAdminUserListItem,
    MainAdminUserListResponse,
    MainAdminCitizenProfile,
    MainAdminNagarsevakProfile,
    MainAdminDepartmentOfficerProfile,
    MainAdminUserActionRequest,
    MainAdminUserActionResponse,
    MainAdminLogin,
)
from app.core.constants import AnnouncementTarget, UserState
from app.services.audit_log_service import AuditLogService
from app.core.security import verify_password, create_access_token


class MainAdminService:
    @staticmethod
    def login(db: Session, login_data: MainAdminLogin) -> dict:
        """Login Main Admin with name and password."""
        admin = MainAdminRepository.get_by_name(db, login_data.name)
        if not admin:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid name or password.",
            )
        
        # Verify password
        if not verify_password(login_data.password, admin.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid name or password.",
            )
        
        # Check if admin is active
        if not admin.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This admin account is inactive.",
            )
        
        # Create JWT token
        token = create_access_token(subject=admin.id, role="main_admin")
        
        return {
            "access_token": token,
            "token_type": "bearer",
            "admin": admin,
        }
    
    @staticmethod
    def create_announcement(
        db: Session,
        admin: MainAdmin,
        announcement_in: MainAdminAnnouncementCreate,
    ) -> MainAdminAnnouncementResponse:
        """Create a new announcement as Main Admin."""
        # Validate target type
        if announcement_in.target_type not in AnnouncementTarget.VALID_TARGETS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid target type. Valid targets: {', '.join(AnnouncementTarget.VALID_TARGETS)}",
            )

        # Validate target-specific requirements
        if announcement_in.target_type in [AnnouncementTarget.WARD_CITIZENS, AnnouncementTarget.WARD_NAGARSEVAKS]:
            if not announcement_in.target_ward_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="target_ward_id is required for ward-specific announcements.",
                )
            # Verify ward exists
            ward = WardRepository.get_all_wards(db)
            if not any(w.id == announcement_in.target_ward_id for w in ward):
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Ward not found.",
                )

        if announcement_in.target_type == AnnouncementTarget.SINGLE_DEPARTMENT:
            if not announcement_in.target_department:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="target_department is required for department-specific announcements.",
                )
            # Validate department name
            if announcement_in.target_department not in Department.VALID_DEPARTMENTS:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid department. Valid departments: {', '.join(Department.VALID_DEPARTMENTS)}",
                )

        announcement = Announcement(
            title=announcement_in.title,
            description=announcement_in.description,
            priority=announcement_in.priority,
            image_url=announcement_in.image_url,
            target_type=announcement_in.target_type,
            target_ward_id=announcement_in.target_ward_id,
            target_department=announcement_in.target_department,
            created_by=admin.name,
        )
        db.add(announcement)
        db.commit()
        db.refresh(announcement)

        # Audit log
        AuditLogService.log_action(
            db, admin, "create", "announcement", announcement.id, f"Created announcement: {announcement.title}"
        )

        return MainAdminAnnouncementResponse.model_validate(announcement)

    @staticmethod
    def get_announcements(
        db: Session,
        include_archived: bool = False,
        include_deleted: bool = False,
        offset: int = 0,
        limit: int = 50,
    ) -> MainAdminAnnouncementListResponse:
        """Get all announcements for Main Admin."""
        announcements = AnnouncementRepository.get_all_announcements(
            db, include_archived, include_deleted, offset, limit
        )
        total_count = AnnouncementRepository.get_all_announcements_count(
            db, include_archived, include_deleted
        )

        return MainAdminAnnouncementListResponse(
            announcements=[MainAdminAnnouncementResponse.model_validate(a) for a in announcements],
            total_count=total_count,
        )

    @staticmethod
    def get_announcement_detail(
        db: Session,
        announcement_id: int,
    ) -> MainAdminAnnouncementResponse:
        """Get announcement detail for Main Admin."""
        announcement = AnnouncementRepository.get_announcement_by_id(db, announcement_id)
        if not announcement:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Announcement not found.",
            )

        return MainAdminAnnouncementResponse.model_validate(announcement)

    @staticmethod
    def update_announcement(
        db: Session,
        announcement_id: int,
        announcement_in: MainAdminAnnouncementUpdate,
        admin: MainAdmin,
    ) -> MainAdminAnnouncementResponse:
        """Update an existing announcement (soft update, no history)."""
        announcement = AnnouncementRepository.get_announcement_by_id(db, announcement_id)
        if not announcement:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Announcement not found.",
            )

        announcement = AnnouncementRepository.update_announcement(
            db,
            announcement,
            title=announcement_in.title,
            description=announcement_in.description,
            priority=announcement_in.priority,
            image_url=announcement_in.image_url,
        )

        # Audit log
        AuditLogService.log_action(
            db, admin, "update", "announcement", announcement.id, f"Updated announcement: {announcement.title}"
        )

        return MainAdminAnnouncementResponse.model_validate(announcement)

    @staticmethod
    def archive_announcement(
        db: Session,
        announcement_id: int,
        admin: MainAdmin,
    ) -> MainAdminAnnouncementResponse:
        """Archive an announcement."""
        announcement = AnnouncementRepository.get_announcement_by_id(db, announcement_id)
        if not announcement:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Announcement not found.",
            )

        if announcement.is_archived:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Announcement is already archived.",
            )

        announcement = AnnouncementRepository.archive_announcement(db, announcement)

        # Audit log
        AuditLogService.log_action(
            db, admin, "archive", "announcement", announcement.id, f"Archived announcement: {announcement.title}"
        )

        return MainAdminAnnouncementResponse.model_validate(announcement)

    @staticmethod
    def unarchive_announcement(
        db: Session,
        announcement_id: int,
        admin: MainAdmin,
    ) -> MainAdminAnnouncementResponse:
        """Unarchive an announcement."""
        announcement = AnnouncementRepository.get_announcement_by_id(db, announcement_id)
        if not announcement:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Announcement not found.",
            )

        if not announcement.is_archived:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Announcement is not archived.",
            )

        announcement = AnnouncementRepository.unarchive_announcement(db, announcement)

        # Audit log
        AuditLogService.log_action(
            db, admin, "unarchive", "announcement", announcement.id, f"Unarchived announcement: {announcement.title}"
        )

        return MainAdminAnnouncementResponse.model_validate(announcement)

    @staticmethod
    def delete_announcement(
        db: Session,
        announcement_id: int,
        admin: MainAdmin,
    ) -> dict:
        """Soft delete an announcement."""
        announcement = AnnouncementRepository.get_announcement_by_id(db, announcement_id)
        if not announcement:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Announcement not found.",
            )

        if announcement.is_deleted:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Announcement is already deleted.",
            )

        AnnouncementRepository.delete_announcement(db, announcement)

        # Audit log
        AuditLogService.log_action(
            db, admin, "delete", "announcement", announcement.id, f"Deleted announcement: {announcement.title}"
        )

        return {"message": "Announcement deleted successfully."}

    @staticmethod
    def search_citizens(
        db: Session,
        search_query: str | None = None,
        ward_id: int | None = None,
        status: str | None = None,
        is_active: bool | None = None,
        is_blocked: bool | None = None,
        is_restricted: bool | None = None,
        is_archived: bool | None = None,
        offset: int = 0,
        limit: int = 50,
    ) -> MainAdminUserListResponse:
        """Search citizens with filters."""
        # Map status to individual flags
        if status == "active":
            is_active = True
            is_blocked = False
            is_restricted = False
            is_archived = False
        elif status == "blocked":
            is_blocked = True
        elif status == "restricted":
            is_restricted = True
        elif status == "archived":
            is_archived = True
        elif status == "deleted":
            # Handled by repository (filter is_deleted == False by default)
            pass

        citizens = CitizenRepository.search_citizens(
            db, search_query, ward_id, is_active, is_blocked, is_restricted, is_archived, offset, limit
        )
        total_count = CitizenRepository.search_citizens_count(
            db, search_query, ward_id, is_active, is_blocked, is_restricted, is_archived
        )

        users = []
        for citizen in citizens:
            users.append(MainAdminUserListItem(
                id=citizen.id,
                name=citizen.full_name,
                phone_number=citizen.phone_number,
                email=None,
                ward_id=citizen.ward_id,
                ward_name=citizen.ward.ward_name if citizen.ward else None,
                ward_number=citizen.ward.ward_number if citizen.ward else None,
                department=None,
                is_active=citizen.is_active,
                is_blocked=citizen.is_blocked,
                is_restricted=citizen.is_restricted,
                is_archived=citizen.is_archived,
                is_deleted=citizen.is_deleted,
                created_at=citizen.created_at,
            ))

        return MainAdminUserListResponse(
            users=users,
            total_count=total_count,
            offset=offset,
            limit=limit,
        )

    @staticmethod
    def search_nagarsevaks(
        db: Session,
        search_query: str | None = None,
        ward_id: int | None = None,
        status: str | None = None,
        is_active: bool | None = None,
        is_blocked: bool | None = None,
        is_restricted: bool | None = None,
        is_archived: bool | None = None,
        offset: int = 0,
        limit: int = 50,
    ) -> MainAdminUserListResponse:
        """Search nagarsevaks with filters."""
        # Map status to individual flags
        if status == "active":
            is_active = True
            is_blocked = False
            is_restricted = False
            is_archived = False
        elif status == "blocked":
            is_blocked = True
        elif status == "restricted":
            is_restricted = True
        elif status == "archived":
            is_archived = True
        elif status == "deleted":
            # Handled by repository (filter is_deleted == False by default)
            pass

        nagarsevaks = NagarsevakRepository.search_nagarsevaks(
            db, search_query, ward_id, is_active, is_blocked, is_restricted, is_archived, offset, limit
        )
        total_count = NagarsevakRepository.search_nagarsevaks_count(
            db, search_query, ward_id, is_active, is_blocked, is_restricted, is_archived
        )

        users = []
        for nagarsevak in nagarsevaks:
            users.append(MainAdminUserListItem(
                id=nagarsevak.id,
                name=nagarsevak.name,
                phone_number=nagarsevak.phone_number,
                email=None,
                ward_id=nagarsevak.ward_id,
                ward_name=nagarsevak.ward.ward_name if nagarsevak.ward else None,
                ward_number=nagarsevak.ward.ward_number if nagarsevak.ward else None,
                department=None,
                is_active=nagarsevak.is_active,
                is_blocked=nagarsevak.is_blocked,
                is_restricted=nagarsevak.is_restricted,
                is_archived=nagarsevak.is_archived,
                is_deleted=nagarsevak.is_deleted,
                created_at=nagarsevak.created_at,
            ))

        return MainAdminUserListResponse(
            users=users,
            total_count=total_count,
            offset=offset,
            limit=limit,
        )

    @staticmethod
    def search_department_officers(
        db: Session,
        search_query: str | None = None,
        department: str | None = None,
        status: str | None = None,
        is_active: bool | None = None,
        is_blocked: bool | None = None,
        is_restricted: bool | None = None,
        is_archived: bool | None = None,
        offset: int = 0,
        limit: int = 50,
    ) -> MainAdminUserListResponse:
        """Search department officers with filters."""
        # Map status to individual flags
        if status == "active":
            is_active = True
            is_blocked = False
            is_restricted = False
            is_archived = False
        elif status == "blocked":
            is_blocked = True
        elif status == "restricted":
            is_restricted = True
        elif status == "archived":
            is_archived = True
        elif status == "deleted":
            # Handled by repository (filter is_deleted == False by default)
            pass

        officers = DepartmentOfficerRepository.search_department_officers(
            db, search_query, department, is_active, is_blocked, is_restricted, is_archived, offset, limit
        )
        total_count = DepartmentOfficerRepository.search_department_officers_count(
            db, search_query, department, is_active, is_blocked, is_restricted, is_archived
        )

        users = []
        for officer in officers:
            users.append(MainAdminUserListItem(
                id=officer.id,
                name=officer.full_name,
                phone_number=officer.phone_number,
                email=officer.email,
                ward_id=None,
                ward_name=None,
                ward_number=None,
                department=officer.department_name,
                is_active=officer.is_active,
                is_blocked=officer.is_blocked,
                is_restricted=officer.is_restricted,
                is_archived=officer.is_archived,
                is_deleted=officer.is_deleted,
                created_at=officer.created_at,
            ))

        return MainAdminUserListResponse(
            users=users,
            total_count=total_count,
            offset=offset,
            limit=limit,
        )

    @staticmethod
    def get_citizen_profile(
        db: Session,
        citizen_id: int,
    ) -> MainAdminCitizenProfile:
        """Get complete citizen profile."""
        citizen = CitizenRepository.get_by_id(db, citizen_id)
        if not citizen:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Citizen not found.",
            )

        return MainAdminCitizenProfile.model_validate(citizen)

    @staticmethod
    def get_nagarsevak_profile(
        db: Session,
        nagarsevak_id: int,
    ) -> MainAdminNagarsevakProfile:
        """Get complete nagarsevak profile."""
        nagarsevak = NagarsevakRepository.get_by_id(db, nagarsevak_id)
        if not nagarsevak:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Nagarsevak not found.",
            )

        return MainAdminNagarsevakProfile.model_validate(nagarsevak)

    @staticmethod
    def get_department_officer_profile(
        db: Session,
        officer_id: int,
    ) -> MainAdminDepartmentOfficerProfile:
        """Get complete department officer profile."""
        officer = DepartmentOfficerRepository.get_by_id(db, officer_id)
        if not officer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Department Officer not found.",
            )

        return MainAdminDepartmentOfficerProfile.model_validate(officer)

    @staticmethod
    def perform_user_action(
        db: Session,
        user_type: str,
        user_id: int,
        action_request: MainAdminUserActionRequest,
        admin: MainAdmin,
    ) -> MainAdminUserActionResponse:
        """Perform management action on a user."""
        if user_type == "citizen":
            return MainAdminService._perform_citizen_action(db, user_id, action_request, admin)
        elif user_type == "nagarsevak":
            return MainAdminService._perform_nagarsevak_action(db, user_id, action_request, admin)
        elif user_type == "department_officer":
            return MainAdminService._perform_department_officer_action(db, user_id, action_request, admin)
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid user type.",
            )

    @staticmethod
    def _perform_citizen_action(
        db: Session,
        citizen_id: int,
        action_request: MainAdminUserActionRequest,
        admin: MainAdmin,
    ) -> MainAdminUserActionResponse:
        """Perform action on citizen."""
        citizen = CitizenRepository.get_by_id(db, citizen_id)
        if not citizen:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Citizen not found.",
            )

        action = action_request.action

        # Validate state transitions
        current_state = MainAdminService._get_user_state(citizen)
        if action not in UserState.VALID_TRANSITIONS.get(current_state, []):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid state transition from {current_state} to {action}.",
            )

        if action == "block":
            if citizen.is_blocked:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Citizen is already blocked.",
                )
            citizen = CitizenRepository.update_user_state(
                db, citizen, is_active=False, is_blocked=True
            )
            message = "Citizen blocked successfully."

        elif action == "unblock":
            if not citizen.is_blocked:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Citizen is not blocked.",
                )
            citizen = CitizenRepository.update_user_state(
                db, citizen, is_active=True, is_blocked=False
            )
            message = "Citizen unblocked successfully."

        elif action == "restrict":
            if citizen.is_restricted:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Citizen is already restricted.",
                )
            citizen = CitizenRepository.update_user_state(
                db, citizen, is_restricted=True
            )
            message = "Citizen restricted successfully."

        elif action == "unrestrict":
            if not citizen.is_restricted:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Citizen is not restricted.",
                )
            citizen = CitizenRepository.update_user_state(
                db, citizen, is_restricted=False
            )
            message = "Citizen restriction removed successfully."

        elif action == "archive":
            if citizen.is_archived:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Citizen is already archived.",
                )
            citizen = CitizenRepository.update_user_state(
                db, citizen, is_archived=True, is_active=False
            )
            message = "Citizen archived successfully."

        elif action == "unarchive":
            if not citizen.is_archived:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Citizen is not archived.",
            )
            citizen = CitizenRepository.update_user_state(
                db, citizen, is_archived=False, is_active=True
            )
            message = "Citizen unarchived successfully."

        elif action == "delete":
            if citizen.is_deleted:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Citizen is already deleted.",
                )
            citizen = CitizenRepository.update_user_state(
                db, citizen, is_deleted=True, is_active=False
            )
            message = "Citizen deleted successfully."

        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid action.",
            )

        # Audit log
        AuditLogService.log_action(
            db, admin, action, "citizen", citizen_id, message
        )

        return MainAdminUserActionResponse(message=message)

    @staticmethod
    def _perform_nagarsevak_action(
        db: Session,
        nagarsevak_id: int,
        action_request: MainAdminUserActionRequest,
        admin: MainAdmin,
    ) -> MainAdminUserActionResponse:
        """Perform action on nagarsevak."""
        nagarsevak = NagarsevakRepository.get_by_id(db, nagarsevak_id)
        if not nagarsevak:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Nagarsevak not found.",
            )

        action = action_request.action

        # Validate state transitions
        current_state = MainAdminService._get_user_state(nagarsevak)
        if action not in UserState.VALID_TRANSITIONS.get(current_state, []):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid state transition from {current_state} to {action}.",
            )

        if action == "block":
            if nagarsevak.is_blocked:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Nagarsevak is already blocked.",
                )
            nagarsevak = NagarsevakRepository.update_user_state(
                db, nagarsevak, is_active=False, is_blocked=True
            )
            message = "Nagarsevak blocked successfully."

        elif action == "unblock":
            if not nagarsevak.is_blocked:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Nagarsevak is not blocked.",
                )
            nagarsevak = NagarsevakRepository.update_user_state(
                db, nagarsevak, is_active=True, is_blocked=False
            )
            message = "Nagarsevak unblocked successfully."

        elif action == "restrict":
            if nagarsevak.is_restricted:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Nagarsevak is already restricted.",
                )
            nagarsevak = NagarsevakRepository.update_user_state(
                db, nagarsevak, is_restricted=True
            )
            message = "Nagarsevak restricted successfully."

        elif action == "unrestrict":
            if not nagarsevak.is_restricted:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Nagarsevak is not restricted.",
                )
            nagarsevak = NagarsevakRepository.update_user_state(
                db, nagarsevak, is_restricted=False
            )
            message = "Nagarsevak restriction removed successfully."

        elif action == "archive":
            if nagarsevak.is_archived:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Nagarsevak is already archived.",
                )
            nagarsevak = NagarsevakRepository.update_user_state(
                db, nagarsevak, is_archived=True, is_active=False
            )
            message = "Nagarsevak archived successfully."

        elif action == "unarchive":
            if not nagarsevak.is_archived:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Nagarsevak is not archived.",
                )
            nagarsevak = NagarsevakRepository.update_user_state(
                db, nagarsevak, is_archived=False, is_active=True
            )
            message = "Nagarsevak unarchived successfully."

        elif action == "delete":
            if nagarsevak.is_deleted:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Nagarsevak is already deleted.",
                )
            nagarsevak = NagarsevakRepository.update_user_state(
                db, nagarsevak, is_deleted=True, is_active=False
            )
            message = "Nagarsevak deleted successfully."

        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid action.",
            )

        # Audit log
        AuditLogService.log_action(
            db, admin, action, "nagarsevak", nagarsevak_id, message
        )

        return MainAdminUserActionResponse(message=message)

    @staticmethod
    def _perform_department_officer_action(
        db: Session,
        officer_id: int,
        action_request: MainAdminUserActionRequest,
        admin: MainAdmin,
    ) -> MainAdminUserActionResponse:
        """Perform action on department officer."""
        officer = DepartmentOfficerRepository.get_by_id(db, officer_id)
        if not officer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Department Officer not found.",
            )

        action = action_request.action

        # Validate state transitions
        current_state = MainAdminService._get_user_state(officer)
        if action not in UserState.VALID_TRANSITIONS.get(current_state, []):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid state transition from {current_state} to {action}.",
            )

        if action == "block":
            if officer.is_blocked:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Department Officer is already blocked.",
                )
            officer = DepartmentOfficerRepository.update_user_state(
                db, officer, is_active=False, is_blocked=True
            )
            message = "Department Officer blocked successfully."

        elif action == "unblock":
            if not officer.is_blocked:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Department Officer is not blocked.",
                )
            officer = DepartmentOfficerRepository.update_user_state(
                db, officer, is_active=True, is_blocked=False
            )
            message = "Department Officer unblocked successfully."

        elif action == "restrict":
            if officer.is_restricted:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Department Officer is already restricted.",
                )
            officer = DepartmentOfficerRepository.update_user_state(
                db, officer, is_restricted=True
            )
            message = "Department Officer restricted successfully."

        elif action == "unrestrict":
            if not officer.is_restricted:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Department Officer is not restricted.",
                )
            officer = DepartmentOfficerRepository.update_user_state(
                db, officer, is_restricted=False
            )
            message = "Department Officer restriction removed successfully."

        elif action == "archive":
            if officer.is_archived:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Department Officer is already archived.",
                )
            officer = DepartmentOfficerRepository.update_user_state(
                db, officer, is_archived=True, is_active=False
            )
            message = "Department Officer archived successfully."

        elif action == "unarchive":
            if not officer.is_archived:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Department Officer is not archived.",
                )
            officer = DepartmentOfficerRepository.update_user_state(
                db, officer, is_archived=False, is_active=True
            )
            message = "Department Officer unarchived successfully."

        elif action == "delete":
            if officer.is_deleted:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Department Officer is already deleted.",
                )
            officer = DepartmentOfficerRepository.update_user_state(
                db, officer, is_deleted=True, is_active=False
            )
            message = "Department Officer deleted successfully."

        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid action.",
            )

        # Audit log
        AuditLogService.log_action(
            db, admin, action, "department_officer", officer_id, message
        )

        return MainAdminUserActionResponse(message=message)

    @staticmethod
    def _get_user_state(user) -> str:
        """Get current user state based on precedence."""
        if hasattr(user, 'is_deleted') and user.is_deleted:
            return "deleted"
        if hasattr(user, 'is_archived') and user.is_archived:
            return "archived"
        if hasattr(user, 'is_blocked') and user.is_blocked:
            return "blocked"
        if hasattr(user, 'is_restricted') and user.is_restricted:
            return "restricted"
        return "active"
