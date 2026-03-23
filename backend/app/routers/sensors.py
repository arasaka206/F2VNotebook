from __future__ import annotations
from datetime import datetime, timezone
from typing import Any
import uuid

from fastapi import APIRouter, status

from app.schemas.sensor import SensorReadingCreate, SensorSummaryOut

router = APIRouter(prefix="/sensors", tags=["sensors"])

_READINGS: list[dict[str, Any]] = [
    {
        "id": "sr-001",
        "farm_id": "farm-001",
        "temperature_c": 26.4,
        "humidity_pct": 68.0,
        "ammonia_ppm": 12.5,
        "status": "normal",
        "recorded_at": "2024-05-10T06:00:00Z",
    },
    {
        "id": "sr-002",
        "farm_id": "farm-001",
        "temperature_c": 27.1,
        "humidity_pct": 72.3,
        "ammonia_ppm": 15.2,
        "status": "warning",
        "recorded_at": "2024-05-10T07:00:00Z",
    },
]


def _classify_status(temp: float, humidity: float, ammonia: float) -> str:
    if ammonia > 25 or temp > 35 or humidity > 90:
        return "critical"
    if ammonia > 15 or temp > 30 or humidity > 80:
        return "warning"
    return "normal"


@router.post("/ingest", response_model=SensorSummaryOut, status_code=status.HTTP_201_CREATED)
def ingest_reading(body: SensorReadingCreate) -> SensorSummaryOut:
    now = datetime.now(timezone.utc).isoformat()
    st = _classify_status(body.temperature_c, body.humidity_pct, body.ammonia_ppm)
    record: dict[str, Any] = {
        "id": f"sr-{uuid.uuid4().hex[:6]}",
        **body.model_dump(),
        "status": st,
        "recorded_at": now,
    }
    _READINGS.append(record)
    return SensorSummaryOut(**record)


@router.get("/latest", response_model=SensorSummaryOut)
def latest_reading(farm_id: str = "farm-001") -> SensorSummaryOut:
    farm_readings = [r for r in _READINGS if r["farm_id"] == farm_id]
    if not farm_readings:
        return SensorSummaryOut(
            farm_id=farm_id,
            temperature_c=0.0,
            humidity_pct=0.0,
            ammonia_ppm=0.0,
            recorded_at=datetime.now(timezone.utc).isoformat(),
            status="normal",
        )
    latest = farm_readings[-1]
    return SensorSummaryOut(**latest)
