from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.dependencies.db import get_db
from app.schemas.ward import WardResponse
from app.services.ward_service import WardService

router = APIRouter(tags=["Wards"])


@router.get("/api/wards", response_model=list[WardResponse], status_code=status.HTTP_200_OK)
def get_all_wards(db: Session = Depends(get_db)):
    return WardService.get_all_wards(db)
