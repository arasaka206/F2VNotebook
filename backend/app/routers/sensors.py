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

class SensorReadingResponse(BaseModel):
    id: str
    barn_id: str
    temperature_c: Optional[float]
    humidity_pct: Optional[float]
    ammonia_ppm: Optional[float]
    status: str
    timestamp: datetime

    class Config:
        from_attributes = True

class SensorAggregateResponse(BaseModel):
    barn_id: str
    avg_temperature_c: Optional[float]
    avg_humidity_pct: Optional[float]
    avg_ammonia_ppm: Optional[float]
    data_points: int
    window_hours: int

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

@router.get("/latest", response_model=SensorReadingResponse)
def get_latest_sensor(db: Session = Depends(get_db)):
    latest = db.query(SensorReading).order_by(SensorReading.timestamp.desc()).first()
    if latest:
        return latest
    # Return default reading if no data exists
    default_reading = SensorReading(
        id="default",
        barn_id="barn-1",
        temperature_c=0,
        humidity_pct=0,
        ammonia_ppm=0,
        status="ok"
    )
    return default_reading

@router.get("/aggregate", response_model=SensorAggregateResponse)
def get_sensor_aggregate(
    barn_id: str = Query(..., description="Barn identifier"),
    window_hours: int = Query(24, description="Time window in hours"),
    db: Session = Depends(get_db)
):
    # Calculate the time threshold
    time_threshold = datetime.utcnow() - timedelta(hours=window_hours)
    
    # Query readings within the window
    readings = db.query(SensorReading).filter(
        SensorReading.barn_id == barn_id,
        SensorReading.timestamp >= time_threshold
    ).all()
    
    data_points = len(readings)
    
    if data_points == 0:
        return SensorAggregateResponse(
            barn_id=barn_id,
            avg_temperature_c=None,
            avg_humidity_pct=None,
            avg_ammonia_ppm=None,
            data_points=0,
            window_hours=window_hours
        )
    
    # Calculate averages
    avg_temp = sum([r.temperature_c for r in readings if r.temperature_c is not None]) / max(1, len([r for r in readings if r.temperature_c is not None])) if any(r.temperature_c is not None for r in readings) else None
    avg_humidity = sum([r.humidity_pct for r in readings if r.humidity_pct is not None]) / max(1, len([r for r in readings if r.humidity_pct is not None])) if any(r.humidity_pct is not None for r in readings) else None
    avg_ammonia = sum([r.ammonia_ppm for r in readings if r.ammonia_ppm is not None]) / max(1, len([r for r in readings if r.ammonia_ppm is not None])) if any(r.ammonia_ppm is not None for r in readings) else None
    
    return SensorAggregateResponse(
        barn_id=barn_id,
        avg_temperature_c=round(avg_temp, 2) if avg_temp is not None else None,
        avg_humidity_pct=round(avg_humidity, 2) if avg_humidity is not None else None,
        avg_ammonia_ppm=round(avg_ammonia, 2) if avg_ammonia is not None else None,
        data_points=data_points,
        window_hours=window_hours
    )