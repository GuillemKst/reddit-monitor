const axios = require('axios');
const { redditLimiter } = require('../utils/rate-limiter');
const { getAccessToken, getRedditConfig } = require('./reddit-auth');
const logger = require('../utils/logger');

async function buildHeaders() {
  const headers = { 'User-Agent': process.env.REDDIT_USER_AGENT };
  const token = await getAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

function parsePost(child) {
  const d = child.data;
  return {
    redditId: d.id,
    title: d.title,
    selftext: d.selftext || '',
    author: d.author,
    subreddit: d.subreddit,
    permalink: d.permalink,
    url: `https://www.reddit.com${d.permalink}`,
    score: d.score,
    numComments: d.num_comments,
    redditCreatedAt: new Date(d.created_utc * 1000),
  };
}

async function searchMultiSubreddit(subredditList, keyword, options = {}) {
  const { sort = 'new', limit = 50, timeFilter = 'day' } = options;
  const { baseUrl } = getRedditConfig();
  const multi = subredditList.join('+');

  await redditLimiter.wait();

  try {
    const headers = await buildHeaders();
    const response = await axios.get(`${baseUrl}/r/${multi}/search.json`, {
      params: { q: keyword, restrict_sr: 'on', sort, t: timeFilter, limit },
      headers,
      timeout: 15000,
    });

    redditLimiter.reportSuccess();
    const posts = (response.data?.data?.children || []).map(parsePost);
    logger.debug(`Searched r/${multi} for "${keyword}": ${posts.length} results`);
    return posts;
  } catch (err) {
    redditLimiter.reportError();
    if (err.response?.status === 429) {
      logger.warn(`Rate limited, backing off...`);
      return [];
    }
    logger.error(`Error searching for "${keyword}":`, err.message);
    return [];
  }
}

async function getNewPostsMulti(subredditList, limit = 100) {
  const { baseUrl } = getRedditConfig();
  const multi = subredditList.join('+');

  await redditLimiter.wait();

  try {
    const headers = await buildHeaders();
    const response = await axios.get(`${baseUrl}/r/${multi}/new.json`, {
      params: { limit },
      headers,
      timeout: 15000,
    });

    redditLimiter.reportSuccess();
    const posts = (response.data?.data?.children || []).map(parsePost);
    logger.info(`Fetched ${posts.length} new posts from ${subredditList.length} subreddits`);
    return posts;
  } catch (err) {
    redditLimiter.reportError();
    if (err.response?.status === 429) {
      logger.warn(`Rate limited on multi/new, backing off...`);
      return [];
    }
    logger.error(`Error fetching new posts:`, err.message);
    return [];
  }
}

function buildBatchQuery(keywords, batchSize = 5) {
  const batches = [];
  for (let i = 0; i < keywords.length; i += batchSize) {
    const batch = keywords.slice(i, i + batchSize);
    const query = batch.map((kw) => `"${kw.phrase}"`).join(' OR ');
    batches.push({ query, keywords: batch });
  }
  return batches;
}

module.exports = { searchMultiSubreddit, getNewPostsMulti, buildBatchQuery };
