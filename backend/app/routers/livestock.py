from __future__ import annotations
from datetime import date, datetime, timezone
from typing import Any
import uuid

from fastapi import APIRouter, HTTPException, status

from app.schemas.livestock import LivestockCreate, LivestockUpdate, LivestockOut

router = APIRouter(prefix="/livestock", tags=["livestock"])

# ---------------------------------------------------------------------------
# In-memory store (replace with DB in production)
# ---------------------------------------------------------------------------
_STORE: dict[str, dict[str, Any]] = {
    "ls-001": {
        "id": "ls-001",
        "tag_id": "COW-A01",
        "name": "Bessie",
        "species": "Cattle",
        "breed": "Holstein",
        "birth_date": "2020-03-15",
        "weight_kg": 450.0,
        "health_status": "healthy",
        "notes": "Regular vaccination up to date",
        "owner_id": "user-001",
        "created_at": "2024-01-10T08:00:00Z",
    },
    "ls-002": {
        "id": "ls-002",
        "tag_id": "COW-A02",
        "name": "Daisy",
        "species": "Cattle",
        "breed": "Jersey",
        "birth_date": "2019-07-22",
        "weight_kg": 390.0,
        "health_status": "under_treatment",
        "notes": "Respiratory infection – see treatment TR-001",
        "owner_id": "user-001",
        "created_at": "2024-01-10T08:05:00Z",
    },
    "ls-003": {
        "id": "ls-003",
        "tag_id": "PIG-B01",
        "name": "Porky",
        "species": "Swine",
        "breed": "Duroc",
        "birth_date": "2022-11-01",
        "weight_kg": 120.0,
        "health_status": "healthy",
        "notes": None,
        "owner_id": "user-001",
        "created_at": "2024-01-11T09:00:00Z",
    },
}


@router.get("/", response_model=list[LivestockOut])
def list_livestock(owner_id: str = "user-001") -> list[LivestockOut]:
    return [LivestockOut(**v) for v in _STORE.values() if v["owner_id"] == owner_id]


@router.post("/", response_model=LivestockOut, status_code=status.HTTP_201_CREATED)
def create_livestock(body: LivestockCreate) -> LivestockOut:
    new_id = f"ls-{uuid.uuid4().hex[:6]}"
    now = datetime.now(timezone.utc).isoformat()
    record: dict[str, Any] = {
        **body.model_dump(),
        "id": new_id,
        "owner_id": "user-001",
        "created_at": now,
        "birth_date": body.birth_date.isoformat() if body.birth_date else None,
    }
    _STORE[new_id] = record
    return LivestockOut(**record)


@router.get("/{livestock_id}", response_model=LivestockOut)
def get_livestock(livestock_id: str) -> LivestockOut:
    item = _STORE.get(livestock_id)
    if not item:
        raise HTTPException(status_code=404, detail="Livestock not found")
    return LivestockOut(**item)


@router.patch("/{livestock_id}", response_model=LivestockOut)
def update_livestock(livestock_id: str, body: LivestockUpdate) -> LivestockOut:
    item = _STORE.get(livestock_id)
    if not item:
        raise HTTPException(status_code=404, detail="Livestock not found")
    updates = body.model_dump(exclude_none=True)
    if "birth_date" in updates and updates["birth_date"]:
        updates["birth_date"] = updates["birth_date"].isoformat()
    item.update(updates)
    return LivestockOut(**item)


@router.delete("/{livestock_id}", status_code=status.HTTP_204_NO_CONTENT, response_model=None)
def delete_livestock(livestock_id: str) -> None:
    if livestock_id not in _STORE:
        raise HTTPException(status_code=404, detail="Livestock not found")
    del _STORE[livestock_id]
