<<<<<<< HEAD
// Screenshot coach: Plan A local vision model, Plan B filename match, then the screen picker.
import { CONFIG } from '../config.js';
import { getState } from '../state.js';
import { chat, ping } from './ollama.js';
import { SCREEN_SCHEMA } from './schemas.js';
import { screenPrompt } from './prompts.js';
import { coachScreens, coachScreenList } from '../data/coachScreens.js';

function cardsFor(screenId, copyCards) {
  return (copyCards || []).filter(c => c.screen === screenId).map(c => c.id);
}

function result(screenId, source, ms, copyCards) {
  const sc = coachScreens[screenId];
  if (!sc) return { screen_id: 'unknown', explanation_th: null, card_ids: [], next_step_th: '', source, ms };
  return {
    screen_id: screenId,
    explanation_th: sc.explanation_th,
    next_step_th: sc.next_step_th,
    card_ids: cardsFor(screenId, copyCards),
    advancesStep: !!sc.advancesStep,
    source, ms,
  };
}

function planB(fileName, copyCards) {
  const m = /agoda-(\d{2})/.exec(fileName || '');
  if (m) {
    const id = 'agoda-' + m[1];
    if (coachScreens[id]) return result(id, 'filename', 0, copyCards);
  }
  return { screen_id: 'unknown', explanation_th: null, card_ids: [], next_step_th: '', source: 'none', ms: 0 };
}

// args: { base64, fileName }, copyCards, step
export async function coachScreenshot({ base64, fileName }, copyCards, step) {
  const settings = getState().settings;

  // saved mode or no vision model → Plan B only
  if (settings.aiMode === 'saved' || !base64) return planB(fileName, copyCards);
  const status = await ping();
  if (!status.ok || !status.hasVision) return planB(fileName, copyCards);

  // Plan A — vision
  try {
    const { json, ms } = await chat({
      model: CONFIG.ollama.visionModel,
      messages: [{ role: 'user', content: screenPrompt(coachScreenList), images: [base64] }],
      format: SCREEN_SCHEMA,
      options: { temperature: 0 },
      timeout: CONFIG.ollama.timeouts.coach,
    });
    const id = json.screen_id;
    const conf = Number(json.confidence || 0);
    if (id && id !== 'unknown' && coachScreens[id] && conf >= 0.5) {
      return result(id, 'vision', ms, copyCards);
    }
  } catch { /* fall through to Plan B */ }

  return planB(fileName, copyCards);
=======
// Screenshot coach logic: Qwen-VL via Ollama, saved answers as fallback. Owner: B (AI and logic)
import { getConfig } from './config.js';
import { ping, generate, blobToBase64 } from './ollama.js';
import { coachPrompt } from './prompts.js';

/**
 * @param {{step:Object, listing:Object|null, question?:string, image?:Blob}} p
 * @returns {Promise<{text:string, src:'ai'|'saved'}>}
 */
export async function askCoach({ step, listing, question = '', image = null }) {
  const status = await ping();
  if (status.ok) {
    try {
      const images = image ? [await blobToBase64(image)] : undefined;
      const text = await generate({
        model: getConfig().models.vision,
        prompt: coachPrompt(step, listing, question, !!image),
        images,
      });
      return { text: text.trim(), src: 'ai' };
    } catch (e) {
      console.warn('[coach] AI failed, using saved answer', e);
    }
  }
  return { text: image ? step.coach.withImage : step.coach.noImage, src: 'saved' };
>>>>>>> parent of 1b829a5 (ver1 of 1)
}
