const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    redditId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    selftext: { type: String, default: '' },
    author: { type: String, required: true },
    subreddit: { type: String, required: true, index: true },
    permalink: { type: String, required: true },
    url: { type: String, required: true },
    score: { type: Number, default: 0 },
    numComments: { type: Number, default: 0 },
    redditCreatedAt: { type: Date, required: true },
    matchedKeywords: [{ type: String }],
    relevanceScore: { type: Number, default: 0, index: true },
    status: {
      type: String,
      enum: ['new', 'seen', 'responded', 'dismissed'],
      default: 'new',
      index: true,
    },
    notifiedAt: { type: Date },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

postSchema.index({ relevanceScore: -1, createdAt: -1 });
postSchema.index({ subreddit: 1, status: 1 });

module.exports = mongoose.model('Post', postSchema);
