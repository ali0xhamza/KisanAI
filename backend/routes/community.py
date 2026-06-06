# backend/routes/community.py
import os
import httpx
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional, List
from database import get_db
from auth import get_current_user
from models import User, CommunityPost, CommunityComment, CommunityLike
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/api/community", tags=["Community"])

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_URL     = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL   = "llama-3.3-70b-versatile"

# ── Pydantic Schemas ──────────────────────────────────────────────

class PostCreate(BaseModel):
    title:    str
    content:  str
    category: str  # fasal / mosum / mandi / keera_maar / general

class CommentCreate(BaseModel):
    content: str

class PostResponse(BaseModel):
    id:            int
    title:         str
    content:       str
    category:      str
    likes:         int
    comment_count: int
    author_name:   str
    author_city:   Optional[str]
    created_at:    datetime
    user_liked:    bool = False

    class Config:
        from_attributes = True

class CommentResponse(BaseModel):
    id:            int
    content:       str
    author_name:   str
    is_ai_response: bool
    created_at:    datetime

    class Config:
        from_attributes = True

# ── GET all posts ─────────────────────────────────────────────────

@router.get("/posts")
async def get_posts(
    category: Optional[str] = Query(None),
    page:     int           = Query(1, ge=1),
    limit:    int           = Query(10, le=50),
    db:       Session       = Depends(get_db),
    current_user: User      = Depends(get_current_user),
):
    query = db.query(CommunityPost)
    if category and category != "all":
        query = query.filter(CommunityPost.category == category)

    total  = query.count()
    posts  = query.order_by(desc(CommunityPost.created_at)).offset((page - 1) * limit).limit(limit).all()

    result = []
    for post in posts:
        liked = db.query(CommunityLike).filter_by(post_id=post.id, user_id=current_user.id).first() is not None
        comment_count = db.query(CommunityComment).filter_by(post_id=post.id).count()
        result.append({
            "id":            post.id,
            "title":         post.title,
            "content":       post.content,
            "category":      post.category,
            "likes":         post.likes,
            "comment_count": comment_count,
            "author_name":   post.author.name,
            "author_city":   post.author.city,
            "created_at":    post.created_at,
            "user_liked":    liked,
        })
    return {"posts": result, "total": total, "page": page}

# ── GET single post with comments ────────────────────────────────

@router.get("/posts/{post_id}")
async def get_post(
    post_id: int,
    db:      Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    post = db.query(CommunityPost).filter_by(id=post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    liked    = db.query(CommunityLike).filter_by(post_id=post_id, user_id=current_user.id).first() is not None
    comments = db.query(CommunityComment).filter_by(post_id=post_id).order_by(CommunityComment.created_at).all()

    return {
        "id":            post.id,
        "title":         post.title,
        "content":       post.content,
        "category":      post.category,
        "likes":         post.likes,
        "author_name":   post.author.name,
        "author_city":   post.author.city,
        "created_at":    post.created_at,
        "user_liked":    liked,
        "comments": [
            {
                "id":             c.id,
                "content":        c.content,
                "author_name":    c.author.name if not c.is_ai_response else "🤖 KisanAI",
                "is_ai_response": c.is_ai_response,
                "created_at":     c.created_at,
            }
            for c in comments
        ],
    }

# ── CREATE post ───────────────────────────────────────────────────

@router.post("/posts")
async def create_post(
    body:         PostCreate,
    db:           Session = Depends(get_db),
    current_user: User    = Depends(get_current_user),
):
    allowed = ["fasal", "mosum", "mandi", "keera_maar", "general"]
    if body.category not in allowed:
        raise HTTPException(status_code=400, detail=f"Category must be one of: {allowed}")

    post = CommunityPost(
        title=body.title,
        content=body.content,
        category=body.category,
        user_id=current_user.id,
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return {"message": "Post created successfully!", "post_id": post.id}

# ── LIKE / UNLIKE post ────────────────────────────────────────────

@router.post("/posts/{post_id}/like")
async def toggle_like(
    post_id:      int,
    db:           Session = Depends(get_db),
    current_user: User    = Depends(get_current_user),
):
    post = db.query(CommunityPost).filter_by(id=post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    existing = db.query(CommunityLike).filter_by(post_id=post_id, user_id=current_user.id).first()
    if existing:
        db.delete(existing)
        post.likes = max(0, post.likes - 1)
        liked = False
    else:
        db.add(CommunityLike(post_id=post_id, user_id=current_user.id))
        post.likes += 1
        liked = True

    db.commit()
    return {"liked": liked, "likes": post.likes}

# ── ADD comment ───────────────────────────────────────────────────

@router.post("/posts/{post_id}/comments")
async def add_comment(
    post_id:      int,
    body:         CommentCreate,
    db:           Session = Depends(get_db),
    current_user: User    = Depends(get_current_user),
):
    post = db.query(CommunityPost).filter_by(id=post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    comment = CommunityComment(
        content=body.content,
        post_id=post_id,
        user_id=current_user.id,
        is_ai_response=False,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return {
        "id":             comment.id,
        "content":        comment.content,
        "author_name":    current_user.name,
        "is_ai_response": False,
        "created_at":     comment.created_at,
    }

# ── AI ADVICE on post ───────────────────────────────────────────

@router.post("/posts/{post_id}/ai-mashwara")
async def ai_mashwara(
    post_id:      int,
    db:           Session = Depends(get_db),
    current_user: User    = Depends(get_current_user),
):
    post = db.query(CommunityPost).filter_by(id=post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if not GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="AI service not configured")

    system_prompt = """You are KisanAI — an AI farming expert for Pakistani farmers.
A farmer has asked a question in the community. Provide a practical answer.
Rules:
1. Always answer in simple English (or Roman Urdu if needed, but prefer English)
2. Use clear and simple language that any farmer can understand
3. Give practical and actionable advice
4. Focus on Pakistani context (Punjab, Sindh, KPK)
5. Keep the answer useful within 150-200 words
6. Use emojis to make the response friendly"""

    user_msg = f"Question: {post.title}\n\nDetailed issue: {post.content}"

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                GROQ_URL,
                headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
                json={
                    "model":       GROQ_MODEL,
                    "messages":    [
                        {"role": "system", "content": system_prompt},
                        {"role": "user",   "content": user_msg},
                    ],
                    "temperature": 0.7,
                    "max_tokens":  400,
                }
            )
            resp.raise_for_status()
            ai_reply = resp.json()["choices"][0]["message"]["content"]
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="AI is slow — please try again")
    except Exception:
        raise HTTPException(status_code=500, detail="AI service encountered an error")

    # Save AI reply as a comment
    ai_comment = CommunityComment(
        content=ai_reply,
        post_id=post_id,
        user_id=current_user.id,
        is_ai_response=True,
    )
    db.add(ai_comment)
    db.commit()
    db.refresh(ai_comment)

    return {
        "id":             ai_comment.id,
        "content":        ai_reply,
        "author_name":    "🤖 KisanAI",
        "is_ai_response": True,
        "created_at":     ai_comment.created_at,
    }

# ── DELETE post (only own) ───────────────────────────────────────

@router.delete("/posts/{post_id}")
async def delete_post(
    post_id:      int,
    db:           Session = Depends(get_db),
    current_user: User    = Depends(get_current_user),
):
    post = db.query(CommunityPost).filter_by(id=post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only delete your own post")

    db.delete(post)
    db.commit()
    return {"message": "Post deleted successfully"}