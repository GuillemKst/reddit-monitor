const defaultKeywords = [
  // Búsqueda directa
  { phrase: 'screen recording', category: 'direct', priority: 1 },
  { phrase: 'screen recorder', category: 'direct', priority: 1 },
  { phrase: 'record my screen', category: 'direct', priority: 1 },
  { phrase: 'screen capture tool', category: 'direct', priority: 2 },
  { phrase: 'screen recording software', category: 'direct', priority: 1 },
  { phrase: 'record screen tutorial', category: 'direct', priority: 2 },
  { phrase: 'how to record screen', category: 'direct', priority: 2 },
  { phrase: 'screen recording app', category: 'direct', priority: 1 },
  { phrase: 'best screen recorder', category: 'direct', priority: 1 },
  { phrase: 'record demo video', category: 'direct', priority: 2 },
  { phrase: 'video demo tool', category: 'direct', priority: 2 },

  // Competidores
  { phrase: 'loom alternative', category: 'competitor', priority: 1 },
  { phrase: 'loom expensive', category: 'competitor', priority: 1 },
  { phrase: 'loom pricing', category: 'competitor', priority: 2 },
  { phrase: 'better than loom', category: 'competitor', priority: 1 },
  { phrase: 'loom free alternative', category: 'competitor', priority: 1 },
  { phrase: 'obs too complicated', category: 'competitor', priority: 2 },
  { phrase: 'obs alternative simple', category: 'competitor', priority: 2 },
  { phrase: 'screenpal alternative', category: 'competitor', priority: 2 },
  { phrase: 'vidyard alternative', category: 'competitor', priority: 2 },
  { phrase: 'loom vs', category: 'competitor', priority: 1 },
  { phrase: 'screencastify alternative', category: 'competitor', priority: 2 },

  // Pain points
  { phrase: 'need to record screen', category: 'pain_point', priority: 2 },
  { phrase: 'send video feedback', category: 'pain_point', priority: 2 },
  { phrase: 'async video communication', category: 'pain_point', priority: 1 },
  { phrase: 'video for remote team', category: 'pain_point', priority: 2 },
  { phrase: 'record bug report video', category: 'pain_point', priority: 2 },
  { phrase: 'record customer support', category: 'pain_point', priority: 2 },
  { phrase: 'share screen recording', category: 'pain_point', priority: 2 },
  { phrase: 'quick screen recording', category: 'pain_point', priority: 2 },

  // Preguntas generales
  { phrase: 'recommend screen recorder', category: 'question', priority: 1 },
  { phrase: 'what do you use to record', category: 'question', priority: 1 },
  { phrase: 'how to make tutorial video', category: 'question', priority: 3 },
  { phrase: 'record and share screen', category: 'question', priority: 2 },
  { phrase: 'best tool for screen recording', category: 'question', priority: 1 },
  { phrase: 'screen recording recommendation', category: 'question', priority: 1 },
];

module.exports = defaultKeywords;
