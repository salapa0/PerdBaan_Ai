// Rule checks on the draft + intake. Returns flags[] (errors first, then warnings).
const hasThai = (s) => /[฀-๿]/.test(s || '');
const banned = /(ดีที่สุด|ดีที่สุดในโลก|อันดับ\s?1|อันดับหนึ่ง|ที่สุดในประเทศ|No\.?\s?1|number\s?one|\bbest\b)/i;
const urlRe = /(https?:\/\/|www\.|\.com|\.co\.th)/i;
const lineRe = /(line\s*id|@[\w.]{3,})/i;
const phoneInText = /0\d[\d\s-]{7,}/;

function cleanPhone(p) { return String(p || '').replace(/[\s-]/g, ''); }
function validThaiPhone(p) {
  const c = cleanPhone(p);
  return /^0[689]\d{8}$/.test(c) || /^0[2-7]\d{7}$/.test(c);
}
function textFields(d) {
  return [d.title_th, d.desc_th, d.title_en, d.desc_en, ...((d.highlights || []).flatMap(h => [h.th, h.en]))].filter(Boolean);
}

const RULES = [
  { id: 'E1', level: 'error', field: 'rooms',
    test: (d, i) => (i.rooms || []).find(r => !r.price || r.price <= 0),
    msg: (hit) => `ห้อง ${hit.name || hit.type} ยังไม่มีราคา` },
  { id: 'E2', level: 'error', field: 'rooms',
    test: (d, i) => (i.rooms || []).find(r => !r.maxGuests || r.maxGuests <= 0),
    msg: (hit) => `ห้อง ${hit.name || hit.type} ยังไม่ระบุจำนวนคนสูงสุด` },
  { id: 'E3', level: 'error', field: 'title_th',
    test: (d) => (!d.title_th || !d.desc_th) ? true : null,
    msg: () => 'ยังไม่มีชื่อหรือคำอธิบายภาษาไทย' },
  { id: 'E4', level: 'error', field: 'desc_th',
    test: (d) => textFields(d).some(t => banned.test(t)) ? true : null,
    msg: () => 'มีคำโฆษณาเกินจริง เช่น "ดีที่สุด" หรือ "อันดับ 1"' },
  { id: 'E5', level: 'error', field: 'phone',
    test: (d, i) => !validThaiPhone(i.contact?.phone) ? true : null,
    msg: () => 'เบอร์โทรไม่ถูกต้อง' },

  { id: 'W1', level: 'warning', field: 'photos',
    test: (d, i) => ((i.photos || []).length < 5) ? true : null,
    msg: () => 'มีรูปน้อยกว่า 5 รูป' },
  { id: 'W2', level: 'warning', field: 'photos',
    test: (d, i) => { const slots = (i.photos || []).map(p => p.slot); return (!slots.includes('front') || !slots.includes('bedroom')) ? true : null; },
    msg: () => 'ยังไม่มีรูปด้านหน้าบ้านหรือห้องนอน' },
  { id: 'W3', level: 'warning', field: 'title_th',
    test: (d) => ((d.title_th || '').length > 60 || (d.title_en || '').length > 70) ? true : null,
    msg: () => 'ชื่อยาวเกินไป' },
  { id: 'W4', level: 'warning', field: 'desc_th',
    test: (d) => { const th = (d.desc_th || '').length, en = (d.desc_en || '').length; return (th < 300 || th > 700 || en < 400 || en > 900) ? true : null; },
    msg: () => 'คำอธิบายสั้นหรือยาวเกินไป' },
  { id: 'W5', level: 'warning', field: 'email',
    test: (d, i) => !(i.contact?.email) ? true : null,
    msg: () => 'ยังไม่มีอีเมล ต้องใช้ตอนสมัคร Agoda' },
  { id: 'W6', level: 'warning', field: 'licence',
    test: (d, i) => !(i.contact?.licence) ? true : null,
    msg: () => 'ยังไม่มีเลขทะเบียนโฮมสเตย์' },
  { id: 'W7', level: 'warning', field: 'rooms',
    test: (d, i) => { const rooms = (i.rooms || []).reduce((s, r) => s + (r.count || 0), 0); const guests = (i.rooms || []).reduce((s, r) => s + (r.maxGuests || 0) * (r.count || 0), 0); return (rooms > 8 || guests > 30) ? true : null; },
    msg: () => 'เกินเกณฑ์โฮมสเตย์ อาจต้องมีใบอนุญาตโรงแรม' },
  { id: 'W8', level: 'warning', field: 'desc_th',
    test: (d) => { const t = (d.desc_th || '') + ' ' + (d.desc_en || ''); return (phoneInText.test(t) || lineRe.test(t) || urlRe.test(t)) ? true : null; },
    msg: () => 'ไม่ควรใส่เบอร์โทรหรือลิงก์ในคำอธิบาย' },
  { id: 'W9', level: 'warning', field: 'source',
    test: (d) => (d._source === 'mixed') ? true : null,
    msg: () => 'บางส่วนใช้ข้อความที่บันทึกไว้' },
];

export function runChecks(draft, intake) {
  const flags = [];
  for (const rule of RULES) {
    let hit;
    try { hit = rule.test(draft, intake); } catch { hit = null; }
    if (hit) {
      flags.push({ id: rule.id, level: rule.level, field: rule.field, message_th: rule.msg(hit) });
    }
  }
  // errors first, then warnings
  return flags.sort((a, b) => (a.level === b.level ? 0 : a.level === 'error' ? -1 : 1));
}
