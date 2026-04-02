const axios = require('axios');
const { redditLimiter } = require('../utils/rate-limiter');
const { getAccessToken, getRedditConfig } = require('./reddit-auth');
const logger = require('../utils/logger');

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,application/json;q=0.8,*/*;q=0.7',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Cache-Control': 'no-cache',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
};

async function buildHeaders() {
  const token = await getAccessToken();
  if (token) {
    return {
      'User-Agent': process.env.REDDIT_USER_AGENT || BROWSER_HEADERS['User-Agent'],
      'Authorization': `Bearer ${token}`,
    };
  }
  return { ...BROWSER_HEADERS };
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

async function fetchWithRetry(url, params, maxRetries = 2) {
  const bases = ['https://www.reddit.com', 'https://old.reddit.com'];

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const baseUrl = bases[attempt % bases.length];
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;

    await redditLimiter.wait();

    try {
      const headers = await buildHeaders();
      const response = await axios.get(fullUrl, {
        params,
        headers,
        timeout: 15000,
        maxRedirects: 5,
      });
      redditLimiter.reportSuccess();
      return response;
    } catch (err) {
      redditLimiter.reportError();
      const status = err.response?.status;

      if (status === 429) {
        logger.warn(`Rate limited (attempt ${attempt + 1}), waiting...`);
        await new Promise((r) => setTimeout(r, (attempt + 1) * 10000));
        continue;
      }

      if (status === 403 && attempt < maxRetries) {
        logger.warn(`403 on ${fullUrl} (attempt ${attempt + 1}), trying alternate...`);
        await new Promise((r) => setTimeout(r, 3000));
        continue;
      }

      throw err;
    }
  }
  return null;
}

async function getNewPostsMulti(subredditList, limit = 100) {
  const chunkSize = 5;
  const allPosts = [];

  for (let i = 0; i < subredditList.length; i += chunkSize) {
    const chunk = subredditList.slice(i, i + chunkSize);
    const multi = chunk.join('+');

    try {
      const response = await fetchWithRetry(`/r/${multi}/new.json`, { limit: Math.min(limit, 50), raw_json: 1 });
      if (response?.data?.data?.children) {
        const posts = response.data.data.children.map(parsePost);
        allPosts.push(...posts);
        logger.info(`Fetched ${posts.length} posts from r/${multi}`);
      }
    } catch (err) {
      logger.error(`Failed r/${multi}:`, err.message);
    }

    if (i + chunkSize < subredditList.length) {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  logger.info(`Total fetched: ${allPosts.length} posts from ${subredditList.length} subreddits`);
  return allPosts;
}

async function searchMultiSubreddit(subredditList, keyword, options = {}) {
  const { sort = 'new', limit = 50, timeFilter = 'day' } = options;
  const multi = subredditList.join('+');

  try {
    const response = await fetchWithRetry(`/r/${multi}/search.json`, {
      q: keyword, restrict_sr: 'on', sort, t: timeFilter, limit, raw_json: 1,
    });

    if (response?.data?.data?.children) {
      const posts = response.data.data.children.map(parsePost);
      logger.debug(`Searched r/${multi} for "${keyword}": ${posts.length} results`);
      return posts;
    }
    return [];
  } catch (err) {
    logger.error(`Error searching for "${keyword}":`, err.message);
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
