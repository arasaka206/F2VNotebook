from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import date, datetime


class ProductionBase(BaseModel):
    production_type: str
    livestock_id: Optional[str] = None
    quantity: float
    unit: str
    production_date: date
    notes: Optional[str] = None


class ProductionCreate(ProductionBase):
    pass


class ProductionResponse(ProductionBase):
    id: str
    farmer_id: str
    created_at: datetime

    class Config:
        from_attributes = True


class SaleBase(BaseModel):
    item_name: str
    quantity: float
    unit: str
    price_per_unit: float
    total_amount: float
    shipping_cost: float = 0
    sale_date: date
    buyer_name: Optional[str] = None
    notes: Optional[str] = None


class SaleCreate(SaleBase):
    pass


class SaleResponse(SaleBase):
    id: str
    farmer_id: str
    created_at: datetime

    class Config:
        from_attributes = True


class AnalyticsReportBase(BaseModel):
    period_type: str  # daily, weekly, monthly, quarterly, yearly
    start_date: date
    end_date: date
    total_revenue: float = 0
    total_feed_cost: float = 0
    total_medicine_cost: float = 0
    total_equipment_cost: float = 0
    total_labor_cost: float = 0
    total_other_cost: float = 0
    total_cost: float = 0
    net_profit: float = 0
    profit_margin: float = 0
    total_production_quantity: float = 0
    production_unit: Optional[str] = None
    inventory_value: float = 0
    low_stock_items: int = 0
    production_efficiency: float = 0
    cost_per_unit: float = 0
    revenue_per_unit: float = 0
    recommendations: Optional[str] = None
    is_analyzed: bool = False


class AnalyticsReportResponse(AnalyticsReportBase):
    id: str
    farmer_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AnalyticsSummary(BaseModel):
    current_period: AnalyticsReportResponse
    previous_period: Optional[AnalyticsReportResponse] = None
    comparison: Optional[Dict[str, Any]] = None
    trends: Optional[List[Dict[str, Any]]] = None


class RevenueBreakdown(BaseModel):
    item_name: str
    quantity: float
    revenue: float
    percentage: float


class CostBreakdown(BaseModel):
    category: str
    amount: float
    percentage: float


class AnalyticsChartData(BaseModel):
    labels: List[str]
    datasets: List[Dict[str, Any]]
    period: str
    total_revenue: float
    total_cost: float
    net_profit: float


class AnalyticsRecommendation(BaseModel):
    title: str
    description: str
    priority: str  # high, medium, low
    action: str
    estimated_impact: str
