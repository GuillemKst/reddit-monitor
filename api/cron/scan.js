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
    const useSearch = !!process.env.REDDIT_CLIENT_ID;
    const minScore = parseInt(process.env.MIN_RELEVANCE_SCORE || '40');

    let totalFound = 0;
    let totalNew = 0;
    let totalMatched = 0;
    let totalNotified = 0;

    if (useSearch) {
      const highPriority = keywords.filter((k) => k.priority <= 2);
      const batches = buildBatchQuery(highPriority, 5);

      for (const batch of batches) {
        const posts = await searchMultiSubreddit(targetSubreddits, batch.query, {
          sort: 'new', limit: 50, timeFilter: 'day',
        });
        totalFound += posts.length;
        const newPosts = await filterNewPosts(posts);
        totalNew += newPosts.length;

        for (const rawPost of newPosts) {
          const text = `${rawPost.title} ${rawPost.selftext}`;
          const matched = matchKeywords(text, keywords);
          if (!matched.length) continue;
          totalMatched++;

          const relevanceScore = calculateRelevanceScore(rawPost, matched);
          const savedPost = await Post.create({
            ...rawPost,
            matchedKeywords: matched.map((k) => k.phrase),
            relevanceScore, status: 'new',
          });

          await Keyword.updateMany(
            { phrase: { $in: matched.map((k) => k.phrase) } },
            { $inc: { matchCount: 1 } }
          );

          if (relevanceScore >= minScore) {
            await notifyPost(savedPost);
            totalNotified++;
          }
        }
      }
    } else {
      const posts = await getNewPostsMulti(targetSubreddits, 100);
      totalFound = posts.length;
      const newPosts = await filterNewPosts(posts);
      totalNew = newPosts.length;

      for (const rawPost of newPosts) {
        const text = `${rawPost.title} ${rawPost.selftext}`;
        const matched = matchKeywords(text, keywords);
        if (!matched.length) continue;
        totalMatched++;

        const relevanceScore = calculateRelevanceScore(rawPost, matched);
        const savedPost = await Post.create({
          ...rawPost,
          matchedKeywords: matched.map((k) => k.phrase),
          relevanceScore, status: 'new',
        });

        await Keyword.updateMany(
          { phrase: { $in: matched.map((k) => k.phrase) } },
          { $inc: { matchCount: 1 } }
        );

        if (relevanceScore >= minScore) {
          await notifyPost(savedPost);
          totalNotified++;
        }
      }
    }

    res.json({
      message: 'Scan complete',
      subreddits: targetSubreddits.length,
      fetched: totalFound,
      new: totalNew,
      matched: totalMatched,
      notified: totalNotified,
    });
  } catch (err) {
    console.error('Cron scan error:', err);
    res.status(500).json({ error: err.message });
  }
};
