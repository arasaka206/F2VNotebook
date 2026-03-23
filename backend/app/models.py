import uuid
from sqlalchemy import Column, String, Float, DateTime, Date, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import declarative_base

Base = declarative_base()

# ─────────────────────────────────────────────────────────────────────────────
# NHÓM 1: BẢNG DỮ LIỆU CƠ SỞ (Có sự kết hợp giữa Nhập thủ công & Tự động)
# ─────────────────────────────────────────────────────────────────────────────
class Livestock(Base):
    __tablename__ = "livestock"

    # [TỰ ĐỘNG] Khóa chính: Tự tạo mã UUID không cần ai nhập
    id = Column(String, primary_key=True, default=lambda: uuid.uuid4().hex)
    
    # [TỰ ĐỘNG] Mã nông dân: Sẽ lấy tự động từ Token đăng nhập của người dùng
    farmer_id = Column(String, index=True, nullable=False)

    # [NHẬP THỦ CÔNG] Các thông tin bắt buộc Nông dân phải gõ vào Form
    species = Column(String, nullable=False)       # Loài (Bò, Lợn...)
    tag_number = Column(String, nullable=False, unique=True) # Số thẻ tai
    
    # [NHẬP THỦ CÔNG] Các thông tin không bắt buộc (có thể để trống)
    birth_date = Column(Date, nullable=True)
    weight_kg = Column(Float, nullable=True)

    # [TỰ ĐỘNG / THỦ CÔNG] Trạng thái mặc định là "Bình thường", có thể sửa sau
    health_status = Column(String, default="Bình thường")

    # [TỰ ĐỘNG] Thời gian tạo: Hệ thống Database tự lấy giờ hiện tại
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# ─────────────────────────────────────────────────────────────────────────────
# NHÓM 2: BẢNG DỮ LIỆU TỰ ĐỘNG 100% (IoT Cảm biến)
# ─────────────────────────────────────────────────────────────────────────────
class SensorReading(Base):
    __tablename__ = "sensor_readings"

    # [TỰ ĐỘNG] Mã bản ghi
    id = Column(String, primary_key=True, default=lambda: uuid.uuid4().hex)
    
    # [TỰ ĐỘNG] Mã chuồng: API tự trích xuất từ định danh của thiết bị IoT gửi lên
    barn_id = Column(String, index=True, nullable=False)

    # [TỰ ĐỘNG & CHO PHÉP NULL] Các chỉ số đo lường. 
    # nullable=True giúp lưu giá trị NULL nếu cảm biến bị lỗi hoặc chưa gửi dữ liệu kịp
    temperature_c = Column(Float, nullable=True)  # Nhiệt độ
    humidity_pct = Column(Float, nullable=True)   # Độ ẩm
    ammonia_ppm = Column(Float, nullable=True)    # Khí Amoniac

    # [TỰ ĐỘNG TÍNH TOÁN] Trạng thái của chuồng (ok, warning, danger)
    # Backend sẽ tự viết logic kiểm tra (VD: temp > 35 -> warning) rồi lưu vào đây
    status = Column(String, default="ok")

    # [TỰ ĐỘNG] Thời gian nhận dữ liệu chính xác đến từng giây
    timestamp = Column(DateTime(timezone=True), server_default=func.now())