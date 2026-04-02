const axios = require('axios');
const nodemailer = require('nodemailer');
const Notification = require('../models/Notification');
const Post = require('../models/Post');
const logger = require('../utils/logger');

function formatTimeAgo(date) {
  const minutes = Math.floor((Date.now() - new Date(date)) / 60000);
  if (minutes < 60) return `hace ${minutes} minutos`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} horas`;
  return `hace ${Math.floor(hours / 24)} días`;
}

async function sendDiscordNotification(post) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    logger.warn('Discord webhook URL not configured');
    return false;
  }

  const embed = {
    title: `🎯 Oportunidad — Relevancia: ${post.relevanceScore}/100`,
    description: `**${post.title}**`,
    color: post.relevanceScore >= 70 ? 0xff4500 : post.relevanceScore >= 50 ? 0xffa500 : 0x4CAF50,
    fields: [
      {
        name: '📌 Subreddit',
        value: `r/${post.subreddit} — ${formatTimeAgo(post.redditCreatedAt)}`,
        inline: true,
      },
      {
        name: '📊 Stats',
        value: `👍 ${post.score} upvotes | 💬 ${post.numComments} comentarios`,
        inline: true,
      },
      {
        name: '🔑 Keywords',
        value: post.matchedKeywords.join(', ') || 'N/A',
        inline: false,
      },
    ],
    url: `https://reddit.com${post.permalink}`,
    timestamp: new Date().toISOString(),
  };

  try {
    await axios.post(webhookUrl, { embeds: [embed] });
    await Notification.create({
      postId: post._id,
      type: 'discord',
      status: 'sent',
    });
    logger.info(`Discord notification sent for post: ${post.redditId}`);
    return true;
  } catch (err) {
    await Notification.create({
      postId: post._id,
      type: 'discord',
      status: 'failed',
      error: err.message,
    });
    logger.error('Discord notification failed:', err.message);
    return false;
  }
}

function getMailTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendDailyDigest() {
  if (!process.env.SMTP_USER || !process.env.EMAIL_TO) {
    logger.warn('Email not configured, skipping daily digest');
    return;
  }

  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const posts = await Post.find({
    createdAt: { $gte: yesterday },
    relevanceScore: { $gte: parseInt(process.env.MIN_RELEVANCE_SCORE || '40') },
  })
    .sort({ relevanceScore: -1 })
    .limit(10)
    .lean();

  if (!posts.length) {
    logger.info('No posts for daily digest');
    return;
  }

  const postsHtml = posts
    .map(
      (p) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee;">
          <a href="https://reddit.com${p.permalink}" style="color:#1a73e8;font-weight:600;">${p.title}</a>
          <br><small style="color:#666;">r/${p.subreddit} · ${p.matchedKeywords.join(', ')}</small>
        </td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">
          <span style="background:${p.relevanceScore >= 70 ? '#ff4500' : '#ffa500'};color:white;padding:2px 8px;border-radius:12px;font-size:13px;">${p.relevanceScore}</span>
        </td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">👍 ${p.score} · 💬 ${p.numComments}</td>
      </tr>`
    )
    .join('');

  const html = `
    <div style="font-family:-apple-system,sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#1a1a1a;">📡 Reddit Monitor — Resumen Diario</h2>
      <p style="color:#555;">${posts.length} oportunidades detectadas en las últimas 24h</p>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:#f5f5f5;">
            <th style="padding:8px;text-align:left;">Post</th>
            <th style="padding:8px;text-align:center;">Score</th>
            <th style="padding:8px;text-align:center;">Stats</th>
          </tr>
        </thead>
        <tbody>${postsHtml}</tbody>
      </table>
    </div>`;

  try {
    const transporter = getMailTransporter();
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
      subject: `📡 Reddit Monitor — ${posts.length} oportunidades hoy`,
      html,
    });
    logger.info(`Daily digest sent with ${posts.length} posts`);
  } catch (err) {
    logger.error('Failed to send daily digest:', err.message);
  }
}

async function notifyPost(post) {
  await sendDiscordNotification(post);
  await Post.updateOne({ _id: post._id }, { notifiedAt: new Date() });
}

module.exports = { notifyPost, sendDailyDigest, sendDiscordNotification };
