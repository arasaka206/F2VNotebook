from __future__ import annotations
from typing import Optional
from pydantic import BaseModel
from datetime import datetime


class SensorReadingCreate(BaseModel):
    barn_id: str
    temperature_c: Optional[float] = None
    humidity_pct: Optional[float] = None
    ammonia_ppm: Optional[float] = None


class SensorReadingOut(BaseModel):
    id: str
    barn_id: str
    temperature_c: Optional[float]
    humidity_pct: Optional[float]
    ammonia_ppm: Optional[float]
    status: str
    timestamp: datetime

    class Config:
        from_attributes = True


class SensorAggregateOut(BaseModel):
    barn_id: str
    avg_temperature_c: Optional[float]
    avg_humidity_pct: Optional[float]
    avg_ammonia_ppm: Optional[float]
    data_points: int
    window_hours: int


class SensorSummaryOut(BaseModel):
    barn_id: str
    temperature_c: Optional[float]
    humidity_pct: Optional[float]
    ammonia_ppm: Optional[float]
    recorded_at: str
    status: str = "ok"  # ok | warning | danger
