const { getSubredditTier } = require('../config/subreddits');
const { containsKeyword, isQuestion, getTimeDiffMinutes, isSelfPromotion } = require('../utils/text-analyzer');

function calculateRelevanceScore(post, matchedKeywords) {
  let score = 0;
  const title = (post.title || '').toLowerCase();
  const body = (post.selftext || '').toLowerCase();

  for (const kw of matchedKeywords) {
    if (containsKeyword(title, kw.phrase)) {
      score += 30;
    } else if (containsKeyword(body, kw.phrase)) {
      score += 15;
    }

    if (kw.category === 'pain_point') score += 15;
    else if (kw.category === 'question') score += 10;
  }

  const ageMinutes = getTimeDiffMinutes(post.redditCreatedAt || post.created_utc * 1000);
  if (ageMinutes <= 120) score += 10;

  if ((post.numComments || post.num_comments || 0) < 5) score += 10;

  const subreddit = post.subreddit || post.subreddit_name_prefixed?.replace('r/', '');
  const tier = getSubredditTier(subreddit);
  if (tier === 1) score += 10;

  if (isQuestion(title)) score += 5;

  const promoLevel = isSelfPromotion(title, body);
  if (promoLevel === 'strong') score -= 60;
  else if (promoLevel === 'weak') score -= 25;

  return Math.max(0, Math.min(score, 100));
}

module.exports = { calculateRelevanceScore };
