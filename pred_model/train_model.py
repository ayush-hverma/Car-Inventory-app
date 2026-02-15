import pandas as pd
import numpy as np
from xgboost import XGBRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
import os
import json
from preprocess import preprocess_data

def train_and_evaluate(data_path, model_dir='ml/models'):
    """Train the model and save it."""
    
    print(f"Loading data from {data_path}...")
    with open(data_path, 'r') as f:
        data = json.load(f)
    
    df = pd.DataFrame(data)
    
    # Preprocess
    X, y, preprocessor = preprocess_data(df, is_training=True, transform_path=model_dir)
    
    # Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train
    print("Training XGBoost Regressor...")
    model = XGBRegressor(
        n_estimators=1000,
        learning_rate=0.05,
        max_depth=6,
        subsample=0.8,
        colsample_bytree=0.8,
        n_jobs=-1,
        random_state=42
    )
    
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)
    
    metrics = {
        'MAE': float(mae),
        'RMSE': float(rmse),
        'R2': float(r2)
    }
    
    print("\nModel Performance Metrics:")
    for k, v in metrics.items():
        print(f"{k}: {v:.2f}")
        
    # Save Model
    if not os.path.exists(model_dir):
        os.makedirs(model_dir)
        
    model_path = os.path.join(model_dir, 'car_price_model.joblib')
    joblib.dump(model, model_path)
    print(f"\nModel saved to {model_path}")
    
    # Save metrics
    with open(os.path.join(model_dir, 'metrics.json'), 'w') as f:
        json.dump(metrics, f, indent=4)
        
    return model, metrics

if __name__ == "__main__":
    # Use the export file as initial training data
    export_file = 'exports/inventory_export_2026-02-15T10-09-12-909Z.json'
    if os.path.exists(export_file):
        train_and_evaluate(export_file)
    else:
        print(f"Export file not found: {export_file}")
