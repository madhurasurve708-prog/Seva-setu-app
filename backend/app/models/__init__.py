# Explicit imports ensure every model class is registered with the SQLAlchemy
# Base metadata before create_all() is called at startup.
# Import order respects foreign-key dependencies:
#   Ward and Category have no FK dependencies → import first
#   Citizen depends on Ward → import second
#   Complaint depends on Citizen, Ward, Category → import last

from app.models.ward import Ward
from app.models.category import Category
from app.models.citizen import Citizen
from app.models.complaint import Complaint
from app.models.nagarsevak import Nagarsevak
from app.models.complaint_history import ComplaintHistory
from app.models.complaint_escalation import ComplaintEscalation
from app.models.announcement import Announcement
from app.models.announcement_read import AnnouncementRead
from app.models.notification import Notification
from app.models.department_officer import DepartmentOfficer

__all__ = [
    "Ward",
    "Category",
    "Citizen",
    "Complaint",
    "Nagarsevak",
    "ComplaintHistory",
    "ComplaintEscalation",
    "Announcement",
    "AnnouncementRead",
    "Notification",
    "DepartmentOfficer",
]
