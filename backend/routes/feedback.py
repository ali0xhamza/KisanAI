# backend/routes/feedback.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel, validator
from typing import Optional
from database import get_db
from models import Feedback, User
from auth import get_current_user, get_admin_user
from datetime import datetime

router = APIRouter(prefix="/api/feedback", tags=["Feedback"])

# ── Schemas ────────────────────────────────────────────────────────
class FeedbackCreate(BaseModel):
    rating: int          # 1-5
    review: str          # written text
    city:   Optional[str] = ""
    crop:   Optional[str] = ""

    @validator('rating')
    def rating_range(cls, v):
        if not 1 <= v <= 5:
            raise ValueError('Rating must be between 1 and 5')
        return v

    @validator('review')
    def review_length(cls, v):
        if len(v.strip()) < 10:
            raise ValueError('Review must be at least 10 characters')
        if len(v.strip()) > 500:
            raise ValueError('Review cannot exceed 500 characters')
        return v.strip()

# ── GET: Public approved reviews ──────────────────────────────────
@router.get("/")
def get_feedback(limit: int = 10, db: Session = Depends(get_db)):
    reviews = db.query(Feedback)\
        .filter(Feedback.is_approved == True)\
        .order_by(Feedback.created_at.desc())\
        .limit(limit).all()

    total     = db.query(func.count(Feedback.id)).filter(Feedback.is_approved == True).scalar()
    avg_query = db.query(func.avg(Feedback.rating)).filter(Feedback.is_approved == True).scalar()
    avg       = round(float(avg_query), 1) if avg_query else 0

    # Star distribution
    dist = {}
    for star in range(1, 6):
        count = db.query(func.count(Feedback.id))\
            .filter(Feedback.is_approved == True, Feedback.rating == star).scalar()
        dist[str(star)] = count

    return {
        "reviews": [_fmt(r) for r in reviews],
        "stats": {
            "total":        total,
            "avg_rating":   avg,
            "distribution": dist,
        }
    }

# ── POST: Submit review (login required) ──────────────────────────
@router.post("/", status_code=201)
def submit_feedback(
    data: FeedbackCreate,
    db:   Session = Depends(get_db),
    user: User    = Depends(get_current_user)
):
    # One user can have only one review — if exists, UPDATE it
    existing = db.query(Feedback).filter(Feedback.user_id == user.id).first()

    if existing:
        # Edit mode — update
        existing.rating = data.rating
        existing.review = data.review
        existing.city   = data.city or existing.city
        existing.crop   = data.crop or existing.crop
        existing.is_approved = True
        db.commit()
        db.refresh(existing)
        return {"message": "✅ Your review has been updated!", "id": existing.id, "action": "updated"}

    # New review
    fb = Feedback(
        user_id     = user.id,
        rating      = data.rating,
        review      = data.review,
        city        = data.city or "",
        crop        = data.crop or "",
        is_approved = True,
        created_at  = datetime.utcnow(),
    )
    db.add(fb)
    db.commit()
    db.refresh(fb)
    return {"message": "✅ Thank you! Your review has been submitted!", "id": fb.id, "action": "created"}

# ── GET: My review ────────────────────────────────────────────────
@router.get("/my")
def my_feedback(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    fb = db.query(Feedback).filter(Feedback.user_id == user.id).first()
    if not fb:
        raise HTTPException(status_code=404, detail="No review found")
    return _fmt(fb)

# ── Admin: Get all (pending + approved) ───────────────────────────
@router.get("/admin/all")
def admin_all(db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    reviews = db.query(Feedback).order_by(Feedback.created_at.desc()).all()
    return [_fmt(r, admin=True) for r in reviews]

# ── Admin: Approve ────────────────────────────────────────────────
@router.patch("/admin/{fb_id}/approve")
def approve(fb_id: int, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    fb = db.query(Feedback).filter(Feedback.id == fb_id).first()
    if not fb: raise HTTPException(404, "Review not found")
    fb.is_approved = True
    db.commit()
    return {"message": "✅ Review approved"}

# ── Admin: Reject / Delete ────────────────────────────────────────
@router.delete("/admin/{fb_id}")
def delete_review(fb_id: int, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    fb = db.query(Feedback).filter(Feedback.id == fb_id).first()
    if not fb: raise HTTPException(404, "Review not found")
    db.delete(fb)
    db.commit()
    return {"message": "🗑️ Review deleted"}

# ── Helper ────────────────────────────────────────────────────────
def _fmt(fb: Feedback, admin=False) -> dict:
    d = {
        "id":          fb.id,
        "rating":      fb.rating,
        "review":      fb.review,
        "city":        fb.city,
        "crop":        fb.crop,
        "user_name":   fb.user.name if fb.user else "Anonymous",
        "is_approved": fb.is_approved,
        "created_at":  fb.created_at.isoformat() if fb.created_at else "",
    }
    if admin:
        d["user_email"] = fb.user.email if fb.user else ""
    return d

# ════════════════════════════════════════════════════════════════
# MODEL — add this to models.py
# ════════════════════════════════════════════════════════════════
"""
class Feedback(Base):
    __tablename__ = "feedback"

    id          = Column(Integer, primary_key=True, index=True)
    user_id     = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating      = Column(Integer, nullable=False)   # 1-5
    review      = Column(Text,    nullable=False)
    city        = Column(String,  default="")
    crop        = Column(String,  default="")
    is_approved = Column(Boolean, default=False)
    created_at  = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="feedback")

# User model add:
# feedback = relationship("Feedback", back_populates="user")
"""

# main.py mein yeh add karo:
"""
from routes.feedback import router as feedback_router
app.include_router(feedback_router)
"""