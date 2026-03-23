from __future__ import annotations
import uuid
from fastapi import APIRouter, HTTPException

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