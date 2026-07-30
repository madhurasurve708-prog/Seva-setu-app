from datetime import datetime
from pydantic import BaseModel


class AnnouncementResponse(BaseModel):
    id: int
    title: str
    description: str
    priority: str
    created_at: datetime
    is_read: bool

    class Config:
        from_attributes = True
