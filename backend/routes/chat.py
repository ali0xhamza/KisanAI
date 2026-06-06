# backend/routes/chat.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models import ChatLog
from auth import get_current_user
from models import User

router = APIRouter(prefix="/api/chat", tags=["Chat"])

class ChatSaveSchema(BaseModel):
    message:  str
    response: str

@router.post("/save", status_code=201)
def save_chat(data: ChatSaveSchema, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    log = ChatLog(
        user_id=current_user.id,
        message=data.message,
        response=data.response,
    )
    db.add(log)
    db.commit()
    return {"message": "Chat saved successfully!"}

@router.get("/history")
def get_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    logs = db.query(ChatLog).filter(ChatLog.user_id == current_user.id).order_by(ChatLog.created_at.desc()).limit(50).all()
    return [
        {
            "id":         log.id,
            "message":    log.message,
            "response":   log.response,
            "created_at": log.created_at,
        }
        for log in logs
    ]