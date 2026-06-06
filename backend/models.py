from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, Text, ForeignKey, Numeric, Date
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime
import enum


class User(Base):
    __tablename__ = "users"

    id              = Column(Integer, primary_key=True, index=True)
    name            = Column(String(100), nullable=False)
    email           = Column(String(150), unique=True, index=True, nullable=False)
    phone           = Column(String(20),  nullable=True)
    city            = Column(String(100), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    role            = Column(String(20),  default="farmer")
    is_active       = Column(Boolean,     default=True)

    fasal           = Column(String(100), nullable=True)
    zameen          = Column(String(50),  nullable=True)
    mitti           = Column(String(50),  nullable=True)
    tehsil          = Column(String(100), nullable=True)

    # ── Email Verification (NEW) ──────────────────────────────────
    is_verified     = Column(Boolean,   default=False)
    otp             = Column(String(6), nullable=True)
    otp_expiry      = Column(DateTime,  nullable=True)

    created_at      = Column(DateTime(timezone=True), server_default=func.now())
    updated_at      = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    community_posts    = relationship("CommunityPost",    back_populates="author")
    community_comments = relationship("CommunityComment", back_populates="author")
    community_likes    = relationship("CommunityLike",    back_populates="user")
    feedback           = relationship("Feedback",         back_populates="user")


class MandiPrice(Base):
    __tablename__ = "mandi_prices"

    id         = Column(Integer, primary_key=True, index=True)
    fasal_urdu = Column(String(50),  nullable=False)
    fasal_eng  = Column(String(100), nullable=False)
    city       = Column(String(100), nullable=False)
    price      = Column(Float,       nullable=False)
    unit       = Column(String(30),  default="40 kg")
    change     = Column(Float,       default=0)
    price_date = Column(String(20),  nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class ChatLog(Base):
    __tablename__ = "chat_logs"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, nullable=True)
    message    = Column(Text,    nullable=False)
    response   = Column(Text,    nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class FarmSeason(Base):
    __tablename__ = "farm_seasons"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"))
    crop_name  = Column(String(100))
    field_area = Column(Numeric)
    area_unit  = Column(String(20), default="acre")
    start_date = Column(Date)
    end_date   = Column(Date, nullable=True)
    status     = Column(String(20), default="active")
    created_at = Column(DateTime, default=datetime.utcnow)
    expenses   = relationship("FarmExpense", back_populates="season", cascade="all, delete")
    incomes    = relationship("FarmIncome",  back_populates="season", cascade="all, delete")


class FarmExpense(Base):
    __tablename__ = "farm_expenses"

    id           = Column(Integer, primary_key=True, index=True)
    season_id    = Column(Integer, ForeignKey("farm_seasons.id"))
    category     = Column(String(50))
    description  = Column(Text, nullable=True)
    amount       = Column(Numeric(10, 2))
    expense_date = Column(Date)
    created_at   = Column(DateTime, default=datetime.utcnow)
    season       = relationship("FarmSeason", back_populates="expenses")


class FarmIncome(Base):
    __tablename__ = "farm_incomes"

    id             = Column(Integer, primary_key=True, index=True)
    season_id      = Column(Integer, ForeignKey("farm_seasons.id"))
    source         = Column(String(100))
    quantity       = Column(Numeric, nullable=True)
    unit           = Column(String(20), nullable=True)
    price_per_unit = Column(Numeric, nullable=True)
    total_amount   = Column(Numeric(10, 2))
    sale_date      = Column(Date)
    created_at     = Column(DateTime, default=datetime.utcnow)
    season         = relationship("FarmSeason", back_populates="incomes")


class CommunityPost(Base):
    __tablename__ = "community_posts"

    id         = Column(Integer, primary_key=True, index=True)
    title      = Column(String(200), nullable=False)
    content    = Column(Text,        nullable=False)
    category   = Column(String(50),  nullable=False)
    likes      = Column(Integer,     default=0)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    author   = relationship("User",             back_populates="community_posts")
    comments = relationship("CommunityComment", back_populates="post", cascade="all, delete-orphan")
    liked_by = relationship("CommunityLike",    back_populates="post", cascade="all, delete-orphan")


class CommunityComment(Base):
    __tablename__ = "community_comments"

    id             = Column(Integer, primary_key=True, index=True)
    content        = Column(Text,    nullable=False)
    is_ai_response = Column(Boolean, default=False)
    post_id        = Column(Integer, ForeignKey("community_posts.id"), nullable=False)
    user_id        = Column(Integer, ForeignKey("users.id"),           nullable=False)
    created_at     = Column(DateTime, default=datetime.utcnow)

    post   = relationship("CommunityPost", back_populates="comments")
    author = relationship("User",          back_populates="community_comments")


class CommunityLike(Base):
    __tablename__ = "community_likes"

    id      = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("community_posts.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"),           nullable=False)

    post = relationship("CommunityPost", back_populates="liked_by")
    user = relationship("User",          back_populates="community_likes")


class Feedback(Base):
    __tablename__ = "feedback"

    id          = Column(Integer, primary_key=True, index=True)
    user_id     = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating      = Column(Integer,     nullable=False)
    review      = Column(Text,        nullable=False)
    city        = Column(String(100), default="")
    crop        = Column(String(100), default="")
    is_approved = Column(Boolean,     default=False)
    created_at  = Column(DateTime,    default=datetime.utcnow)

    user = relationship("User", back_populates="feedback")


class FeedbackTypeEnum(str, enum.Enum):
    bug       = "bug"
    feature   = "feature"
    feedback  = "feedback"
    complaint = "complaint"


class UserFeedback(Base):
    __tablename__ = "user_feedback"

    id            = Column(Integer, primary_key=True, index=True)
    name          = Column(String(100), nullable=False)
    email         = Column(String(150), nullable=False)
    feedback_type = Column(String(20),  nullable=False, default="feedback")
    message       = Column(Text,        nullable=False)
    is_resolved   = Column(Boolean,     default=False)
    created_at    = Column(DateTime,    default=datetime.utcnow)