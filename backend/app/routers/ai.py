from __future__ import annotations

import json
import logging
import time
import uuid

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
import google.generativeai as genai

from app.core.config import settings
from app.database import get_db
from app.models import NotebookLog
from app.schemas.ai import ChatRequest, ChatResponse

router = APIRouter(prefix="/ai", tags=["ai"])
logger = logging.getLogger(__name__)

if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel(settings.GEMINI_MODEL)
else:
    model = None


def _generate_text(prompt: str) -> str:
    if not model:
        raise HTTPException(status_code=503, detail="GEMINI_API_KEY is not configured for the backend.")

    last_error: Exception | None = None
    for attempt in range(2):
        try:
            response = model.generate_content(
                prompt,
                generation_config={"temperature": 0.4, "max_output_tokens": 768},
                request_options={"timeout": 30},
            )
            text = getattr(response, "text", "") or ""
            if text.strip():
                return text.strip()
            raise RuntimeError("Gemini returned an empty response.")
        except Exception as exc:
            last_error = exc
            if attempt == 0:
                time.sleep(1)

    logger.warning("Gemini request failed after retry: %s", last_error)
    raise HTTPException(
        status_code=503,
        detail=f"AI assistant is temporarily unavailable. Gemini error: {last_error}",
    )


@router.post("/chat", response_model=ChatResponse)
def chat(body: ChatRequest) -> ChatResponse:
    session_id = body.session_id or f"sess-{uuid.uuid4().hex[:8]}"
    language = body.language or "en"
    lang_instruction = "Please provide your response in Vietnamese." if language == "vi" else "Please provide your response in English."

    prompt = body.message
    if body.context:
        prompt = f"Additional farm context: {body.context}\n\nUser question: {body.message}"

    reply = _generate_text(f"{lang_instruction}\n\n{prompt}")

    return ChatResponse(
        reply=reply,
        session_id=session_id,
        sources=["Gemini AI", "Farm2Vets Knowledge Base"],
    )


class NotebookLogRequest(BaseModel):
    content: str


class NotebookLogResponse(BaseModel):
    summary: str
    urgency: str
    tags: list[str]
    recommendations: list[str]


@router.post("/analyze-log", response_model=NotebookLogResponse)
def analyze_notebook_log(body: NotebookLogRequest) -> NotebookLogResponse:
    prompt = f"""
You are the Farm2Vets veterinary AI assistant. Analyze this farmer notebook entry:

{body.content}

Return only valid JSON with this exact structure:
{{
  "summary": "short issue summary",
  "urgency": "Low|Medium|High|Critical",
  "tags": ["tag1", "tag2"],
  "recommendations": ["specific action 1", "specific action 2"]
}}
"""

    try:
        text_response = _generate_text(prompt).replace("```json", "").replace("```", "").strip()
        parsed_data = json.loads(text_response)
        return NotebookLogResponse(**parsed_data)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="AI returned invalid JSON.")
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to analyze notebook entry: {exc}")


class SaveNotebookRequest(BaseModel):
    content: str
    summary: str | None = None
    urgency: str | None = None
    tags: list[str] | None = None
    recommendations: list[str] | None = None


@router.post("/notebook")
def save_notebook_log(body: SaveNotebookRequest, db: Session = Depends(get_db)) -> dict:
    db_log = NotebookLog(
        content=body.content,
        summary=body.summary,
        urgency=body.urgency,
        tags=json.dumps(body.tags, ensure_ascii=False) if body.tags else None,
        recommendations=json.dumps(body.recommendations, ensure_ascii=False) if body.recommendations else None,
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return {"message": "Saved successfully", "id": db_log.id}


@router.get("/notebook")
def get_notebook_logs(db: Session = Depends(get_db)) -> list[dict]:
    logs = db.query(NotebookLog).order_by(NotebookLog.timestamp.desc()).all()
    result = []
    for log in logs:
        result.append(
            {
                "id": log.id,
                "content": log.content,
                "timestamp": log.timestamp,
                "analysis": {
                    "summary": log.summary,
                    "urgency": log.urgency,
                    "tags": json.loads(log.tags) if log.tags else [],
                    "recommendations": json.loads(log.recommendations) if log.recommendations else [],
                }
                if log.summary
                else None,
            }
        )
    return result
