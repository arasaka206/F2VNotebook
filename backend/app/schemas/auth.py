from __future__ import annotations
from pydantic import BaseModel


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str  # farmer | vet | admin


class UserOut(BaseModel):
    id: str
    username: str
    full_name: str
    role: str
    farm_id: str | None = None
