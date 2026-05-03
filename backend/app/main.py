from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine
from app.models import Base

from app.core.config import settings
from app.routers import auth, livestock, treatments, sensors, consults, ai, dashboard, heatmap, public_dashboard
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import SensorReading
from app.schemas.sensor import SensorDataUpload

Base.metadata.create_all(bind=engine)

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
app.include_router(heatmap.router, prefix=API_PREFIX)
app.include_router(public_dashboard.router, prefix=API_PREFIX)

# 1. DEFINE THE ROUTER FIRST
router = APIRouter()



@router.post("/upload", status_code=201)
def upload_sensor_data(payload: SensorDataUpload, db: Session = Depends(get_db)):
    # 1. Evaluate environmental status thresholds
    current_status = "ok"
    if payload.temperature_c is not None:
        if payload.temperature_c > 35.0 or payload.temperature_c < 10.0:
            current_status = "danger"
        elif payload.temperature_c > 30.0:
            current_status = "warning"

    # 2. Instantiate the database record
    new_reading = SensorReading(
        barn_id=payload.barn_id,
        temperature_c=payload.temperature_c,
        humidity_pct=payload.humidity_pct,
        status=current_status
    )
    
    # 3. Commit transaction
    try:
        db.add(new_reading)
        db.commit()
        db.refresh(new_reading)
        return {"message": "Telemetry logged successfully", "id": new_reading.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database transaction failed.")
    
app.include_router(router, prefix=API_PREFIX)

# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.get("/health", tags=["health"])
def health_check() -> dict:
    return {"status": "ok", "app": settings.APP_NAME, "version": settings.APP_VERSION}

# uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
