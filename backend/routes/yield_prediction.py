from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
import pickle, numpy as np, os, httpx
from datetime import datetime

load_dotenv()

router = APIRouter()

SOIL_MAP = {'sandy': 0, 'loamy': 1, 'clay': 2}
FERT_MAP = {'low': 0, 'medium': 1, 'high': 2}

PAK_RAINFALL = {
    'Lahore':580,'Karachi':210,'Multan':170,'Faisalabad':380,
    'Peshawar':420,'Quetta':260,'Islamabad':950,'Rawalpindi':820,
    'Sialkot':780,'Gujranwala':620,'Hyderabad':190,'Sukkur':130,
    'Bahawalpur':150,'Sargodha':390,'Sheikhupura':540,'Jhang':330,
    'Sahiwal':420,'Okara':400,'Kasur':500,'Gujrat':680,
}

CROP_INFO = {
    'Wheat':'گندم','Rice':'چاول','Maize':'مکئی','Cotton':'کپاس',
    'Sugarcane':'گنا','Chickpea':'چنے','Lentil':'مسور',
    'Mustard':'سرسوں','Mango':'آم','Tomato':'ٹماٹر',
    'Potato':'آلو','Banana':'کیلا',
}

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_URL     = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL   = "llama-3.3-70b-versatile"

_model, _crops = None, None

def load_model():
    global _model, _crops
    if _model is None:
        ml = os.path.join(os.path.dirname(os.path.dirname(
            os.path.abspath(__file__))), 'ml')
        mp = os.path.join(ml, 'yield_model.pkl')
        cp = os.path.join(ml, 'yield_croplist.pkl')
        if not os.path.exists(mp):
            raise HTTPException(503,
                "Model not trained. Run: python ml/train_yield_model.py")
        with open(mp,'rb') as f: _model = pickle.load(f)
        with open(cp,'rb') as f: _crops = pickle.load(f)
    return _model, _crops

def get_weather(lat, lon):
    api_key = os.getenv('WEATHER_API_KEY', '').strip()
    if not api_key:
        raise HTTPException(400,
            "WEATHER_API_KEY not found in backend .env file.")

    url = (f"https://api.openweathermap.org/data/2.5/weather"
           f"?lat={lat}&lon={lon}&appid={api_key}&units=metric")
    try:
        r = httpx.get(url, timeout=8)
        d = r.json()
    except Exception:
        raise HTTPException(502, "Could not connect to weather server")

    if d.get('cod') != 200:
        raise HTTPException(502, f"Weather API error: {d.get('message','unknown')}")

    city     = d.get('name', '')
    temp     = round(d['main']['temp'], 1)
    humidity = round(d['main']['humidity'], 1)
    rainfall = PAK_RAINFALL.get(city, 450)
    return {'city': city, 'temperature': temp,
            'humidity': humidity, 'rainfall': rainfall}

def build_message(crop, temp, humidity, rainfall, soil, fert, crop_data):
    msgs = []
    opt  = crop_data

    if abs(temp - opt['temp']) <= 4:
        msgs.append(('positive', 'Temperature is ideal for this crop'))
    elif temp > opt['temp'] + 8:
        msgs.append(('negative', 'High heat may reduce yield'))
    else:
        msgs.append(('negative', 'Low temperature can decrease yield'))

    if humidity > opt['hum'] + 20:
        msgs.append(('warning', 'High humidity increases disease risk'))
    elif abs(humidity - opt['hum']) <= 12:
        msgs.append(('positive', 'Humidity is suitable for the crop'))

    if rainfall < opt['rain'] * 0.5:
        msgs.append(('negative', 'Low rainfall may reduce yield — irrigation needed'))
    elif rainfall > opt['rain'] * 1.6:
        msgs.append(('warning', 'Excessive rainfall may harm the crop'))
    else:
        msgs.append(('positive', 'Rainfall amount is adequate'))

    if fert == 'high':
        msgs.append(('positive', 'High fertilizer will improve yield'))
    elif fert == 'low':
        msgs.append(('warning', 'Low fertilizer will limit yield'))

    return msgs

class YieldRequest(BaseModel):
    crop_type:  str
    soil_type:  str
    fertilizer: str
    latitude:   float
    longitude:  float
    land_acres: float = 1.0

from ml.yield_dataset import CROPS as CROP_DATA

# ── Original ML endpoint ───────────────────────────────────────────
@router.post("/predict")
async def predict_yield(data: YieldRequest):
    if data.soil_type not in SOIL_MAP:
        raise HTTPException(400, "soil_type must be one of: sandy, loamy, clay")
    if data.fertilizer not in FERT_MAP:
        raise HTTPException(400, "fertilizer must be one of: low, medium, high")

    model, crops = load_model()

    if data.crop_type not in crops:
        raise HTTPException(400, f"Crop must be one of: {', '.join(crops)}")

    weather = get_weather(data.latitude, data.longitude)

    crop_id  = crops.index(data.crop_type)
    features = np.array([[
        crop_id,
        SOIL_MAP[data.soil_type],
        FERT_MAP[data.fertilizer],
        weather['temperature'],
        weather['humidity'],
        weather['rainfall'],
    ]])

    yield_per_acre = round(float(model.predict(features)[0]), 2)
    total_yield    = round(yield_per_acre * data.land_acres, 2)

    cd   = CROP_DATA[data.crop_type]
    msgs = build_message(data.crop_type, weather['temperature'],
                         weather['humidity'], weather['rainfall'],
                         data.soil_type, data.fertilizer, cd)

    return {
        'success':        True,
        'crop':           data.crop_type,
        'urdu_name':      CROP_INFO.get(data.crop_type, data.crop_type),
        'yield_per_acre': yield_per_acre,
        'total_yield':    total_yield,
        'land_acres':     data.land_acres,
        'unit':           'tons',
        'weather':        weather,
        'messages':       msgs,
        'timestamp':      datetime.now().isoformat(),
    }


# ── NEW: Custom crop — Groq AI predicts ───────────────────────────
@router.post("/predict-custom")
async def predict_custom_crop(data: YieldRequest):
    if data.soil_type not in SOIL_MAP:
        raise HTTPException(400, "soil_type must be one of: sandy, loamy, clay")
    if data.fertilizer not in FERT_MAP:
        raise HTTPException(400, "fertilizer must be one of: low, medium, high")
    if not GROQ_API_KEY:
        raise HTTPException(500, "AI service not configured")

    # Get weather first
    weather = get_weather(data.latitude, data.longitude)

    soil_name = {'sandy': 'Sandy', 'loamy': 'Loamy', 'clay': 'Clay'}[data.soil_type]
    fert_name = {'low': 'Low', 'medium': 'Medium', 'high': 'High'}[data.fertilizer]

    prompt = f"""You are an expert Pakistani agricultural scientist.
A farmer wants to grow "{data.crop_type}" crop in Pakistan.

Conditions:
- Location: {weather['city'] or 'Pakistan'}
- Temperature: {weather['temperature']}°C
- Humidity: {weather['humidity']}%
- Annual Rainfall: {weather['rainfall']}mm
- Soil Type: {soil_name}
- Fertilizer Level: {fert_name}
- Land: {data.land_acres} acres

Respond ONLY in this exact JSON format, nothing else:
{{
  "yield_per_acre": <number in tons, realistic for Pakistan>,
  "season": "<best planting season in Pakistan>",
  "messages": [
    ["positive" or "negative" or "warning", "<short advice in English>"],
    ["positive" or "negative" or "warning", "<short advice in English>"],
    ["positive" or "negative" or "warning", "<short advice in English>"]
  ]
}}

Rules:
- yield_per_acre must be a realistic number (float) for Pakistan conditions.
- messages must be in simple English (easy for farmers).
- Give exactly 3 messages about weather, soil, and fertilizer suitability.
- No extra text, only JSON."""

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                GROQ_URL,
                headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
                json={
                    "model":       GROQ_MODEL,
                    "messages":    [{"role": "user", "content": prompt}],
                    "temperature": 0.2,
                    "max_tokens":  400,
                }
            )
            resp.raise_for_status()
            ai_text = resp.json()["choices"][0]["message"]["content"].strip()

        # Parse JSON
        import json, re
        # Remove backticks or extra text
        json_match = re.search(r'\{.*\}', ai_text, re.DOTALL)
        if not json_match:
            raise ValueError("AI did not return valid JSON")
        ai_data = json.loads(json_match.group())

        yield_per_acre = round(float(ai_data["yield_per_acre"]), 2)
        total_yield    = round(yield_per_acre * data.land_acres, 2)
        messages       = ai_data.get("messages", [])
        season         = ai_data.get("season", "")

        return {
            'success':        True,
            'crop':           data.crop_type,
            'urdu_name':      data.crop_type,
            'yield_per_acre': yield_per_acre,
            'total_yield':    total_yield,
            'land_acres':     data.land_acres,
            'unit':           'tons',
            'weather':        weather,
            'messages':       messages,
            'season':         season,
            'ai_predicted':   True,
            'timestamp':      datetime.now().isoformat(),
        }

    except httpx.TimeoutException:
        raise HTTPException(504, "AI is slow — please try again")
    except Exception as e:
        raise HTTPException(500, f"AI prediction error: {str(e)}")