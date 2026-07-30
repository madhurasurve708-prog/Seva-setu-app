from pydantic import BaseModel


class WardResponse(BaseModel):
    id: int
    ward_number: str
    ward_name: str

    class Config:
        from_attributes = True
