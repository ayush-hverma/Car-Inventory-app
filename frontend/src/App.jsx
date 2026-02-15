import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';

import Navbar from './components/Navbar';
import AnalysisDashboard from './components/AnalysisDashboard';
import InventoryPage from './components/InventoryPage';
import ModelPerformancePage from './components/ModelPerformancePage';

function App() {
  const [inventory, setInventory] = useState([]);
  const [mlMetrics, setMlMetrics] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invRes, mlRes] = await Promise.all([
        fetch('http://localhost:5000/api/inventory'),
        fetch('http://localhost:5000/api/ml-metrics')
      ]);

      const [invData, mlData] = await Promise.all([
        invRes.json(),
        mlRes.json()
      ]);

      setInventory(invData);
      setMlMetrics(mlData);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatIST = (dateString) => {
    if (!dateString) return 'N/A';
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(dateString));
  };

  if (loading && inventory.length === 0) {
    return (
      <div className="container center-content">
        <div className="loader"></div>
        <p>Initializing Dashboard...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="container">
        <header>
          <div className="header-content">
            <h1>AutoInsight Dashboard</h1>
            <p>Inventory & Predictions</p>
          </div>
          <button className="sync-btn" onClick={fetchData}>
            Refresh Data
          </button>
        </header>

        <Navbar />

        <main className="tab-content">
          <Routes>
            <Route
              path="/"
              element={<AnalysisDashboard inventory={inventory} />}
            />
            <Route
              path="/inventory"
              element={<InventoryPage inventory={inventory} formatIST={formatIST} />}
            />
            <Route
              path="/performance"
              element={<ModelPerformancePage mlMetrics={mlMetrics} formatIST={formatIST} />}
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
