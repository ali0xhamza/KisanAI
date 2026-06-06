# backend/routes/admin.py
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, validator
from sqlalchemy.orm import Session
from database import get_db
from auth import get_admin_user, verify_password, hash_password, send_brevo_email
from models import User

router = APIRouter(prefix="/api/admin", tags=["Admin"])


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password:     str
    confirm_password: str

    @validator("new_password")
    def password_strong(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v

    @validator("confirm_password")
    def passwords_match(cls, v, values):
        if "new_password" in values and v != values["new_password"]:
            raise ValueError("Passwords do not match")
        return v


@router.post("/change-password")
def admin_change_password(
    data:         ChangePasswordRequest,
    current_user: User    = Depends(get_admin_user),
    db:           Session = Depends(get_db),
):
    # 1. Current password verify karo
    if not verify_password(data.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    # 2. Naya password purane se alag hona chahiye
    if data.current_password == data.new_password:
        raise HTTPException(status_code=400, detail="New password must be different from current password")

    # 3. Hash karke save karo
    current_user.hashed_password = hash_password(data.new_password)
    db.commit()

    # 4. Confirmation email bhejo
    html = f"""
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:16px">
        <div style="text-align:center;margin-bottom:24px">
            <span style="font-size:40px">🌾</span>
            <h2 style="color:#1B4D2E;margin:8px 0">KisanAI Admin</h2>
        </div>
        <div style="background:white;border-radius:12px;padding:24px">
            <h3 style="color:#1B4D2E">🔐 Password Changed Successfully</h3>
            <p style="color:#444;font-size:14px;line-height:1.7">
                Dear <b>{current_user.name}</b>,<br><br>
                Your admin password has been changed successfully.<br>
                If you did not make this change, please contact support immediately.
            </p>
            <div style="background:#FFF3CD;border-radius:8px;padding:12px;margin-top:16px">
                <p style="color:#856404;font-size:13px;margin:0">
                    ⚠️ If this was not you, someone may have access to your account.
                </p>
            </div>
        </div>
        <p style="text-align:center;color:#aaa;font-size:11px;margin-top:16px">
            © 2026 KisanAI — UET Lahore
        </p>
    </div>
    """
    send_brevo_email(current_user.email, current_user.name, "KisanAI — Password Changed", html)

    return {"success": True, "message": "Password changed successfully"}