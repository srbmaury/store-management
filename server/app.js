const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors({
	origin: 'https://store-management-copy-frontend.onrender.com', // your frontend URL
}));
app.use(express.json());

// -------------------------- DEPLOYMENT ---------------------------
const __dirname1 = path.resolve();

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname1, "client", "dist"))); // Vite builds to dist

	// SPA fallback route
	app.get('/{*any}', (req, res) => {
		res.sendFile(path.join(__dirname1, 'client', 'dist', 'index.html'));
	});
} else {
	app.get("/", (req, res) => {
		res.send("API is running successfully");
	});
}
// -------------------------- DEPLOYMENT ---------------------------

// Routes
const authRoutes = require('./routes/authRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const salesRoutes = require('./routes/salesRoutes');
const storeRoutes = require('./routes/storeRoutes');
const joinRequestRoutes = require('./routes/joinRequestRoutes');
const testRoutes = require('./routes/testRoutes');
const staffRoutes = require('./routes/staffRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/join-requests', joinRequestRoutes);
app.use('/api/test', testRoutes);
app.use('/api/staff', staffRoutes);

module.exports = app;