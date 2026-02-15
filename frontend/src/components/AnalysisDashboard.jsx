import { useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, ScatterChart, Scatter, ZAxis, Legend
} from 'recharts';

const AnalysisDashboard = ({ inventory }) => {
    // Data Processing for Charts
    const stats = useMemo(() => {
        if (!inventory.length) return null;

        // 1. Price Distribution (Buckets of 10k)
        const priceBuckets = {};
        inventory.forEach(car => {
            if (!car.price) return;
            const bucket = Math.floor(car.price / 10000) * 10;
            const label = `${bucket}k-${bucket + 10}k`;
            priceBuckets[label] = (priceBuckets[label] || 0) + 1;
        });
        const priceData = Object.entries(priceBuckets)
            .map(([range, count]) => ({ range, count }))
            .sort((a, b) => parseInt(a.range) - parseInt(b.range));

        // 2. Year Distribution
        const yearBuckets = {};
        inventory.forEach(car => {
            if (!car.year) return;
            yearBuckets[car.year] = (yearBuckets[car.year] || 0) + 1;
        });
        const yearData = Object.entries(yearBuckets)
            .map(([year, count]) => ({ year: parseInt(year), count }))
            .sort((a, b) => a.year - b.year);

        // 3. Status Pie
        const statusCounts = {};
        inventory.forEach(car => {
            statusCounts[car.status] = (statusCounts[car.status] || 0) + 1;
        });
        const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

        // 4. Scatter Data (Mileage vs Price)
        const scatterData = inventory
            .filter(car => car.price && car.mileage)
            .map(car => ({
                mileage: car.mileage,
                price: car.price,
                title: car.title
            }));

        // Summary Metrics
        const avgPrice = inventory.reduce((acc, car) => acc + (car.price || 0), 0) / inventory.length;
        const avgMileage = inventory.reduce((acc, car) => acc + (car.mileage || 0), 0) / inventory.length;
        const totalValue = inventory.reduce((acc, car) => acc + (car.price || 0), 0);

        return { priceData, yearData, statusData, scatterData, avgPrice, avgMileage, totalValue };
    }, [inventory]);

    if (!stats) return <div className="empty-msg">No data available for analysis.</div>;

    const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444'];

    return (
        <div className="analysis-dashboard">
            <div className="metrics-row">
                <div className="metric-card">
                    <h3>Total Inventory</h3>
                    <div className="metric-value">{inventory.length}</div>
                    <p>Active & Removed Listings</p>
                </div>
                <div className="metric-card">
                    <h3>Average Price</h3>
                    <div className="metric-value">${Math.round(stats.avgPrice).toLocaleString()}</div>
                    <p>Across all listings</p>
                </div>
                <div className="metric-card">
                    <h3>Avg Mileage</h3>
                    <div className="metric-value">{Math.round(stats.avgMileage).toLocaleString()} km</div >
                    <p>Fleet usage average</p>
                </div >
                <div className="metric-card highlight">
                    <h3>Total Valuation</h3>
                    <div className="metric-value">${Math.round(stats.totalValue).toLocaleString()}</div>
                    <p>Estimated market value</p>
                </div>
            </div>

            <div className="charts-grid">
                <div className="chart-container">
                    <h3>Price Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={stats.priceData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="range" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                                itemStyle={{ color: '#f8fafc' }}
                            />
                            <Bar dataKey="count" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-container">
                    <h3>Inventory by Year</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={stats.yearData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="year" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                                itemStyle={{ color: '#f8fafc' }}
                            />
                            <Line type="monotone" dataKey="count" stroke="#a855f7" strokeWidth={3} dot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-container">
                    <h3>Listing Status</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={stats.statusData}
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {stats.statusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                                itemStyle={{ color: '#f8fafc' }}
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-container">
                    <h3>Price vs Mileage Correlation</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <ScatterChart>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis
                                type="number"
                                dataKey="mileage"
                                name="Mileage"
                                unit="km"
                                stroke="#94a3b8"
                                tick={{ fontSize: 10 }}
                            />
                            <YAxis
                                type="number"
                                dataKey="price"
                                name="Price"
                                unit="$"
                                stroke="#94a3b8"
                                tick={{ fontSize: 10 }}
                            />
                            <ZAxis type="category" dataKey="title" name="Model" />
                            <Tooltip
                                cursor={{ strokeDasharray: '3 3' }}
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                            />
                            <Scatter name="Vehicles" data={stats.scatterData} fill="#10b981" />
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default AnalysisDashboard;
