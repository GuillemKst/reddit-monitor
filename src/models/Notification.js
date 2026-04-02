const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    type: { type: String, enum: ['discord', 'email'], required: true },
    status: { type: String, enum: ['sent', 'failed'], required: true },
    error: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
