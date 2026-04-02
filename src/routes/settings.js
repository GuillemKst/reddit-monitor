const express = require('express');
const { runScan } = require('../jobs/scan-job');
const Keyword = require('../models/Keyword');
const defaultKeywords = require('../config/keywords');
const logger = require('../utils/logger');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

router.post('/scan/trigger', async (req, res) => {
  try {
    logger.info('Manual scan triggered');
    runScan();
    res.json({ message: 'Scan triggered' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/seed-keywords', async (req, res) => {
  try {
    let seeded = 0;
    for (const kw of defaultKeywords) {
      const exists = await Keyword.findOne({ phrase: kw.phrase.toLowerCase() });
      if (!exists) {
        await Keyword.create({
          phrase: kw.phrase.toLowerCase(),
          category: kw.category,
          priority: kw.priority,
          isActive: true,
        });
        seeded++;
      }
    }
    res.json({ message: `${seeded} keywords seeded (${defaultKeywords.length - seeded} already existed)` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
