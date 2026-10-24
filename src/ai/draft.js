import { config } from '../config.js';
import { askJson, ping } from './ollama.js';
import { validateDraft, TH, ZH } from './validate.js';
import { savedDraft } from '../data/savedDraft.js';
import { allAmenities, customTerms } from '../data/options.js';
import { demoHomestay } from '../data/demoHomestay.js';

function fallback(i) {
  if (i.name === demoHomestay.name) return { ...savedDraft };
  const n = i.rooms.reduce((s, r) => s + (+r.count || 0), 0), p = (i.rooms[0] || {}).price;
  const types = i.rooms.map(r => `${r.name} ${r.count} ห้อง`).join(' ');
  const am = allAmenities(i).join(' ');
  return {
    title_th: i.name, title_en: i.name, title_zh: i.name,
    desc_th: `${i.name} ตั้งอยู่ที่ ${i.location} มีห้องพัก ${n} ห้อง (${types}) สิ่งอำนวยความสะดวก: ${am} ${i.features} ราคาเริ่มต้น ${p} บาทต่อคืน`,
    desc_en: `${i.name} is in ${i.location} with ${n} rooms. From ${p} THB per night.`,
    desc_zh: `${i.name}位于${i.location}，共${n}间客房，每晚${p}泰铢起。`,
  };
}

// Optional extras for the EN / 中文 preview pages: the place name and the owner-typed terms.
// A bad or missing answer is simply dropped (the preview then shows the original text).
const okLang = (s, lang) => typeof s === 'string' && s.trim() && !TH.test(s) && (lang === 'zh' ? ZH.test(s) : !ZH.test(s));
function extras(th, zh, terms) {
  const out = {};
  if (okLang(th.location_en, 'en')) out.location_en = th.location_en.trim();
  if (okLang(zh.location_zh, 'zh')) out.location_zh = zh.location_zh.trim();
  for (const [lang, arr] of [['en', th.terms_en], ['zh', zh.terms_zh]]) {
    if (!Array.isArray(arr) || arr.length !== terms.length) continue;
    const m = {};
    terms.forEach((t, k) => { if (okLang(arr[k], lang)) m[t] = arr[k].trim(); });
    if (Object.keys(m).length) out['tr_' + lang] = m;
  }
  return out;
}

// Returns { draft, source }. Always resolves: any failure falls back to the saved answer.
export async function generateDraft(intake, mode, signal) {
  if (mode === 'live' && await ping()) {
    try {
      // Photos are data URLs (huge): the model only needs to know how many there are.
      const { photos, ...rest } = intake, terms = customTerms(intake);
      const info = JSON.stringify({ ...rest, photoCount: (photos || []).length });
      const th = await askJson(config.textModel, `เขียนประกาศโฮมสเตย์จากข้อมูลนี้ ห้ามโอ้อวดสูงสุด ตอบ JSON {title_th,title_en,desc_th,desc_en,location_en,terms_en} โดย location_en คือที่ตั้งเป็นภาษาอังกฤษ และ terms_en คืออาร์เรย์คำแปลภาษาอังกฤษของรายการนี้ตามลำดับเดิม ${JSON.stringify(terms)}: ${info}`, undefined, signal);
      const zh = await askJson(config.visionModel, `Translate to Simplified Chinese. JSON {title_zh,desc_zh,location_zh,terms_zh} where terms_zh is an array in the same order as terms: ${JSON.stringify({ title: th.title_en, description: th.desc_en, location: th.location_en, terms: th.terms_en || [] })}`, undefined, signal);
      const draft = { title_th: th.title_th, title_en: th.title_en, desc_th: th.desc_th, desc_en: th.desc_en, title_zh: zh.title_zh, desc_zh: zh.desc_zh };
      if (validateDraft(draft).ok) return { draft: { ...draft, ...extras(th, zh, terms) }, source: 'Live AI' };
    } catch { /* aborted or failed: use saved answer */ }
  }
  return { draft: fallback(intake), source: 'Saved (cached)' };
}
