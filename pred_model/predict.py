import pandas as pd
import joblib
import os
import json
from preprocess import preprocess_data

def run_predictions(data, model_dir='ml/models'):
    """Run predictions on provided data."""
    
    if isinstance(data, str):
        with open(data, 'r') as f:
            data = json.load(f)
            
    df = pd.DataFrame(data)
    
    # Preprocess (is_training=False loads existing objects)
    X, _, _ = preprocess_data(df, is_training=False, transform_path=model_dir)
    
    # Load Model
    model_path = os.path.join(model_dir, 'car_price_model.joblib')
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model not found at {model_path}. Please train the model first.")
        
    model = joblib.load(model_path)
    
    # Predict
    predictions = model.predict(X)
    
    # Add predictions to dataframe
    df['predicted_price'] = predictions.tolist()
    
    return df

if __name__ == "__main__":
    # Test prediction
    export_file = 'exports/inventory_export_2026-02-15T10-09-12-909Z.json'
    if os.path.exists(export_file):
        results = run_predictions(export_file)
        print("\nSample Predictions:")
        print(results[['title', 'price', 'predicted_price']].head(10))
