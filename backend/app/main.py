from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from fastapi import FastAPI
from app.database import engine
from app.models import Base  # Import file models.py bạn vừa tạo

from app.core.config import settings
from app.routers import auth, livestock, treatments, sensors, consults, ai, dashboard

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Farm2Vets API")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
API_PREFIX = "/api"

app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(livestock.router, prefix=API_PREFIX)
app.include_router(treatments.router, prefix=API_PREFIX)
app.include_router(sensors.router, prefix=API_PREFIX)
app.include_router(consults.router, prefix=API_PREFIX)
app.include_router(ai.router, prefix=API_PREFIX)
app.include_router(dashboard.router, prefix=API_PREFIX)


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.get("/health", tags=["health"])
def health_check() -> dict:
    return {"status": "ok", "app": settings.APP_NAME, "version": settings.APP_VERSION}
