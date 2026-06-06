from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import pickle, numpy as np, os

router = APIRouter()

SOIL_MAP  = {'sandy': 0, 'loamy': 1, 'clay': 2}
WATER_MAP = {'low': 0, 'medium': 1, 'high': 2}

CROP_INFO = {
    'Wheat':     {'urdu': 'گندم',   'season': 'Rabi (Oct–Mar)',   'icon': '🌾', 'color': '#b45309'},
    'Rice':      {'urdu': 'چاول',   'season': 'Kharif (Jun–Nov)', 'icon': '🌾', 'color': '#15803d'},
    'Maize':     {'urdu': 'مکئی',   'season': 'Kharif (Mar–Jul)', 'icon': '🌽', 'color': '#ca8a04'},
    'Cotton':    {'urdu': 'کپاس',   'season': 'Kharif (Apr–Nov)', 'icon': '🌿', 'color': '#0891b2'},
    'Sugarcane': {'urdu': 'گنا',    'season': 'Spring (Feb–Mar)', 'icon': '🎋', 'color': '#16a34a'},
    'Chickpea':  {'urdu': 'چنے',    'season': 'Rabi (Oct–Feb)',   'icon': '🫘', 'color': '#92400e'},
    'Lentil':    {'urdu': 'مسور',   'season': 'Rabi (Oct–Feb)',   'icon': '🫘', 'color': '#9f1239'},
    'Mustard':   {'urdu': 'سرسوں',  'season': 'Rabi (Oct–Feb)',   'icon': '🌻', 'color': '#a16207'},
    'Mango':     {'urdu': 'آم',     'season': 'Summer (May–Jul)', 'icon': '🥭', 'color': '#c2410c'},
    'Banana':    {'urdu': 'کیلا',   'season': 'Year-round',       'icon': '🍌', 'color': '#ca8a04'},
    'Tomato':    {'urdu': 'ٹماٹر',  'season': 'Winter (Oct–Jan)', 'icon': '🍅', 'color': '#dc2626'},
    'Potato':    {'urdu': 'آلو',    'season': 'Rabi (Oct–Jan)',   'icon': '🥔', 'color': '#78350f'},
}

_model, _encoder = None, None

def get_model():
    global _model, _encoder
    if _model is None:
        ml_dir = os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'ml'
        )
        mp = os.path.join(ml_dir, 'crop_model.pkl')
        ep = os.path.join(ml_dir, 'label_encoder.pkl')

        if not os.path.exists(mp):
            raise HTTPException(
                status_code=503,
                detail="Model not trained yet. "
                       "Run in terminal: cd backend && python ml/train_model.py"
            )

        with open(mp, 'rb') as f: _model   = pickle.load(f)
        with open(ep, 'rb') as f: _encoder = pickle.load(f)

    return _model, _encoder


class CropRequest(BaseModel):
    soil_type:          str
    temperature:        float
    humidity:           float
    rainfall:           float
    water_availability: str


@router.post("/recommend")
async def recommend_crop(data: CropRequest):

    if data.soil_type not in SOIL_MAP:
        raise HTTPException(400, "soil_type must be one of: sandy, loamy, clay")
    if data.water_availability not in WATER_MAP:
        raise HTTPException(400, "water_availability must be one of: low, medium, high")
    if not (0 <= data.temperature <= 55):
        raise HTTPException(400, "Temperature must be between 0 and 55°C")
    if not (0 <= data.humidity <= 100):
        raise HTTPException(400, "Humidity must be between 0 and 100%")
    if not (0 <= data.rainfall <= 5000):
        raise HTTPException(400, "Rainfall must be between 0 and 5000mm")

    model, encoder = get_model()

    features = np.array([[
        SOIL_MAP[data.soil_type],
        data.temperature,
        data.humidity,
        data.rainfall,
        WATER_MAP[data.water_availability],
    ]])

    probas   = model.predict_proba(features)[0]
    top3_idx = np.argsort(probas)[::-1][:3]

    def build(idx):
        name       = encoder.classes_[idx]
        confidence = round(float(probas[idx]) * 100, 1)
        info       = CROP_INFO.get(name, {'urdu': name, 'season': 'N/A',
                                          'icon': '🌱', 'color': '#16a34a'})
        return {
            'crop':       name,
            'urdu_name':  info['urdu'],
            'icon':       info['icon'],
            'color':      info['color'],
            'confidence': confidence,
            'season':     info['season'],
        }

    results = [build(i) for i in top3_idx]

    return {
        'success':      True,
        'best_crop':    results[0],
        'alternatives': results[1:],
    }