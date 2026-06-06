# backend/routes/password_reset.py
import os
import secrets
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from database import get_db
from models import User
from auth import hash_password
from utils.email import send_password_reset_email
from middleware.rate_limit import auth_rate_limit

router = APIRouter(prefix="/api/auth", tags=["Password Reset"])

# ── In-memory token store ─────────────────────────────────────────
# Format: { "token": {"user_id": 1, "expires": datetime} }
reset_tokens = {}

class ForgotSchema(BaseModel):
    email: EmailStr

class ResetSchema(BaseModel):
    token:    str
    password: str

# ── Forgot Password ───────────────────────────────────────────────
@router.post("/forgot-password")
def forgot_password(
    data: ForgotSchema,
    db:   Session = Depends(get_db),
    _:    None    = Depends(auth_rate_limit),
):
    user = db.query(User).filter(User.email == data.email).first()

    # Security: respond the same whether email exists or not,
    # to prevent email enumeration
    if not user:
        return {"message": "If the email is registered, you will receive a reset link."}

    # Generate token — 32 random bytes
    token   = secrets.token_urlsafe(32)
    expires = datetime.utcnow() + timedelta(minutes=30)

    # Store
    reset_tokens[token] = {
        "user_id": user.id,
        "email":   user.email,
        "expires": expires,
    }

    # Send email
    sent = send_password_reset_email(user.email, user.name, token)

    if not sent:
        raise HTTPException(
            status_code=500,
            detail="Could not send email — please try again later."
        )

    return {"message": "Password reset link has been sent to your email."}


# ── Verify Token ──────────────────────────────────────────────────
@router.get("/verify-reset-token/{token}")
def verify_token(token: str):
    token_data = reset_tokens.get(token)

    if not token_data:
        raise HTTPException(status_code=400, detail="Invalid or expired link.")

    if datetime.utcnow() > token_data["expires"]:
        del reset_tokens[token]
        raise HTTPException(status_code=400, detail="Link has expired — please request a new one.")

    return {"valid": True, "email": token_data["email"]}


# ── Reset Password ────────────────────────────────────────────────
@router.post("/reset-password")
def reset_password(
    data: ResetSchema,
    db:   Session = Depends(get_db),
):
    token_data = reset_tokens.get(data.token)

    if not token_data:
        raise HTTPException(status_code=400, detail="Invalid or expired link.")

    if datetime.utcnow() > token_data["expires"]:
        del reset_tokens[data.token]
        raise HTTPException(status_code=400, detail="Link has expired — please request a new one.")

    # Password validation
    if len(data.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters.")

    if len(data.password) > 72:
        raise HTTPException(status_code=400, detail="Password cannot exceed 72 characters.")

    # Find user and update password
    user = db.query(User).filter(User.id == token_data["user_id"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    user.hashed_password = hash_password(data.password)
    db.commit()

    # Delete token — can only be used once
    del reset_tokens[data.token]

    return {"message": "Password changed successfully! You can now log in."}