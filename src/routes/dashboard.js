const express = require('express');
const Post = require('../models/Post');
const Notification = require('../models/Notification');

const router = express.Router();

router.get('/posts', async (req, res) => {
  try {
    const {
      status,
      subreddit,
      minScore,
      maxScore,
      keyword,
      sort = '-relevanceScore',
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (subreddit) filter.subreddit = subreddit;
    if (keyword) filter.matchedKeywords = { $in: [keyword] };
    if (minScore || maxScore) {
      filter.relevanceScore = {};
      if (minScore) filter.relevanceScore.$gte = parseInt(minScore);
      if (maxScore) filter.relevanceScore.$lte = parseInt(maxScore);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Post.countDocuments(filter),
    ]);

    res.json({
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/posts/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['new', 'seen', 'responded', 'dismissed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/posts/:id/notes', async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { notes: req.body.notes },
      { new: true }
    );
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const now = new Date();
    const dayAgo = new Date(now - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

    const [totalPosts, todayPosts, weekPosts, statusCounts, topSubreddits, topKeywords] =
      await Promise.all([
        Post.countDocuments(),
        Post.countDocuments({ createdAt: { $gte: dayAgo } }),
        Post.countDocuments({ createdAt: { $gte: weekAgo } }),
        Post.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
        Post.aggregate([
          { $group: { _id: '$subreddit', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ]),
        Post.aggregate([
          { $unwind: '$matchedKeywords' },
          { $group: { _id: '$matchedKeywords', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ]),
      ]);

    const responded = statusCounts.find((s) => s._id === 'responded')?.count || 0;
    const responseRate = totalPosts > 0 ? ((responded / totalPosts) * 100).toFixed(1) : 0;

    res.json({
      totalPosts,
      todayPosts,
      weekPosts,
      responseRate: parseFloat(responseRate),
      statusCounts: Object.fromEntries(statusCounts.map((s) => [s._id, s.count])),
      topSubreddits,
      topKeywords,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/subreddits', async (req, res) => {
  try {
    const subreddits = await Post.distinct('subreddit');
    res.json(subreddits.sort());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
