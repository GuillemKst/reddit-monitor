const logger = require('./logger');

class RateLimiter {
  constructor(minDelayMs = 6000) {
    this.minDelayMs = minDelayMs;
    this.lastRequestTime = 0;
    this.consecutiveErrors = 0;
  }

  async wait() {
    const backoffDelay = this.consecutiveErrors > 0
      ? this.minDelayMs * Math.pow(2, Math.min(this.consecutiveErrors, 4))
      : this.minDelayMs;

    const now = Date.now();
    const elapsed = now - this.lastRequestTime;
    if (elapsed < backoffDelay) {
      const waitTime = backoffDelay - elapsed;
      logger.debug(`Rate limiter: waiting ${waitTime}ms (errors: ${this.consecutiveErrors})`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
    this.lastRequestTime = Date.now();
  }

  reportSuccess() {
    this.consecutiveErrors = 0;
  }

  reportError() {
    this.consecutiveErrors++;
  }
}

const isOAuth = !!process.env.REDDIT_CLIENT_ID;
const redditLimiter = new RateLimiter(isOAuth ? 1200 : 6000);

module.exports = { RateLimiter, redditLimiter };
