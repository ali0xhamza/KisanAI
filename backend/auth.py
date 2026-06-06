# backend/auth.py
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database import get_db
from models import User
from dotenv import load_dotenv
import os
import random
import string
import requests

load_dotenv()

SECRET_KEY  = os.getenv("SECRET_KEY")
ALGORITHM   = os.getenv("ALGORITHM", "HS256")
EXPIRE_MINS = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 10080))

# Brevo setup
BREVO_API_KEY = os.getenv("BREVO_API_KEY")
FROM_EMAIL    = os.getenv("FROM_EMAIL", "kisanai.noreply@gmail.com")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# ── Password helpers ───────────────────────────────────────────────
def hash_password(password: str) -> str:
    pwd_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

# ── Token helpers ──────────────────────────────────────────────────
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=EXPIRE_MINS))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None

# ── OTP helpers ────────────────────────────────────────────────────
def generate_otp() -> str:
    return ''.join(random.choices(string.digits, k=6))

def send_brevo_email(to_email: str, to_name: str, subject: str, html: str) -> bool:
    try:
        response = requests.post(
            "https://api.brevo.com/v3/smtp/email",
            headers={
                "api-key": BREVO_API_KEY,
                "Content-Type": "application/json"
            },
            json={
                "sender": {"name": "KisanAI", "email": FROM_EMAIL},
                "to": [{"email": to_email, "name": to_name}],
                "subject": subject,
                "htmlContent": html
            }
        )
        if response.status_code in (200, 201):
            return True
        print(f"Brevo error: {response.status_code} — {response.text}")
        return False
    except Exception as e:
        print(f"Email send error: {e}")
        return False

def send_otp_email(email: str, otp: str, name: str = "") -> bool:
    html = f"""
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:16px">
        <div style="text-align:center;margin-bottom:24px">
            <span style="font-size:40px">🌾</span>
            <h2 style="color:#1B4D2E;margin:8px 0">KisanAI</h2>
        </div>
        <div style="background:white;border-radius:12px;padding:24px;text-align:center">
            <p style="color:#444;font-size:15px">Dear <b>{name}</b>,</p>
            <p style="color:#444;font-size:14px">Your OTP code is:</p>
            <div style="background:#F0F7F0;border-radius:12px;padding:20px;margin:16px 0">
                <span style="font-size:36px;font-weight:900;letter-spacing:8px;color:#1B4D2E">{otp}</span>
            </div>
            <p style="color:#888;font-size:12px">This code will expire in <b>10 minutes</b>.</p>
            <p style="color:#888;font-size:12px">If you did not register, please ignore this email.</p>
        </div>
        <p style="text-align:center;color:#aaa;font-size:11px;margin-top:16px">
            © 2026 KisanAI — UET Lahore
        </p>
    </div>
    """
    return send_brevo_email(email, name, "KisanAI — Your OTP Code", html)

def send_welcome_email(email: str, name: str) -> bool:
    html = f"""
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:16px">
        <div style="text-align:center;margin-bottom:24px">
            <span style="font-size:40px">🌾</span>
            <h2 style="color:#1B4D2E;margin:8px 0">KisanAI</h2>
        </div>
        <div style="background:white;border-radius:12px;padding:24px">
            <h3 style="color:#1B4D2E">Welcome, {name}! 🎉</h3>
            <p style="color:#444;font-size:14px;line-height:1.7">
                Your KisanAI account has been successfully created.<br>
                You can now use the following features:
            </p>
            <ul style="color:#444;font-size:14px;line-height:2">
                <li>🤖 AI Chat — ask about crop problems</li>
                <li>🔬 Disease Scanner — identify from photos</li>
                <li>💰 Mandi Rates — daily market prices</li>
                <li>⛅ Weather — 7‑day forecast</li>
                <li>🧪 Fertilizer Guide — AI‑based recommendations</li>
            </ul>
            <div style="text-align:center;margin-top:24px">
                <a href="http://localhost:5173"
                   style="background:linear-gradient(135deg,#1B4D2E,#2D7A47);color:white;padding:14px 32px;border-radius:50px;text-decoration:none;font-weight:700;font-size:14px">
                    Open App →
                </a>
            </div>
        </div>
        <p style="text-align:center;color:#aaa;font-size:11px;margin-top:16px">
            © 2026 KisanAI — UET Lahore
        </p>
    </div>
    """
    return send_brevo_email(email, name, "Welcome to KisanAI! 🌾", html)

# ── Current user dependency ────────────────────────────────────────
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_token(token)
    if not payload:
        raise credentials_exception

    user_id: int = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user or not user.is_active:
        raise credentials_exception
    return user

def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can access this resource"
        )
    return current_user