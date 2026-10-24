// Listing generation: Ollama first, then saved answers (demo homestay), then templates.
// Owner: B (AI and logic)
import { LANGS } from '../data/shapes.js';
import { isDemo } from '../../content/demo-homestay.js';
import { SAVED_LISTING } from '../../content/fallback.js';
import { getConfig } from './config.js';
import { ping, generate } from './ollama.js';
import { listingPrompt } from './prompts.js';
import { templateListing } from './templates.js';

function parseJson(text) {
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) throw new Error('no json');
  return JSON.parse(m[0]);
}

function validate(o) {
  const ok = ['title', 'summary', 'description'].every((k) => typeof o[k] === 'string' && o[k].trim().length > 5);
  if (!ok) throw new Error('bad shape');
  return { title: o.title.trim(), summary: o.summary.trim(), description: o.description.trim() };
}

async function viaOllama(lang, a) {
  const cfg = getConfig();
  const model = lang === 'zh' ? cfg.models.zh : cfg.models.text;
  const raw = await generate({ model, prompt: listingPrompt(lang, a), json: true });
  return { ...validate(parseJson(raw)), model };
}

/**
 * @param {import('../data/shapes.js').Answers} answers
 * @param {(lang:string, phase:'start'|'done')=>void} onProgress
 * @returns {Promise<import('../data/shapes.js').Listing>}
 */
export async function generateListing(answers, onProgress = () => {}) {
  const status = await ping();
  const listing = { meta: { source: {}, at: Date.now(), aiUp: status.ok } };
  const template = (lang) => templateListing(lang, answers);

  for (const lang of LANGS) {
    onProgress(lang, 'start');
    let result = null;
    let source = null;

    if (status.ok) {
      try {
        const r = await viaOllama(lang, answers);
        const { model, ...rest } = r;
        // keep highlight labels from the template so the card list stays consistent
        result = { ...rest, highlights: template(lang).highlights, storyUntranslated: false };
        source = { kind: 'ai', model };
      } catch (e) {
        console.warn(`[listing:${lang}] AI failed, falling back`, e);
      }
    }
    if (!result && isDemo(answers)) {
      result = { ...SAVED_LISTING[lang] };
      source = { kind: 'saved' };
    }
    if (!result) {
      result = template(lang);
      source = { kind: 'template' };
    }
    listing[lang] = result;
    listing.meta.source[lang] = source;
    onProgress(lang, 'done');
  }
  return listing;
}
