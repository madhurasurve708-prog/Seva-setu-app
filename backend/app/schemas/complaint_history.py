from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class ComplaintHistoryResponse(BaseModel):
    author_role: str
    author_name: str
    author_id: Optional[int] = None
    created_at: datetime
    note_text: str
    image_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
