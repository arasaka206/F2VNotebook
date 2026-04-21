from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AlertBase(BaseModel):
    alert_type: str = "info"
    severity: str = "info"  # info, warning, critical
    title: str
    message: str
    scope: str = "global"  # global, region, farm
    target_id: Optional[str] = None
    is_active: bool = True
    created_by: Optional[str] = None


class AlertCreate(AlertBase):
    pass


class AlertUpdate(BaseModel):
    is_read: Optional[bool] = None
    is_active: Optional[bool] = None


class AlertOut(AlertBase):
    id: str
    is_read: bool
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True