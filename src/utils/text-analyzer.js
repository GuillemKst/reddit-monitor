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

module.exports = {
  normalizeText,
  containsKeyword,
  isQuestion,
  getTimeDiffMinutes,
  findMatchingKeywords,
};
