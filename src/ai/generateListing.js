// The listing pipeline (Typhoon + Qwen-VL translate) with saved-answer fallback behind every pass.
import { CONFIG } from '../config.js';
import { getState } from '../state.js';
import { chat, ping, AIError } from './ollama.js';
import { DRAFT_TH_EN_SCHEMA, ZH_SCHEMA } from './schemas.js';
import { listingSystem, listingUser, translateSystem, translateUser } from './prompts.js';
import { validateDraft, validateZh } from './validate.js';
import { suggestPrice } from '../rules/suggestPrice.js';
import { runChecks } from '../rules/runChecks.js';
import { buildCopyCards } from '../rules/buildCopyCards.js';
import { savedDraft as demoSaved } from '../data/savedDraft.js';
import { demoHomestay } from '../data/demoHomestay.js';
import { templateDraft } from './templateDraft.js';
import { enLabel, thLabel } from '../data/options.js';

let activeCtrls = [];
let savedDraft = demoSaved; // the fallback for THIS run (demo curated text, or built from the owner's intake)
const isDemo = (intake) => intake?.place?.name === demoHomestay.place.name;
function pickFallback(intake) { savedDraft = isDemo(intake) ? demoSaved : templateDraft(intake); }
let forceSaved = false;
const register = (ctrl) => activeCtrls.push(ctrl);
export function useSavedNow() { forceSaved = true; activeCtrls.forEach(c => { try { c.abort(); } catch {} }); }

function compactInput(intake) {
  const band = suggestPrice(intake);
  return {
    place: intake.place,
    rooms: (intake.rooms || []).map(r => ({
      type_en: enLabel('room', r.type), type_th: thLabel('room', r.type),
      name: r.name, count: r.count, maxGuests: r.maxGuests, price: r.price,
      bathroom: r.bathroom, aircon: r.aircon,
      beds: (r.beds || []).map(b => `${b.qty} ${enLabel('bed', b.type)}`),
    })),
    facilities_en: (intake.answers.facilities || []).map(id => enLabel('fac', id)),
    nearby_en: (intake.answers.nearby || []).map(id => enLabel('nearby', id)).concat(intake.answers.nearbyOther ? [intake.answers.nearbyOther] : []),
    meal: intake.answers.meal,
    rules: { checkin: intake.answers.checkin, checkout: intake.answers.checkout, smoking: intake.answers.smoking, pets: intake.answers.pets },
    owner_note: intake.answers.note || '',
    photo_slots: (intake.photos || []).map(p => p.slot),
    priceBand: band,
  };
}

function fillBad(draft, bad) {
  for (const f of bad) {
    if (f === 'highlights') draft.highlights = JSON.parse(JSON.stringify(savedDraft.highlights));
    else draft[f] = savedDraft[f];
  }
}

function savedResult(intake, sourceLabel = 'saved') {
  const draft = JSON.parse(JSON.stringify(savedDraft));
  const band = suggestPrice(intake);
  draft.price = { ...band, reason_th: savedDraft.price.reason_th };
  draft._source = sourceLabel;
  draft.flags = runChecks(draft, intake);
  delete draft.revisions;
  return { draft, draftMeta: { source: sourceLabel, model: 'cached', ms: 0 }, copyCards: buildCopyCards(draft, intake) };
}

export async function generateListing(intake, onProgress = () => {}, opts = {}) {
  activeCtrls = []; forceSaved = false;
  pickFallback(intake);
  const settings = getState().settings;
  onProgress(1);

  // saved mode or Ollama unreachable → honest fake progress, then saved
  if (settings.aiMode === 'saved') {
    await fakeProgress(onProgress);
    return savedResult(intake, 'saved');
  }
  const status = await ping();
  if (!status.ok || !status.hasText) {
    await fakeProgress(onProgress);
    return savedResult(intake, 'saved');
  }

  const input = compactInput(intake);
  let usedSaved = false;
  let draft = {};
  let model = CONFIG.ollama.textModel;
  let totalMs = 0;

  // Pass 1 — Typhoon (Thai + English)
  onProgress(2);
  try {
    const { json, ms } = await chat({
      model: CONFIG.ollama.textModel,
      messages: [{ role: 'system', content: listingSystem }, { role: 'user', content: listingUser(input) }],
      format: DRAFT_TH_EN_SCHEMA,
      options: { temperature: 0.4, num_predict: 1500 },
      timeout: CONFIG.ollama.timeouts.listing,
      onToken: opts.onToken,
      register,
    });
    totalMs += ms;
    draft = {
      title_th: json.title_th, title_en: json.title_en,
      desc_th: json.desc_th, desc_en: json.desc_en,
      highlights: (json.highlights || []).map(h => ({ th: h.th, en: h.en, zh: '' })),
      _priceReason: json.price_reason_th,
    };
    const v = validateDraft(draft);
    if (!v.ok) { usedSaved = true; fillBad(draft, v.bad); }
  } catch (e) {
    usedSaved = true;
    draft = { title_th: savedDraft.title_th, title_en: savedDraft.title_en, desc_th: savedDraft.desc_th, desc_en: savedDraft.desc_en, highlights: savedDraft.highlights.map(h => ({ ...h })), _priceReason: savedDraft.price.reason_th };
  }

  if (forceSaved) return savedResult(intake, 'saved');

  // Pass 2 — Qwen-VL text (Chinese)
  onProgress(3);
  try {
    const { json, ms } = await chat({
      model: CONFIG.ollama.visionModel,
      messages: [{ role: 'system', content: translateSystem }, { role: 'user', content: translateUser(draft) }],
      format: ZH_SCHEMA,
      options: { temperature: 0.2, num_predict: 1200 },
      timeout: CONFIG.ollama.timeouts.translate,
      register,
    });
    totalMs += ms;
    draft.title_zh = json.title_zh; draft.desc_zh = json.desc_zh;
    (json.highlights_zh || []).forEach((z, idx) => { if (draft.highlights[idx]) draft.highlights[idx].zh = z; });
    const vz = validateZh(draft);
    if (!vz.ok) { usedSaved = true; draft.title_zh = savedDraft.title_zh; draft.desc_zh = savedDraft.desc_zh; draft.highlights.forEach((h, i) => h.zh = savedDraft.highlights[i]?.zh || h.zh); }
  } catch (e) {
    usedSaved = true;
    draft.title_zh = savedDraft.title_zh; draft.desc_zh = savedDraft.desc_zh;
    draft.highlights.forEach((h, i) => { if (!h.zh) h.zh = savedDraft.highlights[i]?.zh || ''; });
  }

  // Pass 3 — merge, price, checks, cards
  onProgress(4);
  const band = suggestPrice(intake);
  draft.price = { ...band, reason_th: draft._priceReason || savedDraft.price.reason_th };
  delete draft._priceReason;
  const source = usedSaved ? 'mixed' : 'live';
  draft._source = source;
  draft.flags = runChecks(draft, intake);

  onProgress(5);
  const copyCards = buildCopyCards(draft, intake);
  return { draft, draftMeta: { source, model, ms: totalMs }, copyCards };
}

function fakeProgress(onProgress) {
  const steps = [2, 3, 4, 5];
  const per = CONFIG.savedProgressMs / steps.length;
  return steps.reduce((p, step) => p.then(() => new Promise(r => setTimeout(() => { onProgress(step); r(); }, per))), Promise.resolve());
}
