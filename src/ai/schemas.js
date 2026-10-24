// JSON schemas passed to Ollama's `format` so output is constrained.
export const DRAFT_TH_EN_SCHEMA = {
  type: 'object',
  properties: {
    title_th: { type: 'string' },
    title_en: { type: 'string' },
    desc_th: { type: 'string' },
    desc_en: { type: 'string' },
    highlights: {
      type: 'array',
      minItems: 3, maxItems: 5,
      items: { type: 'object', properties: { th: { type: 'string' }, en: { type: 'string' } }, required: ['th', 'en'] },
    },
    price_reason_th: { type: 'string' },
  },
  required: ['title_th', 'title_en', 'desc_th', 'desc_en', 'highlights', 'price_reason_th'],
};

export const ZH_SCHEMA = {
  type: 'object',
  properties: {
    title_zh: { type: 'string' },
    desc_zh: { type: 'string' },
    highlights_zh: { type: 'array', items: { type: 'string' } },
  },
  required: ['title_zh', 'desc_zh', 'highlights_zh'],
};

export const SCREEN_SCHEMA = {
  type: 'object',
  properties: { screen_id: { type: 'string' }, confidence: { type: 'number' } },
  required: ['screen_id', 'confidence'],
};

export const REWRITE_SCHEMA = {
  type: 'object',
  properties: { value: { type: 'string' } },
  required: ['value'],
};
