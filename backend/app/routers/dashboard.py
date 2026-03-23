from __future__ import annotations

from fastapi import APIRouter

from app.schemas.dashboard import DashboardSummaryOut

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

_ACTIVITY_STREAM = [
    {"id": "act-001", "timestamp": "2024-05-10T06:30:00Z", "type": "ai_note", "message": "AI detected elevated ammonia – recommended ventilation check"},
    {"id": "act-002", "timestamp": "2024-05-09T14:00:00Z", "type": "treatment", "message": "Treatment TR-001 updated: Daisy responded to antibiotics"},
    {"id": "act-003", "timestamp": "2024-05-09T10:00:00Z", "type": "consult", "message": "Consult CON-001 accepted by Dr. Tran Thi Bich"},
    {"id": "act-004", "timestamp": "2024-05-08T08:00:00Z", "type": "sensor", "message": "Sensor alert: Temperature spike 34.1°C in Barn A"},
    {"id": "act-005", "timestamp": "2024-05-07T16:00:00Z", "type": "ai_note", "message": "AI notebook entry: Vaccination reminder for COW-A01"},
]


@router.get("/summary", response_model=DashboardSummaryOut)
def get_summary() -> DashboardSummaryOut:
    return DashboardSummaryOut(
        herd_health_score=78,
        active_treatment_cases=2,
        total_livestock=24,
        disease_alert_level="medium",
        latest_sensor={
            "temperature_c": 27.1,
            "humidity_pct": 72.3,
            "ammonia_ppm": 15.2,
            "status": "warning",
        },
        activity_stream=_ACTIVITY_STREAM,
    )
