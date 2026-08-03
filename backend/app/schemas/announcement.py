from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class AnnouncementResponse(BaseModel):
    id: int
    title: str
    description: str
    priority: str
    image_url: Optional[str] = None
    target_type: str
    target_ward_id: Optional[int] = None
    target_department: Optional[str] = None
    created_by: Optional[str] = None
    is_archived: bool
    is_deleted: bool
    created_at: datetime
    updated_at: datetime
    is_read: bool = False  # Added for frontend convenience

    model_config = ConfigDict(from_attributes=True)
