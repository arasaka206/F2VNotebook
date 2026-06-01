from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime, date, timedelta
from typing import List, Optional, Dict, Any
import json
from dateutil.relativedelta import relativedelta

from app.database import get_db
from app.models import (
    AnalyticsReport, Sale, Production, InventoryItem,
    InventoryTransaction
)
from app.schemas.analytics import (
    AnalyticsReportResponse,
    AnalyticsReportBase,
    AnalyticsSummary,
    RevenueBreakdown,
    CostBreakdown,
    AnalyticsChartData,
    SaleCreate,
    SaleResponse,
    ProductionCreate,
    ProductionResponse,
)

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


def get_current_user_id(db: Session = Depends(get_db)) -> str:
    """Get current user ID from request. In production, this would validate JWT token."""
    return "farmer_default"


def calculate_period_dates(period_type: str, end_date: Optional[date] = None) -> tuple[date, date]:
    """Calculate start and end dates for a period."""
    if end_date is None:
        end_date = date.today()
    
    if period_type == "daily":
        start_date = end_date
    elif period_type == "weekly":
        start_date = end_date - timedelta(days=end_date.weekday())
    elif period_type == "monthly":
        start_date = end_date.replace(day=1)
    elif period_type == "quarterly":
        quarter = (end_date.month - 1) // 3
        start_date = end_date.replace(month=quarter * 3 + 1, day=1)
    elif period_type == "yearly":
        start_date = end_date.replace(month=1, day=1)
    else:
        start_date = end_date - timedelta(days=30)
    
    return start_date, end_date


def calculate_report_data(
    farmer_id: str,
    start_date: date,
    end_date: date,
    db: Session
) -> Dict[str, Any]:
    """Calculate analytics data for a given period."""
    
    # Get sales data
    sales = db.query(Sale).filter(
        Sale.farmer_id == farmer_id,
        Sale.sale_date >= start_date,
        Sale.sale_date <= end_date
    ).all()
    
    total_revenue = sum(sale.total_amount for sale in sales)
    
    # Get inventory transactions for cost calculations
    transactions = db.query(InventoryTransaction).filter(
        InventoryTransaction.farmer_id == farmer_id,
        InventoryTransaction.created_at >= datetime.combine(start_date, datetime.min.time()),
        InventoryTransaction.created_at <= datetime.combine(end_date, datetime.max.time())
    ).all()
    
    # Calculate costs by type (simplified - in real app, would categorize better)
    total_feed_cost = 0
    total_medicine_cost = 0
    total_equipment_cost = 0
    total_other_cost = 0
    
    for trans in transactions:
        if trans.transaction_type == "in" and trans.total_amount:
            item = db.query(InventoryItem).filter(
                InventoryItem.id == trans.item_id
            ).first()
            if item:
                amount = trans.total_amount or 0
                if "feed" in item.category.lower():
                    total_feed_cost += amount
                elif "medicine" in item.category.lower():
                    total_medicine_cost += amount
                elif "equipment" in item.category.lower():
                    total_equipment_cost += amount
                else:
                    total_other_cost += amount
    
    total_cost = total_feed_cost + total_medicine_cost + total_equipment_cost + total_other_cost
    net_profit = total_revenue - total_cost
    profit_margin = (net_profit / total_revenue * 100) if total_revenue > 0 else 0
    
    # Get production data
    productions = db.query(Production).filter(
        Production.farmer_id == farmer_id,
        Production.production_date >= start_date,
        Production.production_date <= end_date
    ).all()
    
    total_production_quantity = sum(p.quantity for p in productions)
    production_unit = productions[0].unit if productions else None
    
    # Calculate inventory value
    items = db.query(InventoryItem).filter(
        InventoryItem.farmer_id == farmer_id,
        InventoryItem.is_active == True
    ).all()
    
    inventory_value = sum(
        (item.unit_cost or item.unit_price or 0) * item.quantity
        for item in items
    )
    
    low_stock_items = len([
        item for item in items
        if item.quantity <= item.min_quantity
    ])
    
    # Calculate efficiency metrics
    production_efficiency = 0
    cost_per_unit = 0
    revenue_per_unit = 0
    
    if total_production_quantity > 0:
        cost_per_unit = total_cost / total_production_quantity
        revenue_per_unit = total_revenue / total_production_quantity
        production_efficiency = (total_production_quantity / max(len(items), 1)) * 10
        production_efficiency = min(100, production_efficiency)
    
    # Generate recommendations
    recommendations = generate_recommendations(
        total_revenue, total_cost, net_profit, low_stock_items,
        production_efficiency, cost_per_unit
    )
    
    return {
        "total_revenue": total_revenue,
        "total_feed_cost": total_feed_cost,
        "total_medicine_cost": total_medicine_cost,
        "total_equipment_cost": total_equipment_cost,
        "total_labor_cost": 0,  # Could be integrated from other data
        "total_other_cost": total_other_cost,
        "total_cost": total_cost,
        "net_profit": net_profit,
        "profit_margin": profit_margin,
        "total_production_quantity": total_production_quantity,
        "production_unit": production_unit,
        "inventory_value": inventory_value,
        "low_stock_items": low_stock_items,
        "production_efficiency": production_efficiency,
        "cost_per_unit": cost_per_unit,
        "revenue_per_unit": revenue_per_unit,
        "recommendations": recommendations,
        "is_analyzed": True,
    }


def get_or_refresh_report(
    period_type: str,
    end_date: Optional[date],
    db: Session,
    farmer_id: str,
) -> AnalyticsReport:
    if end_date is None:
        end_date = date.today()

    start_date, end_date = calculate_period_dates(period_type, end_date)

    existing_report = db.query(AnalyticsReport).filter(
        AnalyticsReport.farmer_id == farmer_id,
        AnalyticsReport.period_type == period_type,
        AnalyticsReport.start_date == start_date,
        AnalyticsReport.end_date == end_date,
    ).first()

    data = calculate_report_data(farmer_id, start_date, end_date, db)

    if existing_report:
        for key, value in data.items():
            setattr(existing_report, key, value)
        db.commit()
        db.refresh(existing_report)
        return existing_report

    report = AnalyticsReport(
        farmer_id=farmer_id,
        period_type=period_type,
        start_date=start_date,
        end_date=end_date,
        **data
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


def get_chart_period_range(
    period_type: str,
    current_end_date: date,
    offset: int,
) -> tuple[date, date]:
    if period_type == "daily":
        anchor_date = current_end_date - timedelta(days=offset)
        return anchor_date, anchor_date

    if period_type == "weekly":
        anchor_date = current_end_date - timedelta(weeks=offset)
        start_date = anchor_date - timedelta(days=anchor_date.weekday())
        if offset == 0:
            return start_date, current_end_date
        return start_date, start_date + timedelta(days=6)

    if period_type == "monthly":
        anchor_date = current_end_date - relativedelta(months=offset)
        start_date = anchor_date.replace(day=1)
        if offset == 0:
            return start_date, current_end_date
        end_date = (start_date + relativedelta(months=1)) - timedelta(days=1)
        return start_date, end_date

    if period_type == "quarterly":
        anchor_date = current_end_date - relativedelta(months=3 * offset)
        quarter = (anchor_date.month - 1) // 3
        start_date = anchor_date.replace(month=quarter * 3 + 1, day=1)
        if offset == 0:
            return start_date, current_end_date
        end_date = (start_date + relativedelta(months=3)) - timedelta(days=1)
        return start_date, end_date

    if period_type == "yearly":
        anchor_date = current_end_date - relativedelta(years=offset)
        start_date = anchor_date.replace(month=1, day=1)
        if offset == 0:
            return start_date, current_end_date
        end_date = anchor_date.replace(month=12, day=31)
        return start_date, end_date

    anchor_date = current_end_date - timedelta(days=offset)
    return anchor_date, anchor_date


def generate_recommendations(
    revenue: float, cost: float, profit: float,
    low_stock: int, efficiency: float, cost_per_unit: float
) -> str:
    """Generate business recommendations based on analytics."""
    recommendations = []
    
    if profit < 0:
        recommendations.append({
            "title": "Negative Profit",
            "description": "Your farm is operating at a loss this period.",
            "priority": "high",
            "action": "Review expenses and consider optimizing costs or increasing production.",
            "estimated_impact": "Could increase profitability by 20-30%"
        })
    elif profit < revenue * 0.1:
        recommendations.append({
            "title": "Low Profit Margin",
            "description": "Profit margin is below 10% which is concerning.",
            "priority": "high",
            "action": "Reduce operational costs or increase selling prices.",
            "estimated_impact": "Could increase profitability by 10-20%"
        })
    
    if low_stock > 0:
        recommendations.append({
            "title": "Low Stock Alert",
            "description": f"You have {low_stock} items with low inventory levels.",
            "priority": "medium",
            "action": "Plan inventory replenishment to avoid shortages.",
            "estimated_impact": "Prevent production disruptions"
        })
    
    if efficiency < 50:
        recommendations.append({
            "title": "Low Production Efficiency",
            "description": "Production efficiency is below 50%.",
            "priority": "medium",
            "action": "Review production processes and resource allocation.",
            "estimated_impact": "Could increase efficiency by 20-40%"
        })
    else:
        recommendations.append({
            "title": "Good Production Efficiency",
            "description": f"Your production efficiency is at {efficiency:.1f}%.",
            "priority": "low",
            "action": "Maintain current operations and monitor continuously.",
            "estimated_impact": "Sustainable production levels"
        })
    
    return json.dumps(recommendations)


# ============= SALES MANAGEMENT =============


@router.post("/sales", response_model=SaleResponse)
def create_sale(
    sale: SaleCreate,
    db: Session = Depends(get_db),
    farmer_id: str = Depends(get_current_user_id),
):
    """Record a sale."""
    db_sale = Sale(**sale.dict(), farmer_id=farmer_id)
    db.add(db_sale)
    db.commit()
    db.refresh(db_sale)

    for period in ["daily", "weekly", "monthly", "quarterly", "yearly"]:
        get_or_refresh_report(period, date.today(), db, farmer_id)

    return db_sale


@router.get("/sales", response_model=List[SaleResponse])
def get_sales(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    farmer_id: str = Depends(get_current_user_id),
):
    """Get sales records for the farmer."""
    query = db.query(Sale).filter(Sale.farmer_id == farmer_id)
    
    if start_date:
        query = query.filter(Sale.sale_date >= start_date)
    if end_date:
        query = query.filter(Sale.sale_date <= end_date)
    
    return query.order_by(Sale.sale_date.desc()).all()


# ============= PRODUCTION MANAGEMENT =============


@router.post("/production", response_model=ProductionResponse)
def create_production(
    production: ProductionCreate,
    db: Session = Depends(get_db),
    farmer_id: str = Depends(get_current_user_id),
):
    """Record production."""
    db_production = Production(**production.dict(), farmer_id=farmer_id)
    db.add(db_production)
    db.commit()
    db.refresh(db_production)

    for period in ["daily", "weekly", "monthly", "quarterly", "yearly"]:
        get_or_refresh_report(period, date.today(), db, farmer_id)

    return db_production


@router.get("/production", response_model=List[ProductionResponse])
def get_production(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    production_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    farmer_id: str = Depends(get_current_user_id),
):
    """Get production records for the farmer."""
    query = db.query(Production).filter(Production.farmer_id == farmer_id)
    
    if start_date:
        query = query.filter(Production.production_date >= start_date)
    if end_date:
        query = query.filter(Production.production_date <= end_date)
    if production_type:
        query = query.filter(Production.production_type == production_type)
    
    return query.order_by(Production.production_date.desc()).all()


# ============= ANALYTICS REPORTS =============


@router.post("/report", response_model=AnalyticsReportResponse)
def create_report(
    period_type: str = Query("monthly"),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    farmer_id: str = Depends(get_current_user_id),
):
    """Create or update an analytics report for a period."""
    start_date, end_date = calculate_period_dates(period_type, end_date)
    
    # Check if report already exists
    existing_report = db.query(AnalyticsReport).filter(
        AnalyticsReport.farmer_id == farmer_id,
        AnalyticsReport.period_type == period_type,
        AnalyticsReport.start_date == start_date,
        AnalyticsReport.end_date == end_date,
    ).first()
    
    data = calculate_report_data(farmer_id, start_date, end_date, db)
    
    if existing_report:
        # Update existing report
        for key, value in data.items():
            setattr(existing_report, key, value)
        db.commit()
        db.refresh(existing_report)
        return existing_report
    else:
        # Create new report
        report = AnalyticsReport(
            farmer_id=farmer_id,
            period_type=period_type,
            start_date=start_date,
            end_date=end_date,
            **data
        )
        db.add(report)
        db.commit()
        db.refresh(report)
        return report


@router.get("/report", response_model=AnalyticsReportResponse)
def get_latest_report(
    period_type: str = Query("monthly"),
    db: Session = Depends(get_db),
    farmer_id: str = Depends(get_current_user_id),
):
    """Get the latest report for a given period type."""
    return get_or_refresh_report(period_type, None, db, farmer_id)


@router.get("/summary", response_model=AnalyticsSummary)
def get_analytics_summary(
    period_type: str = Query("monthly"),
    db: Session = Depends(get_db),
    farmer_id: str = Depends(get_current_user_id),
):
    """Get analytics summary with comparison to previous period."""
    # Get current period and refresh it from source data
    current_report = get_or_refresh_report(period_type, None, db, farmer_id)

    # Get previous period
    previous_report = db.query(AnalyticsReport).filter(
        AnalyticsReport.farmer_id == farmer_id,
        AnalyticsReport.period_type == period_type,
        AnalyticsReport.end_date < current_report.start_date
    ).order_by(AnalyticsReport.end_date.desc()).first()
    
    comparison = None
    if previous_report:
        comparison = {
            "revenue_change": current_report.total_revenue - previous_report.total_revenue,
            "revenue_change_pct": (
                (current_report.total_revenue - previous_report.total_revenue) / 
                max(previous_report.total_revenue, 1) * 100
            ),
            "profit_change": current_report.net_profit - previous_report.net_profit,
            "profit_change_pct": (
                (current_report.net_profit - previous_report.net_profit) /
                max(abs(previous_report.net_profit), 1) * 100
            ),
            "cost_change": current_report.total_cost - previous_report.total_cost,
            "efficiency_change": current_report.production_efficiency - previous_report.production_efficiency,
        }
    
    return {
        "current_period": current_report,
        "previous_period": previous_report,
        "comparison": comparison,
    }


@router.get("/revenue-breakdown", response_model=List[RevenueBreakdown])
def get_revenue_breakdown(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    farmer_id: str = Depends(get_current_user_id),
):
    """Get revenue breakdown by product."""
    if not start_date:
        start_date = date.today() - timedelta(days=30)
    if not end_date:
        end_date = date.today()
    
    sales = db.query(Sale).filter(
        Sale.farmer_id == farmer_id,
        Sale.sale_date >= start_date,
        Sale.sale_date <= end_date
    ).all()
    
    revenue_by_item = {}
    for sale in sales:
        if sale.item_name not in revenue_by_item:
            revenue_by_item[sale.item_name] = {"quantity": 0, "revenue": 0}
        revenue_by_item[sale.item_name]["quantity"] += sale.quantity
        revenue_by_item[sale.item_name]["revenue"] += sale.total_amount
    
    total_revenue = sum(item["revenue"] for item in revenue_by_item.values())
    
    breakdown = []
    for item_name, data in revenue_by_item.items():
        breakdown.append(
            RevenueBreakdown(
                item_name=item_name,
                quantity=data["quantity"],
                revenue=data["revenue"],
                percentage=(data["revenue"] / total_revenue * 100) if total_revenue > 0 else 0,
            )
        )
    
    return sorted(breakdown, key=lambda x: x.revenue, reverse=True)


@router.get("/chart-data", response_model=AnalyticsChartData)
def get_chart_data(
    period_type: str = Query("monthly"),
    months: int = Query(6),
    db: Session = Depends(get_db),
    farmer_id: str = Depends(get_current_user_id),
):
    """Get chart data for multiple periods."""
    data_points = []
    revenues = []
    costs = []
    profits = []

    current_end_date = date.today()

    for offset in range(months - 1, -1, -1):
        start_date, end_date = get_chart_period_range(period_type, current_end_date, offset)

        report = db.query(AnalyticsReport).filter(
            AnalyticsReport.farmer_id == farmer_id,
            AnalyticsReport.period_type == period_type,
            AnalyticsReport.start_date == start_date,
            AnalyticsReport.end_date == end_date,
        ).first()

        if not report:
            report = get_or_refresh_report(period_type, end_date, db, farmer_id)
        else:
            report = get_or_refresh_report(period_type, end_date, db, farmer_id)

        if period_type == "daily":
            label = start_date.strftime("%b %d")
        elif period_type == "weekly":
            label = f"{start_date.strftime('%b %d')}"
        elif period_type == "monthly":
            label = start_date.strftime("%b %Y")
        elif period_type == "quarterly":
            label = f"Q{((start_date.month - 1) // 3) + 1} {start_date.year}"
        elif period_type == "yearly":
            label = start_date.strftime("%Y")
        else:
            label = start_date.strftime("%b %d")

        data_points.append(label)
        revenues.append(float(report.total_revenue))
        costs.append(float(report.total_cost))
        profits.append(float(report.net_profit))

    total_revenue = sum(revenues)
    total_cost = sum(costs)
    total_profit = sum(profits)

    return AnalyticsChartData(
        labels=data_points,
        datasets=[
            {"label": "Revenue", "data": revenues, "borderColor": "rgb(75, 192, 75)"},
            {"label": "Costs", "data": costs, "borderColor": "rgb(255, 99, 132)"},
            {"label": "Net Profit", "data": profits, "borderColor": "rgb(54, 162, 235)"},
        ],
        period=period_type,
        total_revenue=total_revenue,
        total_cost=total_cost,
        net_profit=total_profit,
    )
