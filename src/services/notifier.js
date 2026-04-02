const axios = require('axios');
const nodemailer = require('nodemailer');
const Notification = require('../models/Notification');
const Post = require('../models/Post');
const logger = require('../utils/logger');

function formatTimeAgo(date) {
  const minutes = Math.floor((Date.now() - new Date(date)) / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function getScoreColor(score) {
  if (score >= 70) return '#ef4444';
  if (score >= 50) return '#f59e0b';
  return '#22c55e';
}

let transporter = null;
function getTransporter() {
  if (!transporter && process.env.GMAIL_APP_PASSWORD) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_TO,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }
  return transporter;
}

async function sendDiscordNotification(post) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return false;

  const embed = {
    title: `Oportunidad — Relevancia: ${post.relevanceScore}/100`,
    description: `**${post.title}**`,
    color: post.relevanceScore >= 70 ? 0xff4500 : post.relevanceScore >= 50 ? 0xffa500 : 0x4caf50,
    fields: [
      { name: 'Subreddit', value: `r/${post.subreddit} — ${formatTimeAgo(post.redditCreatedAt)}`, inline: true },
      { name: 'Stats', value: `${post.score} upvotes | ${post.numComments} comments`, inline: true },
      { name: 'Keywords', value: post.matchedKeywords.join(', ') || 'N/A', inline: false },
    ],
    url: `https://reddit.com${post.permalink}`,
    timestamp: new Date().toISOString(),
  };

  try {
    await axios.post(webhookUrl, { embeds: [embed] });
    await Notification.create({ postId: post._id, type: 'discord', status: 'sent' });
    logger.info(`Discord notification sent for: ${post.redditId}`);
    return true;
  } catch (err) {
    await Notification.create({ postId: post._id, type: 'discord', status: 'failed', error: err.message });
    logger.error('Discord notification failed:', err.message);
    return false;
  }
}

async function sendEmailNotification(post) {
  const transport = getTransporter();
  if (!transport || !process.env.EMAIL_TO) return false;

  const scoreColor = getScoreColor(post.relevanceScore);
  const redditUrl = `https://reddit.com${post.permalink}`;

  const html = `
  <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:560px;margin:0 auto;background:#0a0a0a;border-radius:12px;overflow:hidden;border:1px solid #1f1f1f;">
    <div style="padding:20px 24px;border-bottom:1px solid #1f1f1f;">
      <span style="font-size:14px;font-weight:600;color:#fff;">Reddit Monitor</span>
      <span style="background:${scoreColor}20;color:${scoreColor};font-size:12px;font-weight:700;padding:4px 10px;border-radius:20px;float:right;">${post.relevanceScore}/100</span>
    </div>
    <div style="padding:24px;">
      <div style="margin-bottom:12px;">
        <span style="font-size:11px;font-weight:500;color:#f97316;background:#f9731615;padding:3px 8px;border-radius:6px;">r/${post.subreddit}</span>
        <span style="font-size:11px;color:#666;margin-left:8px;">${formatTimeAgo(post.redditCreatedAt)}</span>
      </div>
      <h2 style="font-size:16px;font-weight:600;color:#fff;margin:0 0 12px;line-height:1.4;">${post.title}</h2>
      ${post.selftext ? `<p style="font-size:13px;color:#999;line-height:1.5;margin:0 0 16px;border-left:2px solid #333;padding-left:12px;">${post.selftext.slice(0, 300)}${post.selftext.length > 300 ? '...' : ''}</p>` : ''}
      <div style="margin-bottom:12px;">
        <span style="font-size:12px;color:#666;">${post.score} upvotes · ${post.numComments} comments</span>
      </div>
      <div style="margin-bottom:20px;">
        ${post.matchedKeywords.map((kw) => `<span style="font-size:11px;background:#1f1f1f;color:#999;padding:3px 8px;border-radius:4px;margin-right:4px;display:inline-block;margin-bottom:4px;">${kw}</span>`).join('')}
      </div>
      <a href="${redditUrl}" style="display:inline-block;background:#f97316;color:#fff;font-size:13px;font-weight:600;padding:10px 20px;border-radius:8px;text-decoration:none;">Open on Reddit</a>
    </div>
  </div>`;

  try {
    await transport.sendMail({
      from: process.env.EMAIL_TO,
      to: process.env.EMAIL_TO,
      subject: `[${post.relevanceScore}] r/${post.subreddit}: ${post.title.slice(0, 60)}`,
      html,
    });
    await Notification.create({ postId: post._id, type: 'email', status: 'sent' });
    logger.info(`Email sent for: ${post.redditId}`);
    return true;
  } catch (err) {
    await Notification.create({ postId: post._id, type: 'email', status: 'failed', error: err.message });
    logger.error('Email failed:', err.message);
    return false;
  }
}

async function sendDailyDigest() {
  const transport = getTransporter();
  if (!transport || !process.env.EMAIL_TO) {
    logger.warn('Gmail not configured, skipping digest');
    return;
  }

  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const posts = await Post.find({
    createdAt: { $gte: yesterday },
    relevanceScore: { $gte: parseInt(process.env.MIN_RELEVANCE_SCORE || '50') },
  }).sort({ relevanceScore: -1 }).limit(10).lean();

  if (!posts.length) {
    logger.info('No posts for daily digest');
    return;
  }

  const rows = posts.map((p) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #1f1f1f;">
        <a href="https://reddit.com${p.permalink}" style="color:#f97316;font-weight:600;font-size:13px;text-decoration:none;line-height:1.3;display:block;">${p.title}</a>
        <span style="font-size:11px;color:#666;margin-top:4px;display:block;">r/${p.subreddit} · ${p.matchedKeywords.slice(0, 3).join(', ')}</span>
      </td>
      <td style="padding:10px;border-bottom:1px solid #1f1f1f;text-align:center;vertical-align:top;">
        <span style="background:${getScoreColor(p.relevanceScore)}20;color:${getScoreColor(p.relevanceScore)};font-size:12px;font-weight:700;padding:3px 8px;border-radius:12px;">${p.relevanceScore}</span>
      </td>
    </tr>`).join('');

  const html = `
  <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:560px;margin:0 auto;background:#0a0a0a;border-radius:12px;overflow:hidden;border:1px solid #1f1f1f;">
    <div style="padding:20px 24px;border-bottom:1px solid #1f1f1f;">
      <span style="font-size:16px;font-weight:700;color:#fff;">Daily Digest</span>
      <span style="font-size:12px;color:#666;display:block;margin-top:4px;">${posts.length} opportunities in the last 24h</span>
    </div>
    <table style="width:100%;border-collapse:collapse;">${rows}</table>
    <div style="padding:16px 24px;text-align:center;">
      <span style="font-size:11px;color:#444;">Reddit Monitor — BuzzScreen</span>
    </div>
  </div>`;

  try {
    await transport.sendMail({
      from: process.env.EMAIL_TO,
      to: process.env.EMAIL_TO,
      subject: `Reddit Monitor — ${posts.length} opportunities today`,
      html,
    });
    logger.info(`Daily digest sent: ${posts.length} posts`);
  } catch (err) {
    logger.error('Digest email failed:', err.message);
  }
}

async function notifyPost(post) {
  await Promise.all([
    sendDiscordNotification(post),
    sendEmailNotification(post),
  ]);
  await Post.updateOne({ _id: post._id }, { notifiedAt: new Date() });
}

module.exports = { notifyPost, sendDailyDigest };
