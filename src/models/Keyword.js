const mongoose = require('mongoose');

const keywordSchema = new mongoose.Schema(
  {
    phrase: { type: String, required: true, unique: true, lowercase: true, trim: true },
    category: {
      type: String,
      enum: ['direct', 'competitor', 'pain_point', 'question'],
      required: true,
    },
    isActive: { type: Boolean, default: true },
    priority: { type: Number, default: 2, min: 1, max: 3 },
    matchCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Keyword', keywordSchema);
