from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.database import get_db
from app.models import HeatmapData, Livestock, SensorReading
from app.schemas.heatmap import HeatmapDataOut, HeatmapGridOut
from sqlalchemy import func

router = APIRouter(prefix="/heatmap", tags=["heatmap"])

@router.get("/geo-data")
def get_geo_heatmap_data(
    region: str = Query("Vietnam"), # 'Vietnam', 'Hanoi', 'HCMC', etc.
    data_type: str = Query("health"),
    db: Session = Depends(get_db)
):
    """
    Lấy dữ liệu heatmap dựa trên toạ độ địa lý (lat, lng) theo khu vực.
    """
    query = db.query(HeatmapData).filter(HeatmapData.data_type == data_type)
    
    # Lọc theo vùng nếu không phải là toàn bộ Việt Nam
    if region != "Vietnam":
        query = query.filter(HeatmapData.province == region)
        
    heatmap_points = query.order_by(HeatmapData.timestamp.desc()).limit(1000).all()
    
    grid_data = [
        {
            "latitude": point.latitude,
            "longitude": point.longitude,
            "intensity": point.intensity
        }
        for point in heatmap_points
    ]
    
    return {
        "region": region,
        "data_type": data_type,
        "points": grid_data,
        "timestamp": datetime.utcnow()
    }



@router.get("/data/{barn_id}")
def get_heatmap_data(
    barn_id: str,
    data_type: str = Query("health"),
    db: Session = Depends(get_db)
):
    """
    Lấy dữ liệu heatmap cho một chuồng theo loại dữ liệu (health, temperature, humidity).
    """
    heatmap_points = db.query(HeatmapData).filter(
        HeatmapData.barn_id == barn_id,
        HeatmapData.data_type == data_type
    ).order_by(HeatmapData.timestamp.desc()).limit(100).all()
    
    return [HeatmapDataOut.from_orm(point) for point in heatmap_points]


@router.get("/grid/{barn_id}")
def get_heatmap_grid(
    barn_id: str,
    data_type: str = Query("health"),
    db: Session = Depends(get_db)
):
    """
    Trả về dữ liệu heatmap dạng grid để hiển thị bản đồ nhiệt.
    """
    # Lấy dữ liệu heatmap mới nhất
    latest_data = db.query(HeatmapData).filter(
        HeatmapData.barn_id == barn_id,
        HeatmapData.data_type == data_type
    ).order_by(HeatmapData.timestamp.desc()).limit(100).all()
    
    grid_data = [
        {
            "x": point.location_x,
            "y": point.location_y,
            "intensity": point.intensity
        }
        for point in latest_data
    ]
    
    return HeatmapGridOut(
        barn_id=barn_id,
        data_type=data_type,
        grid_data=grid_data,
        timestamp=datetime.utcnow()
    )


@router.post("/data")
def create_heatmap_data(
    barn_id: str,
    location_x: float,
    location_y: float,
    intensity: float,
    data_type: str = "health",
    db: Session = Depends(get_db)
):
    """
    Tạo một điểm dữ liệu heatmap mới (thường được gọi từ cảm biến IoT).
    """
    heatmap_point = HeatmapData(
        barn_id=barn_id,
        location_x=location_x,
        location_y=location_y,
        intensity=intensity,
        data_type=data_type
    )
    db.add(heatmap_point)
    db.commit()
    db.refresh(heatmap_point)
    return HeatmapDataOut.from_orm(heatmap_point)


@router.get("/summary/{barn_id}")
def get_heatmap_summary(
    barn_id: str,
    db: Session = Depends(get_db)
):
    """
    Trả về tóm tắt dữ liệu heatmap: min, max, average intensity.
    """
    # Lấy dữ liệu từ 24 giờ gần đây
    time_threshold = datetime.utcnow() - timedelta(hours=24)
    
    stats = db.query(
        func.min(HeatmapData.intensity).label("min_intensity"),
        func.max(HeatmapData.intensity).label("max_intensity"),
        func.avg(HeatmapData.intensity).label("avg_intensity"),
        func.count(HeatmapData.id).label("data_points")
    ).filter(
        HeatmapData.barn_id == barn_id,
        HeatmapData.timestamp >= time_threshold
    ).first()
    
    return {
        "barn_id": barn_id,
        "min_intensity": stats.min_intensity or 0,
        "max_intensity": stats.max_intensity or 0,
        "avg_intensity": stats.avg_intensity or 0,
        "data_points": stats.data_points or 0
    }


@router.post("/demo-data/{barn_id}")
def create_demo_heatmap_data(barn_id: str, db: Session = Depends(get_db)):
    """
    Tạo dữ liệu demo để test heatmap visualization.
    Generates sample heatmap points across the barn.
    """
    # Clear existing demo data
    db.query(HeatmapData).filter(HeatmapData.barn_id == barn_id).delete()
    db.commit()
    
    # Generate sample data points in a grid pattern with varying intensity
    import random
    demo_points = []
    
    for x in range(10, 100, 15):  # 10, 25, 40, 55, 70, 85
        for y in range(10, 100, 15):
            # Create varied intensity with some hotspots
            base_intensity = 45 + random.uniform(-15, 15)
            
            # Add some hotspots
            if (x in [55, 70]) and (y in [55, 70]):
                base_intensity = 75 + random.uniform(-5, 10)
            
            intensity = max(10, min(100, base_intensity))
            
            point = HeatmapData(
                barn_id=barn_id,
                location_x=float(x),
                location_y=float(y),
                intensity=intensity,
                data_type="health"
            )
            demo_points.append(point)
    
    db.add_all(demo_points)
    db.commit()
    
    return {
        "message": f"Demo data created for {barn_id}",
        "points_created": len(demo_points)
    }


@router.post("/from-sensors/{barn_id}")
def generate_heatmap_from_sensors(barn_id: str, db: Session = Depends(get_db)):
    """
    Generate heatmap data from real sensor readings.
    Maps sensor locations to heatmap grid and calculates intensity from sensor metrics.
    """
    # Get all sensor readings for this barn
    latest_sensors = db.query(SensorReading).filter(
        SensorReading.barn_id == barn_id
    ).order_by(SensorReading.timestamp.desc()).limit(50).all()
    
    if not latest_sensors:
        return {"message": "No sensor data found for this barn", "points_created": 0}
    
    # Clear old heatmap data
    db.query(HeatmapData).filter(HeatmapData.barn_id == barn_id).delete()
    db.commit()
    
    heatmap_points = []
    
    # Process each sensor reading and distribute across barn grid
    for idx, sensor in enumerate(latest_sensors):
        # Calculate location based on sensor sequence (distribute across barn)
        location_x = 10 + ((idx % 5) * 18)  # 5 columns
        location_y = 10 + ((idx // 5) * 18)  # Multiple rows
        
        # Calculate intensity from sensor metrics (0-100 scale)
        intensity = 50  # baseline
        
        # Temperature contribution (optimal: 20-25°C)
        if sensor.temperature_c:
            temp = sensor.temperature_c
            if 20 <= temp <= 25:
                temp_intensity = 30  # Good
            elif 15 <= temp < 30:
                temp_intensity = 50  # Acceptable
            else:
                temp_intensity = 75  # Warning/Critical
            intensity = (intensity + temp_intensity) / 2
        
        # Humidity contribution (optimal: 60-70%)
        if sensor.humidity_pct:
            humidity = sensor.humidity_pct
            if 60 <= humidity <= 70:
                humidity_intensity = 30  # Good
            elif 50 <= humidity < 80:
                humidity_intensity = 50  # Acceptable
            else:
                humidity_intensity = 75  # Warning/Critical
            intensity = (intensity + humidity_intensity) / 2
        
        # Ammonia contribution (optimal: <10 ppm)
        if sensor.ammonia_ppm:
            ammonia = sensor.ammonia_ppm
            if ammonia < 10:
                ammonia_intensity = 30  # Good
            elif ammonia < 20:
                ammonia_intensity = 50  # Acceptable
            else:
                ammonia_intensity = 85  # Critical
            intensity = (intensity + ammonia_intensity) / 2
        
        # Adjust based on sensor status
        if sensor.status == "danger":
            intensity = min(100, intensity + 30)
        elif sensor.status == "warning":
            intensity = min(100, intensity + 15)
        
        point = HeatmapData(
            barn_id=barn_id,
            location_x=location_x,
            location_y=location_y,
            intensity=intensity,
            data_type="health"
        )
        heatmap_points.append(point)
    
    db.add_all(heatmap_points)
    db.commit()
    
    return {
        "message": f"Heatmap generated from {len(heatmap_points)} sensor readings",
        "points_created": len(heatmap_points)
    }
