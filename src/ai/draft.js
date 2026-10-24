import { config } from '../config.js';
import { askJson, ping } from './ollama.js';
import { validateDraft } from './validate.js';
import { savedDraft } from '../data/savedDraft.js';
import { demoHomestay } from '../data/demoHomestay.js';

function fallback(i) {
  if (i.name === demoHomestay.name) return { ...savedDraft };
  const n = i.rooms.reduce((s, r) => s + (+r.count || 0), 0), p = i.rooms[0].price;
  return {
    title_th: i.name, title_en: i.name, title_zh: i.name,
    desc_th: `${i.name} ตั้งอยู่ที่ ${i.location} มีห้องพัก ${n} ห้อง ${i.features} ราคาเริ่มต้น ${p} บาทต่อคืน`,
    desc_en: `${i.name} is in ${i.location} with ${n} rooms. From ${p} THB per night.`,
    desc_zh: `${i.name}位于${i.location}，共${n}间客房，每晚${p}泰铢起。`,
  };
}

// Returns { draft, source }. Always resolves: any failure falls back to the saved answer.
export async function generateDraft(intake, mode, signal) {
  if (mode === 'live' && await ping()) {
    try {
      const info = JSON.stringify(intake);
      const th = await askJson(config.textModel, `เขียนประกาศโฮมสเตย์จากข้อมูลนี้ ห้ามโอ้อวดสูงสุด ตอบ JSON {title_th,title_en,desc_th,desc_en}: ${info}`, undefined, signal);
      const zh = await askJson(config.visionModel, `Translate to Simplified Chinese. JSON {title_zh,desc_zh}: ${JSON.stringify({ t: th.title_en, d: th.desc_en })}`, undefined, signal);
      const draft = { ...th, ...zh };
      if (validateDraft(draft).ok) return { draft, source: 'Live AI' };
    } catch { /* aborted or failed: use saved answer */ }
  }
  return { draft: fallback(intake), source: 'Saved (cached)' };
}
