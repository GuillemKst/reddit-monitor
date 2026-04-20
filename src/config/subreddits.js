const subreddits = {
  tier1: [
    'SaaS',
    'startups',
    'Entrepreneur',
    'SideProject',
  ],
  tier2: [
    'marketing',
    'growthhacking',
    'digital_marketing',
    'FacebookAds',
    'PPC',
    'contentcreation',
    'videoediting',
    'ProductManagement',
    'IndieDev',
  ],
  tier3: [
    'smallbusiness',
    'socialmedia',
    'TikTokAds',
    'webdev',
    'OnlineBusiness',
    'freelance',
    'DigitalNomad',
    'Advertising',
  ],
};

function getSubredditTier(subredditName) {
  const lower = subredditName.toLowerCase();
  if (subreddits.tier1.some((s) => s.toLowerCase() === lower)) return 1;
  if (subreddits.tier2.some((s) => s.toLowerCase() === lower)) return 2;
  if (subreddits.tier3.some((s) => s.toLowerCase() === lower)) return 3;
  return 3;
}

function getAllSubreddits() {
  return [...subreddits.tier1, ...subreddits.tier2, ...subreddits.tier3];
}

module.exports = { subreddits, getSubredditTier, getAllSubreddits };
