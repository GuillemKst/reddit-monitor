const axios = require('axios');
const { redditLimiter } = require('../utils/rate-limiter');
const { getAccessToken } = require('./reddit-auth');
const logger = require('../utils/logger');

const REDDIT_OAUTH_BASE = 'https://oauth.reddit.com';
const REDDIT_PUBLIC_BASE = 'https://www.reddit.com';

async function getHeaders() {
  const token = await getAccessToken();
  const userAgent = process.env.REDDIT_USER_AGENT || 'reddit-monitor:v1.0.0 (by /u/monitor-bot)';

  if (token) {
    return {
      Authorization: `Bearer ${token}`,
      'User-Agent': userAgent,
    };
  }

  return { 'User-Agent': userAgent };
}

function getBaseUrl(hasToken) {
  return hasToken ? REDDIT_OAUTH_BASE : REDDIT_PUBLIC_BASE;
}

function parsePost(d) {
  const data = d.data || d;
  return {
    redditId: data.id,
    title: data.title || '',
    selftext: data.selftext || '',
    author: data.author || '[deleted]',
    subreddit: data.subreddit,
    permalink: data.permalink || `/r/${data.subreddit}/comments/${data.id}/`,
    url: `https://www.reddit.com${data.permalink || `/r/${data.subreddit}/comments/${data.id}/`}`,
    score: data.score || 0,
    numComments: data.num_comments || 0,
    redditCreatedAt: new Date((data.created_utc || data.created) * 1000),
  };
}

async function fetchSubreddit(subreddit, limit = 25) {
  await redditLimiter.wait();

  const headers = await getHeaders();
  const hasToken = !!headers.Authorization;
  const baseUrl = getBaseUrl(hasToken);

  const response = await axios.get(`${baseUrl}/r/${subreddit}/new.json`, {
    params: { limit, raw_json: 1 },
    headers,
    timeout: 15000,
  });

  const children = response.data?.data?.children || [];
  return Array.isArray(children) ? children.map(parsePost) : [];
}

async function getNewPostsMulti(subredditList, limit = 100) {
  const allPosts = [];
  const perSub = Math.min(Math.ceil(limit / subredditList.length), 50);
  const threeHoursAgo = Date.now() - (3 * 60 * 60 * 1000);

  for (const sub of subredditList) {
    try {
      const posts = await fetchSubreddit(sub, perSub);
      const recentPosts = posts.filter((p) => p.redditCreatedAt.getTime() > threeHoursAgo);
      allPosts.push(...recentPosts);
      redditLimiter.reportSuccess();
      if (recentPosts.length > 0) {
        logger.info(`r/${sub}: ${recentPosts.length} posts (last 3h)`);
      }
    } catch (err) {
      redditLimiter.reportError();
      if (err.response?.status === 429) {
        const retryAfter = parseInt(err.response.headers['retry-after'] || '10', 10);
        logger.warn(`Reddit rate limited on r/${sub}, waiting ${retryAfter}s...`);
        await new Promise((r) => setTimeout(r, retryAfter * 1000));
      } else if (err.response?.status === 403) {
        logger.warn(`r/${sub}: forbidden (quarantined/private?), skipping`);
      } else {
        logger.error(`r/${sub} error (${err.response?.status}): ${err.message}`);
      }
    }
  }

  logger.info(`Total: ${allPosts.length} posts from ${subredditList.length} subreddits`);
  return allPosts;
}

async function searchSubreddit(subreddit, query, options = {}) {
  const { limit = 25, timeFilter = 'day' } = options;
  await redditLimiter.wait();

  const headers = await getHeaders();
  const hasToken = !!headers.Authorization;
  const baseUrl = getBaseUrl(hasToken);

  const response = await axios.get(`${baseUrl}/r/${subreddit}/search.json`, {
    params: {
      q: query,
      restrict_sr: 1,
      sort: 'new',
      t: timeFilter,
      limit,
      raw_json: 1,
    },
    headers,
    timeout: 15000,
  });

  const children = response.data?.data?.children || [];
  return Array.isArray(children) ? children.map(parsePost) : [];
}

async function searchMultiSubreddit(subredditList, keyword, options = {}) {
  const { limit = 50, timeFilter = 'day' } = options;
  const allPosts = [];
  const perSub = Math.min(limit, 25);

  for (const sub of subredditList) {
    try {
      const posts = await searchSubreddit(sub, keyword, { limit: perSub, timeFilter });
      allPosts.push(...posts);
      redditLimiter.reportSuccess();
    } catch (err) {
      redditLimiter.reportError();
      if (err.response?.status === 429) {
        const retryAfter = parseInt(err.response.headers['retry-after'] || '10', 10);
        logger.warn(`Reddit rate limited searching r/${sub}, waiting ${retryAfter}s...`);
        await new Promise((r) => setTimeout(r, retryAfter * 1000));
      } else {
        logger.error(`Search r/${sub} error: ${err.message}`);
      }
    }
  }

  return allPosts;
}

function buildBatchQuery(keywords, batchSize = 5) {
  const batches = [];
  for (let i = 0; i < keywords.length; i += batchSize) {
    const batch = keywords.slice(i, i + batchSize);
    const query = batch.map((kw) => kw.phrase).join(' OR ');
    batches.push({ query, keywords: batch });
  }
  return batches;
}

module.exports = { searchMultiSubreddit, getNewPostsMulti, buildBatchQuery };
