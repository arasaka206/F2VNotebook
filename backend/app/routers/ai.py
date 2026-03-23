from __future__ import annotations
import uuid

from fastapi import APIRouter

from app.schemas.ai import ChatRequest, ChatResponse

router = APIRouter(prefix="/ai", tags=["ai"])

_MOCK_REPLIES: list[str] = [
    "Based on the symptoms you described, this could be Bovine Respiratory Disease. I recommend contacting your vet for a proper diagnosis.",
    "The temperature and humidity levels in your barn are slightly elevated. Consider improving ventilation.",
    "Your herd health score has been stable. Keep up the vaccination schedule and monitor feed conversion.",
    "I detected a possible early sign of foot rot in your livestock profile. Early treatment is key — consult Dr. Tran.",
    "The regional disease alert level has been raised to MEDIUM for HFMD in swine. Monitor your pigs closely.",
    "Routine deworming is due for COW-A01 based on the 6-month schedule recorded in the notebook.",
]

_session_counter: dict[str, int] = {}


@router.post("/chat", response_model=ChatResponse)
def chat(body: ChatRequest) -> ChatResponse:
    session_id = body.session_id or f"sess-{uuid.uuid4().hex[:8]}"
    count = _session_counter.get(session_id, 0)
    reply = _MOCK_REPLIES[count % len(_MOCK_REPLIES)]
    _session_counter[session_id] = count + 1
    return ChatResponse(
        reply=reply,
        session_id=session_id,
        sources=["AI Herd Notebook", "Farm2Vets Knowledge Base"],
    )
