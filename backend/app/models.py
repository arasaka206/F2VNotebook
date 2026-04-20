import uuid
from sqlalchemy import Column, String, Float, DateTime, Date, ForeignKey, Integer, Text, Boolean
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


# ─────────────────────────────────────────────────────────────────────────────
# NHÓM 3: HEATMAP DATA (Bản đồ nhiệt - trực quan hóa dữ liệu cảm biến)
# ─────────────────────────────────────────────────────────────────────────────
class HeatmapData(Base):
    __tablename__ = "heatmap_data"

    id = Column(String, primary_key=True, default=lambda: uuid.uuid4().hex)
    barn_id = Column(String, index=True, nullable=False)
    
    # Vị trí trên bản đồ (X, Y coordinates)
    location_x = Column(Float, nullable=False)
    location_y = Column(Float, nullable=False)
    
    # Giá trị cường độ (0-100)
    intensity = Column(Float, nullable=False)  # Độ mạnh (dựa trên health_score)
    
    # Loại dữ liệu heatmap
    data_type = Column(String, default="health")  # health, temperature, humidity, etc.
    
    timestamp = Column(DateTime(timezone=True), server_default=func.now())


# ─────────────────────────────────────────────────────────────────────────────
# NHÓM 4: PUBLIC DASHBOARD - FORUM (Diễn đàn công cộng)
# ─────────────────────────────────────────────────────────────────────────────
class ForumPost(Base):
    __tablename__ = "forum_posts"

    id = Column(String, primary_key=True, default=lambda: uuid.uuid4().hex)
    author_id = Column(String, index=True, nullable=False)
    author_name = Column(String, nullable=False)
    
    # Nội dung bài viết
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    
    # Số lượng reactions
    reaction_count = Column(Integer, default=0)
    comment_count = Column(Integer, default=0)
    
    # Trạng thái
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class ForumComment(Base):
    __tablename__ = "forum_comments"

    id = Column(String, primary_key=True, default=lambda: uuid.uuid4().hex)
    post_id = Column(String, ForeignKey("forum_posts.id"), nullable=False, index=True)
    author_id = Column(String, index=True, nullable=False)
    author_name = Column(String, nullable=False)
    
    # Nội dung bình luận
    content = Column(Text, nullable=False)
    
    # Số lượng reactions trên comment
    reaction_count = Column(Integer, default=0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class ForumReaction(Base):
    __tablename__ = "forum_reactions"

    id = Column(String, primary_key=True, default=lambda: uuid.uuid4().hex)
    
    # Phản ứng có thể là cho Post hoặc Comment
    post_id = Column(String, ForeignKey("forum_posts.id"), nullable=True, index=True)
    comment_id = Column(String, ForeignKey("forum_comments.id"), nullable=True, index=True)
    
    # Người phản ứng
    user_id = Column(String, index=True, nullable=False)
    reaction_type = Column(String, default="like")  # like, love, haha, sad, angry
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ForumHashtag(Base):
    __tablename__ = "forum_hashtags"

    id = Column(String, primary_key=True, default=lambda: uuid.uuid4().hex)
    post_id = Column(String, ForeignKey("forum_posts.id"), nullable=False, index=True)
    tag = Column(String, nullable=False, index=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())