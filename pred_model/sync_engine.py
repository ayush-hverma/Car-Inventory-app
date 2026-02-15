import os
import json
from datetime import datetime
from pymongo import MongoClient
from dotenv import load_dotenv
import subprocess
import sys

# Add ml directory to path to import main
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

load_dotenv()

MONGODB_URI = os.getenv('MONGODB_URI')
DB_NAME = 'car_scraper'
COLLECTION_NAME = 'inventory'

def get_db():
    client = MongoClient(MONGODB_URI)
    return client[DB_NAME], client

def run_sync():
    """Run the full sync process."""
    print(f"--- Sync Cycle Started at {datetime.now().isoformat()} ---")
    
    db, client = get_db()
    
    try:
        # 1. Simulate Scraper or Load New Data
        # In a real scenario, this would call the Puppeteer scraper or an API
        # For this implementation, we'll use the latest export as "new" data to demonstrate logic
        export_path = 'exports/inventory_export_2026-02-15T10-09-12-909Z.json'
        if not os.path.exists(export_path):
            print(f"No new data found at {export_path}")
            return
            
        with open(export_path, 'r') as f:
            new_data = json.load(f)
            
        # 2. Compare and Generate Sync Report
        inventory_col = db[COLLECTION_NAME]
        existing_vehicles = {v['vin']: v for v in inventory_col.find({})}
        
        added = 0
        updated = 0
        removed = 0 # In this logic, we might mark as inactive
        
        new_vins = set()
        
        for vehicle in new_data:
            vin = vehicle.get('vin')
            if not vin: continue
            new_vins.add(vin)
            
            if vin in existing_vehicles:
                # Update existing (simplified check)
                inventory_col.update_one({'vin': vin}, {'$set': vehicle})
                updated += 1
            else:
                # Add new
                vehicle['status'] = 'active'
                vehicle['first_seen'] = datetime.utcnow()
                vehicle['last_seen'] = datetime.utcnow()
                inventory_col.insert_one(vehicle)
                added += 1
                
        # Handle "removed" (not in new data but was active)
        active_in_db = [v['vin'] for v in inventory_col.find({'status': 'active'})]
        for vin in active_in_db:
            if vin not in new_vins:
                inventory_col.update_one({'vin': vin}, {'$set': {'status': 'removed', 'removed_at': datetime.utcnow()}})
                removed += 1
        
        # 3. Trigger ML Pipeline
        print("\nTriggering ML Pipeline...")
        try:
            from main import main as ml_main
            ml_main()
        except Exception as ml_err:
            print(f"ML Pipeline failed: {ml_err}")
            
    except Exception as e:
        print(f"Sync Cycle failed: {e}")
    finally:
        client.close()
        
    print(f"--- Sync Cycle Completed ---")

if __name__ == "__main__":
    run_sync()
