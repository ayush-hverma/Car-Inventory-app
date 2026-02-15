const InventoryPage = ({ inventory, formatIST }) => {
    return (
        <div className="inventory-section">
            <div className="inventory-grid">
                {inventory.map((car) => (
                    <div key={car.vin} className="car-card">
                        <div className="car-content">
                            <div className="car-badge-row">
                                <span className="car-year">{car.year}</span>
                                {car.predicted_price && (
                                    <span className="prediction-badge">Predicted</span>
                                )}
                            </div>
                            <h2 className="car-title">{car.title}</h2>

                            <div className="car-details">
                                <div className="detail-item">
                                    <span className="detail-label">Mileage</span>
                                    <span className="detail-value">{car.mileage ? `${car.mileage.toLocaleString()} km` : 'N/A'}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Transmission</span>
                                    <span className="detail-value">{car.transmission || 'N/A'}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">First Scraped</span>
                                    <span className="detail-value">{formatIST(car.data_scraped)}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Last Seen</span>
                                    <span className="detail-value">{formatIST(car.last_seen)}</span>
                                </div>
                                <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                                    <span className="detail-label">VIN</span>
                                    <span className="detail-value mono">{car.vin}</span>
                                </div>
                            </div>

                            <div className="price-comparison">
                                <div className="price-item actual">
                                    <span className="price-label">Actual Price</span>
                                    <span className="price-value">${car.price ? car.price.toLocaleString() : 'N/A'}</span>
                                </div>
                                {car.predicted_price && (
                                    <div className="price-item predicted">
                                        <span className="price-label">AI Forecast</span>
                                        <span className="price-value">${Math.round(car.predicted_price).toLocaleString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="car-footer">
                            <span className={`status-badge status-${car.status}`}>
                                {car.status}
                            </span>
                            <a href={car.listing_url} target="_blank" rel="noopener noreferrer" className="view-link">
                                Listing →
                            </a>
                        </div>
                    </div>
                ))}
            </div>
            {inventory.length === 0 && <p className="empty-msg">No active vehicles found.</p>}
        </div>
    );
};

export default InventoryPage;
