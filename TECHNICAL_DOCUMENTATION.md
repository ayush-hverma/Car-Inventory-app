# Technical Documentation: Car Inventory & Prediction System

This document provides a deep dive into the technical architecture, automation logic, machine learning pipeline, and API specifications of the Car Inventory Scraper & Price Prediction System.

---

## 🏗 Architecture Diagram

The system follows a linear data pipeline with added export functionality and external automation triggers.

```mermaid
graph TD
    A[Dealership Website] -->|Puppeteer Scraper| B[(MongoDB: Inventory)]
    B -->|Express API| E[React Dashboard]
    E -->|Visualizations| F[End User]
    E -->|Export| G[CSV Data]
    B -.->|Sync Logic| C[ML Pipeline (External)]
    C -->|Preprocessing| D[XGBoost Training]
    D -->|Predictions| B
```

---

## 🚀 Project Setup

### Local Installation

1.  **Clone the Repository**:
    ```bash
    git clone <repository-url>
    cd assignment
    ```

2.  **Environment Configuration**:
    Create a `.env` file in the root directory with:
    ```env
    MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/car_scraper
    PORT=5000
    ```
    For the frontend, ensure `VITE_API_URL` is configured if pointing to a remote backend (defaults to `http://localhost:5000` in development).

3.  **Install & Start Backend**:
    ```bash
    cd backend
    npm install
    npm start
    ```

4.  **Install & Start Frontend**:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

5.  **Setup Scraper**:
    ```bash
    cd scraper
    npm install
    node scraper.js
    ```

6.  **Setup Python Environment (Prediction Model)**:
    ```bash
    cd pred_model
    python -m venv venv
    source venv/bin/activate  # or venv\Scripts\activate on Windows
    pip install -r requirements.txt
    ```

---

## 🤖 Machine Learning Model Details

### Model Choice
- **Algorithm**: XGBoost Regressor
- **Rationale**: High performance on structured/tabular data with the ability to handle non-linear relationships between mileage, year, and price.

### Feature Engineering (`preprocess.py`)
- **Title Extraction**: Regex patterns extract `Year`, `Make`, and `Model` from unstructured titles.
- **Categorical Encoding**: `OneHotEncoder` converts `Make`, `Model`, `FuelType`, and `Transmission` into numerical arrays.
- **Scaling**: `StandardScaler` normalizes `Mileage` and `Year`.
- **Handling Missing Values**: Median imputation for numerical fields and "Unknown" tagging for categorical fields.

### Pipeline & Evaluation
The training script (`train_model.py`) splits data into 80/20 train/test sets. 
- **Metrics**: 
  - **MAE (Mean Absolute Error)**: Shows average dollar deviation.
  - **RMSE (Root Mean Square Error)**: Punishes large outliers.
  - **R2 Score**: Indicates variance explanation.

---

## 🔄 Automation & Sync Logic

### GitHub Actions Trigger
The scraper is automated using a GitHub Actions workflow (`scraper.yml`) located in the `scraper/.github/workflows/` directory.
- **Schedule**: `cron: "0 0 * * *"` (Runs daily at midnight UTC).
- **Manual Toggle**: `workflow_dispatch` allows for on-demand syncs.
- **Headless Mode**: The scraper runs in Puppeteer's "new" headless mode for compatibility with CI environments.

### ML Pipeline Integration
Post-scrape, the system triggers the ML training pipeline using a **Repository Dispatch** event.
- **Action**: `peter-evans/repository-dispatch@v3`
- **Target**: `ayush-hverma/Autoinsight-prediction-model`
- **Event Type**: `train_model`

### Sync Workflow (`scraper.js`)
1.  **Extraction**: Puppeteer navigates to the dealership site, handles "Load More" pagination, and parses vehicle attributes.
2.  **Comparison**: 
    - **New Vehicles**: Inserted with `status: "active"` and `data_scraped` date.
    - **Existing Vehicles**: Updated with `last_seen` date.
    - **Removed Vehicles**: If a VIN in the DB is missing from the scrape, it's marked `status: "removed"`.

---

## 📡 API & Dashboard Features

### Backend API (`http://localhost:5000/api`)

#### 1. Get Inventory
`GET /api/inventory`
- **Query Params**: `status` (Optional, default: `active`)
- **Response**: Array of vehicle objects including `predicted_price`.

#### 2. Get ML Metrics
`GET /api/ml-metrics`
- **Response**: The latest training results (MAE, RMSE, R2) from the `ml_metrics` collection.

### Dashboard Features
- **Real-time Stats**: Displays Total Inventory, Average Price, and Total Valuation.
- **Visualizations**: Includes Price Distribution, Year Distribution, Listing Status, and Price vs. Mileage Correlation charts.
- **CSV Export**: Users can export the entire inventory to a CSV file directly from the Analysis Dashboard.

---

## ⚠️ Assumptions & Limitations

-   **Selector Stability**: The scraper relies on specific CSS selectors (`.listing-tile-wrapper`, `.car-name`). Changes to the dealership's frontend will require updates.
-   **VIN Uniqueness**: VINs are used as the primary key for tracking vehicle status.
-   **Data Threshold**: The XGBoost model performs best with a significant amount of historical data. Small datasets may result in higher error margins.
-   **Condition Ignored**: Price predictions do not account for physical condition or history (accidents), which are not available in the public scrape.
-   **Token Security**: Automation requires a `TRAIN_DISPATCH_TOKEN` with repository scope permissions.

