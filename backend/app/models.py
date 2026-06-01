import uuid
from sqlalchemy import Column, String, Float, DateTime, Date, ForeignKey, Integer, Text, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import declarative_base
from datetime import datetime

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


# ─────────────────────────────────────────────────────────────────────────────
# NHÓM 5: ALERTS & NOTIFICATIONS (Cảnh báo và thông báo)
# ─────────────────────────────────────────────────────────────────────────────
class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String, primary_key=True, default=lambda: uuid.uuid4().hex)
    
    # Loại alert: alarming (cảnh báo nghiêm trọng), info (thông tin), warning (cảnh báo)
    alert_type = Column(String, default="info")
    
    # Mức độ nghiêm trọng
    severity = Column(String, default="info")  # info, warning, critical
    
    # Tiêu đề và nội dung
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    
    # Phạm vi: global (toàn hệ thống), region (vùng), farm (trang trại cụ thể)
    scope = Column(String, default="global")
    
    # ID của farm hoặc region nếu scope không phải global
    target_id = Column(String, nullable=True)
    
    # Trạng thái
    is_active = Column(Boolean, default=True)
    is_read = Column(Boolean, default=False)
    
    # Người tạo (admin hoặc system)
    created_by = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


# ─────────────────────────────────────────────────────────────────────────────
# NHÓM 6: REPORTS & MODERATION (Báo cáo và kiểm duyệt)
# ─────────────────────────────────────────────────────────────────────────────
class Report(Base):
    __tablename__ = "reports"

    id = Column(String, primary_key=True, default=lambda: uuid.uuid4().hex)
    
    # Loại đối tượng bị báo cáo: post, comment, user
    target_type = Column(String, nullable=False)
    
    # ID của đối tượng bị báo cáo
    target_id = Column(String, nullable=False, index=True)
    
    # Người báo cáo
    reporter_id = Column(String, index=True, nullable=False)
    
    # Lý do báo cáo
    reason = Column(String, nullable=False)
    
    # Mô tả chi tiết
    description = Column(Text, nullable=True)
    
    # Trạng thái: pending, reviewed, resolved, dismissed
    status = Column(String, default="pending")
    
    # Người xử lý (admin/moderator)
    reviewed_by = Column(String, nullable=True)
    
    # Ghi chú của người xử lý
    review_notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


# ─────────────────────────────────────────────────────────────────────────────
# NHÓM 7: QUIZZES & EDUCATION (Bài kiểm tra và giáo dục)
# ─────────────────────────────────────────────────────────────────────────────
class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(String, primary_key=True, default=lambda: uuid.uuid4().hex)
    
    # Tiêu đề bài quiz
    title = Column(String, nullable=False)
    
    # Mô tả
    description = Column(Text, nullable=True)
    
    # Chủ đề (outbreak, health, treatment, etc.)
    topic = Column(String, nullable=False)
    
    # Mức độ khó (beginner, intermediate, advanced)
    difficulty = Column(String, default="intermediate")
    
    # Thời gian làm bài (phút)
    time_limit = Column(Integer, nullable=True)
    
    # Điểm pass
    passing_score = Column(Float, default=70.0)
    
    # Trạng thái: active, inactive
    is_active = Column(Boolean, default=True)
    
    # Người tạo
    created_by = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class QuizQuestion(Base):
    __tablename__ = "quiz_questions"

    id = Column(String, primary_key=True, default=lambda: uuid.uuid4().hex)
    
    # Thuộc về quiz nào
    quiz_id = Column(String, ForeignKey("quizzes.id"), nullable=False, index=True)
    
    # Câu hỏi
    question = Column(Text, nullable=False)
    
    # Các lựa chọn (JSON array)
    options = Column(Text, nullable=False)  # JSON string of options
    
    # Đáp án đúng (index của options)
    correct_answer = Column(Integer, nullable=False)
    
    # Giải thích đáp án
    explanation = Column(Text, nullable=True)
    
    # Thứ tự câu hỏi
    order = Column(Integer, default=0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class UserQuizAttempt(Base):
    __tablename__ = "user_quiz_attempts"

    id = Column(String, primary_key=True, default=lambda: uuid.uuid4().hex)
    
    # Người dùng
    user_id = Column(String, index=True, nullable=False)
    
    # Quiz
    quiz_id = Column(String, ForeignKey("quizzes.id"), nullable=False, index=True)
    
    # Điểm số
    score = Column(Float, nullable=False)
    
    # Tổng số câu đúng
    correct_answers = Column(Integer, nullable=False)
    
    # Tổng số câu hỏi
    total_questions = Column(Integer, nullable=False)
    
    # Thời gian hoàn thành (giây)
    time_taken = Column(Integer, nullable=True)
    
    # Trạng thái: completed, failed
    status = Column(String, default="completed")
    
    # Chi tiết câu trả lời (JSON)
    answers = Column(Text, nullable=True)  # JSON string of user answers
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class UserAwarenessScore(Base):
    __tablename__ = "user_awareness_scores"

    id = Column(String, primary_key=True, default=lambda: uuid.uuid4().hex)
    
    # Người dùng
    user_id = Column(String, index=True, nullable=False, unique=True)
    
    # Điểm nhận thức tổng thể (0-100)
    overall_score = Column(Float, default=0.0)
    
    # Số quiz đã hoàn thành
    quizzes_completed = Column(Integer, default=0)
    
    # Số quiz pass
    quizzes_passed = Column(Integer, default=0)
    
    # Trạng thái: good, needs_improvement, restricted
    status = Column(String, default="needs_improvement")
    
    # Lần cập nhật cuối
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class NotebookLog(Base):
    __tablename__ = "notebook_logs"
    
    id = Column(String, primary_key=True, default=lambda: uuid.uuid4().hex)
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Các trường dành cho AI (lưu dưới dạng chuỗi Text nếu là mảng/list)
    summary = Column(String, nullable=True)
    urgency = Column(String, nullable=True)
    tags = Column(Text, nullable=True) # Lưu json string: '["tag1", "tag2"]'
    recommendations = Column(Text, nullable=True) # Lưu json string


# ─────────────────────────────────────────────────────────────────────────────
# NHÓM 8: INVENTORY & SUPPLIES (Kho hàng và vật tư)
# ─────────────────────────────────────────────────────────────────────────────
class InventoryItem(Base):
    __tablename__ = "inventory_items"

    id = Column(String, primary_key=True, default=lambda: uuid.uuid4().hex)
    
    # Nông dân chủ sở hữu
    farmer_id = Column(String, index=True, nullable=False)
    
    # Tên sản phẩm
    name = Column(String, nullable=False)
    
    # Loại (feed, medicine, equipment, seed, etc.)
    category = Column(String, nullable=False)
    
    # Số lượng hiện tại
    quantity = Column(Float, nullable=False, default=0)
    
    # Đơn vị (kg, lít, hộp, cái, etc.)
    unit = Column(String, nullable=False)
    
    # Giá mua (VND)
    unit_cost = Column(Float, nullable=True)
    
    # Giá bán (VND)
    unit_price = Column(Float, nullable=True)
    
    # Ngưỡng cảnh báo (khi hết, cần order)
    min_quantity = Column(Float, default=0)
    
    # Mô tả
    description = Column(Text, nullable=True)
    
    # Trạng thái
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class InventoryTransaction(Base):
    __tablename__ = "inventory_transactions"

    id = Column(String, primary_key=True, default=lambda: uuid.uuid4().hex)
    
    # Nông dân
    farmer_id = Column(String, index=True, nullable=False)
    
    # Sản phẩm
    item_id = Column(String, ForeignKey("inventory_items.id"), nullable=False, index=True)
    
    # Loại giao dịch: in (nhập kho), out (xuất kho), return (trả lại), adjustment (điều chỉnh)
    transaction_type = Column(String, nullable=False)
    
    # Số lượng
    quantity = Column(Float, nullable=False)
    
    # Giá tại thời điểm giao dịch
    price_at_transaction = Column(Float, nullable=True)
    
    # Tổng tiền
    total_amount = Column(Float, nullable=True)
    
    # Ghi chú
    notes = Column(Text, nullable=True)
    
    # Liên quan đến mục nào (có thể để NULL)
    related_to = Column(String, nullable=True)  # e.g., "livestock_id", "treatment_id"
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# ─────────────────────────────────────────────────────────────────────────────
# NHÓM 9: PRODUCTION & SALES (Sản lượng và bán hàng)
# ─────────────────────────────────────────────────────────────────────────────
class Production(Base):
    __tablename__ = "productions"

    id = Column(String, primary_key=True, default=lambda: uuid.uuid4().hex)
    
    # Nông dân
    farmer_id = Column(String, index=True, nullable=False)
    
    # Loại sản xuất (milk, eggs, meat, wool, etc.)
    production_type = Column(String, nullable=False)
    
    # Liên quan đến vật nuôi (nếu có)
    livestock_id = Column(String, ForeignKey("livestock.id"), nullable=True, index=True)
    
    # Số lượng sản xuất
    quantity = Column(Float, nullable=False)
    
    # Đơn vị
    unit = Column(String, nullable=False)
    
    # Ngày sản xuất
    production_date = Column(Date, nullable=False)
    
    # Ghi chú (chất lượng, điều kiện, etc.)
    notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Sale(Base):
    __tablename__ = "sales"

    id = Column(String, primary_key=True, default=lambda: uuid.uuid4().hex)
    
    # Nông dân
    farmer_id = Column(String, index=True, nullable=False)
    
    # Sản phẩm (từ inventory hoặc production)
    item_name = Column(String, nullable=False)
    
    # Số lượng bán
    quantity = Column(Float, nullable=False)
    
    # Đơn vị
    unit = Column(String, nullable=False)
    
    # Giá bán (VND)
    price_per_unit = Column(Float, nullable=False)
    
    # Tổng tiền bán
    total_amount = Column(Float, nullable=False)
    
    # Chi phí vận chuyển
    shipping_cost = Column(Float, default=0)
    
    # Ngày bán
    sale_date = Column(Date, nullable=False)
    
    # Người mua
    buyer_name = Column(String, nullable=True)
    
    # Ghi chú
    notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# ─────────────────────────────────────────────────────────────────────────────
# NHÓM 10: ANALYTICS REPORT (Báo cáo phân tích)
# ─────────────────────────────────────────────────────────────────────────────
class AnalyticsReport(Base):
    __tablename__ = "analytics_reports"

    id = Column(String, primary_key=True, default=lambda: uuid.uuid4().hex)
    
    # Nông dân
    farmer_id = Column(String, index=True, nullable=False)
    
    # Khoảng thời gian: daily, weekly, monthly, quarterly, yearly
    period_type = Column(String, nullable=False)
    
    # Ngày bắt đầu - kết thúc
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    
    # DOANH THU
    total_revenue = Column(Float, default=0)  # Tổng tiền bán
    
    # CHI PHÍ
    total_feed_cost = Column(Float, default=0)  # Chi phí thức ăn
    total_medicine_cost = Column(Float, default=0)  # Chi phí thuốc
    total_equipment_cost = Column(Float, default=0)  # Chi phí thiết bị
    total_labor_cost = Column(Float, default=0)  # Chi phí nhân công
    total_other_cost = Column(Float, default=0)  # Chi phí khác
    
    # Tính toán lợi nhuận
    total_cost = Column(Float, default=0)  # Tổng chi phí
    net_profit = Column(Float, default=0)  # Lợi nhuận ròng
    profit_margin = Column(Float, default=0)  # Tỷ suất lợi nhuận (%)
    
    # SẢN LƯỢNG
    total_production_quantity = Column(Float, default=0)
    production_unit = Column(String, nullable=True)
    
    # TỒNKHO
    inventory_value = Column(Float, default=0)  # Giá trị tồn kho
    low_stock_items = Column(Integer, default=0)  # Số sản phẩm còn ít
    
    # PHÂN TÍCH HIỆU SUẤT
    production_efficiency = Column(Float, default=0)  # Hiệu suất sản xuất (%)
    cost_per_unit = Column(Float, default=0)  # Chi phí trên đơn vị sản phẩm
    revenue_per_unit = Column(Float, default=0)  # Doanh thu trên đơn vị
    
    # KHUYẾN NGHỊ
    recommendations = Column(Text, nullable=True)  # JSON recommendations
    
    # TRẠNG THÁI
    is_analyzed = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())