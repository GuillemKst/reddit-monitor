const axios = require('axios');
const { redditLimiter } = require('../utils/rate-limiter');
const logger = require('../utils/logger');

const REDDIT_BASE = 'https://www.reddit.com';

async function getPostComments(permalink, limit = 50) {
  await redditLimiter.wait();

  try {
    const url = `${REDDIT_BASE}${permalink}.json`;
    const response = await axios.get(url, {
      params: { limit, sort: 'new' },
      headers: { 'User-Agent': process.env.REDDIT_USER_AGENT },
      timeout: 10000,
    });

    const commentListing = response.data?.[1]?.data?.children || [];
    return flattenComments(commentListing);
  } catch (err) {
    logger.error(`Error fetching comments for ${permalink}:`, err.message);
    return [];
  }
}

function flattenComments(children, depth = 0) {
  const comments = [];
  for (const child of children) {
    if (child.kind !== 't1') continue;
    const d = child.data;
    comments.push({
      id: d.id,
      body: d.body || '',
      author: d.author,
      score: d.score,
      createdAt: new Date(d.created_utc * 1000),
      depth,
    });
    if (d.replies?.data?.children) {
      comments.push(...flattenComments(d.replies.data.children, depth + 1));
    }
  }
  return comments;
}

module.exports = { getPostComments };
