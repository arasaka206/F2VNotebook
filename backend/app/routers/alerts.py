from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database import get_db
from app.models import Alert
from app.schemas.alert import AlertCreate, AlertUpdate, AlertOut
import uuid

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("/alarming", response_model=list[AlertOut])
def get_alarming_notifications(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Get active alarming notifications (critical and warning severity)."""
    alerts = db.query(Alert).filter(
        Alert.is_active == True,
        Alert.alert_type == "alarming",
        Alert.severity.in_(["warning", "critical"])
    ).order_by(desc(Alert.created_at)).limit(limit).all()

    return alerts


@router.get("/", response_model=list[AlertOut])
def get_alerts(
    alert_type: str = Query(None),
    severity: str = Query(None),
    scope: str = Query(None),
    is_active: bool = Query(True),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get alerts with optional filtering."""
    query = db.query(Alert).filter(Alert.is_active == is_active)

    if alert_type:
        query = query.filter(Alert.alert_type == alert_type)
    if severity:
        query = query.filter(Alert.severity == severity)
    if scope:
        query = query.filter(Alert.scope == scope)

    alerts = query.order_by(desc(Alert.created_at)).limit(limit).all()
    return alerts


@router.post("/", response_model=AlertOut)
def create_alert(
    alert_data: AlertCreate,
    created_by: str = Query(None),
    db: Session = Depends(get_db)
):
    """Create a new alert (admin/system only)."""
    alert = Alert(
        **alert_data.model_dump(),
        created_by=created_by
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert


@router.put("/{alert_id}", response_model=AlertOut)
def update_alert(
    alert_id: str,
    alert_update: AlertUpdate,
    db: Session = Depends(get_db)
):
    """Update an alert (mark as read, deactivate, etc.)."""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    update_data = alert_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(alert, field, value)

    db.commit()
    db.refresh(alert)
    return alert


@router.put("/{alert_id}/read")
def mark_alert_as_read(
    alert_id: str,
    db: Session = Depends(get_db)
):
    """Mark a specific alert as read."""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    alert.is_read = True
    db.commit()
    return {"message": "Alert marked as read"}


@router.delete("/{alert_id}")
def delete_alert(
    alert_id: str,
    db: Session = Depends(get_db)
):
    """Delete an alert (admin only)."""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    db.delete(alert)
    db.commit()
    return {"message": "Alert deleted"}