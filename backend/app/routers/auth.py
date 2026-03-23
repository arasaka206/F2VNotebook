from __future__ import annotations
from datetime import datetime, timezone
from typing import Any
import uuid

from fastapi import APIRouter

from app.schemas.auth import LoginRequest, TokenOut, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])

# ---------------------------------------------------------------------------
# In-memory stub users (replace with DB in production)
# ---------------------------------------------------------------------------
_USERS: dict[str, dict[str, Any]] = {
    "farmer1": {
        "id": "user-001",
        "username": "farmer1",
        "full_name": "Nguyen Van An",
        "password": "farmer123",
        "role": "farmer",
        "farm_id": "farm-001",
    },
    "vet1": {
        "id": "user-002",
        "username": "vet1",
        "full_name": "Dr. Tran Thi Bich",
        "password": "vet123",
        "role": "vet",
        "farm_id": None,
    },
}


def _fake_token(user: dict[str, Any]) -> str:
    return f"stub-token-{user['id']}-{uuid.uuid4().hex[:8]}"


@router.post("/login", response_model=TokenOut)
def login(body: LoginRequest) -> TokenOut:
    user = _USERS.get(body.username)
    if not user or user["password"] != body.password:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return TokenOut(access_token=_fake_token(user), token_type="bearer", role=user["role"])


@router.get("/me", response_model=UserOut)
def get_me() -> UserOut:
    """Stub – returns the first farmer user. Replace with JWT validation."""
    u = _USERS["farmer1"]
    return UserOut(id=u["id"], username=u["username"], full_name=u["full_name"], role=u["role"], farm_id=u["farm_id"])
