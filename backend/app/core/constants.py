"""
Shared constants for the Seva Setu application.
This file contains reusable role constants and other shared values.
"""


class Role:
    """Role constants used throughout the application."""
    NAGARSEVAK = "nagarsevak"
    DEPARTMENT_OFFICER = "department_officer"
    MAIN_ADMIN = "main_admin"
    CITIZEN = "citizen"


class ReaderRole:
    """Reader role constants for announcement tracking."""
    NAGARSEVAK = "NAGARSEVAK"
    DEPARTMENT_OFFICER = "DEPARTMENT_OFFICER"
    MAIN_ADMIN = "MAIN_ADMIN"
    CITIZEN = "CITIZEN"


class AuthorRole:
    """Author role constants for complaint history and escalations."""
    NAGARSEVAK = "Nagarsevak"
    DEPARTMENT = "Department"
    MAIN_ADMIN = "Main Admin"


class ComplaintStatus:
    """Complaint status constants used throughout the application."""
    PENDING = "Pending"
    IN_PROGRESS = "In Progress"
    RESOLVED = "Resolved"
    CLOSED = "Closed"

    # Set of all valid statuses for validation
    VALID_STATUSES = {PENDING, IN_PROGRESS, RESOLVED, CLOSED}


class ImageValidation:
    """Image validation constants for file uploads."""
    ALLOWED_IMAGE_TYPES: dict[str, str] = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
    }
    MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB


class AnnouncementTarget:
    """Announcement target audience constants."""
    EVERYONE = "everyone"
    ALL_CITIZENS = "all_citizens"
    WARD_CITIZENS = "ward_citizens"
    ALL_NAGARSEVAKS = "all_nagarsevaks"
    WARD_NAGARSEVAKS = "ward_nagarsevaks"
    ALL_DEPARTMENTS = "all_department_officers"
    SINGLE_DEPARTMENT = "department_officers"

    VALID_TARGETS = frozenset({
        EVERYONE,
        ALL_CITIZENS,
        WARD_CITIZENS,
        ALL_NAGARSEVAKS,
        WARD_NAGARSEVAKS,
        ALL_DEPARTMENTS,
        SINGLE_DEPARTMENT,
    })


class UserState:
    """User state management constants."""
    # State precedence (highest to lowest priority)
    STATE_PRECEDENCE = ["is_deleted", "is_archived", "is_blocked", "is_restricted", "is_active"]

    # Valid state transitions
    VALID_TRANSITIONS = {
        "active": ["blocked", "restricted", "archived", "deleted"],
        "blocked": ["active", "restricted", "archived", "deleted"],
        "restricted": ["active", "blocked", "archived", "deleted"],
        "archived": ["active", "blocked", "restricted", "deleted"],
        "deleted": [],  # Cannot transition from deleted
    }


class Department:
    """Department constants for complaint categorization."""
    VALID_DEPARTMENTS = {
        "DEPT_PANI": "पाणी पुरवठा विभाग",
        "DEPT_SWACHHTA": "स्वच्छता व घनकचरा विभाग",
        "DEPT_BANDHKAM": "बांधकाम विभाग",
        "DEPT_VIDYUT": "विद्युत विभाग",
        "DEPT_AROGYA": "आरोग्य विभाग",
        "DEPT_UDYAN": "उद्याने व बाग विभाग",
    }


# Category to Department mapping
CATEGORY_TO_DEPARTMENT = {
    "Water": "DEPT_PANI",
    "Garbage": "DEPT_SWACHHTA",
    "Gutter": "DEPT_SWACHHTA",
    "Drainage": "DEPT_BANDHKAM",
    "Road": "DEPT_BANDHKAM",
    "Street Lights": "DEPT_VIDYUT",
    "Animals": "DEPT_AROGYA",
    "Tree": "DEPT_UDYAN",
    "Traffic": "DEPT_BANDHKAM",
    "Other": "DEPT_AROGYA",
}
