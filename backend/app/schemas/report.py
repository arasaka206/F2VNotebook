from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ReportBase(BaseModel):
    target_type: str  # post, comment, user
    target_id: str
    reporter_id: str
    reason: str
    description: Optional[str] = None


class ReportCreate(ReportBase):
    pass


class ReportUpdate(BaseModel):
    status: Optional[str] = None  # pending, reviewed, resolved, dismissed
    reviewed_by: Optional[str] = None
    review_notes: Optional[str] = None


class ReportOut(ReportBase):
    id: str
    status: str
    reviewed_by: Optional[str]
    review_notes: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True