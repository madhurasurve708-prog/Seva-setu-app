from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
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
from app.api.department_officer_announcement import router as department_officer_announcement_router
from app.api.main_admin import router as main_admin_router
from app.api.main_admin_complaint import router as main_admin_complaint_router
from app.api.main_admin_analytics import router as main_admin_analytics_router
from app.api.main_admin_audit import router as main_admin_audit_router
from app.api.citizen_announcement import router as citizen_announcement_router
from app.core.config import settings

# Import all models so SQLAlchemy registers them with Base.metadata
# before create_all() runs. Must happen before the app starts.
import app.models  # noqa: F401

app = FastAPI(
    title="Seva Setu API",
    version="1.0.0",
    description="Backend API for Seva Setu civic-service portals.",
)

# Configure CORS origins
cors_origins = [
    "http://localhost:8081",
    "http://localhost:8082",
    "http://localhost:19006",
    "https://seva-setu-app.onrender.com",
]

if settings.CORS_ORIGINS:
    for origin in settings.CORS_ORIGINS.split(","):
        stripped = origin.strip()
        if stripped and stripped not in cors_origins:
            cors_origins.append(stripped)

# During development, allow 127.0.0.1 equivalents for Expo Web
if settings.ALLOW_DEV_MODE:
    dev_origins = ["http://127.0.0.1:8081", "http://127.0.0.1:8082"]
    for origin in dev_origins:
        if origin not in cors_origins:
            cors_origins.append(origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(SQLAlchemyError)
async def database_exception_handler(_: Request, exc: SQLAlchemyError) -> JSONResponse:
    """Avoid exposing database vendor details to API consumers."""
    import traceback
    traceback.print_exc()
    print("DB ERROR:", exc)
    return JSONResponse(
        status_code=500,
        content={"detail": f"An internal database error occurred: {exc}"},
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
app.include_router(department_officer_announcement_router)
app.include_router(main_admin_router)
app.include_router(main_admin_complaint_router)
app.include_router(main_admin_analytics_router)
app.include_router(main_admin_audit_router)
app.include_router(citizen_announcement_router)


@app.get("/")
def root():
    return {"message": "Seva Setu Backend Running"}
