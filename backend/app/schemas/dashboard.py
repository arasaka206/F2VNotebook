from __future__ import annotations
from pydantic import BaseModel


class DashboardSummaryOut(BaseModel):
    herd_health_score: int          # 0-100
    active_treatment_cases: int
    total_livestock: int
    disease_alert_level: str        # low | medium | high | critical
    latest_sensor: dict             # temperature_c, humidity_pct, ammonia_ppm, status
    activity_stream: list[dict]     # last N AI notebook events
