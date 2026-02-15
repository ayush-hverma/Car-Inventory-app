import pandas as pd
import numpy as np
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import joblib
import os
import re

def extract_features_from_title(title):
    """Extract Year, Make, and Model from title string like '2022 Chevrolet Spark'"""
    if not isinstance(title, str):
        return None, None, None
    
    # Try to find a 4-digit year
    year_match = re.search(r'\b(19|20)\d{2}\b', title)
    year = int(year_match.group(0)) if year_match else None
    
    # Remove year if found
    clean_title = title
    if year_match:
        clean_title = title.replace(year_match.group(0), '').strip()
    
    parts = clean_title.split(' ', 1)
    make = parts[0] if len(parts) > 0 else None
    model = parts[1] if len(parts) > 1 else None
    
    return year, make, model

def preprocess_data(df, is_training=True, transform_path='ml/models'):
    """Preprocess the dataframe for training or prediction."""
    
    # 1. Feature Extraction from Title
    if 'title' in df.columns:
        extracted = df['title'].apply(lambda x: pd.Series(extract_features_from_title(x)))
        extracted.columns = ['extracted_year', 'make', 'model']
        df = pd.concat([df, extracted], axis=1)
    
    # Use year from title if available, otherwise use existing year column
    if 'year' in df.columns:
        df['year'] = df['year'].fillna(df['extracted_year'])
    else:
        df['year'] = df['extracted_year']
        
    # 2. Select Features
    # VIN can be used to extract manufacturer or region info, but for now we use basic features
    features = ['year', 'mileage', 'make', 'model', 'fuelType', 'transmission']
    target = 'price'
    
    # Filter columns that exist
    available_features = [f for f in features if f in df.columns]
    
    X = df[available_features].copy()
    y = df[target] if target in df.columns else None
    
    # 3. Handle Missing Values
    X['fuelType'] = X['fuelType'].fillna('Unknown')
    X['transmission'] = X['transmission'].fillna('Unknown')
    X['make'] = X['make'].fillna('Unknown')
    X['model'] = X['model'].fillna('Unknown')
    X['mileage'] = X['mileage'].fillna(X['mileage'].median() if is_training else 0)
    X['year'] = X['year'].fillna(X['year'].median() if is_training else 2020)
    
    categorical_features = ['make', 'model', 'fuelType', 'transmission']
    numerical_features = ['year', 'mileage']
    
    # Ensure all categorical columns are strings
    for col in categorical_features:
        if col in X.columns:
            X[col] = X[col].astype(str)
            
    if is_training:
        # 4. Setup Pipeline
        categorical_transformer = Pipeline(steps=[
            ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
        ])
        
        numerical_transformer = Pipeline(steps=[
            ('scaler', StandardScaler())
        ])
        
        preprocessor = ColumnTransformer(
            transformers=[
                ('num', numerical_transformer, numerical_features),
                ('cat', categorical_transformer, categorical_features)
            ])
        
        X_processed = preprocessor.fit_transform(X)
        
        # Save preprocessor
        if not os.path.exists(transform_path):
            os.makedirs(transform_path)
        joblib.dump(preprocessor, os.path.join(transform_path, 'preprocessor.joblib'))
        
        return X_processed, y, preprocessor
    else:
        # Load preprocessor
        preprocessor = joblib.load(os.path.join(transform_path, 'preprocessor.joblib'))
        X_processed = preprocessor.transform(X)
        return X_processed, y, preprocessor

if __name__ == "__main__":
    # Test with sample JSON
    import json
    with open('exports/inventory_export_2026-02-15T10-09-12-909Z.json', 'r') as f:
        data = json.load(f)
    
    df = pd.DataFrame(data)
    X_p, y, prep = preprocess_data(df)
    print(f"Processed shape: {X_p.shape}")
    print(f"Target count: {len(y)}")
