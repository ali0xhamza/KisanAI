import os
from routes.reports import router as reports_router
from routes.diary import router as diary_router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routes import users, mandi, chat, ai, password_reset, verification
from routes.expense_tracker import router as expense_router
from utils.scheduler import start_scheduler
from routes.mandi import router as mandi_router
from routes.feedback import router as feedback_router
from routes.user_feedback import router as user_feedback_router
from routes.spray_calculator import router
from routes.yield_prediction import router as yield_router
from routes.notifications import router as notifications_router
from routes.admin import router as admin_router


try:
    from routes.recommendation import router as rec_router
    from routes.community import router as community_router
    has_extra_routes = True
except:
    has_extra_routes = False

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="KisanAI Backend API",
    description="AI-powered agriculture assistant for Pakistani farmers",
    version="2.0.0",
    docs_url="/docs" if os.getenv("ENV") != "production" else None,
    redoc_url=None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "https://kisan-ai-woad.vercel.app",
        "https://kisan-ai-git-main-ali-hamza-s-projects2.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(chat.router)
app.include_router(ai.router)
app.include_router(password_reset.router)
app.include_router(verification.router)
app.include_router(mandi_router)
app.include_router(expense_router)
app.include_router(diary_router,   prefix="/api/diary",   tags=["Fasal Diary"])
app.include_router(reports_router, prefix="/api/reports", tags=["Reports"])
app.include_router(feedback_router)
app.include_router(user_feedback_router)
app.include_router(router)
app.include_router(yield_router, prefix="/api/yield")
app.include_router(notifications_router)
app.include_router(admin_router)


if has_extra_routes:
    app.include_router(community_router)
    app.include_router(rec_router, prefix="/api/recommendation", tags=["recommendation"])

@app.on_event("startup")
async def startup():
    start_scheduler()

@app.get("/")
def root():
    return {"app": "KisanAI Backend", "version": "2.0.0", "status": "✅ Running!"}

@app.get("/health")
def health():
    return {"status": "ok"}