from __future__ import annotations
from datetime import date
from typing import Optional
from pydantic import BaseModel


class TreatmentBase(BaseModel):
    livestock_id: str
    diagnosis: str
    treatment_plan: str
    start_date: date
    end_date: Optional[date] = None
    assigned_vet_id: Optional[str] = None
    status: str = "active"  # active | completed | cancelled


class TreatmentCreate(TreatmentBase):
    pass


class TreatmentUpdate(BaseModel):
    diagnosis: Optional[str] = None
    treatment_plan: Optional[str] = None
    end_date: Optional[date] = None
    assigned_vet_id: Optional[str] = None
    status: Optional[str] = None


class TreatmentOut(TreatmentBase):
    id: str
    created_at: str
