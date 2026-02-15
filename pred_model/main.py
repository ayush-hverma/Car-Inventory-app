import os
import sys
import json
from dotenv import load_dotenv
from pymongo import MongoClient
from train_model import train_and_evaluate
from predict import run_predictions

# Load env vars
load_dotenv()

MONGODB_URI = os.getenv('MONGODB_URI')
DB_NAME = 'car_scraper'
COLLECTION_NAME = 'inventory'

from datetime import datetime

def fetch_data_from_mongodb():
    """Fetch all active inventory from MongoDB."""
    if not MONGODB_URI:
        print("MONGODB_URI not found in environment variables.")
        return None
        
    client = MongoClient(MONGODB_URI)
    db = client[DB_NAME]
    collection = db[COLLECTION_NAME]
    
    # Only fetch active ones or all for training? Let's use all for better training
    cursor = collection.find({})
    data = []
    for item in cursor:
        # Convert non-serializable fields
        if '_id' in item:
            item['_id'] = str(item['_id'])
        
        # Convert datetime objects to string
        for key, value in item.items():
            if isinstance(value, datetime):
                item[key] = value.isoformat()
                
        data.append(item)
        
    client.close()
    return data

def main():
    print("--- Starting Car Price ML Pipeline ---")
    
    # 1. Fetch data
    data = fetch_data_from_mongodb()
    
    if not data:
        print("No data found in MongoDB. Attempting to use export file...")
        export_file = 'exports/inventory_export_2026-02-15T10-09-12-909Z.json'
        if os.path.exists(export_file):
            with open(export_file, 'r') as f:
                data = json.load(f)
        else:
            print("No data available to train/predict.")
            return

    # Temporary file for training script
    temp_data_path = 'ml/temp_data.json'
    with open(temp_data_path, 'w') as f:
        json.dump(data, f)

    try:
        # 2. Train Model (Always retrain to get best performance with new data)
        print("\nStep 1: Retraining model with latest data...")
        model, metrics = train_and_evaluate(temp_data_path)
        
        # 3. Predict Prices for all active inventory
        print("\nStep 2: Generating predictions for active inventory...")
        results_df = run_predictions(temp_data_path)
        
        # 4. Save results back to MongoDB
        print("\nStep 3: Updating MongoDB with predictions and metrics...")
        client = MongoClient(MONGODB_URI)
        db = client[DB_NAME]
        
        # Store metrics
        metrics_collection = db['ml_metrics']
        metrics['timestamp'] = datetime.utcnow()
        metrics_collection.insert_one(metrics)
        
        # Update each vehicle with its prediction
        inventory_collection = db[COLLECTION_NAME]
        for _, row in results_df.iterrows():
            inventory_collection.update_one(
                {'vin': row['vin']},
                {'$set': {'predicted_price': float(row['predicted_price'])}}
            )
        
        print(f"\nPipeline run completed. Updated {len(results_df)} records.")
        
    except Exception as e:
        print(f"Error in pipeline: {e}")
        raise e
    finally:
        if os.path.exists(temp_data_path):
            os.remove(temp_data_path)

    print("\n--- Pipeline Completed Successfully ---")

if __name__ == "__main__":
    main()
