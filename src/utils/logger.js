const LOG_LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const currentLevel = process.env.LOG_LEVEL || 'info';

function formatMessage(level, ...args) {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  return [prefix, ...args];
}

const logger = {
  error: (...args) => {
    if (LOG_LEVELS[currentLevel] >= LOG_LEVELS.error) {
      console.error(...formatMessage('error', ...args));
    }
  },
  warn: (...args) => {
    if (LOG_LEVELS[currentLevel] >= LOG_LEVELS.warn) {
      console.warn(...formatMessage('warn', ...args));
    }
  },
  info: (...args) => {
    if (LOG_LEVELS[currentLevel] >= LOG_LEVELS.info) {
      console.log(...formatMessage('info', ...args));
    }
  },
  debug: (...args) => {
    if (LOG_LEVELS[currentLevel] >= LOG_LEVELS.debug) {
      console.log(...formatMessage('debug', ...args));
    }
  },
};

module.exports = logger;
