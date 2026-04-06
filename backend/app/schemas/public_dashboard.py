from __future__ import annotations
from pydantic import BaseModel
from datetime import datetime


class ForumCommentOut(BaseModel):
    id: str
    post_id: str
    author_id: str
    author_name: str
    content: str
    reaction_count: int
    created_at: datetime
    updated_at: datetime | None = None

    class Config:
        from_attributes = True


class ForumPostOut(BaseModel):
    id: str
    author_id: str
    author_name: str
    title: str
    content: str
    reaction_count: int
    comment_count: int
    created_at: datetime
    updated_at: datetime | None = None
    hashtags: list[str] = []

    class Config:
        from_attributes = True


class ForumPostCreate(BaseModel):
    title: str
    content: str
    hashtags: list[str] = []


class ForumCommentCreate(BaseModel):
    content: str


class ForumReactionIn(BaseModel):
    reaction_type: str = "like"  # like, love, haha, sad, angry


class ForumReactionOut(BaseModel):
    id: str
    post_id: str | None
    comment_id: str | None
    user_id: str
    reaction_type: str
    created_at: datetime

    class Config:
        from_attributes = True


class ForumPostDetail(ForumPostOut):
    """Post với đầy đủ comments"""
    comments: list[ForumCommentOut] = []


class ForumSearchResult(BaseModel):
    """Kết quả tìm kiếm posts"""
    posts: list[ForumPostOut]
    total_count: int
    page: int
    page_size: int
