require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
const dbName = 'car_scraper';
const collectionName = 'inventory';

async function startServer() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // API Endpoint to get inventory (enhanced with predictions)
        app.get('/api/inventory', async (req, res) => {
            try {
                const status = req.query.status || 'active';
                const inventory = await collection.find({ status }).sort({ last_seen: -1 }).toArray();
                res.json(inventory);
            } catch (error) {
                res.status(500).json({ error: 'Failed to fetch inventory' });
            }
        });

        // API Endpoint for ML Metrics
        app.get('/api/ml-metrics', async (req, res) => {
            try {
                const metricsCol = db.collection('ml_metrics');
                const metrics = await metricsCol.find().sort({ timestamp: -1 }).limit(1).toArray();
                res.json(metrics[0] || {});
            } catch (error) {
                res.status(500).json({ error: 'Failed to fetch ML metrics' });
            }
        });

        app.listen(port, () => {
            console.log(`Server running on http://localhost:${port}`);
        });
    } catch (error) {
        console.error('Failed to connect to MongoDB', error);
        process.exit(1);
    }
}

startServer();
