from fastapi import FastAPI
from app.core.config import settings

app = FastAPI(
    title="Seva Setu API",
    version="1.0.0",
)

@app.get("/")
def root():
    return {
        "message": "Seva Setu Backend Running 🚀",
        "supabase": settings.SUPABASE_URL,
    }