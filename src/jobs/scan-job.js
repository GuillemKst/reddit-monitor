const cron = require('node-cron');
const { getNewPostsMulti, searchMultiSubreddit, buildBatchQuery } = require('../services/reddit-scanner');
const { filterNewPosts } = require('../services/deduplicator');
const { calculateRelevanceScore } = require('../services/relevance-scorer');
const { notifyPost } = require('../services/notifier');
const { subreddits } = require('../config/subreddits');
const Keyword = require('../models/Keyword');
const Post = require('../models/Post');
const logger = require('../utils/logger');

let scanCount = 0;
let isScanning = false;

function getSubredditsForCycle(cycle) {
  const subs = [...subreddits.tier1];
  if (cycle % 3 === 0) subs.push(...subreddits.tier2);
  if (cycle % 6 === 0) subs.push(...subreddits.tier3);
  return subs;
}

function matchKeywords(text, keywords) {
  const lower = text.toLowerCase();
  return keywords.filter((kw) => lower.includes(kw.phrase));
}

async function processNewPosts(rawPosts, keywords, minScore) {
  const newPosts = await filterNewPosts(rawPosts);
  let matched = 0;
  let notified = 0;

  for (const rawPost of newPosts) {
    const text = `${rawPost.title} ${rawPost.selftext}`;
    const matches = matchKeywords(text, keywords);
    if (!matches.length) continue;
    matched++;

    const relevanceScore = calculateRelevanceScore(rawPost, matches);

    const savedPost = await Post.create({
      ...rawPost,
      matchedKeywords: matches.map((k) => k.phrase),
      relevanceScore,
      status: 'new',
    });

    await Keyword.updateMany(
      { phrase: { $in: matches.map((k) => k.phrase) } },
      { $inc: { matchCount: 1 } }
    );

    if (relevanceScore >= minScore) {
      await notifyPost(savedPost);
      notified++;
    }
  }

  return { newCount: newPosts.length, matched, notified };
}

async function runScan() {
  if (isScanning) {
    logger.warn('Scan already in progress, skipping');
    return;
  }

  isScanning = true;
  scanCount++;
  logger.info(`Starting scan cycle #${scanCount}`);

  try {
    const keywords = await Keyword.find({ isActive: true }).lean();
    if (!keywords.length) {
      logger.warn('No active keywords found. Skipping scan.');
      isScanning = false;
      return;
    }

    const targetSubreddits = getSubredditsForCycle(scanCount);
    const minScore = parseInt(process.env.MIN_RELEVANCE_SCORE || '40');
    const useSearch = !!process.env.REDDIT_CLIENT_ID;

    let totalFound = 0;
    let totalNew = 0;
    let totalMatched = 0;
    let totalNotified = 0;

    if (useSearch) {
      const highPriority = keywords.filter((k) => k.priority <= 2);
      const batches = buildBatchQuery(highPriority, 5);
      logger.info(`OAuth mode: ${targetSubreddits.length} subs, ${batches.length} batch queries`);

      for (const batch of batches) {
        const posts = await searchMultiSubreddit(targetSubreddits, batch.query, {
          sort: 'new', limit: 50, timeFilter: 'day',
        });
        totalFound += posts.length;
        const result = await processNewPosts(posts, keywords, minScore);
        totalNew += result.newCount;
        totalMatched += result.matched;
        totalNotified += result.notified;
      }
    } else {
      logger.info(`No-auth mode: fetching new posts from ${targetSubreddits.length} subs (1 request)`);
      const posts = await getNewPostsMulti(targetSubreddits, 100);
      totalFound = posts.length;
      const result = await processNewPosts(posts, keywords, minScore);
      totalNew = result.newCount;
      totalMatched = result.matched;
      totalNotified = result.notified;
    }

    logger.info(
      `Scan #${scanCount} complete: ${totalFound} fetched, ${totalNew} new, ${totalMatched} matched, ${totalNotified} notified`
    );
  } catch (err) {
    logger.error('Scan job error:', err.message);
  } finally {
    isScanning = false;
  }
}

function startScanJob() {
  const intervalMinutes = parseInt(process.env.SCAN_INTERVAL_MINUTES || '10');
  const cronExpr = `*/${intervalMinutes} * * * *`;

  logger.info(`Scheduling scan job every ${intervalMinutes} minutes`);
  cron.schedule(cronExpr, runScan);

  setTimeout(() => {
    logger.info('Running initial scan...');
    runScan();
  }, 5000);
}

function startDailyDigest() {
  const { sendDailyDigest } = require('../services/notifier');
  cron.schedule('0 9 * * *', () => {
    logger.info('Sending daily digest...');
    sendDailyDigest();
  });
  logger.info('Daily digest scheduled at 9:00 AM');
}

module.exports = { startScanJob, startDailyDigest, runScan };
