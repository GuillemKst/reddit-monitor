const mongoose = require('mongoose');
const logger = require('../utils/logger');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10,
      bufferCommands: true,
    });
    logger.info('MongoDB connected');
  } catch (err) {
    logger.error('MongoDB connection error:', err.message);
    logger.warn('Server will start without DB. Fix connection and restart.');
  }
}

module.exports = connectDB;
