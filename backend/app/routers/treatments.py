from __future__ import annotations
from datetime import datetime, timezone
from typing import Any
import uuid

from fastapi import APIRouter, HTTPException, status

from app.schemas.treatment import TreatmentCreate, TreatmentUpdate, TreatmentOut

router = APIRouter(prefix="/treatments", tags=["treatments"])

_STORE: dict[str, dict[str, Any]] = {
    "tr-001": {
        "id": "tr-001",
        "livestock_id": "ls-002",
        "diagnosis": "Bovine Respiratory Disease",
        "treatment_plan": "Oxytetracycline 20mg/kg IV for 5 days",
        "start_date": "2024-05-01",
        "end_date": None,
        "assigned_vet_id": "user-002",
        "status": "active",
        "created_at": "2024-05-01T07:00:00Z",
    },
    "tr-002": {
        "id": "tr-002",
        "livestock_id": "ls-001",
        "diagnosis": "Foot-and-Mouth Disease (mild)",
        "treatment_plan": "Isolation + topical wound treatment",
        "start_date": "2024-04-20",
        "end_date": "2024-04-27",
        "assigned_vet_id": "user-002",
        "status": "completed",
        "created_at": "2024-04-20T10:00:00Z",
    },
}


@router.get("/", response_model=list[TreatmentOut])
def list_treatments(status_filter: str | None = None) -> list[TreatmentOut]:
    items = list(_STORE.values())
    if status_filter:
        items = [i for i in items if i["status"] == status_filter]
    return [TreatmentOut(**i) for i in items]


@router.post("/", response_model=TreatmentOut, status_code=status.HTTP_201_CREATED)
def create_treatment(body: TreatmentCreate) -> TreatmentOut:
    new_id = f"tr-{uuid.uuid4().hex[:6]}"
    now = datetime.now(timezone.utc).isoformat()
    record: dict[str, Any] = {
        **body.model_dump(),
        "id": new_id,
        "created_at": now,
        "start_date": body.start_date.isoformat(),
        "end_date": body.end_date.isoformat() if body.end_date else None,
    }
    _STORE[new_id] = record
    return TreatmentOut(**record)


@router.get("/{treatment_id}", response_model=TreatmentOut)
def get_treatment(treatment_id: str) -> TreatmentOut:
    item = _STORE.get(treatment_id)
    if not item:
        raise HTTPException(status_code=404, detail="Treatment not found")
    return TreatmentOut(**item)


@router.patch("/{treatment_id}", response_model=TreatmentOut)
def update_treatment(treatment_id: str, body: TreatmentUpdate) -> TreatmentOut:
    item = _STORE.get(treatment_id)
    if not item:
        raise HTTPException(status_code=404, detail="Treatment not found")
    updates = body.model_dump(exclude_none=True)
    if "end_date" in updates and updates["end_date"]:
        updates["end_date"] = updates["end_date"].isoformat()
    item.update(updates)
    return TreatmentOut(**item)
