from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta
from app.database import get_db
from app.models import SensorReading

router = APIRouter(prefix="/sensors", tags=["sensors"])

class SensorIngestRequest(BaseModel):
    barn_id: str
    temperature_c: Optional[float] = None
    humidity_pct: Optional[float] = None
    ammonia_ppm: Optional[float] = None

@router.post("/ingest")
def ingest_sensor_data(data: SensorIngestRequest, db: Session = Depends(get_db)):
    # 1. ĐÂY LÀ PHẦN LOGIC QUAN TRỌNG ĐỂ CẬP NHẬT STATUS
    status = "ok"
    if data.temperature_c and data.temperature_c > 35.0:
        status = "warning"
    if data.ammonia_ppm and data.ammonia_ppm > 25.0:
        status = "danger"

    # 2. Lưu vào DB với status vừa được cập nhật
    new_reading = SensorReading(
        barn_id=data.barn_id,
        temperature_c=data.temperature_c,
        humidity_pct=data.humidity_pct,
        ammonia_ppm=data.ammonia_ppm,
        status=status 
    )
    
    db.add(new_reading)
    db.commit()
    db.refresh(new_reading)
    
    return {"message": "Đã lưu dữ liệu cảm biến", "data": new_reading}

@router.get("/aggregate")
def get_sensor_aggregate(
    barn_id: str = Query(...),
    window_hours: int = Query(24, ge=1, le=168),
    db: Session = Depends(get_db)
):
    time_threshold = datetime.utcnow() - timedelta(hours=window_hours)

    stats = db.query(
        func.min(SensorReading.temperature_c).label("min_temperature_c"),
        func.max(SensorReading.temperature_c).label("max_temperature_c"),
        func.avg(SensorReading.temperature_c).label("avg_temperature_c"),
        func.min(SensorReading.humidity_pct).label("min_humidity_pct"),
        func.max(SensorReading.humidity_pct).label("max_humidity_pct"),
        func.avg(SensorReading.humidity_pct).label("avg_humidity_pct"),
        func.min(SensorReading.ammonia_ppm).label("min_ammonia_ppm"),
        func.max(SensorReading.ammonia_ppm).label("max_ammonia_ppm"),
        func.avg(SensorReading.ammonia_ppm).label("avg_ammonia_ppm"),
        func.count(SensorReading.id).label("data_points"),
    ).filter(
        SensorReading.barn_id == barn_id,
        SensorReading.timestamp >= time_threshold,
    ).first()

    latest = db.query(SensorReading).filter(SensorReading.barn_id == barn_id).order_by(SensorReading.timestamp.desc()).first()

    return {
        "barn_id": barn_id,
        "window_hours": window_hours,
        "min_temperature_c": float(stats.min_temperature_c or 0),
        "max_temperature_c": float(stats.max_temperature_c or 0),
        "avg_temperature_c": float(stats.avg_temperature_c or 0),
        "min_humidity_pct": float(stats.min_humidity_pct or 0),
        "max_humidity_pct": float(stats.max_humidity_pct or 0),
        "avg_humidity_pct": float(stats.avg_humidity_pct or 0),
        "min_ammonia_ppm": float(stats.min_ammonia_ppm or 0),
        "max_ammonia_ppm": float(stats.max_ammonia_ppm or 0),
        "avg_ammonia_ppm": float(stats.avg_ammonia_ppm or 0),
        "last_updated": latest.timestamp.isoformat() if latest else None,
        "data_points": stats.data_points or 0,
    }


@router.get("/latest")
def get_latest_sensor(db: Session = Depends(get_db)):
    latest = db.query(SensorReading).order_by(SensorReading.timestamp.desc()).first()
    return latest if latest else {"status": "ok", "temperature_c": 0, "humidity_pct": 0, "ammonia_ppm": 0}