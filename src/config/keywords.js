const defaultKeywords = [
  // ===== PAIN POINTS (oro puro — la persona YA tiene el problema) =====
  { phrase: 'looking for screen recorder', category: 'pain_point', priority: 1 },
  { phrase: 'best screen recording software', category: 'pain_point', priority: 1 },
  { phrase: 'screen recording tool recommendation', category: 'pain_point', priority: 1 },
  { phrase: 'how to record product demo', category: 'pain_point', priority: 1 },
  { phrase: 'how to record demo video', category: 'pain_point', priority: 1 },
  { phrase: 'how do you record tutorials', category: 'pain_point', priority: 1 },
  { phrase: 'tool for recording product demo', category: 'pain_point', priority: 1 },
  { phrase: 'software demo recording tool', category: 'pain_point', priority: 1 },
  { phrase: 'record screen with zoom', category: 'pain_point', priority: 2 },

  // Quejas directas
  { phrase: 'loom is expensive', category: 'pain_point', priority: 1 },
  { phrase: 'loom limitations', category: 'pain_point', priority: 1 },
  { phrase: 'screen studio too expensive', category: 'pain_point', priority: 1 },
  { phrase: 'screen studio windows alternative', category: 'pain_point', priority: 1 },
  { phrase: 'descript screen recording issues', category: 'pain_point', priority: 2 },
  { phrase: 'screen recording workflow', category: 'pain_point', priority: 1 },
  { phrase: 'loom alternatives reddit', category: 'pain_point', priority: 1 },

  // ===== CASOS DE USO — Product Demos =====
  { phrase: 'product demo video', category: 'direct', priority: 1 },
  { phrase: 'saas demo video', category: 'direct', priority: 1 },
  { phrase: 'demo video for landing page', category: 'direct', priority: 1 },
  { phrase: 'software demo video', category: 'direct', priority: 1 },
  { phrase: 'how to make product demo', category: 'direct', priority: 1 },
  { phrase: 'record saas demo', category: 'direct', priority: 1 },

  // Casos de uso — Tutorials
  { phrase: 'record coding tutorial', category: 'direct', priority: 1 },
  { phrase: 'record screen tutorial', category: 'direct', priority: 1 },
  { phrase: 'how to record dev tutorials', category: 'direct', priority: 1 },

  // Casos de uso — Marketing
  { phrase: 'saas product video', category: 'direct', priority: 2 },
  { phrase: 'app demo video', category: 'direct', priority: 2 },

  // Casos de uso — Social media
  { phrase: 'screen recording for tiktok', category: 'direct', priority: 2 },
  { phrase: 'screen recording for youtube', category: 'direct', priority: 2 },
  { phrase: 'screen recording for twitter', category: 'direct', priority: 2 },

  // ===== COMPETIDORES — Comparaciones (gold mine) =====
  { phrase: 'loom alternative', category: 'competitor', priority: 1 },
  { phrase: 'loom vs', category: 'competitor', priority: 1 },
  { phrase: 'screen studio vs', category: 'competitor', priority: 1 },
  { phrase: 'screen studio alternative', category: 'competitor', priority: 1 },
  { phrase: 'descript vs', category: 'competitor', priority: 1 },
  { phrase: 'best loom alternative', category: 'competitor', priority: 1 },
  { phrase: 'tools like loom', category: 'competitor', priority: 1 },
  { phrase: 'tools like screen studio', category: 'competitor', priority: 1 },
  { phrase: 'loom free alternative', category: 'competitor', priority: 1 },
  { phrase: 'better than loom', category: 'competitor', priority: 1 },
  { phrase: 'screencastify alternative', category: 'competitor', priority: 2 },
  { phrase: 'vidyard alternative', category: 'competitor', priority: 2 },
  { phrase: 'screenpal alternative', category: 'competitor', priority: 2 },
  { phrase: 'obs alternative simple', category: 'competitor', priority: 2 },
  { phrase: 'loom pricing', category: 'competitor', priority: 2 },
  { phrase: 'loom expensive', category: 'competitor', priority: 1 },

  // ===== WORKFLOWS ROTOS (pitch perfecto para BuzzScreen) =====
  { phrase: 'record screen and edit video', category: 'pain_point', priority: 1 },
  { phrase: 'record and edit demo video', category: 'pain_point', priority: 1 },
  { phrase: 'tool for recording and editing demos', category: 'pain_point', priority: 1 },
  { phrase: 'record screen and zoom on clicks', category: 'pain_point', priority: 1 },
  { phrase: 'zooming manually', category: 'pain_point', priority: 2 },
  { phrase: 'editing demo videos', category: 'pain_point', priority: 2 },
  { phrase: 'highlight clicks', category: 'pain_point', priority: 2 },
  { phrase: 'screen recording editing', category: 'pain_point', priority: 1 },

  // ===== PREGUNTAS de intención fuerte =====
  { phrase: 'how do you create demo videos', category: 'question', priority: 1 },
  { phrase: 'how do you show your product on twitter', category: 'question', priority: 1 },
  { phrase: 'how do you record product demos', category: 'question', priority: 1 },
  { phrase: 'recommend screen recorder', category: 'question', priority: 1 },
  { phrase: 'what do you use to record', category: 'question', priority: 1 },
  { phrase: 'best tool for screen recording', category: 'question', priority: 1 },
  { phrase: 'screen recording recommendation', category: 'question', priority: 1 },

  // ===== BÚSQUEDA DIRECTA =====
  { phrase: 'screen recorder', category: 'direct', priority: 2 },
  { phrase: 'screen recording', category: 'direct', priority: 2 },
  { phrase: 'screen recording app', category: 'direct', priority: 2 },
  { phrase: 'screen capture tool', category: 'direct', priority: 2 },
  { phrase: 'screen recording software', category: 'direct', priority: 2 },
  { phrase: 'best screen recorder', category: 'direct', priority: 2 },
  { phrase: 'record my screen', category: 'direct', priority: 3 },
  { phrase: 'record demo video', category: 'direct', priority: 2 },
];

module.exports = defaultKeywords;
