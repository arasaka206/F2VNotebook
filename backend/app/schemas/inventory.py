from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date


class InventoryItemBase(BaseModel):
    name: str
    category: str
    quantity: float
    unit: str
    unit_cost: Optional[float] = None
    unit_price: Optional[float] = None
    min_quantity: float = 0
    description: Optional[str] = None
    is_active: bool = True


class InventoryItemCreate(InventoryItemBase):
    pass


class InventoryItemUpdate(BaseModel):
    name: Optional[str] = None
    quantity: Optional[float] = None
    unit_cost: Optional[float] = None
    unit_price: Optional[float] = None
    min_quantity: Optional[float] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class InventoryItemResponse(InventoryItemBase):
    id: str
    farmer_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class InventoryTransactionBase(BaseModel):
    item_id: str
    transaction_type: str  # in, out, return, adjustment
    quantity: float
    price_at_transaction: Optional[float] = None
    total_amount: Optional[float] = None
    notes: Optional[str] = None
    related_to: Optional[str] = None


class InventoryTransactionCreate(InventoryTransactionBase):
    pass


class InventoryTransactionResponse(InventoryTransactionBase):
    id: str
    farmer_id: str
    created_at: datetime

    class Config:
        from_attributes = True


class InventorySummary(BaseModel):
    total_items: int
    total_value: float
    low_stock_items: List[InventoryItemResponse]
    recent_transactions: List[InventoryTransactionResponse]
    categories: List[str]


class InventoryStockAlert(BaseModel):
    item_id: str
    name: str
    current_quantity: float
    min_quantity: float
    unit: str
    status: str  # critical, warning, ok
