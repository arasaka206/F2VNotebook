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
    default_reading = SensorReadingResponse(
        id="default",
        barn_id="barn-1",
        temperature_c=0,
        humidity_pct=0,
        ammonia_ppm=0,
        status="ok",
        timestamp=datetime.utcnow(),
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


@router.get("/barns/overview")
def get_barn_sensor_overview(
    window_hours: int = Query(24, description="Time window in hours"),
    db: Session = Depends(get_db)
):
    time_threshold = datetime.utcnow() - timedelta(hours=window_hours)

    latest_per_barn = db.query(
        SensorReading.barn_id.label("barn_id"),
        func.max(SensorReading.timestamp).label("latest_timestamp")
    ).group_by(SensorReading.barn_id).subquery()

    latest_readings = db.query(SensorReading).join(
        latest_per_barn,
        (SensorReading.barn_id == latest_per_barn.c.barn_id) &
        (SensorReading.timestamp == latest_per_barn.c.latest_timestamp)
    ).order_by(SensorReading.timestamp.desc()).all()

    if not latest_readings:
        return []

    barn_ids = [reading.barn_id for reading in latest_readings]

    aggregates = db.query(
        SensorReading.barn_id.label("barn_id"),
        func.avg(SensorReading.temperature_c).label("avg_temperature_c"),
        func.avg(SensorReading.humidity_pct).label("avg_humidity_pct"),
        func.avg(SensorReading.ammonia_ppm).label("avg_ammonia_ppm"),
        func.count(SensorReading.id).label("data_points"),
        func.max(SensorReading.timestamp).label("last_seen")
    ).filter(
        SensorReading.barn_id.in_(barn_ids),
        SensorReading.timestamp >= time_threshold
    ).group_by(SensorReading.barn_id).all()

    aggregate_map = {row.barn_id: row for row in aggregates}

    overview = []
    for reading in latest_readings:
        stats = aggregate_map.get(reading.barn_id)
        overview.append({
            "barn_id": reading.barn_id,
            "latest_reading": {
                "id": reading.id,
                "barn_id": reading.barn_id,
                "temperature_c": reading.temperature_c,
                "humidity_pct": reading.humidity_pct,
                "ammonia_ppm": reading.ammonia_ppm,
                "status": reading.status,
                "timestamp": reading.timestamp,
            },
            "avg_temperature_c": round(stats.avg_temperature_c, 2) if stats and stats.avg_temperature_c is not None else None,
            "avg_humidity_pct": round(stats.avg_humidity_pct, 2) if stats and stats.avg_humidity_pct is not None else None,
            "avg_ammonia_ppm": round(stats.avg_ammonia_ppm, 2) if stats and stats.avg_ammonia_ppm is not None else None,
            "data_points": int(stats.data_points) if stats and stats.data_points is not None else 0,
            "last_seen": stats.last_seen.isoformat() if stats and stats.last_seen else reading.timestamp.isoformat(),
            "window_hours": window_hours,
        })

    return overview
