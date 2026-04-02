require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('../src/config/db');

const dashboardRoutes = require('../src/routes/dashboard');
const keywordsRoutes = require('../src/routes/keywords');
const settingsRoutes = require('../src/routes/settings');

const app = express();

app.use(cors());
app.use(express.json());

let dbConnected = false;
app.use(async (req, res, next) => {
  if (!dbConnected) {
    await connectDB();
    dbConnected = true;
  }
  next();
});

app.use('/api', dashboardRoutes);
app.use('/api/keywords', keywordsRoutes);
app.use('/api/settings', settingsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = app;
