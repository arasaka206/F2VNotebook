from __future__ import annotations
from datetime import datetime, timezone
from typing import Any
import uuid

from fastapi import APIRouter, HTTPException, status

from app.schemas.consult import ConsultCreate, ConsultUpdate, ConsultOut

router = APIRouter(prefix="/consults", tags=["consults"])

_STORE: dict[str, dict[str, Any]] = {
    "con-001": {
        "id": "con-001",
        "farmer_id": "user-001",
        "vet_id": "user-002",
        "livestock_id": "ls-002",
        "subject": "Respiratory infection follow-up",
        "description": "Daisy still coughing after day 3 of antibiotic",
        "priority": "high",
        "status": "in_progress",
        "created_at": "2024-05-03T08:00:00Z",
        "updated_at": "2024-05-04T09:00:00Z",
    }
}

# Available vets for display
VETS = [
    {"id": "user-002", "full_name": "Dr. Tran Thi Bich", "specialty": "Bovine", "status": "online"},
    {"id": "user-003", "full_name": "Dr. Le Minh Hoang", "specialty": "Swine", "status": "busy"},
    {"id": "user-004", "full_name": "Dr. Pham Nguyen Lan", "specialty": "Poultry", "status": "offline"},
]


@router.get("/vets", response_model=list[dict])
def list_vets() -> list[dict]:
    return VETS


@router.get("/", response_model=list[ConsultOut])
def list_consults(farmer_id: str | None = None) -> list[ConsultOut]:
    items = list(_STORE.values())
    if farmer_id:
        items = [i for i in items if i["farmer_id"] == farmer_id]
    return [ConsultOut(**i) for i in items]


@router.post("/", response_model=ConsultOut, status_code=status.HTTP_201_CREATED)
def create_consult(body: ConsultCreate) -> ConsultOut:
    new_id = f"con-{uuid.uuid4().hex[:6]}"
    now = datetime.now(timezone.utc).isoformat()
    record: dict[str, Any] = {
        **body.model_dump(),
        "id": new_id,
        "status": "pending",
        "created_at": now,
        "updated_at": now,
    }
    _STORE[new_id] = record
    return ConsultOut(**record)


@router.patch("/{consult_id}", response_model=ConsultOut)
def update_consult(consult_id: str, body: ConsultUpdate) -> ConsultOut:
    item = _STORE.get(consult_id)
    if not item:
        raise HTTPException(status_code=404, detail="Consult not found")
    now = datetime.now(timezone.utc).isoformat()
    updates = body.model_dump(exclude_none=True)
    updates["updated_at"] = now
    item.update(updates)
    return ConsultOut(**item)
