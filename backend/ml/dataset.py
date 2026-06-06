import numpy as np
import pandas as pd

np.random.seed(42)

CROP_CONDITIONS = {
    'Wheat': {
        'soil': [1, 2, 1],
        'temp': (10, 26),
        'humidity': (40, 70),
        'rainfall': (200, 500),
        'water': [1, 1, 0],
    },
    'Rice': {
        'soil': [2, 2, 1],
        'temp': (22, 36),
        'humidity': (72, 92),
        'rainfall': (1200, 2800),
        'water': [2, 2],
    },
    'Maize': {
        'soil': [1, 0, 1],
        'temp': (18, 32),
        'humidity': (50, 80),
        'rainfall': (300, 700),
        'water': [1, 1],
    },
    'Cotton': {
        'soil': [0, 1, 0],
        'temp': (25, 40),
        'humidity': (28, 65),
        'rainfall': (100, 450),
        'water': [1, 0, 1],
    },
    'Sugarcane': {
        'soil': [1, 2],
        'temp': (25, 38),
        'humidity': (60, 88),
        'rainfall': (1000, 2200),
        'water': [2, 2],
    },
    'Chickpea': {
        'soil': [0, 1],
        'temp': (8, 26),
        'humidity': (28, 58),
        'rainfall': (60, 280),
        'water': [0, 0, 1],
    },
    'Lentil': {
        'soil': [0, 1],
        'temp': (10, 28),
        'humidity': (32, 62),
        'rainfall': (80, 280),
        'water': [0, 1],
    },
    'Mustard': {
        'soil': [0, 1],
        'temp': (8, 26),
        'humidity': (28, 62),
        'rainfall': (120, 380),
        'water': [0, 1],
    },
    'Mango': {
        'soil': [1, 0],
        'temp': (24, 34),
        'humidity': (48, 78),
        'rainfall': (500, 1100),
        'water': [1, 2],
    },
    'Banana': {
        'soil': [1, 2],
        'temp': (22, 38),
        'humidity': (72, 92),
        'rainfall': (900, 2200),
        'water': [2, 2],
    },
    'Tomato': {
        'soil': [1, 1, 0],
        'temp': (18, 32),
        'humidity': (48, 78),
        'rainfall': (300, 650),
        'water': [1, 1],
    },
    'Potato': {
        'soil': [1, 0],
        'temp': (8, 22),
        'humidity': (48, 75),
        'rainfall': (250, 620),
        'water': [1, 1],
    },
}

def create_dataset(n_per_crop=200):
    all_samples = []

    for crop, c in CROP_CONDITIONS.items():
        for _ in range(n_per_crop):
            soil  = int(np.random.choice(c['soil']))
            temp  = round(float(np.random.uniform(*c['temp'])), 1)
            hum   = round(float(np.random.uniform(*c['humidity'])), 1)
            rain  = round(float(np.random.uniform(*c['rainfall'])), 1)
            water = int(np.random.choice(c['water']))

            all_samples.append({
                'soil_type':          soil,
                'temperature':        temp,
                'humidity':           hum,
                'rainfall':           rain,
                'water_availability': water,
                'crop':               crop,
            })

    df = pd.DataFrame(all_samples)
    df = df.sample(frac=1, random_state=42).reset_index(drop=True)
    return df