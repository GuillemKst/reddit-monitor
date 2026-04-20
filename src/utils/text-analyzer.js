function normalizeText(text) {
  return (text || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function containsKeyword(text, keyword) {
  const normalized = normalizeText(text);
  const normalizedKeyword = normalizeText(keyword);
  return normalized.includes(normalizedKeyword);
}

function isQuestion(text) {
  return /\?/.test(text);
}

function getTimeDiffMinutes(dateStr) {
  const postDate = new Date(dateStr);
  const now = new Date();
  return (now - postDate) / (1000 * 60);
}

function findMatchingKeywords(text, keywords) {
  const normalizedText = normalizeText(text);
  return keywords.filter((kw) => normalizedText.includes(normalizeText(kw.phrase)));
}

const SELF_PROMO_PATTERNS = [
  'i built', 'i made', 'i created', 'we built', 'we made', 'we created',
  'just launched', 'just released', 'launching today', 'launching soon',
  'check out my', 'check out our', 'try my', 'try our',
  'introducing my', 'introducing our', 'announcing my', 'announcing our',
  'my new tool', 'my new app', 'our new tool', 'our new app',
  'my startup', 'our startup', 'my saas', 'our saas',
  'i developed', 'we developed', 'proud to announce',
  'here is my', 'here is our', 'heres my', 'heres our',
  'give it a try', 'would love feedback', 'looking for feedback',
  'free to use', 'completely free', 'open beta',
  'sign up', 'signup for', 'get early access',
  'my side project', 'our side project',
  'better than loom', 'better than screen studio',
  'alternative to loom', 'alternative to screen studio',
];

function isSelfPromotion(title, body) {
  const text = normalizeText(`${title} ${body}`);
  let matches = 0;
  for (const pattern of SELF_PROMO_PATTERNS) {
    if (text.includes(pattern)) matches++;
  }
  return matches >= 2 ? 'strong' : matches === 1 ? 'weak' : 'none';
}

module.exports = {
  normalizeText,
  containsKeyword,
  isQuestion,
  getTimeDiffMinutes,
  findMatchingKeywords,
  isSelfPromotion,
};
