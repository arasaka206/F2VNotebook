from __future__ import annotations
from typing import Optional
from pydantic import BaseModel


class ConsultBase(BaseModel):
    farmer_id: str
    vet_id: Optional[str] = None
    livestock_id: Optional[str] = None
    subject: str
    description: str
    priority: str = "normal"  # low | normal | high | emergency


class ConsultCreate(ConsultBase):
    pass


class ConsultUpdate(BaseModel):
    vet_id: Optional[str] = None
    status: Optional[str] = None  # pending | accepted | in_progress | completed | cancelled
    notes: Optional[str] = None


class ConsultOut(ConsultBase):
    id: str
    status: str = "pending"
    created_at: str
    updated_at: str
