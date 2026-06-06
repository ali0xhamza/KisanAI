from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import FarmSeason, FarmExpense, FarmIncome
from auth import get_current_user
from pydantic import BaseModel
from datetime import date
from typing import Optional

router = APIRouter(prefix="/api/expense", tags=["Expense Tracker"])


# ── Schemas ────────────────────────────────────────────────────────

class SeasonCreate(BaseModel):
    crop_name:  str
    field_area: float
    area_unit:  str = "acre"
    start_date: date

class ExpenseCreate(BaseModel):
    season_id:    int
    category:     str
    description:  Optional[str] = None
    amount:       float
    expense_date: date

class IncomeCreate(BaseModel):
    season_id:      int
    source:         str
    quantity:       Optional[float] = None
    unit:           Optional[str]   = None
    price_per_unit: Optional[float] = None
    total_amount:   float
    sale_date:      date


# ── Seasons ────────────────────────────────────────────────────────

@router.post("/seasons")
def create_season(
    data: SeasonCreate,
    db:   Session = Depends(get_db),
    user = Depends(get_current_user)
):
    season = FarmSeason(**data.dict(), user_id=user.id)
    db.add(season)
    db.commit()
    db.refresh(season)
    return season

@router.get("/seasons")
def get_seasons(
    db:   Session = Depends(get_db),
    user = Depends(get_current_user)
):
    return db.query(FarmSeason).filter(
        FarmSeason.user_id == user.id
    ).order_by(FarmSeason.created_at.desc()).all()

@router.delete("/seasons/{season_id}")
def delete_season(
    season_id: int,
    db:        Session = Depends(get_db),
    user = Depends(get_current_user)
):
    season = db.query(FarmSeason).filter(
        FarmSeason.id == season_id,
        FarmSeason.user_id == user.id
    ).first()
    if not season:
        raise HTTPException(status_code=404, detail="Season not found")
    db.delete(season)
    db.commit()
    return {"message": "Season deleted successfully"}


# ── Expenses ───────────────────────────────────────────────────────

@router.post("/expenses")
def add_expense(
    data: ExpenseCreate,
    db:   Session = Depends(get_db),
    user = Depends(get_current_user)
):
    expense = FarmExpense(**data.dict())
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense

@router.get("/expenses/{season_id}")
def get_expenses(
    season_id: int,
    db:        Session = Depends(get_db),
    user = Depends(get_current_user)
):
    return db.query(FarmExpense).filter(
        FarmExpense.season_id == season_id
    ).order_by(FarmExpense.expense_date.desc()).all()

@router.delete("/expenses/{expense_id}")
def delete_expense(
    expense_id: int,
    db:         Session = Depends(get_db),
    user = Depends(get_current_user)
):
    expense = db.query(FarmExpense).filter(FarmExpense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    db.delete(expense)
    db.commit()
    return {"message": "Expense deleted successfully"}


# ── Income ─────────────────────────────────────────────────────────

@router.post("/income")
def add_income(
    data: IncomeCreate,
    db:   Session = Depends(get_db),
    user = Depends(get_current_user)
):
    income = FarmIncome(**data.dict())
    db.add(income)
    db.commit()
    db.refresh(income)
    return income

@router.get("/income/{season_id}")
def get_income(
    season_id: int,
    db:        Session = Depends(get_db),
    user = Depends(get_current_user)
):
    return db.query(FarmIncome).filter(
        FarmIncome.season_id == season_id
    ).order_by(FarmIncome.sale_date.desc()).all()

@router.delete("/income/{income_id}")
def delete_income(
    income_id: int,
    db:        Session = Depends(get_db),
    user = Depends(get_current_user)
):
    income = db.query(FarmIncome).filter(FarmIncome.id == income_id).first()
    if not income:
        raise HTTPException(status_code=404, detail="Income not found")
    db.delete(income)
    db.commit()
    return {"message": "Income deleted successfully"}


# ── Summary ────────────────────────────────────────────────────────

@router.get("/summary/{season_id}")
def get_summary(
    season_id: int,
    db:        Session = Depends(get_db),
    user = Depends(get_current_user)
):
    total_expense = db.query(
        func.sum(FarmExpense.amount)
    ).filter(FarmExpense.season_id == season_id).scalar() or 0

    total_income = db.query(
        func.sum(FarmIncome.total_amount)
    ).filter(FarmIncome.season_id == season_id).scalar() or 0

    breakdown = db.query(
        FarmExpense.category,
        func.sum(FarmExpense.amount).label("total")
    ).filter(
        FarmExpense.season_id == season_id
    ).group_by(FarmExpense.category).all()

    return {
        "total_expense": float(total_expense),
        "total_income":  float(total_income),
        "net_profit":    float(total_income - total_expense),
        "is_profitable": total_income > total_expense,
        "breakdown": [
            {"category": b.category, "amount": float(b.total)}
            for b in breakdown
        ]
    }