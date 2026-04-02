const subreddits = {
  tier1: [
    // Builders & SaaS — máxima relevancia
    'SaaS',
    'startups',
    'Entrepreneur',
    'SideProject',
    // Developers — buscan herramientas activamente
    'webdev',
    'programming',
    'reactjs',
    'javascript',
  ],
  tier2: [
    // Product & Marketing
    'ProductManagement',
    'marketing',
    'growthhacking',
    'digital_marketing',
    // Creators
    'youtubers',
    'contentcreation',
    'videoediting',
    // Productivity & Remote
    'productivity',
    'remotework',
  ],
  tier3: [
    // Más nicho pero valioso
    'DevTools',
    'selfhosted',
    'smallbusiness',
    'freelance',
    'NewTubers',
    'MacApps',
    'windows',
    'software',
    'AskTechnology',
    'techsupport',
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
