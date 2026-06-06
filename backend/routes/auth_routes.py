# backend/routes/auth_routes.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, validator
from typing import Optional
from database import get_db
from models import User
from auth import (
    hash_password, verify_password, create_access_token,
    generate_otp, send_otp_email, send_welcome_email, get_current_user
)
from datetime import datetime, timedelta
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import os
import re

router = APIRouter(prefix="/api/auth", tags=["Auth"])

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

# ── Schemas ────────────────────────────────────────────────────────
class RegisterSchema(BaseModel):
    name:     str
    email:    str
    password: str
    phone:    Optional[str] = ""
    city:     Optional[str] = ""

    @validator('email')
    def email_valid(cls, v):
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(pattern, v):
            raise ValueError('Please enter a valid email address')
        return v.lower().strip()

    @validator('password')
    def password_strong(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        return v

    @validator('name')
    def name_valid(cls, v):
        if len(v.strip()) < 2:
            raise ValueError('Please enter your name')
        return v.strip()

class OTPVerifySchema(BaseModel):
    email: str
    otp:   str

class LoginSchema(BaseModel):
    email:    str
    password: str

class ResendOTPSchema(BaseModel):
    email: str

class GoogleLoginSchema(BaseModel):
    credential: str   # Google ID token

# ── Helper: user response ──────────────────────────────────────────
def _user_response(user: User, db: Session) -> dict:
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

# ── REGISTER — Step 1 ─────────────────────────────────────────────
@router.post("/register")
def register(data: RegisterSchema, db: Session = Depends(get_db)):
    # Email already exist?
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        if existing.is_verified:
            raise HTTPException(400, "This email is already registered")
        else:
            # Unverified — send new OTP
            otp        = generate_otp()
            existing.otp        = otp
            existing.otp_expiry = datetime.utcnow() + timedelta(minutes=10)
            db.commit()
            send_otp_email(data.email, otp, existing.name)
            return {"message": "OTP resent — please check your email", "step": "verify"}

    # New user — create unverified
    otp  = generate_otp()
    user = User(
        name            = data.name,
        email           = data.email,
        hashed_password = hash_password(data.password),
        phone           = data.phone or "",
        city            = data.city  or "",
        role            = "farmer",
        is_active       = True,
        is_verified     = False,
        otp             = otp,
        otp_expiry      = datetime.utcnow() + timedelta(minutes=10),
    )
    db.add(user)
    db.commit()

    # Send OTP email
    send_otp_email(data.email, otp, data.name)

    return {
        "message": "OTP sent to your email — please verify within 10 minutes",
        "step":    "verify"
    }

# ── VERIFY OTP — Step 2 ───────────────────────────────────────────
@router.post("/verify-otp")
def verify_otp(data: OTPVerifySchema, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email.lower().strip()).first()

    if not user:
        raise HTTPException(404, "Email not found — please register first")

    if user.is_verified:
        raise HTTPException(400, "Account already verified — please login")

    # OTP check
    if user.otp != data.otp:
        raise HTTPException(400, "Invalid OTP — please check again")

    # Expiry check
    if user.otp_expiry and datetime.utcnow() > user.otp_expiry:
        raise HTTPException(400, "OTP has expired — please request a new one")

    # Verify
    user.is_verified = True
    user.otp         = None
    user.otp_expiry  = None
    db.commit()
    db.refresh(user)

    # Welcome email
    send_welcome_email(user.email, user.name)

    return {
        "message": "✅ Account verified successfully!",
        **_user_response(user, db)
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

    send_otp_email(data.email, otp, user.name)
    return {"message": "New OTP sent — please check your email"}

# ── LOGIN ─────────────────────────────────────────────────────────
@router.post("/login")
def login(data: LoginSchema, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email.lower().strip()).first()

    if not user:
        raise HTTPException(401, "Invalid email or password")

    if not verify_password(data.password, user.hashed_password):
        raise HTTPException(401, "Invalid email or password")

    if not user.is_verified:
        # Resend OTP
        otp             = generate_otp()
        user.otp        = otp
        user.otp_expiry = datetime.utcnow() + timedelta(minutes=10)
        db.commit()
        send_otp_email(user.email, otp, user.name)
        raise HTTPException(403, "Please verify your email first — a new OTP has been sent")

    if not user.is_active:
        raise HTTPException(403, "Account is disabled — contact admin")

    return {"message": "Login successful!", **_user_response(user, db)}

# ── GOOGLE LOGIN ──────────────────────────────────────────────────
@router.post("/google")
def google_login(data: GoogleLoginSchema, db: Session = Depends(get_db)):
    try:
        # Verify Google token
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

    # Existing user?
    user = db.query(User).filter(User.email == email).first()

    if user:
        # Already exists — just login
        if not user.is_active:
            raise HTTPException(403, "Account is disabled")
        # Google login — auto verify
        if not user.is_verified:
            user.is_verified = True
            db.commit()
    else:
        # New user — create from Google (no OTP needed)
        user = User(
            name            = name,
            email           = email,
            hashed_password = hash_password(os.urandom(32).hex()),  # random password
            role            = "farmer",
            is_active       = True,
            is_verified     = True,   # Google verified
            otp             = None,
            otp_expiry      = None,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        send_welcome_email(email, name)

    return {"message": "Google login successful!", **_user_response(user, db)}

# ── GET PROFILE ───────────────────────────────────────────────────
@router.get("/profile")
def get_profile(current_user: User = Depends(get_current_user)):
    return {
        "id":    current_user.id,
        "name":  current_user.name,
        "email": current_user.email,
        "role":  current_user.role,
        "city":  current_user.city,
        "phone": current_user.phone,
    }

# ── UPDATE PROFILE ────────────────────────────────────────────────
class UpdateProfileSchema(BaseModel):
    name:   Optional[str] = None
    phone:  Optional[str] = None
    city:   Optional[str] = None
    fasal:  Optional[str] = None
    zameen: Optional[str] = None
    mitti:  Optional[str] = None
    tehsil: Optional[str] = None

@router.put("/profile")
def update_profile(
    data: UpdateProfileSchema,
    db:   Session = Depends(get_db),
    user: User    = Depends(get_current_user)
):
    if data.name:   user.name   = data.name
    if data.phone:  user.phone  = data.phone
    if data.city:   user.city   = data.city
    if data.fasal:  user.fasal  = data.fasal
    if data.zameen: user.zameen = data.zameen
    if data.mitti:  user.mitti  = data.mitti
    if data.tehsil: user.tehsil = data.tehsil
    db.commit()
    db.refresh(user)
    return {"message": "Profile updated successfully!", "user": {
        "id":    user.id,
        "name":  user.name,
        "email": user.email,
        "role":  user.role,
        "city":  user.city,
        "phone": user.phone,
    }}