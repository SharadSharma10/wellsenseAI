"""
WellSense AI - Student Mental Well-Being Screening Platform
Backend FastAPI Application
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

from app.config import settings
from app.ml.inference import get_predictor
from app.database.store import get_store

# Import routers
from app.api.auth import router as auth_router
from app.api.predict import router as predict_router
from app.api.assessments import router as assessments_router
from app.api.wearables import router as wearables_router
from app.api.counsellor import router as counsellor_router
from app.api.admin import router as admin_router
from app.api.privacy import router as privacy_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Warmup database and model predictor
    get_store()
    try:
        predictor = get_predictor()
        print(f"[WellSense Startup] Model '{predictor.metadata.get('model_name')}' loaded successfully.")
    except Exception as e:
        print(f"[WellSense Startup Warning] Model loading delayed or failed: {e}")
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Full-stack AI-driven student mental well-being screening and early support platform.",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", tags=["System"])
def health_check():
    """Health check endpoint for container probes and uptime monitoring."""
    model_loaded = False
    try:
        predictor = get_predictor()
        model_loaded = predictor.model is not None
    except Exception:
        model_loaded = False

    return {
        "status": "healthy",
        "service": "WellSense AI Backend",
        "version": settings.VERSION,
        "model_loaded": model_loaded,
        "timestamp": datetime.utcnow().isoformat(),
        "disclaimer": "WellSense AI is a screening aid, not a medical diagnostic system."
    }

@app.get("/", tags=["System"])
def root():
    return {
        "message": "Welcome to WellSense AI - Student Mental Well-Being Screening Platform API",
        "docs_url": "/docs",
        "health_url": "/health",
        "version": settings.VERSION
    }

# Mount API routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(predict_router, prefix=settings.API_V1_STR)
app.include_router(assessments_router, prefix=settings.API_V1_STR)
app.include_router(wearables_router, prefix=settings.API_V1_STR)
app.include_router(counsellor_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)
app.include_router(privacy_router, prefix=settings.API_V1_STR)

# Also mount root /predict and /model-info to satisfy requirement 7 ("GET /health, POST /predict, GET /model-info")
app.include_router(predict_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
