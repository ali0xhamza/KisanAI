import os
import httpx
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from typing import List, Optional
from auth import get_current_user
from models import User
from middleware.rate_limit import ai_rate_limit
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/api/ai", tags=["AI"])

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_URL     = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL   = "llama-3.3-70b-versatile"
VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"

class Message(BaseModel):
    role:    str
    content: str

class ChatRequest(BaseModel):
    messages:    List[Message]
    max_tokens:  Optional[int]   = 600
    temperature: Optional[float] = 0.7
    system:      Optional[str]   = None

class DiseaseRequest(BaseModel):
    fasal:        Optional[str] = None          # now optional
    symptoms:     Optional[List[str]] = []
    image_base64: Optional[str]       = None
    image_type:   Optional[str]       = "image/jpeg"

def build_system_prompt(user: User) -> str:
    """Build personalized system prompt using user profile"""
    name   = user.name   or "Farmer"
    city   = user.city   or "Pakistan"
    crop   = user.fasal  or None
    area   = user.zameen or None
    soil   = user.mitti  or None
    tehsil = user.tehsil or None

    profile_lines = []
    if crop:   profile_lines.append(f"Main crop: {crop}")
    if area:   profile_lines.append(f"Land: {area} acres")
    if soil:   profile_lines.append(f"Soil: {soil}")
    if tehsil: profile_lines.append(f"Tehsil/Area: {tehsil}")

    profile_section = ""
    if profile_lines:
        profile_section = f"""
Farmer's crop details:
{chr(10).join(f'- {l}' for l in profile_lines)}

When giving advice, consider this farmer's {crop or 'crop'} and the conditions in {city}."""

    prompt = f"""You are KisanAI — an AI farming expert for Pakistani farmers.
You specialize in: crop diseases and treatments, fertilizer and spray schedules,
weather-based farming advice, soil health, sowing times, and market prices.

Farmer info:
- Name: {name}
- City: {city}
{profile_section}

Rules:
1. Always answer in English or Roman Urdu — use simple, clear language.
2. Provide practical and actionable advice.
3. Keep responses short and useful.
4. Use emojis to make answers friendly.
5. If the farmer's main crop is known, focus on that crop.

Now respond to the farmer's query."""
    return prompt


# ── Chat Endpoint ─────────────────────────────────────────────────
@router.post("/chat")
async def ai_chat(
    req:          ChatRequest,
    request:      Request,
    current_user: User = Depends(get_current_user),
    _:            None = Depends(ai_rate_limit),
):
    if not GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="AI service not configured")
    
    system_prompt = req.system or build_system_prompt(current_user)
    messages = [{"role": "system", "content": system_prompt}]
    messages += [{"role": m.role, "content": m.content} for m in req.messages]
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                GROQ_URL,
                headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
                json={
                    "model":       GROQ_MODEL,
                    "messages":    messages,
                    "temperature": req.temperature,
                    "max_tokens":  req.max_tokens,
                }
            )
            response.raise_for_status()
            return {"reply": response.json()["choices"][0]["message"]["content"]}
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="AI service is slow — please try again")
    except Exception:
        raise HTTPException(status_code=500, detail="AI service encountered an error")


# ── Disease Detection Endpoint ────────────────────────────────────
@router.post("/disease")
async def disease_detect(
    req:          DiseaseRequest,
    request:      Request,
    current_user: User = Depends(get_current_user),
    _:            None = Depends(ai_rate_limit),
):
    if not GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="AI service not configured")
    
    # System prompt for disease detection (crop identification included)
    system_prompt = """You are an expert Pakistani agricultural plant disease specialist.
If the farmer does not provide the crop name, identify it from the photo (or from symptoms if no photo).
Then give a complete diagnosis.

Always answer in this format:

🔍 DISEASE NAME: (specific name)
⚠️ SYMPTOMS: (what signs are visible)
🌱 CAUSE: (fungal/bacterial/viral/nutrient deficiency)
💊 TREATMENT: (specific spray/product available in Pakistan, dosage and timing)
🛡️ PREVENTION: (for next season)
💰 APPROXIMATE COST: (PKR per acre)
⏰ IMMEDIATE ACTION: (what to do right now)

Write the answer in English or Roman Urdu — practical and accurate."""

    # Build user content based on what we have
    if req.image_base64:
        # We have an image → use vision model
        text_parts = []
        if req.fasal and req.fasal.strip():
            text_parts.append(f"My crop: {req.fasal.strip()}")
        if req.symptoms:
            text_parts.append(f"Symptoms: {', '.join(req.symptoms)}")
        
        if text_parts:
            user_text = " ".join(text_parts) + "\nPlease diagnose the disease from the photo and the information provided."
        else:
            user_text = "Please identify the crop and diagnose the disease from this photo alone."
        
        user_content = [
            {"type": "text", "text": user_text},
            {"type": "image_url", "image_url": {"url": f"data:{req.image_type};base64,{req.image_base64}"}}
        ]
        model_to_use = VISION_MODEL
    else:
        # No image → text only (crop and symptoms)
        crop_info = f"crop: {req.fasal.strip()}" if req.fasal and req.fasal.strip() else "crop unknown"
        symptoms_text = ', '.join(req.symptoms) if req.symptoms else "none"
        user_content = f"My {crop_info}. Symptoms: {symptoms_text}. Please diagnose the disease and give treatment advice."
        model_to_use = GROQ_MODEL

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user",   "content": user_content},
    ]

    try:
        async with httpx.AsyncClient(timeout=45.0) as client:
            response = await client.post(
                GROQ_URL,
                headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
                json={"model": model_to_use, "messages": messages, "temperature": 0.2, "max_tokens": 1000}
            )
            response.raise_for_status()
            reply = response.json()["choices"][0]["message"]["content"]
            return {"reply": reply, "used_image": bool(req.image_base64)}
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="AI is slow — please try again")
    except Exception:
        # Fallback: if vision fails, try text‑only (if we have at least crop or symptoms)
        if req.image_base64 and (req.symptoms or req.fasal):
            try:
                fallback_parts = []
                if req.fasal and req.fasal.strip():
                    fallback_parts.append(f"My crop: {req.fasal.strip()}")
                if req.symptoms:
                    fallback_parts.append(f"Symptoms: {', '.join(req.symptoms)}")
                fallback_text = " ".join(fallback_parts) + ". Please diagnose based on this information (photo could not be processed)."
                async with httpx.AsyncClient(timeout=30.0) as client:
                    response = await client.post(
                        GROQ_URL,
                        headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
                        json={"model": GROQ_MODEL, "messages": [{"role":"system","content":system_prompt},{"role":"user","content":fallback_text}], "temperature":0.2, "max_tokens":1000}
                    )
                    response.raise_for_status()
                    reply = response.json()["choices"][0]["message"]["content"]
                    return {"reply": reply + "\n\n⚠️ Note: Image analysis failed — diagnosis based on text only.", "used_image": False}
            except:
                pass
        raise HTTPException(status_code=500, detail="AI service encountered an error")


# ── Mandi AI Prices Endpoint ──────────────────────────────────────
@router.post("/mandi")
async def mandi_prices(
    req:          ChatRequest,
    request:      Request,
    current_user: User = Depends(get_current_user),
    _:            None = Depends(ai_rate_limit),
):
    if not GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="AI service not configured")
    
    messages = [{"role": m.role, "content": m.content} for m in req.messages]
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                GROQ_URL,
                headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
                json={"model": GROQ_MODEL, "messages": messages, "temperature": 0.3, "max_tokens": 800}
            )
            response.raise_for_status()
            return {"reply": response.json()["choices"][0]["message"]["content"]}
    except Exception:
        raise HTTPException(status_code=500, detail="AI service encountered an error")