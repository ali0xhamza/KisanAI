import pickle
import os
import sys
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from sklearn.preprocessing import LabelEncoder

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ml.dataset import create_dataset

def train_and_save():
    print("Dataset bana raha hun...")
    df = create_dataset(n_per_crop=200)
    print(f"Total samples: {len(df)} | Crops: {df['crop'].nunique()}")

    X = df[['soil_type', 'temperature', 'humidity',
            'rainfall', 'water_availability']].values
    y = df['crop'].values

    le = LabelEncoder()
    y_enc = le.fit_transform(y)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y_enc, test_size=0.2, random_state=42, stratify=y_enc
    )

    print("Random Forest train kar raha hun (200 trees)...")
    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=15,
        min_samples_split=5,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)

    acc = accuracy_score(y_test, model.predict(X_test))
    print(f"Model Accuracy: {acc * 100:.2f}%")

    ml_dir = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(ml_dir, 'crop_model.pkl'), 'wb') as f:
        pickle.dump(model, f)
    with open(os.path.join(ml_dir, 'label_encoder.pkl'), 'wb') as f:
        pickle.dump(le, f)

    print("Model save ho gaya!")
    print("Files: backend/ml/crop_model.pkl")
    return acc

if __name__ == '__main__':
    train_and_save()