# Reddit Monitor — Social Listening for SaaS

Automated Reddit monitoring tool that detects opportunities to organically mention your screen recording SaaS. Sends real-time Discord notifications when relevant posts are found.

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally or a cloud URI

### 1. Install dependencies

```bash
npm install
cd client && npm install && cd ..
```

### 2. Configure environment

Copy `.env` and fill in your values:

```
MONGODB_URI=mongodb://localhost:27017/reddit-monitor
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your-webhook
REDDIT_USER_AGENT=RedditMonitor/1.0 (by /u/yourusername)
```

### 3. Run the project

```bash
# Backend + Frontend together
npm run dev:all

# Or separately
npm run dev        # Backend on :3001
npm run client     # Frontend on :5173
```

### 4. Seed default keywords

Visit `http://localhost:5173/settings` and click "Seed Default Keywords", or:

```bash
curl -X POST http://localhost:3001/api/settings/seed-keywords
```

## How It Works

1. **Cron job** runs every 10 minutes
2. Searches Reddit JSON API for configured keywords across tiered subreddits
3. New posts are scored 0-100 based on keyword match, post age, competition, and subreddit relevance
4. Posts scoring >= 40 trigger a Discord notification
5. Dashboard shows all detected opportunities with filters and status management

## Scoring System

| Factor | Points |
|--------|--------|
| Keyword in title | +30 |
| Keyword in body | +15 |
| Competitor category | +20 |
| Pain point category | +15 |
| Recent post (< 2h) | +10 |
| Few comments (< 5) | +10 |
| Tier 1 subreddit | +10 |
| Post is a question | +5 |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/posts` | List posts (filterable) |
| PATCH | `/api/posts/:id/status` | Update post status |
| GET | `/api/stats` | Dashboard statistics |
| GET | `/api/keywords` | List keywords |
| POST | `/api/keywords` | Create keyword |
| PATCH | `/api/keywords/:id` | Update keyword |
| DELETE | `/api/keywords/:id` | Delete keyword |
| POST | `/api/settings/scan/trigger` | Manual scan |
| POST | `/api/settings/seed-keywords` | Load defaults |
| GET | `/api/settings/health` | Health check |
