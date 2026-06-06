# backend/routes/spray_calculator.py
import os, httpx, json, re
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from auth import get_current_user
from models import User
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/api/spray", tags=["Spray Calculator"])

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_URL     = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL   = "llama-3.3-70b-versatile"

class SprayRequest(BaseModel):
    dawa:  str
    fasal: str
    acres: float
    masla: Optional[str]

@router.post("/calculate")
async def calculate_spray(
    data: SprayRequest,
    current_user: User = Depends(get_current_user),
):
    if not GROQ_API_KEY:
        raise HTTPException(500, "AI service not configured")

    user_city  = current_user.city  or "Pakistan"
    user_mitti = current_user.mitti or "loamy"

    prompt = f"""You are an expert Pakistani agricultural spray consultant.
A farmer has provided the following information:

- Pesticide/Fertilizer: {data.dawa}
- Crop: {data.fasal}
- Land: {data.acres} acres
- Problem: {data.masla or 'spray schedule'}
- City: {user_city}
- Soil type: {user_mitti}

Give an exact and practical calculation. Respond ONLY in this JSON format with REAL values, not placeholders:

{{
  "chemical_name": "Cypermethrin 10% EC",
  "dose_per_acre": "375 ml",
  "total_chemical": "1875 ml",
  "water_per_acre": "100 litres",
  "total_water": "500 litres",
  "pump_count": "33 pumps (15L each)",
  "spray_time": "Early morning or evening",
  "safety": "Wear gloves and mask",
  "repeat_after": "After 7-10 days",
  "cost": "Rs. 800-1000",
  "tips": ["tip 1", "tip 2", "tip 3"]
}}

IMPORTANT: Replace ALL values above with actual calculated values for {data.dawa} on {data.acres} acres of {data.fasal}.
Return only JSON, no extra text."""

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                GROQ_URL,
                headers={
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model":       GROQ_MODEL,
                    "messages":    [{"role": "user", "content": prompt}],
                    "temperature": 0.1,
                    "max_tokens":  600,
                }
            )
            resp.raise_for_status()
            ai_text = resp.json()["choices"][0]["message"]["content"].strip()

        match = re.search(r'\{.*\}', ai_text, re.DOTALL)
        if not match:
            raise ValueError("Invalid JSON")

        result = json.loads(match.group())

        # Clean placeholder values
        def clean(val):
            if not val or str(val).startswith('<') or str(val).strip() == '':
                return None
            return val

        if not clean(result.get("total_chemical")):
            dose = result.get("dose_per_acre", "")
            result["total_chemical"] = f"{dose} × {data.acres} acres"

        if not clean(result.get("water_per_acre")):
            result["water_per_acre"] = "100 litres"

        if not clean(result.get("total_water")):
            result["total_water"] = f"{int(data.acres * 100)} litres"

        if not clean(result.get("pump_count")):
            result["pump_count"] = f"~{max(1, round(data.acres * 100 / 15))} pumps"

        if not clean(result.get("cost")):
            result["cost"] = "Check local market"

        return {"success": True, "data": result, "acres": data.acres}

    except httpx.TimeoutException:
        raise HTTPException(504, "AI is slow — please try again")
    except Exception as e:
        raise HTTPException(500, f"Calculation error: {str(e)}")