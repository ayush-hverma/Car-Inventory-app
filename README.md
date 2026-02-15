# Car Inventory Scraper & Price Prediction System

A comprehensive end-to-end system for scraping used car inventory, managing data through a backend API, visualizing trends via a React dashboard, and predicting vehicle prices using machine learning.

## 🏗 Project Architecture

The system is composed of four main modules:

1.  **Scraper (`/scraper`)**: A Puppeteer-based engine that extracts car details (VIN, Price, Mileage, etc.) from dealership websites and stores them in MongoDB.
2.  **Backend (`/backend`)**: An Express.js API that serves inventory data and ML metrics to the frontend.
3.  **Frontend (`/frontend`)**: A Vite + React dashboard using Recharts for data visualization and navigation for inventory management.
4.  **ML Model (`/pred_model`)**: A Python-based XGBoost pipeline for preprocessing data, training price prediction models, and generating market insights.

---

## 🚀 Getting Started

### Prerequisites

-   **Node.js**: v18+ 
-   **Python**: v3.9+
-   **MongoDB**: Local instance or Atlas URI
-   **npm**: Included with Node.js

### 1. Environment Setup

Create a `.env` file in the **root** directory (or in `backend/` and `scraper/` individually):

```env
MONGODB_URI=your_mongodb_connection_string
PORT=5000
VITE_API_URL=http://localhost:5000
```

### 2. Component Installation & Running

#### 🔌 Backend
```bash
cd backend
npm install
npm start
```

#### 🎨 Frontend
```bash
cd frontend
npm install
npm run dev
```

#### 🕷 Scraper
```bash
cd scraper
npm install
npm start
```

#### 🤖 Prediction Model
```bash
cd pred_model
pip install -r requirements.txt
python main.py
```

---

## 🛠 Tech Stack

-   **Frontend**: React, Vite, Recharts, React Router
-   **Backend**: Node.js, Express, MongoDB (Driver)
-   **Scraper**: Puppeteer
-   **Data Science**: Python, Pandas, Scikit-Learn, XGBoost, Joblib

## 📂 Project Structure

```text
├── backend/          # Express API server
├── frontend/         # React dashboard
├── scraper/          # Puppeteer scraping scripts
├── pred_model/       # ML training & prediction logic
└── .env              # Shared configuration
```

## ✨ Key Features

-   **Automated Scraping**: Periodically syncs dealership inventory with MongoDB.
-   **Inventory Tracking**: Tracks "Removed" vs "Active" inventory using last-seen timestamps.
-   **Price Prediction**: Uses XGBoost to estimate fair market value based on year and mileage.
-   **Performance Metrics**: Dashboard displays model accuracy and inventory trends.
