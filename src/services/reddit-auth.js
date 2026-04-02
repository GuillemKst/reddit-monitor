const axios = require('axios');
const logger = require('../utils/logger');

let accessToken = null;
let tokenExpiresAt = 0;

async function getAccessToken() {
  if (accessToken && Date.now() < tokenExpiresAt - 60000) {
    return accessToken;
  }

  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    logger.warn('Reddit OAuth not configured — using unauthenticated access');
    return null;
  }

  try {
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const response = await axios.post(
      'https://www.reddit.com/api/v1/access_token',
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': process.env.REDDIT_USER_AGENT,
        },
        timeout: 10000,
      }
    );

    accessToken = response.data.access_token;
    tokenExpiresAt = Date.now() + response.data.expires_in * 1000;
    logger.info('Reddit OAuth token obtained');
    return accessToken;
  } catch (err) {
    logger.error('Reddit OAuth error:', err.response?.data || err.message);
    return null;
  }
}

function getRedditConfig() {
  const isOAuth = !!process.env.REDDIT_CLIENT_ID;
  return {
    baseUrl: isOAuth ? 'https://oauth.reddit.com' : 'https://www.reddit.com',
    isOAuth,
  };
}

module.exports = { getAccessToken, getRedditConfig };
