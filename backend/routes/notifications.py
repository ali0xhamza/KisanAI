from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import Column, Integer, Text, ForeignKey
from pydantic import BaseModel
from database import get_db, Base
from models import User
from auth import get_current_user, get_admin_user
from pywebpush import webpush, WebPushException
import os, json

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

# ── Model ────────────────────────────────────────────────────────
class PushSubscription(Base):
    __tablename__ = "push_subscriptions"
    id       = Column(Integer, primary_key=True, index=True)
    user_id  = Column(Integer, ForeignKey("users.id"), nullable=False)
    endpoint = Column(Text, nullable=False)
    p256dh   = Column(Text, nullable=False)
    auth     = Column(Text, nullable=False)

# ── Schema ───────────────────────────────────────────────────────
class SubscriptionData(BaseModel):
    endpoint: str
    keys: dict

# ── Subscribe ────────────────────────────────────────────────────
@router.post("/subscribe")
def subscribe(
    data: SubscriptionData,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    existing = db.query(PushSubscription).filter(
        PushSubscription.user_id == user.id
    ).first()

    if existing:
        existing.endpoint = data.endpoint
        existing.p256dh   = data.keys.get("p256dh", "")
        existing.auth     = data.keys.get("auth", "")
    else:
        sub = PushSubscription(
            user_id  = user.id,
            endpoint = data.endpoint,
            p256dh   = data.keys.get("p256dh", ""),
            auth     = data.keys.get("auth", ""),
        )
        db.add(sub)

    db.commit()
    return {"message": "Subscribed successfully"}

# ── Send to one user ─────────────────────────────────────────────
def send_push(user_id: int, title: str, body: str, url: str = "/", db: Session = None):
    if not db:
        return
    sub = db.query(PushSubscription).filter(
        PushSubscription.user_id == user_id
    ).first()
    if not sub:
        return
    try:
        webpush(
            subscription_info={
                "endpoint": sub.endpoint,
                "keys": {"p256dh": sub.p256dh, "auth": sub.auth}
            },
            data=json.dumps({"title": title, "body": body, "url": url}),
            vapid_private_key=os.getenv("VAPID_PRIVATE_KEY"),
            vapid_claims={"sub": os.getenv("VAPID_EMAIL")},
        )
    except WebPushException as e:
        print(f"Push failed: {e}")

# ── Send to all subscribers ──────────────────────────────────────
def send_push_all(title: str, body: str, url: str = "/", db: Session = None):
    if not db:
        return
    subs = db.query(PushSubscription).all()
    for sub in subs:
        try:
            webpush(
                subscription_info={
                    "endpoint": sub.endpoint,
                    "keys": {"p256dh": sub.p256dh, "auth": sub.auth}
                },
                data=json.dumps({"title": title, "body": body, "url": url}),
                vapid_private_key=os.getenv("VAPID_PRIVATE_KEY"),
                vapid_claims={"sub": os.getenv("VAPID_EMAIL")},
            )
        except WebPushException as e:
            print(f"Push failed for user {sub.user_id}: {e}")

@router.post("/test-weather")
async def test_weather_notification(
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    from utils.scheduler import check_weather_and_notify
    await check_weather_and_notify()
    return {"message": "Weather check completed!"}

@router.get("/stats")
def notification_stats(db: Session = Depends(get_db)):
    count = db.query(PushSubscription).count()
    return {"count": count}