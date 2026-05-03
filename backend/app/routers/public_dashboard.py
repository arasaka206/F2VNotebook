from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func, desc
from app.database import get_db
from app.models import ForumPost, ForumComment, ForumReaction, ForumHashtag
from app.schemas.public_dashboard import (
    ForumPostOut,
    ForumPostCreate,
    ForumCommentOut,
    ForumCommentCreate,
    ForumReactionIn,
    ForumReactionOut,
    ForumPostDetail,
    ForumSearchResult
)
import uuid

router = APIRouter(prefix="/public-dashboard", tags=["public-dashboard"])


# ═════════════════════════════════════════════════════════════════════════════
# POSTS
# ═════════════════════════════════════════════════════════════════════════════

@router.post("/posts")
def create_post(
    post_data: ForumPostCreate,
    author_id: str = Query(...),
    author_name: str = Query(...),
    db: Session = Depends(get_db)
):
    """Tạo bài viết mới trên diễn đàn công cộng."""
    post = ForumPost(
        author_id=author_id,
        author_name=author_name,
        title=post_data.title,
        content=post_data.content
    )
    db.add(post)
    db.flush()
    
    # Thêm hashtags
    for tag in post_data.hashtags:
        clean_tag = tag.lower().strip()
        if clean_tag.startswith("#"):
            clean_tag = clean_tag[1:]
        
        hashtag = ForumHashtag(
            post_id=post.id,
            tag=clean_tag
        )
        db.add(hashtag)
    
    db.commit()
    db.refresh(post)
    
    return ForumPostOut(
        id=post.id,
        author_id=post.author_id,
        author_name=post.author_name,
        title=post.title,
        content=post.content,
        reaction_count=post.reaction_count,
        comment_count=post.comment_count,
        created_at=post.created_at,
        hashtags=[tag.tag for tag in db.query(ForumHashtag).filter(ForumHashtag.post_id == post.id).all()]
    )


@router.get("/posts")
def get_posts(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    sort_by: str = Query("newest"),  # newest, trending, oldest
    db: Session = Depends(get_db)
):
    """Lấy danh sách bài viết với phân trang."""
    query = db.query(ForumPost)
    
    # Sắp xếp
    if sort_by == "trending":
        query = query.order_by(desc(ForumPost.reaction_count), desc(ForumPost.created_at))
    elif sort_by == "oldest":
        query = query.order_by(ForumPost.created_at)
    else:  # newest
        query = query.order_by(desc(ForumPost.created_at))
    
    total_count = query.count()
    posts = query.offset((page - 1) * page_size).limit(page_size).all()
    
    posts_out = []
    for post in posts:
        hashtags = [tag.tag for tag in db.query(ForumHashtag).filter(ForumHashtag.post_id == post.id).all()]
        posts_out.append(ForumPostOut(
            id=post.id,
            author_id=post.author_id,
            author_name=post.author_name,
            title=post.title,
            content=post.content,
            reaction_count=post.reaction_count,
            comment_count=post.comment_count,
            created_at=post.created_at,
            hashtags=hashtags
        ))
    
    return ForumSearchResult(
        posts=posts_out,
        total_count=total_count,
        page=page,
        page_size=page_size
    )


@router.get("/posts/{post_id}")
def get_post_detail(post_id: str, db: Session = Depends(get_db)):
    """Lấy chi tiết một bài viết với tất cả bình luận."""
    post = db.query(ForumPost).filter(ForumPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    comments = db.query(ForumComment).filter(ForumComment.post_id == post_id).order_by(ForumComment.created_at).all()
    comments_out = [
        ForumCommentOut(
            id=c.id,
            post_id=c.post_id,
            author_id=c.author_id,
            author_name=c.author_name,
            content=c.content,
            reaction_count=c.reaction_count,
            created_at=c.created_at,
            updated_at=c.updated_at
        )
        for c in comments
    ]
    
    hashtags = [tag.tag for tag in db.query(ForumHashtag).filter(ForumHashtag.post_id == post_id).all()]
    
    return ForumPostDetail(
        id=post.id,
        author_id=post.author_id,
        author_name=post.author_name,
        title=post.title,
        content=post.content,
        reaction_count=post.reaction_count,
        comment_count=post.comment_count,
        created_at=post.created_at,
        updated_at=post.updated_at,
        hashtags=hashtags,
        comments=comments_out
    )


@router.get("/search")
def search_posts(
    query: str = Query(...),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Tìm kiếm bài viết theo từ khóa hoặc hashtag.
    Hỗ trợ tìm kiếm với #hashtag hoặc từ khóa thông thường.
    """
    if query.startswith("#"):
        # Tìm kiếm theo hashtag
        tag = query[1:].lower()
        hashtags = db.query(ForumHashtag).filter(ForumHashtag.tag.ilike(f"%{tag}%")).all()
        post_ids = [h.post_id for h in hashtags]
        posts_query = db.query(ForumPost).filter(ForumPost.id.in_(post_ids)) if post_ids else db.query(ForumPost).filter(False)
    else:
        # Tìm kiếm theo title hoặc content
        posts_query = db.query(ForumPost).filter(
            or_(
                ForumPost.title.ilike(f"%{query}%"),
                ForumPost.content.ilike(f"%{query}%")
            )
        )
    
    total_count = posts_query.count()
    posts = posts_query.order_by(desc(ForumPost.created_at)).offset((page - 1) * page_size).limit(page_size).all()
    
    posts_out = []
    for post in posts:
        hashtags = [tag.tag for tag in db.query(ForumHashtag).filter(ForumHashtag.post_id == post.id).all()]
        posts_out.append(ForumPostOut(
            id=post.id,
            author_id=post.author_id,
            author_name=post.author_name,
            title=post.title,
            content=post.content,
            reaction_count=post.reaction_count,
            comment_count=post.comment_count,
            created_at=post.created_at,
            hashtags=hashtags
        ))
    
    return ForumSearchResult(
        posts=posts_out,
        total_count=total_count,
        page=page,
        page_size=page_size
    )


# ═════════════════════════════════════════════════════════════════════════════
# COMMENTS
# ═════════════════════════════════════════════════════════════════════════════

@router.post("/posts/{post_id}/comments")
def add_comment(
    post_id: str,
    comment_data: ForumCommentCreate,
    author_id: str = Query(...),
    author_name: str = Query(...),
    db: Session = Depends(get_db)
):
    """Thêm bình luận cho một bài viết."""
    post = db.query(ForumPost).filter(ForumPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    comment = ForumComment(
        post_id=post_id,
        author_id=author_id,
        author_name=author_name,
        content=comment_data.content
    )
    db.add(comment)
    post.comment_count += 1
    db.commit()
    db.refresh(comment)
    
    return ForumCommentOut(
        id=comment.id,
        post_id=comment.post_id,
        author_id=comment.author_id,
        author_name=comment.author_name,
        content=comment.content,
        reaction_count=comment.reaction_count,
        created_at=comment.created_at,
        updated_at=comment.updated_at
    )


@router.delete("/comments/{comment_id}")
def delete_comment(comment_id: str, db: Session = Depends(get_db)):
    """Xóa bình luận."""
    comment = db.query(ForumComment).filter(ForumComment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    post = db.query(ForumPost).filter(ForumPost.id == comment.post_id).first()
    if post:
        post.comment_count = max(0, post.comment_count - 1)
    
    db.delete(comment)
    db.commit()
    return {"message": "Comment deleted"}


# ═════════════════════════════════════════════════════════════════════════════
# REACTIONS
# ═════════════════════════════════════════════════════════════════════════════

@router.post("/posts/{post_id}/react")
def react_to_post(
    post_id: str,
    reaction: ForumReactionIn,
    user_id: str = Query(...),
    db: Session = Depends(get_db)
):
    """Thêm reaction (like, love, v.v.) cho một bài viết."""
    post = db.query(ForumPost).filter(ForumPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Kiểm tra xem user đã reaction chưa (xóa nếu có)
    existing = db.query(ForumReaction).filter(
        ForumReaction.post_id == post_id,
        ForumReaction.user_id == user_id
    ).first()
    
    if existing:
        db.delete(existing)
        post.reaction_count = max(0, post.reaction_count - 1)
    else:
        new_reaction = ForumReaction(
            post_id=post_id,
            user_id=user_id,
            reaction_type=reaction.reaction_type
        )
        db.add(new_reaction)
        post.reaction_count += 1
    
    db.commit()
    return {"message": "Reaction recorded", "reaction_count": post.reaction_count}


@router.post("/comments/{comment_id}/react")
def react_to_comment(
    comment_id: str,
    reaction: ForumReactionIn,
    user_id: str = Query(...),
    db: Session = Depends(get_db)
):
    """Thêm reaction cho một bình luận."""
    comment = db.query(ForumComment).filter(ForumComment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # Kiểm tra xem user đã reaction chưa (xóa nếu có)
    existing = db.query(ForumReaction).filter(
        ForumReaction.comment_id == comment_id,
        ForumReaction.user_id == user_id
    ).first()
    
    if existing:
        db.delete(existing)
        comment.reaction_count = max(0, comment.reaction_count - 1)
    else:
        new_reaction = ForumReaction(
            comment_id=comment_id,
            user_id=user_id,
            reaction_type=reaction.reaction_type
        )
        db.add(new_reaction)
        comment.reaction_count += 1
    
    db.commit()
    return {"message": "Reaction recorded", "reaction_count": comment.reaction_count}


# ═════════════════════════════════════════════════════════════════════════════
# HASHTAGS
# ═════════════════════════════════════════════════════════════════════════════

@router.get("/hashtags/trending")
def get_trending_hashtags(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Lấy danh sách hashtag đang được sử dụng nhiều nhất."""
    trending_tags = db.query(
        ForumHashtag.tag,
        func.count(ForumHashtag.id).label("count")
    ).group_by(ForumHashtag.tag).order_by(desc(func.count(ForumHashtag.id))).limit(limit).all()
    
    return [{"tag": tag[0], "count": tag[1]} for tag in trending_tags]
