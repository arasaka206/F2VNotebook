from __future__ import annotations
from datetime import date
from typing import Optional
from pydantic import BaseModel


class LivestockBase(BaseModel):
    tag_id: str
    name: str
    species: str
    breed: Optional[str] = None
    birth_date: Optional[date] = None
    weight_kg: Optional[float] = None
    health_status: str = "healthy"  # healthy | sick | under_treatment | deceased
    notes: Optional[str] = None


class LivestockCreate(LivestockBase):
    pass


class LivestockUpdate(BaseModel):
    name: Optional[str] = None
    breed: Optional[str] = None
    birth_date: Optional[date] = None
    weight_kg: Optional[float] = None
    health_status: Optional[str] = None
    notes: Optional[str] = None


class LivestockOut(LivestockBase):
    id: str
    owner_id: str
    created_at: str
