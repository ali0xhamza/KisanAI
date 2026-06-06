from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Literal, Optional
from datetime import datetime
from database import get_db
from models import UserFeedback, User   # User imported (for admin check)
from auth import send_brevo_email, get_admin_user
from auth import get_current_user

router = APIRouter(prefix="/api/user-feedback", tags=["Feedback"])

class FeedbackCreate(BaseModel):
    name: str
    email: EmailStr
    feedback_type: Literal["bug", "feature", "feedback", "complaint"]
    message: str

class FeedbackResponse(BaseModel):
    id: int
    name: str
    email: str
    feedback_type: str
    message: str
    created_at: datetime
    is_resolved: bool

    class Config:
        from_attributes = True

TYPE_LABELS = {
    "bug":       "Bug Report",
    "feature":   "Feature Request",
    "feedback":  "General Feedback",
    "complaint": "Complaint",
}

def send_resolve_email(name: str, email: str, feedback_type: str, message: str) -> bool:
    label = TYPE_LABELS.get(feedback_type, "Feedback")
    html = f"""
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:16px">
        <div style="text-align:center;margin-bottom:24px">
            <span style="font-size:40px">🌾</span>
            <h2 style="color:#1B4D2E;margin:8px 0">KisanAI</h2>
        </div>
        <div style="background:white;border-radius:12px;padding:24px">
            <h3 style="color:#1B4D2E;margin:0 0 16px">✅ Your Feedback Has Been Resolved!</h3>
            <p style="color:#444;font-size:14px;line-height:1.7">
                Dear <b>{name}</b>,
            </p>
            <p style="color:#444;font-size:14px;line-height:1.7">
                Your <b>{label}</b> has been successfully resolved by our team.
            </p>
            <div style="background:#F0F7F0;border-radius:12px;padding:16px;margin:16px 0;border-left:4px solid #1B4D2E">
                <p style="color:#666;font-size:12px;margin:0 0 6px;font-weight:600">Your Feedback:</p>
                <p style="color:#333;font-size:13px;margin:0;line-height:1.6">{message}</p>
            </div>
            <p style="color:#444;font-size:14px;line-height:1.7">
                Thank you for sharing your thoughts with us — this helps us make KisanAI better! 🚀
            </p>
            <p style="color:#444;font-size:14px;line-height:1.7">
                If you face any other issue, please send feedback again — we are always here to help.
            </p>
        </div>
        <p style="text-align:center;color:#aaa;font-size:11px;margin-top:16px">
            © 2026 KisanAI — UET Lahore
        </p>
    </div>
    """
    return send_brevo_email(email, name, "✅ KisanAI — Your Feedback Has Been Resolved", html)

@router.post("/", response_model=FeedbackResponse, status_code=201)
def submit_feedback(data: FeedbackCreate, db: Session = Depends(get_db)):
    if len(data.message.strip()) < 3:
        raise HTTPException(400, "Message is too short")
    feedback = UserFeedback(
        name          = data.name.strip(),
        email         = data.email.lower(),
        feedback_type = data.feedback_type,
        message       = data.message.strip(),
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    return feedback

@router.get("/", response_model=list[FeedbackResponse])
def get_all_feedback(
    feedback_type: str  = None,
    is_resolved:   bool = None,
    db: Session = Depends(get_db),
):
    query = db.query(UserFeedback)
    if feedback_type:
        query = query.filter(UserFeedback.feedback_type == feedback_type)
    if is_resolved is not None:
        query = query.filter(UserFeedback.is_resolved == is_resolved)
    return query.order_by(UserFeedback.created_at.desc()).all()

@router.patch("/{feedback_id}/resolve")
def resolve_feedback(feedback_id: int, db: Session = Depends(get_db)):
    fb = db.query(UserFeedback).filter(UserFeedback.id == feedback_id).first()
    if not fb:
        raise HTTPException(404, "Feedback not found")
    fb.is_resolved = True
    db.commit()

    # Send email
    send_resolve_email(fb.name, fb.email, fb.feedback_type, fb.message)

    return {"message": "✅ Resolved — email sent as well!"}

# ✅ DELETE endpoint – admin only
@router.delete("/admin/{feedback_id}")
def delete_feedback(
    feedback_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    feedback = db.query(UserFeedback).filter(UserFeedback.id == feedback_id).first()
    if not feedback:
        raise HTTPException(404, "Feedback not found")
    db.delete(feedback)
    db.commit()
    return {"message": "Feedback deleted"}