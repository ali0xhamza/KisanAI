# backend/routes/verification.py
import secrets
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import Column, Boolean, String
from database import get_db
from models import User
from utils.email import send_email
from dotenv import load_dotenv
import os

load_dotenv()

router = APIRouter(prefix="/api/auth", tags=["Verification"])

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

# ── In-memory verification tokens ────────────────────────────────
verify_tokens = {}

def send_verification_email(to_email: str, name: str, token: str) -> bool:
    verify_url = f"{FRONTEND_URL}/verify-email?token={token}"
    html = f"""
    <!DOCTYPE html>
    <html><head><meta charset="utf-8"></head>
    <body style="font-family:Arial,sans-serif;background:#f3faf4;padding:20px;margin:0;">
      <div style="max-width:500px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
        <div style="background:linear-gradient(135deg,#1B4D2E,#2D7A47);padding:32px;text-align:center;">
          <div style="font-size:48px;margin-bottom:8px;">🌾</div>
          <h1 style="color:white;margin:0;font-size:24px;">KisanAI</h1>
          <p style="color:#A7D9B5;margin:4px 0 0;font-size:13px;">Smart Farming Assistant 🇵🇰</p>
        </div>
        <div style="padding:32px;">
          <h2 style="color:#1B4D2E;margin:0 0 16px;">Verify Your Email ✅</h2>
          <p style="color:#444;line-height:1.6;margin:0 0 12px;">Dear <strong>{name}</strong>,</p>
          <p style="color:#444;line-height:1.6;margin:0 0 24px;">To activate your account, please click the button below:</p>
          <div style="text-align:center;margin:24px 0;">
            <a href="{verify_url}" style="background:linear-gradient(135deg,#1B4D2E,#2D7A47);color:white;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:bold;font-size:15px;display:inline-block;">
              ✅ Verify Email
            </a>
          </div>
          <p style="color:#888;font-size:12px;line-height:1.6;margin:24px 0 0;">
            ⏰ This link is valid for <strong>24 hours</strong>.<br>
            ⚠️ If you did not register, please ignore this email.
          </p>
        </div>
        <div style="background:#f3faf4;padding:16px;text-align:center;border-top:1px solid #e0f0e0;">
          <p style="color:#999;font-size:11px;margin:0;">KisanAI – For Pakistani Farmers 🇵🇰</p>
        </div>
      </div>
    </body></html>
    """
    return send_email(to_email, "KisanAI — Verify Your Email", html)

# ── Send verification email ───────────────────────────────────────
@router.post("/send-verification")
def send_verification(db: Session = Depends(get_db), email: str = ""):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    token   = secrets.token_urlsafe(32)
    expires = datetime.utcnow() + timedelta(hours=24)
    verify_tokens[token] = {"user_id": user.id, "expires": expires}

    send_verification_email(user.email, user.name, token)
    return {"message": "Verification email sent"}

# ── Verify email token ────────────────────────────────────────────
@router.get("/verify-email/{token}")
def verify_email(token: str, db: Session = Depends(get_db)):
    token_data = verify_tokens.get(token)

    if not token_data:
        raise HTTPException(status_code=400, detail="Invalid or expired link")

    if datetime.utcnow() > token_data["expires"]:
        del verify_tokens[token]
        raise HTTPException(status_code=400, detail="Link has expired")

    user = db.query(User).filter(User.id == token_data["user_id"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = True
    db.commit()
    del verify_tokens[token]

    return {"message": "Email verified successfully! You can now log in.", "verified": True}