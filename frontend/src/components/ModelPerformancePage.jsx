const ModelPerformancePage = ({ mlMetrics, formatIST }) => {
    return (
        <div className="ml-section">
            <div className="metrics-grid">
                <div className="metric-card">
                    <h3>MAE</h3>
                    <div className="metric-value">{mlMetrics.MAE ? mlMetrics.MAE.toFixed(2) : '--'}</div>
                    <p>Mean Absolute Error</p>
                </div>
                <div className="metric-card">
                    <h3>RMSE</h3>
                    <div className="metric-value">{mlMetrics.RMSE ? mlMetrics.RMSE.toFixed(2) : '--'}</div>
                    <p>Root Mean Square Error</p>
                </div>
                <div className="metric-card highlight">
                    <h3>R² Score</h3>
                    <div className="metric-value">{mlMetrics.R2 ? (mlMetrics.R2 * 100).toFixed(1) + '%' : '--'}</div>
                    <p>Model Accuracy</p>
                </div>
            </div>

            <div className="ml-info">
                <h3>Model Intelligence</h3>
                <p>The prediction model is trained on multiple features including <strong>VIN region</strong>, <strong>manufacture year</strong>, <strong>mileage</strong>, <strong>transmission type</strong>, and <strong>engine fuel type</strong>.</p>
                <p>Last Retrained: {formatIST(mlMetrics.timestamp)}</p>
            </div>
        </div>
    );
};

export default ModelPerformancePage;
