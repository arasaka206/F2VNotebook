from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List

from app.database import get_db
from app.models import InventoryItem, InventoryTransaction
from app.schemas.inventory import (
    InventoryItemResponse,
    InventoryItemCreate,
    InventoryItemUpdate,
    InventoryTransactionResponse,
    InventoryTransactionCreate,
    InventorySummary,
    InventoryStockAlert,
)

router = APIRouter(prefix="/api/inventory", tags=["inventory"])


def get_current_user_id(db: Session = Depends(get_db)) -> str:
    """Get current user ID from request. In production, this would validate JWT token."""
    # For now, return a default user ID. This should be implemented with proper JWT validation
    return "farmer_default"


# ============= INVENTORY ITEMS =============


@router.get("/items", response_model=List[InventoryItemResponse])
def get_inventory_items(
    category: str = Query(None),
    db: Session = Depends(get_db),
    farmer_id: str = Depends(get_current_user_id),
):
    """Get all inventory items for the farmer, optionally filtered by category."""
    query = db.query(InventoryItem).filter(InventoryItem.farmer_id == farmer_id)
    
    if category:
        query = query.filter(InventoryItem.category == category)
    
    return query.all()


@router.get("/items/{item_id}", response_model=InventoryItemResponse)
def get_inventory_item(
    item_id: str,
    db: Session = Depends(get_db),
    farmer_id: str = Depends(get_current_user_id),
):
    """Get a specific inventory item."""
    item = db.query(InventoryItem).filter(
        InventoryItem.id == item_id,
        InventoryItem.farmer_id == farmer_id
    ).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    return item


@router.post("/items", response_model=InventoryItemResponse)
def create_inventory_item(
    item: InventoryItemCreate,
    db: Session = Depends(get_db),
    farmer_id: str = Depends(get_current_user_id),
):
    """Create a new inventory item."""
    db_item = InventoryItem(
        **item.dict(),
        farmer_id=farmer_id
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


@router.put("/items/{item_id}", response_model=InventoryItemResponse)
def update_inventory_item(
    item_id: str,
    item_update: InventoryItemUpdate,
    db: Session = Depends(get_db),
    farmer_id: str = Depends(get_current_user_id),
):
    """Update an inventory item."""
    db_item = db.query(InventoryItem).filter(
        InventoryItem.id == item_id,
        InventoryItem.farmer_id == farmer_id
    ).first()
    
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    update_data = item_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)
    
    db.commit()
    db.refresh(db_item)
    return db_item


@router.delete("/items/{item_id}")
def delete_inventory_item(
    item_id: str,
    db: Session = Depends(get_db),
    farmer_id: str = Depends(get_current_user_id),
):
    """Delete an inventory item (soft delete by marking inactive)."""
    db_item = db.query(InventoryItem).filter(
        InventoryItem.id == item_id,
        InventoryItem.farmer_id == farmer_id
    ).first()
    
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    db_item.is_active = False
    db.commit()
    return {"message": "Item deleted successfully"}


# ============= INVENTORY TRANSACTIONS =============


@router.post("/transactions", response_model=InventoryTransactionResponse)
def create_transaction(
    transaction: InventoryTransactionCreate,
    db: Session = Depends(get_db),
    farmer_id: str = Depends(get_current_user_id),
):
    """Create a new inventory transaction and update item quantity."""
    # Verify item exists
    item = db.query(InventoryItem).filter(
        InventoryItem.id == transaction.item_id,
        InventoryItem.farmer_id == farmer_id
    ).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # Update item quantity based on transaction type
    if transaction.transaction_type == "in":
        item.quantity += transaction.quantity
    elif transaction.transaction_type == "out":
        if item.quantity < transaction.quantity:
            raise HTTPException(status_code=400, detail="Insufficient quantity")
        item.quantity -= transaction.quantity
    elif transaction.transaction_type == "return":
        item.quantity += transaction.quantity
    elif transaction.transaction_type == "adjustment":
        item.quantity = transaction.quantity
    
    # Create transaction record
    db_transaction = InventoryTransaction(
        **transaction.dict(),
        farmer_id=farmer_id
    )
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    
    return db_transaction


@router.get("/transactions", response_model=List[InventoryTransactionResponse])
def get_transactions(
    item_id: str = Query(None),
    transaction_type: str = Query(None),
    db: Session = Depends(get_db),
    farmer_id: str = Depends(get_current_user_id),
):
    """Get transaction history for the farmer."""
    query = db.query(InventoryTransaction).filter(
        InventoryTransaction.farmer_id == farmer_id
    )
    
    if item_id:
        query = query.filter(InventoryTransaction.item_id == item_id)
    
    if transaction_type:
        query = query.filter(InventoryTransaction.transaction_type == transaction_type)
    
    return query.order_by(InventoryTransaction.created_at.desc()).all()


# ============= INVENTORY SUMMARY =============


@router.get("/summary", response_model=InventorySummary)
def get_inventory_summary(
    db: Session = Depends(get_db),
    farmer_id: str = Depends(get_current_user_id),
):
    """Get a summary of inventory status."""
    items = db.query(InventoryItem).filter(
        InventoryItem.farmer_id == farmer_id,
        InventoryItem.is_active == True
    ).all()
    
    total_value = sum(
        (item.unit_cost or item.unit_price or 0) * item.quantity
        for item in items
    )
    
    low_stock_items = [
        item for item in items
        if item.quantity <= item.min_quantity
    ]
    
    categories = list(set(item.category for item in items))
    
    recent_transactions = db.query(InventoryTransaction).filter(
        InventoryTransaction.farmer_id == farmer_id
    ).order_by(InventoryTransaction.created_at.desc()).limit(10).all()
    
    return {
        "total_items": len(items),
        "total_value": total_value,
        "low_stock_items": low_stock_items,
        "recent_transactions": recent_transactions,
        "categories": categories,
    }


@router.get("/alerts/stock", response_model=List[InventoryStockAlert])
def get_stock_alerts(
    db: Session = Depends(get_db),
    farmer_id: str = Depends(get_current_user_id),
):
    """Get stock alerts for items below minimum quantity."""
    items = db.query(InventoryItem).filter(
        InventoryItem.farmer_id == farmer_id,
        InventoryItem.is_active == True
    ).all()
    
    alerts = []
    for item in items:
        if item.quantity <= item.min_quantity:
            if item.quantity == 0:
                status = "critical"
            elif item.quantity <= item.min_quantity * 1.5:
                status = "warning"
            else:
                status = "ok"
            
            alerts.append(
                InventoryStockAlert(
                    item_id=item.id,
                    name=item.name,
                    current_quantity=item.quantity,
                    min_quantity=item.min_quantity,
                    unit=item.unit,
                    status=status,
                )
            )
    
    return sorted(alerts, key=lambda x: x.status == "critical", reverse=True)
