const subreddits = {
  tier1: [
    'SaaS',
    'startups',
    'Entrepreneur',
    'webdev',
    'programming',
    'software',
    'productivity',
    'remotework',
  ],
  tier2: [
    'smallbusiness',
    'freelance',
    'digital_marketing',
    'MacApps',
    'windows',
    'linux',
    'WorkOnline',
    'telecommuting',
  ],
  tier3: [
    'DevTools',
    'selfhosted',
    'SideProject',
    'AskTechnology',
    'techsupport',
    'youtubers',
    'NewTubers',
  ],
};

function getSubredditTier(subredditName) {
  if (subreddits.tier1.includes(subredditName)) return 1;
  if (subreddits.tier2.includes(subredditName)) return 2;
  if (subreddits.tier3.includes(subredditName)) return 3;
  return 3;
}

function getAllSubreddits() {
  return [...subreddits.tier1, ...subreddits.tier2, ...subreddits.tier3];
}

module.exports = { subreddits, getSubredditTier, getAllSubreddits };
