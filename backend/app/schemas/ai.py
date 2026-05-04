from __future__ import annotations
from typing import Optional
from pydantic import BaseModel


class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = None  # e.g. "livestock_id:abc123"
    session_id: Optional[str] = None
    language: Optional[str] = None  # e.g. "en" or "vi"


class ChatResponse(BaseModel):
    reply: str
    session_id: str
    sources: list[str] = []
