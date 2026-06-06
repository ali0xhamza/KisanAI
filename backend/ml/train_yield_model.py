import pickle, os, sys
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_squared_error

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ml.yield_dataset import create_yield_dataset, CROP_LIST

def train():
    print("Dataset bana raha hun...")
    df = create_yield_dataset(n=300)
    print(f"Total samples: {len(df)}")

    X = df[['crop_id','soil_type','fertilizer',
             'temperature','humidity','rainfall']].values
    y = df['yield'].values

    X_tr, X_te, y_tr, y_te = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    print("Random Forest Regressor train kar raha hun...")
    model = RandomForestRegressor(
        n_estimators=300,
        max_depth=20,
        min_samples_split=4,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_tr, y_tr)

    pred = model.predict(X_te)
    r2   = r2_score(y_te, pred)
    rmse = np.sqrt(mean_squared_error(y_te, pred))
    print(f"R² Score : {r2*100:.2f}%")
    print(f"RMSE     : {rmse:.3f} tons/acre")

    ml_dir = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(ml_dir, 'yield_model.pkl'),    'wb') as f: pickle.dump(model,     f)
    with open(os.path.join(ml_dir, 'yield_croplist.pkl'), 'wb') as f: pickle.dump(CROP_LIST, f)

    print("Model save ho gaya: backend/ml/yield_model.pkl")

if __name__ == '__main__':
    train()