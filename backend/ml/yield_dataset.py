import numpy as np
import pandas as pd

np.random.seed(42)

CROPS = {
    'Wheat':     {'base': 2.5,  'unit': 'tons', 'temp': 20, 'hum': 55, 'rain': 400},
    'Rice':      {'base': 3.0,  'unit': 'tons', 'temp': 28, 'hum': 82, 'rain': 1500},
    'Maize':     {'base': 3.2,  'unit': 'tons', 'temp': 25, 'hum': 65, 'rain': 500},
    'Cotton':    {'base': 1.2,  'unit': 'tons', 'temp': 32, 'hum': 48, 'rain': 300},
    'Sugarcane': {'base': 30.0, 'unit': 'tons', 'temp': 30, 'hum': 72, 'rain': 1500},
    'Chickpea':  {'base': 0.8,  'unit': 'tons', 'temp': 18, 'hum': 42, 'rain': 180},
    'Lentil':    {'base': 0.7,  'unit': 'tons', 'temp': 18, 'hum': 48, 'rain': 200},
    'Mustard':   {'base': 0.9,  'unit': 'tons', 'temp': 18, 'hum': 45, 'rain': 250},
    'Mango':     {'base': 5.0,  'unit': 'tons', 'temp': 28, 'hum': 62, 'rain': 800},
    'Tomato':    {'base': 12.0, 'unit': 'tons', 'temp': 25, 'hum': 65, 'rain': 500},
    'Potato':    {'base': 10.0, 'unit': 'tons', 'temp': 15, 'hum': 62, 'rain': 450},
    'Banana':    {'base': 15.0, 'unit': 'tons', 'temp': 28, 'hum': 82, 'rain': 1500},
}

CROP_LIST  = list(CROPS.keys())
SOIL_MAP   = {'sandy': 0, 'loamy': 1, 'clay': 2}
FERT_MAP   = {'low': 0, 'medium': 1, 'high': 2}

SOIL_MULT  = {
    'default': {0: 0.80, 1: 1.00, 2: 0.90},
    'Rice':    {0: 0.65, 1: 0.88, 2: 1.00},
    'Banana':  {0: 0.70, 1: 1.00, 2: 0.95},
}
FERT_MULT  = {0: 0.68, 1: 1.00, 2: 1.28}

def factor(value, optimal, scale):
    f = 1.0 - abs(value - optimal) / scale
    return max(0.45, min(1.20, f))

def create_yield_dataset(n=300):
    rows = []
    for crop, c in CROPS.items():
        ci = CROP_LIST.index(crop)
        sm = SOIL_MULT.get(crop, SOIL_MULT['default'])

        for _ in range(n):
            soil = np.random.choice([0, 1, 2])
            fert = np.random.choice([0, 1, 2])
            temp = np.random.uniform(c['temp'] - 12, c['temp'] + 12)
            hum  = np.random.uniform(max(20, c['hum'] - 25), min(98, c['hum'] + 25))
            rain = np.random.uniform(max(50, c['rain'] * 0.3), c['rain'] * 1.8)

            tf = factor(temp, c['temp'], 15)
            hf = factor(hum,  c['hum'],  30)
            rf = factor(rain, c['rain'],  c['rain'])

            y = (c['base'] * sm[soil] * FERT_MULT[fert] * tf * hf * rf
                 + np.random.normal(0, c['base'] * 0.04))
            y = round(max(0.1, y), 3)

            rows.append({
                'crop_id':     ci,
                'soil_type':   soil,
                'fertilizer':  fert,
                'temperature': round(temp, 1),
                'humidity':    round(hum, 1),
                'rainfall':    round(rain, 1),
                'yield':       y,
            })

    df = pd.DataFrame(rows).sample(frac=1, random_state=42).reset_index(drop=True)
    return df