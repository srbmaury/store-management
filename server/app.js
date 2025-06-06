const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API is running...');
});

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