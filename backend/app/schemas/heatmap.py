from __future__ import annotations
from pydantic import BaseModel
from datetime import datetime


class HeatmapDataOut(BaseModel):
    id: str
    barn_id: str
    location_x: float
    location_y: float
    intensity: float
    data_type: str
    timestamp: datetime

    class Config:
        from_attributes = True


class HeatmapGridOut(BaseModel):
    """Grid-based heatmap data for visualization"""
    barn_id: str
    data_type: str
    grid_data: list[dict]  # [{x, y, intensity}, ...]
    timestamp: datetime
