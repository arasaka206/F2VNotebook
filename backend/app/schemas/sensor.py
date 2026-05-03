from __future__ import annotations
from typing import Optional
from pydantic import BaseModel


class SensorReadingCreate(BaseModel):
    farm_id: str
    temperature_c: float
    humidity_pct: float
    ammonia_ppm: float

class SensorDataUpload(BaseModel):
    barn_id: str
    temperature_c: Optional[float] = None
    humidity_pct: Optional[float] = None
    # ammonia_ppm is omitted from the request since the BME280 cannot provide it.

class SensorSummaryOut(BaseModel):
    farm_id: str
    temperature_c: float
    humidity_pct: float
    ammonia_ppm: float
    recorded_at: str
    status: str = "normal"  # normal | warning | critical
