from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError
from app.db.base_class import Base
from app.db.session import engine
from app.api.citizen import router as citizen_router
from app.api.complaint import router as complaint_router
from app.api.category import router as category_router
from app.api.ward import router as ward_router
from app.api.nagarsevak import router as nagarsevak_router
from app.api.nagarsevak_complaint import router as nagarsevak_complaint_router
from app.api.announcement import router as announcement_router
from app.api.department_officer import router as department_officer_router
from app.api.department_officer_complaint import router as department_officer_complaint_router

# Import all models so SQLAlchemy registers them with Base.metadata
# before create_all() runs. Must happen before the app starts.
import app.models  # noqa: F401

app = FastAPI(
    title="Seva Setu API",
    version="1.0.0",
    description="Backend API for Seva Setu civic-service portals.",
)


@app.exception_handler(SQLAlchemyError)
async def database_exception_handler(_: Request, __: SQLAlchemyError) -> JSONResponse:
    """Avoid exposing database vendor details to API consumers."""
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal database error occurred."},
    )


@app.on_event("startup")
def create_tables() -> None:
    """Create all database tables that do not yet exist."""
    Base.metadata.create_all(bind=engine)


app.include_router(citizen_router)
app.include_router(complaint_router)
app.include_router(category_router)
app.include_router(ward_router)
app.include_router(nagarsevak_router)
app.include_router(nagarsevak_complaint_router)
app.include_router(announcement_router)
app.include_router(department_officer_router)
app.include_router(department_officer_complaint_router)


@app.get("/")
def root():
    return {"message": "Seva Setu Backend Running"}
