from __future__ import annotations
import uuid
from fastapi import APIRouter, HTTPException
import json
from sqlalchemy.orm import Session
from fastapi import Depends
from app.database import get_db
from app.models import NotebookLog
import google.generativeai as genai

from app.schemas.ai import ChatRequest, ChatResponse
from app.core.config import settings

router = APIRouter(prefix="/ai", tags=["ai"])

if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)
    # Sử dụng model gemini-1.5-flash (nhanh, chi phí rẻ, phù hợp cho chat)
    model = genai.GenerativeModel("gemini-2.5-flash")
else:
    model = None

@router.post("/chat", response_model=ChatResponse)
def chat(body: ChatRequest) -> ChatResponse:
    if not model:
        raise HTTPException(status_code=500, detail="Chưa cấu hình GEMINI_API_KEY trong file .env")

    session_id = body.session_id or f"sess-{uuid.uuid4().hex[:8]}"

    # Kết hợp ngữ cảnh (context) nếu có do frontend gửi lên
    prompt = body.message
    if body.context:
        prompt = f"Thông tin bổ sung: {body.context}\n\nCâu hỏi của người dùng: {body.message}"

    try:
        # Gọi Gemini API
        response = model.generate_content(prompt)
        reply = response.text
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi kết nối với Gemini: {str(e)}")

    return ChatResponse(
        reply=reply,
        session_id=session_id,
        sources=["Gemini AI", "Farm2Vets Knowledge Base"],
    )

import json
from pydantic import BaseModel
from typing import List

# 1. Khai báo Schema cho Notebook
class NotebookLogRequest(BaseModel):
    content: str

class NotebookLogResponse(BaseModel):
    summary: str
    urgency: str  # Low, Medium, High, Critical
    tags: List[str]
    recommendations: List[str]

# 2. Thêm Endpoint mới
@router.post("/analyze-log", response_model=NotebookLogResponse)
def analyze_notebook_log(body: NotebookLogRequest):
    if not model:
        raise HTTPException(status_code=500, detail="Chưa cấu hình GEMINI_API_KEY")

    # Prompt yêu cầu AI đóng vai bác sĩ thú y và phân tích văn bản
    prompt = f"""
    Bạn là một chuyên gia thú y AI của hệ thống Farm2Vets. Hãy phân tích ghi chép sau đây của người nông dân về đàn vật nuôi của họ.
    
    Ghi chép: "{body.content}"
    
    Hãy thực hiện:
    1. Tóm tắt ngắn gọn vấn đề.
    2. Đánh giá mức độ nghiêm trọng (chỉ được chọn 1 trong 4 từ: Low, Medium, High, Critical).
    3. Tạo một danh sách các tag (ví dụ: 'Dinh dưỡng', 'Hô hấp', 'Bệnh truyền nhiễm', 'Heo').
    4. Đưa ra danh sách các hành động đề xuất cụ thể.
    
    YÊU CẦU QUAN TRỌNG: Chỉ trả về MỘT CHUỖI JSON HỢP LỆ với cấu trúc sau, KHÔNG giải thích thêm, KHÔNG sử dụng markdown block (```json):
    {{
        "summary": "Tóm tắt vấn đề ở đây...",
        "urgency": "High",
        "tags": ["tag1", "tag2"],
        "recommendations": ["Đề xuất 1", "Đề xuất 2"]
    }}
    """
    
    try:
        response = model.generate_content(prompt)
        
        # Làm sạch chuỗi trả về trong trường hợp AI vẫn tự ý bọc markdown
        text_response = response.text.replace("```json", "").replace("```", "").strip()
        
        # Parse JSON và map vào Pydantic model
        parsed_data = json.loads(text_response)
        return NotebookLogResponse(**parsed_data)
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="AI trả về sai định dạng dữ liệu.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi phân tích: {str(e)}")
    
# 1. Khai báo schema nhận dữ liệu từ Frontend
class SaveNotebookRequest(BaseModel):
    content: str
    summary: str | None = None
    urgency: str | None = None
    tags: list[str] | None = None
    recommendations: list[str] | None = None

# 2. Endpoint lưu ghi chú vào DB
@router.post("/notebook")
def save_notebook_log(body: SaveNotebookRequest, db: Session = Depends(get_db)):
    db_log = NotebookLog(
        content=body.content,
        summary=body.summary,
        urgency=body.urgency,
        # Chuyển list thành chuỗi JSON để lưu vào SQLite
        tags=json.dumps(body.tags, ensure_ascii=False) if body.tags else None,
        recommendations=json.dumps(body.recommendations, ensure_ascii=False) if body.recommendations else None
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return {"message": "Saved successfully", "id": db_log.id}

# 3. Endpoint lấy toàn bộ lịch sử
@router.get("/notebook")
def get_notebook_logs(db: Session = Depends(get_db)):
    logs = db.query(NotebookLog).order_by(NotebookLog.timestamp.desc()).all()
    result = []
    for log in logs:
        result.append({
            "id": log.id,
            "content": log.content,
            "timestamp": log.timestamp,
            # Nếu có dữ liệu AI thì parse ngược chuỗi JSON thành List
            "analysis": {
                "summary": log.summary,
                "urgency": log.urgency,
                "tags": json.loads(log.tags) if log.tags else [],
                "recommendations": json.loads(log.recommendations) if log.recommendations else []
            } if log.summary else None
        })
    return result