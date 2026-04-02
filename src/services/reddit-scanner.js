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

async function getNewPostsMulti(subredditList, limit = 100) {
  const allPosts = [];
  const chunkSize = 10;
  const after = Math.floor(Date.now() / 1000) - (3 * 60 * 60);

  for (let i = 0; i < subredditList.length; i += chunkSize) {
    const chunk = subredditList.slice(i, i + chunkSize);
    const subredditParam = chunk.join(',');

    await redditLimiter.wait();

    try {
      const response = await axios.get(`${PULLPUSH_BASE}/reddit/search/submission/`, {
        params: {
          subreddit: subredditParam,
          after,
          size: Math.min(limit, 100),
          sort_type: 'created_utc',
          sort: 'desc',
        },
        timeout: 20000,
      });

      const items = response.data?.data || [];
      const posts = (Array.isArray(items) ? items : []).map(parsePost);
      allPosts.push(...posts);
      redditLimiter.reportSuccess();
      logger.info(`PullPush: ${posts.length} posts from [${subredditParam}]`);
    } catch (err) {
      redditLimiter.reportError();
      if (err.response?.status === 429) {
        logger.warn('PullPush rate limited, waiting 10s...');
        await new Promise((r) => setTimeout(r, 10000));
      } else {
        logger.error(`PullPush error (${err.response?.status}): ${err.message}`);
      }
    }

    if (i + chunkSize < subredditList.length) {
      await new Promise((r) => setTimeout(r, 1500));
    }
  }

  logger.info(`PullPush total: ${allPosts.length} posts from ${subredditList.length} subreddits`);
  return allPosts;
}

async function searchMultiSubreddit(subredditList, keyword, options = {}) {
  const { limit = 50 } = options;
  const subredditParam = subredditList.join(',');
  const after = Math.floor(Date.now() / 1000) - (24 * 60 * 60);

  await redditLimiter.wait();

  try {
    const response = await axios.get(`${PULLPUSH_BASE}/reddit/search/submission/`, {
      params: {
        subreddit: subredditParam,
        q: keyword,
        after,
        size: limit,
        sort_type: 'created_utc',
        sort: 'desc',
      },
      timeout: 20000,
    });

    const items = response.data?.data || [];
    const posts = (Array.isArray(items) ? items : []).map(parsePost);
    redditLimiter.reportSuccess();
    logger.debug(`PullPush search "${keyword.slice(0, 30)}": ${posts.length} results`);
    return posts;
  } catch (err) {
    redditLimiter.reportError();
    logger.error(`PullPush search error: ${err.message}`);
    return [];
  }
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
