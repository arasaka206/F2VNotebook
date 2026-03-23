from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
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

@router.get("/latest")
def get_latest_sensor(db: Session = Depends(get_db)):
    latest = db.query(SensorReading).order_by(SensorReading.timestamp.desc()).first()
    return latest if latest else {"status": "ok", "temperature_c": 0, "humidity_pct": 0, "ammonia_ppm": 0}