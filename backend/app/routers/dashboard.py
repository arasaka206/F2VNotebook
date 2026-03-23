from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Livestock, SensorReading

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    # 1. Đếm tổng số vật nuôi đang có trong Database
    total_livestock = db.query(Livestock).count()

    # 2. Lấy chỉ số cảm biến mới nhất vừa gửi lên
    latest_sensor = db.query(SensorReading).order_by(SensorReading.timestamp.desc()).first()
    
    sensor_data = {
        "temperature_c": latest_sensor.temperature_c if latest_sensor and latest_sensor.temperature_c else 0,
        "humidity_pct": latest_sensor.humidity_pct if latest_sensor and latest_sensor.humidity_pct else 0,
        "ammonia_ppm": latest_sensor.ammonia_ppm if latest_sensor and latest_sensor.ammonia_ppm else 0,
        "status": latest_sensor.status if latest_sensor else "ok",
    }

    # 3. Logic tự động: Bắt đầu với 100 điểm. Trừ điểm nếu môi trường xấu.
    health_score = 100
    if sensor_data["status"] == "warning":
        health_score -= 25  # Còn 75 điểm (Màu vàng)
    elif sensor_data["status"] == "danger":
        health_score -= 45  # Còn 55 điểm (Màu đỏ)

    # 4. Trả dữ liệu về cho Frontend hiển thị
    return {
        "herd_health_score": health_score,
        "active_treatment_cases": 0, # Chưa nối DB nên tạm để 0
        "total_livestock": total_livestock,
        "disease_alert_level": "low",
        "latest_sensor": sensor_data,
        "activity_stream": [
            {
                "id": "system-msg",
                "timestamp": "2024-05-20T00:00:00Z",
                "type": "ai_note",
                "message": "Hệ thống đã kết nối Database thật thành công!"
            }
        ]
    }