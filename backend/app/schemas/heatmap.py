from __future__ import annotations
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class GeoHeatmapDataOut(BaseModel):
    id: str
    latitude: float
    longitude: float
    intensity: float
    data_type: str
    timestamp: datetime
    province: Optional[str] = None
    city: Optional[str] = None

    class Config:
        from_attributes = True

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
