require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const { startScanJob, startDailyDigest } = require('./jobs/scan-job');
const logger = require('./utils/logger');

const dashboardRoutes = require('./routes/dashboard');
const keywordsRoutes = require('./routes/keywords');
const settingsRoutes = require('./routes/settings');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api', dashboardRoutes);
app.use('/api/keywords', keywordsRoutes);
app.use('/api/settings', settingsRoutes);

app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));
app.get('/{*splat}', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
  }
});

async function start() {
  await connectDB();

  if (!process.env.VERCEL) {
    startScanJob();
    startDailyDigest();
  }

  app.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`);
  });
}

start();
