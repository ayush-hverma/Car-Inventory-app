import { useState } from 'react';

const ITEMS_PER_PAGE = 9;

const InventoryPage = ({ inventory, formatIST }) => {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(inventory.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedInventory = inventory.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);
        if (end - start < maxVisible - 1) {
            start = Math.max(1, end - maxVisible + 1);
        }
        for (let i = start; i <= end; i++) pages.push(i);
        return pages;
    };

    return (
        <div className="inventory-section">
            <div className="inventory-grid">
                {paginatedInventory.map((car) => (
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

            {totalPages > 1 && (
                <div className="pagination">
                    <div className="pagination-info">
                        Showing {startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, inventory.length)} of {inventory.length} vehicles
                    </div>
                    <div className="pagination-controls">
                        <button
                            className="page-btn"
                            onClick={() => goToPage(1)}
                            disabled={currentPage === 1}
                            title="First page"
                        >
                            «
                        </button>
                        <button
                            className="page-btn"
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            ‹
                        </button>

                        {getPageNumbers().map((page) => (
                            <button
                                key={page}
                                className={`page-btn ${page === currentPage ? 'active' : ''}`}
                                onClick={() => goToPage(page)}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            className="page-btn"
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            ›
                        </button>
                        <button
                            className="page-btn"
                            onClick={() => goToPage(totalPages)}
                            disabled={currentPage === totalPages}
                            title="Last page"
                        >
                            »
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryPage;
