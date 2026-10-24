// Pre-submit checks. Owner: B (AI and logic)
// Some limits are OUR guidelines, not Agoda's official rules. Verify against Agoda before the pitch.
import { LANGS } from '../data/shapes.js';

const CONTACT = /(\+?\d[\d\s-]{8,}\d)|line\s*id|ไลน์\s*ไอดี|@[a-z0-9_.]{3,}|https?:\/\/|www\./i;
const SUPERLATIVE = /ที่สุด|อันดับ\s*1|\bbest\b|no\.?\s?1\b|#1\b|最好|第一/i;
const CJK = /[一-鿿]/;

/** @returns {{id:string, level:'ok'|'warn'|'error', label:string, detail?:string}[]} */
export function runChecks(state) {
  const out = [];
  const L = state.listing;
  const a = state.answers || {};
  const add = (id, level, label, detail) => out.push({ id, level, label, detail });

  if (!L) {
    add('listing', 'error', 'ยังไม่มีร่างประกาศ');
    return out;
  }

  for (const lang of LANGS) {
    if (!L[lang]?.title?.trim() || !L[lang]?.description?.trim()) add(`lang-${lang}`, 'error', `ประกาศภาษา ${lang.toUpperCase()} ยังว่าง`);
  }
  if (LANGS.every((l) => L[l]?.description?.trim())) add('langs', 'ok', 'มีประกาศครบ 3 ภาษา');

  if (L.zh?.description && !CJK.test(L.zh.description)) add('zh-chars', 'error', 'ข้อความภาษาจีนไม่มีตัวอักษรจีน');

  for (const lang of ['th', 'en']) {
    const t = L[lang]?.title || '';
    if (t.length > 60) add(`title-${lang}`, 'warn', `ชื่อประกาศ ${lang.toUpperCase()} ยาว ${t.length} ตัวอักษร`, 'แนวทางของเรา: ไม่เกิน 60');
    const d = L[lang]?.description || '';
    if (d && d.length < 200) add(`len-${lang}`, 'warn', `คำอธิบาย ${lang.toUpperCase()} สั้นไป (${d.length} ตัวอักษร)`, 'ควรมีอย่างน้อย 200');
  }

  for (const lang of LANGS) {
    const text = `${L[lang]?.title || ''} ${L[lang]?.summary || ''} ${L[lang]?.description || ''}`;
    if (CONTACT.test(text)) add(`contact-${lang}`, 'error', `พบช่องทางติดต่อในข้อความ ${lang.toUpperCase()}`, 'แพลตฟอร์มจองห้องมักไม่ให้ใส่เบอร์โทร ไลน์ หรือลิงก์');
    if (SUPERLATIVE.test(text)) add(`super-${lang}`, 'warn', `มีคำเกินจริงในข้อความ ${lang.toUpperCase()}`, 'เช่น ที่สุด / best / No.1');
  }

  for (const lang of ['en', 'zh']) {
    if (L[lang]?.storyUntranslated) add(`story-${lang}`, 'warn', `เรื่องเล่าของเจ้าของยังไม่ถูกแปลเป็น ${lang.toUpperCase()}`, 'ข้อความมาจากเทมเพลต ตรวจและเติมก่อนส่ง');
  }

  if (!(a.price > 0)) add('price', 'error', 'ยังไม่มีราคา');
  if (!(a.rooms > 0)) add('rooms', 'error', 'ยังไม่มีจำนวนห้อง');
  if ((a.photoCount || 0) < 5) add('photos', 'warn', `มีรูปแค่ ${a.photoCount || 0} รูป`, 'ควรมีอย่างน้อย 5 รูป');
  else add('photos-ok', 'ok', `มีรูป ${a.photoCount} รูป`);

  const sources = Object.values(L.meta?.source || {});
  if (sources.some((s) => s.kind === 'template')) add('template', 'warn', 'บางภาษามาจากเทมเพลต ไม่ใช่ AI', 'เปิด Ollama แล้วกดสร้างใหม่ เพื่อให้ข้อความเป็นธรรมชาติขึ้น');

  if (!out.some((c) => c.level === 'error')) add('summary', 'ok', 'ไม่พบข้อผิดพลาดร้ายแรง');
  return out;
}
