import { config } from '../config.js';
import { askJson, ping } from './ollama.js';
import { getPlatform } from '../data/platforms.js';

// Explains a platform's sign-up screenshot in Thai and says which card to copy.
// Plan B (no AI): match the file name to a screen id, else use the current step.
export async function coachScreenshot({ base64, fileName }, cards, step, mode = 'saved', platform = 'agoda') {
  const p = getPlatform(platform), screens = p.screens;
  const ids = screens.map(s => s.screen);
  let id = ids.find(x => (fileName || '').toLowerCase().includes(x)) || ids[Math.min(Math.max(step - 1, 0), ids.length - 1)];
  let explain = null, source = 'Saved (cached)';
  if (mode === 'live' && base64 && await ping()) {
    try {
      const r = await askJson(config.visionModel,
        `This is a ${p.name} sign-up page. Which one is it: ${ids.join(', ')}? Explain in Thai in 2 short sentences what to fill. JSON {screen_id, explain_th}`, [base64]);
      if (ids.includes(r.screen_id)) { id = r.screen_id; explain = r.explain_th; source = 'Live AI'; }
    } catch { /* keep Plan B */ }
  }
  const s = screens.find(x => x.screen === id);
  const card = cards.find(c => c.screen === id && !c.hintOnly);
  return { screen_id: id, explain_th: explain || `หน้านี้คือ "${s.title}" คัดลอกข้อมูลจากการ์ดด้านล่างไปวางได้เลย`, highlight: card ? card.label : '', source };
}
