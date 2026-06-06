# backend/routes/users.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional
from database import get_db
from models import User
from auth import (
    hash_password, verify_password, create_access_token,
    get_current_user, get_admin_user,
    generate_otp, send_otp_email, send_welcome_email
)
from datetime import datetime, timedelta
import re
import os

# Google OAuth imports
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

router = APIRouter(prefix="/api/auth", tags=["Auth"])

# ── Schemas ────────────────────────────────────────────────────────
class RegisterSchema(BaseModel):
    name:     str
    email:    str
    password: str
    phone:    Optional[str] = None
    city:     Optional[str] = None

class LoginSchema(BaseModel):
    email:    str
    password: str

class OTPVerifySchema(BaseModel):
    email: str
    otp:   str

class ResendOTPSchema(BaseModel):
    email: str

class UpdateProfileSchema(BaseModel):
    name:   Optional[str] = None
    phone:  Optional[str] = None
    city:   Optional[str] = None
    fasal:  Optional[str] = None
    zameen: Optional[str] = None
    mitti:  Optional[str] = None
    tehsil: Optional[str] = None

# Google Login Schema
class GoogleLoginSchema(BaseModel):
    credential: str

def user_dict(u):
    return {
        "id":         u.id,
        "name":       u.name,
        "email":      u.email,
        "phone":      u.phone,
        "city":       u.city,
        "role":       u.role,
        "fasal":      u.fasal,
        "zameen":     u.zameen,
        "mitti":      u.mitti,
        "tehsil":     u.tehsil,
        "created_at": u.created_at,
    }

# Helper for Google login response
def _user_response(user: User) -> dict:
    token = create_access_token({"sub": str(user.id)})
    return {
        "token": token,
        "user": {
            "id":    user.id,
            "name":  user.name,
            "email": user.email,
            "role":  user.role,
            "city":  user.city,
            "phone": user.phone,
        }
    }

# ── REGISTER — Send OTP ───────────────────────────────────────────
@router.post("/register", status_code=201)
def register(data: RegisterSchema, db: Session = Depends(get_db)):
    # Email format check
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(pattern, data.email):
        raise HTTPException(400, "Please enter a valid email address")

    email = data.email.lower().strip()

    existing = db.query(User).filter(User.email == email).first()
    if existing:
        if existing.is_verified:
            raise HTTPException(400, "This email is already registered")
        else:
            # Unverified — send new OTP
            otp = generate_otp()
            existing.otp        = otp
            existing.otp_expiry = datetime.utcnow() + timedelta(minutes=10)
            db.commit()
            send_otp_email(email, otp, existing.name)
            return {"message": "OTP resent — please check your email", "step": "verify"}

    # New user
    otp  = generate_otp()
    user = User(
        name            = data.name.strip(),
        email           = email,
        phone           = data.phone or "",
        city            = data.city  or "",
        hashed_password = hash_password(data.password),
        role            = "farmer",
        is_active       = True,
        is_verified     = False,
        otp             = otp,
        otp_expiry      = datetime.utcnow() + timedelta(minutes=10),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    send_otp_email(email, otp, data.name)

    return {
        "message": "OTP sent to your email — please verify within 10 minutes",
        "step":    "verify"
    }

# ── VERIFY OTP ────────────────────────────────────────────────────
@router.post("/verify-otp")
def verify_otp(data: OTPVerifySchema, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email.lower().strip()).first()

    if not user:
        raise HTTPException(404, "Email not found — please register first")
    if user.is_verified:
        raise HTTPException(400, "Account already verified — please login")
    if user.otp != data.otp:
        raise HTTPException(400, "Invalid OTP — please check again")
    if user.otp_expiry and datetime.utcnow() > user.otp_expiry:
        raise HTTPException(400, "OTP has expired — please request a new one")

    user.is_verified = True
    user.otp         = None
    user.otp_expiry  = None
    db.commit()
    db.refresh(user)

    send_welcome_email(user.email, user.name)

    token = create_access_token({"sub": str(user.id)})
    return {
        "message": "✅ Account verified successfully! Welcome!",
        "token":   token,
        "user":    user_dict(user),
    }

# ── RESEND OTP ────────────────────────────────────────────────────
@router.post("/resend-otp")
def resend_otp(data: ResendOTPSchema, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email.lower().strip()).first()
    if not user:
        raise HTTPException(404, "Email not found")
    if user.is_verified:
        raise HTTPException(400, "Account already verified — please login")

    otp             = generate_otp()
    user.otp        = otp
    user.otp_expiry = datetime.utcnow() + timedelta(minutes=10)
    db.commit()

    send_otp_email(user.email, otp, user.name)
    return {"message": "New OTP sent — please check your email"}

# ── LOGIN ─────────────────────────────────────────────────────────
@router.post("/login")
def login(data: LoginSchema, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email.lower().strip()).first()

    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(401, "Invalid email or password")

    if not user.is_verified:
        otp             = generate_otp()
        user.otp        = otp
        user.otp_expiry = datetime.utcnow() + timedelta(minutes=10)
        db.commit()
        send_otp_email(user.email, otp, user.name)
        raise HTTPException(403, "Please verify your email first — a new OTP has been sent")

    if not user.is_active:
        raise HTTPException(403, "Account is disabled — contact admin")

    token = create_access_token({"sub": str(user.id)})
    return {"message": "Login successful!", "token": token, "user": user_dict(user)}

# ── GET PROFILE ───────────────────────────────────────────────────
@router.get("/me")
def get_profile(current_user: User = Depends(get_current_user)):
    return user_dict(current_user)

# ── UPDATE PROFILE ────────────────────────────────────────────────
@router.put("/me")
def update_profile(
    data:         UpdateProfileSchema,
    current_user: User    = Depends(get_current_user),
    db:           Session = Depends(get_db),
):
    if data.name   is not None: current_user.name   = data.name
    if data.phone  is not None: current_user.phone  = data.phone
    if data.city   is not None: current_user.city   = data.city
    if data.fasal  is not None: current_user.fasal  = data.fasal
    if data.zameen is not None: current_user.zameen = data.zameen
    if data.mitti  is not None: current_user.mitti  = data.mitti
    if data.tehsil is not None: current_user.tehsil = data.tehsil
    db.commit()
    db.refresh(current_user)
    return {"message": "Profile updated successfully!", "user": user_dict(current_user)}

# ── ADMIN: ALL USERS ──────────────────────────────────────────────
@router.get("/admin/users")
def all_users(db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    users = db.query(User).all()
    return [user_dict(u) | {"is_active": u.is_active, "is_verified": u.is_verified} for u in users]

# ── ADMIN: TOGGLE USER ────────────────────────────────────────────
@router.patch("/admin/users/{user_id}/toggle")
def toggle_user(user_id: int, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user: raise HTTPException(404, "User not found")
    user.is_active = not user.is_active
    db.commit()
    return {"message": f"User {'activated' if user.is_active else 'deactivated'} successfully", "is_active": user.is_active}

# ── ADMIN: DELETE USER ────────────────────────────────────────────
@router.delete("/admin/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    from sqlalchemy import text

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")

    # Sab related tables raw SQL se delete karo
    db.execute(text("DELETE FROM community_likes    WHERE user_id = :uid"), {"uid": user_id})
    db.execute(text("DELETE FROM community_comments WHERE user_id = :uid"), {"uid": user_id})

    # Is user ke posts ki bhi likes/comments delete karo
    db.execute(text("""
        DELETE FROM community_likes
        WHERE post_id IN (SELECT id FROM community_posts WHERE user_id = :uid)
    """), {"uid": user_id})
    db.execute(text("""
        DELETE FROM community_comments
        WHERE post_id IN (SELECT id FROM community_posts WHERE user_id = :uid)
    """), {"uid": user_id})

    db.execute(text("DELETE FROM community_posts WHERE user_id = :uid"),    {"uid": user_id})
    db.execute(text("DELETE FROM feedback         WHERE user_id = :uid"),   {"uid": user_id})
    db.execute(text("DELETE FROM push_subscriptions WHERE user_id = :uid"), {"uid": user_id})

    # Farm data
    db.execute(text("""
        DELETE FROM farm_expenses
        WHERE season_id IN (SELECT id FROM farm_seasons WHERE user_id = :uid)
    """), {"uid": user_id})
    db.execute(text("""
        DELETE FROM farm_incomes
        WHERE season_id IN (SELECT id FROM farm_seasons WHERE user_id = :uid)
    """), {"uid": user_id})
    db.execute(text("DELETE FROM farm_seasons WHERE user_id = :uid"), {"uid": user_id})

    db.flush()
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}

# ══════════════════════════════════════════════════════════════════
# GOOGLE LOGIN ENDPOINT
# ══════════════════════════════════════════════════════════════════
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

@router.post("/google")
def google_login(data: GoogleLoginSchema, db: Session = Depends(get_db)):
    try:
        idinfo = id_token.verify_oauth2_token(
            data.credential,
            google_requests.Request(),
            GOOGLE_CLIENT_ID
        )
    except Exception:
        raise HTTPException(401, "Google login failed — please try again")

    email = idinfo.get("email", "").lower()
    name  = idinfo.get("name", "Google User")

    if not email:
        raise HTTPException(400, "Could not retrieve email from Google account")

    user = db.query(User).filter(User.email == email).first()
    if user:
        if not user.is_active:
            raise HTTPException(403, "Account is disabled")
        if not user.is_verified:
            user.is_verified = True
            db.commit()
    else:
        user = User(
            name            = name,
            email           = email,
            hashed_password = hash_password(os.urandom(32).hex()),
            role            = "farmer",
            is_active       = True,
            is_verified     = True,
            otp             = None,
            otp_expiry      = None,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        send_welcome_email(email, name)

    return {"message": "Google login successful!", **_user_response(user)}

from sqlalchemy import func
from models import MandiPrice, Feedback, UserFeedback, ChatLog

@router.get("/admin/stats")
def admin_stats(db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    today = datetime.utcnow().date()
    return {
        "total_users":      db.query(func.count(User.id)).scalar(),
        "active_users":     db.query(func.count(User.id)).filter(User.is_active == True).scalar(),
        "admin_users":      db.query(func.count(User.id)).filter(User.role == "admin").scalar(),
        "farmer_users":     db.query(func.count(User.id)).filter(User.role == "farmer").scalar(),
        "today_users":      db.query(func.count(User.id)).filter(func.date(User.created_at) == today).scalar(),
        "total_reviews":    db.query(func.count(Feedback.id)).scalar(),
        "avg_rating":       round(float(db.query(func.avg(Feedback.rating)).scalar() or 0), 1),
        "total_feedback":   db.query(func.count(UserFeedback.id)).scalar(),
        "pending_feedback": db.query(func.count(UserFeedback.id)).filter(UserFeedback.is_resolved == False).scalar(),
        "mandi_count":      db.query(func.count(MandiPrice.id)).scalar(),
        "chat_count":       db.query(func.count(ChatLog.id)).scalar(),
    }