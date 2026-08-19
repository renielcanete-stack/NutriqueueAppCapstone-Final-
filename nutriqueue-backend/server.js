require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
const path = require('path');

// Serve the simple dev frontend if present
const staticDir = path.join(__dirname, '..', 'nutriqueue-frontend', 'public');
const fs = require('fs');
if (fs.existsSync(staticDir)) {
	app.use(express.static(staticDir));
}

// Routes are located at the repository root `routes/` directory.
app.use('/api/qr', require(path.join(__dirname, '..', 'routes', 'qr')));
app.use('/api/ml', require(path.join(__dirname, '..', 'routes', 'ml')));
app.use('/api/orders', require(path.join(__dirname, '..', 'routes', 'orders')));
app.use('/api/health', require(path.join(__dirname, '..', 'routes', 'health')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`);
});

// If frontend exists, log its URL
if (fs.existsSync(staticDir)) {
  console.log(`Dev UI available at http://localhost:${PORT}/`);
}
