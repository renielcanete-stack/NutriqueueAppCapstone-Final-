require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import Routes
const qrRoutes = require('./routes/qr');
const mlRoutes = require('./routes/ml');
const ordersRoutes = require('./routes/orders');
const healthRoutes = require('./routes/health');

// Route Registration
app.use('/api/qr', qrRoutes);
app.use('/api/ml', mlRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/health', healthRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`NutriQueue Backend running on port ${PORT}`);
});