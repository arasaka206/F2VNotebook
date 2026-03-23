from __future__ import annotations
from typing import Optional
from pydantic import BaseModel


class SensorReadingCreate(BaseModel):
    farm_id: str
    temperature_c: float
    humidity_pct: float
    ammonia_ppm: float


class SensorSummaryOut(BaseModel):
    farm_id: str
    temperature_c: float
    humidity_pct: float
    ammonia_ppm: float
    recorded_at: str
    status: str = "normal"  # normal | warning | critical
