const axios = require('axios');
const { redditLimiter } = require('../utils/rate-limiter');
const logger = require('../utils/logger');

const PULLPUSH_BASE = 'https://api.pullpush.io';

function parsePost(d) {
  return {
    redditId: d.id,
    title: d.title || '',
    selftext: d.selftext || '',
    author: d.author || '[deleted]',
    subreddit: d.subreddit,
    permalink: d.permalink || `/r/${d.subreddit}/comments/${d.id}/`,
    url: `https://www.reddit.com/r/${d.subreddit}/comments/${d.id}/`,
    score: d.score || 0,
    numComments: d.num_comments || 0,
    redditCreatedAt: new Date((d.created_utc || d.created) * 1000),
  };
}

async function fetchSubreddit(subreddit, after, size = 25) {
  await redditLimiter.wait();

  const response = await axios.get(`${PULLPUSH_BASE}/reddit/search/submission/`, {
    params: {
      subreddit,
      after,
      size,
      sort_type: 'created_utc',
      sort: 'desc',
    },
    timeout: 15000,
  });

  const items = response.data?.data || [];
  return Array.isArray(items) ? items.map(parsePost) : [];
}

async function getNewPostsMulti(subredditList, limit = 100) {
  const allPosts = [];
  const after = Math.floor(Date.now() / 1000) - (3 * 60 * 60);
  const perSub = Math.min(Math.ceil(limit / subredditList.length), 50);

  for (const sub of subredditList) {
    try {
      const posts = await fetchSubreddit(sub, after, perSub);
      allPosts.push(...posts);
      redditLimiter.reportSuccess();
      if (posts.length > 0) {
        logger.info(`r/${sub}: ${posts.length} posts`);
      }
    } catch (err) {
      redditLimiter.reportError();
      if (err.response?.status === 429) {
        logger.warn(`PullPush rate limited on r/${sub}, waiting 10s...`);
        await new Promise((r) => setTimeout(r, 10000));
      } else {
        logger.error(`r/${sub} error (${err.response?.status}): ${err.message}`);
      }
    }
  }

  logger.info(`Total: ${allPosts.length} posts from ${subredditList.length} subreddits`);
  return allPosts;
}

async function searchMultiSubreddit(subredditList, keyword, options = {}) {
  const { limit = 50 } = options;
  const after = Math.floor(Date.now() / 1000) - (24 * 60 * 60);
  const allPosts = [];

  for (const sub of subredditList) {
    await redditLimiter.wait();
    try {
      const response = await axios.get(`${PULLPUSH_BASE}/reddit/search/submission/`, {
        params: {
          subreddit: sub,
          q: keyword,
          after,
          size: Math.min(limit, 25),
          sort_type: 'created_utc',
          sort: 'desc',
        },
        timeout: 15000,
      });

      const items = response.data?.data || [];
      const posts = Array.isArray(items) ? items.map(parsePost) : [];
      allPosts.push(...posts);
      redditLimiter.reportSuccess();
    } catch (err) {
      redditLimiter.reportError();
      logger.error(`Search r/${sub} error: ${err.message}`);
    }
  }

  return allPosts;
}

function buildBatchQuery(keywords, batchSize = 5) {
  const batches = [];
  for (let i = 0; i < keywords.length; i += batchSize) {
    const batch = keywords.slice(i, i + batchSize);
    const query = batch.map((kw) => kw.phrase).join('|');
    batches.push({ query, keywords: batch });
  }
  return batches;
}

module.exports = { searchMultiSubreddit, getNewPostsMulti, buildBatchQuery };
