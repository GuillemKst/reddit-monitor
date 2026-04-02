const Post = require('../models/Post');
const logger = require('../utils/logger');

async function isNewPost(redditId) {
  const existing = await Post.findOne({ redditId }).lean();
  return !existing;
}

async function filterNewPosts(posts) {
  if (!posts.length) return [];

  const redditIds = posts.map((p) => p.redditId || p.id);
  const existing = await Post.find({ redditId: { $in: redditIds } })
    .select('redditId')
    .lean();

  const existingIds = new Set(existing.map((p) => p.redditId));
  const newPosts = posts.filter((p) => !existingIds.has(p.redditId || p.id));

  logger.debug(`Deduplicator: ${posts.length} total, ${newPosts.length} new`);
  return newPosts;
}

module.exports = { isNewPost, filterNewPosts };
