from pydantic import BaseModel


class MessageResponse(BaseModel):
    message: str


class ActionResponse(MessageResponse):
    success: bool
