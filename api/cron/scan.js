require('dotenv').config();

const mongoose = require('mongoose');
const { getNewPostsMulti, searchMultiSubreddit, buildBatchQuery } = require('../../src/services/reddit-scanner');
const { filterNewPosts } = require('../../src/services/deduplicator');
const { calculateRelevanceScore } = require('../../src/services/relevance-scorer');
const { notifyPost } = require('../../src/services/notifier');
const { subreddits } = require('../../src/config/subreddits');
const Keyword = require('../../src/models/Keyword');
const Post = require('../../src/models/Post');

function getCycleNumber() {
  return Math.floor(Date.now() / 60000);
}

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

async function processResults(posts, keywords, minScore) {
  const newPosts = await filterNewPosts(posts);
  let matched = 0;
  let notified = 0;
  let dismissed = 0;
  const dismissThreshold = Math.max(20, minScore - 20);

  for (const rawPost of newPosts) {
    const text = `${rawPost.title} ${rawPost.selftext}`;
    const matches = matchKeywords(text, keywords);
    if (!matches.length) continue;
    matched++;

    const relevanceScore = calculateRelevanceScore(rawPost, matches);

    if (relevanceScore < dismissThreshold) {
      dismissed++;
      continue;
    }

    const status = relevanceScore >= minScore ? 'new' : 'seen';
    const savedPost = await Post.create({
      ...rawPost,
      matchedKeywords: matches.map((k) => k.phrase),
      relevanceScore,
      status,
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

  return { newCount: newPosts.length, matched, notified, dismissed };
}

module.exports = async function handler(req, res) {
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
        maxPoolSize: 5,
      });
    }

    const keywords = await Keyword.find({ isActive: true }).lean();
    if (!keywords.length) {
      return res.json({ message: 'No active keywords', scanned: 0 });
    }

    const cycle = getCycleNumber();
    const targetSubreddits = getSubredditsForCycle(cycle);
    const minScore = parseInt(process.env.MIN_RELEVANCE_SCORE || '50');

    const posts = await getNewPostsMulti(targetSubreddits, 100);
    const results = await processResults(posts, keywords, minScore);

    res.json({
      message: 'Scan complete',
      subreddits: targetSubreddits.length,
      fetched: posts.length,
      ...results,
    });
  } catch (err) {
    console.error('Cron scan error:', err);
    res.status(500).json({ error: err.message });
  }
};
