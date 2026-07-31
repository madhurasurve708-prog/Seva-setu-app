from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class ComplaintHistoryCreate(BaseModel):
    note_text: str
    image_url: Optional[str] = None


class ComplaintHistoryResponse(BaseModel):
    author_role: str
    author_name: str
    author_id: Optional[int] = None
    created_at: datetime
    note_text: str
    image_url: Optional[str] = None

    class Config:
        from_attributes = True
