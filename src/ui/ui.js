// DOM helpers, shared components, and all Thai UI strings in one place (TEXT).
import { doAction } from '../router.js';

// h('div', {class:'x', on:{click:fn}}, child, child...)
export function h(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'on') { for (const [ev, fn] of Object.entries(v)) node.addEventListener(ev, fn); }
    else if (k === 'class') node.className = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k === 'dataset') { for (const [dk, dv] of Object.entries(v)) node.dataset[dk] = dv; }
    else if (k in node && k !== 'list') { try { node[k] = v; } catch { node.setAttribute(k, v); } }
    else node.setAttribute(k, v);
  }
  for (const c of children.flat()) {
    if (c == null || c === false) continue;
    node.append(c.nodeType ? c : document.createTextNode(String(c)));
  }
  return node;
}

export function clear(node) { while (node && node.firstChild) node.removeChild(node.firstChild); return node; }

export function fmtTime(ts = Date.now()) {
  const d = new Date(ts);
  return d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
}

export function money(n) {
  return '฿' + Number(n || 0).toLocaleString('en-US');
}

// ---------- components ----------
export function button(label, action, variant = 'primary', payload = null, extra = {}) {
  return h('button', {
    class: `btn ${variant}` + (extra.block ? ' block' : '') + (extra.sm ? ' sm' : ''),
    disabled: extra.disabled,
    on: { click: () => { if (extra.onClick) extra.onClick(); else doAction(action, payload); } },
  }, label);
}

export function badge(status) {
  const map = {
    not_connected: ['grey', TEXT.badge.not_connected],
    connecting:    ['amber', TEXT.badge.connecting],
    waiting_check: ['blue', TEXT.badge.waiting],
    live:          ['green', TEXT.badge.live],
    needs_attention: ['red', TEXT.badge.needs],
  };
  const [cls, label] = map[status] || ['grey', status];
  return h('span', { class: `badge ${cls}` }, label);
}

export function chip(label, selected, onToggle) {
  return h('span', { class: 'chip' + (selected ? ' on' : ''), on: { click: () => onToggle && onToggle(!selected) } }, label);
}

export function stepper(value, min, max, onChange) {
  let v = value;
  const valEl = h('span', { class: 'val' }, String(v));
  const set = (nv) => { v = Math.max(min, Math.min(max, nv)); valEl.textContent = String(v); onChange && onChange(v); };
  return h('span', { class: 'stepper' },
    h('button', { type: 'button', on: { click: () => set(v - 1) } }, '−'),
    valEl,
    h('button', { type: 'button', on: { click: () => set(v + 1) } }, '+'),
  );
}

let toastTimer = null;
export function toast(text, ms = 1600) {
  const root = document.getElementById('toast-root');
  if (!root) return;
  const t = h('div', { class: 'toast' }, text);
  root.appendChild(t);
  setTimeout(() => t.remove(), ms);
}

// ---------- SVG icons (vector: stay sharp at any zoom / display scaling) ----------
const SVGNS = 'http://www.w3.org/2000/svg';
const ICON_PATHS = {
  back: '<path d="M15 18l-6-6 6-6"/>',
  chevronRight: '<path d="M9 18l6-6-6-6"/>',
  close: '<path d="M18 6L6 18M6 6l12 12"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  keyboard: '<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M21 16l-5-5-9 9"/>',
  smile: '<circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
  check: '<path d="M5 12l5 5L20 7"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  bed: '<path d="M3 18V7M3 13h18v5M21 18v-5a3 3 0 0 0-3-3h-8v3"/><circle cx="7" cy="10.5" r="1.5"/>',
  shower: '<path d="M4 20V8a4 4 0 0 1 8 0M10 8h4M9 13v.01M12 14v.01M15 15v.01M10 17v.01M13 18v.01"/>',
  mountain: '<path d="M3 20l6-10 4 6 3-4 5 8z"/>',
  food: '<path d="M3 11h18a9 9 0 0 1-18 0zM8 7c0-2 2-2 2-4M13 7c0-2 2-2 2-4"/>',
  bike: '<circle cx="6" cy="17" r="3.5"/><circle cx="18" cy="17" r="3.5"/><path d="M6 17l4-7h5l3 7M10 10L8.5 6H7M14.5 10l1.5-3h2"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  photoPlus: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M12 9v6M9 12h6"/>',
  arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  idCard: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M6 16c.5-1.5 1.7-2 3-2s2.5.5 3 2M14 10h4M14 13h3"/>',
  book: '<path d="M4 5h11a3 3 0 0 1 3 3v12H7a3 3 0 0 1-3-3zM4 17a3 3 0 0 1 3-3h11"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  share: '<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4"/>',
  external: '<path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
};

export function icon(name, size = 20, extraClass = '') {
  const svg = document.createElementNS(SVGNS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', size); svg.setAttribute('height', size);
  svg.setAttribute('fill', 'none'); svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2'); svg.setAttribute('stroke-linecap', 'round'); svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('class', 'ic ' + extraClass);
  svg.innerHTML = ICON_PATHS[name] || '';
  return svg;
}

// Brand mark: green tile with a white house (used as the LINE official-account avatar)
export function logo(size = 36) {
  const wrap = document.createElement('span');
  wrap.className = 'logo';
  wrap.style.width = wrap.style.height = size + 'px';
  wrap.innerHTML = `<svg viewBox="0 0 40 40" width="${size}" height="${size}" aria-hidden="true"><rect width="40" height="40" rx="12" fill="#06C755"/><path d="M10 19.5 20 11l10 8.5V29a1.5 1.5 0 0 1-1.5 1.5H23v-6.5h-6v6.5h-5.5A1.5 1.5 0 0 1 10 29z" fill="#fff"/><circle cx="27.5" cy="13" r="3" fill="#FFD43B"/></svg>`;
  return wrap;
}

// ---------- all Thai UI strings ----------
export const TEXT = {
  badge: {
    not_connected: 'ยังไม่เชื่อมต่อ', connecting: 'กำลังเชื่อมต่อ',
    waiting: 'รอ Agoda ตรวจสอบ', live: 'ออนไลน์แล้ว', needs: 'ต้องแก้ไข',
  },
  dock: { post: 'ลงประกาศ', connect: 'การเชื่อมต่อ', edit: 'แก้ไขประกาศ', contact: 'ติดต่อทีมงาน', soon: 'เร็วๆ นี้', typePlaceholder: 'พิมพ์ข้อความ' },
  welcome1: 'สวัสดีค่ะ เราช่วยให้ที่พักของคุณขึ้นบน Agoda ได้ โดยไม่ต้องเก่งเทคโนโลยี',
  startCard: { title: 'เริ่มลงประกาศที่พัก', body: 'ใช้เวลาประมาณ 10 นาที เตรียมรูปที่พัก 5 รูปขึ้นไป', btn: 'เริ่มเลย' },
  afterSubmit: 'ทีมงานกำลังตรวจประกาศของคุณ จะส่งตัวอย่างให้ในไม่ช้า',
  previewReady: { title: 'ประกาศของคุณพร้อมแล้ว', body: 'ทีมงานตรวจเรียบร้อย กดดูตัวอย่างได้เลย', btn: 'ดูตัวอย่าง' },
  afterApprove: 'ขอบคุณค่ะ ขั้นต่อไปคือเชื่อมต่อกับ Agoda',
  goConnections: 'ไปที่หน้าการเชื่อมต่อ',
  waitingMsg: 'ส่งให้ Agoda ตรวจแล้ว ปกติใช้เวลาไม่เกิน 72 ชั่วโมง เราจะแจ้งทันทีเมื่อประกาศออนไลน์',
  liveFollow: 'เมื่อมีคนจอง Agoda จะแจ้งคุณในแอปสำหรับเจ้าของที่พัก ถ้าดูไม่เป็น ส่งภาพหน้าจอมาถามได้เลย',
  intake: {
    title: 'ลงประกาศที่พัก', next: 'ถัดไป', back: 'ย้อนกลับ', submit: 'ให้ AI เขียนประกาศ',
    s1: 'ที่พักและห้อง', s2: 'รูปภาพ', s3: 'คำถามสั้นๆ',
    placeName: 'ชื่อที่พัก', village: 'หมู่บ้าน / ตำบล', district: 'อำเภอ', province: 'จังหวัด',
    address: 'ที่อยู่', postcode: 'รหัสไปรษณีย์',
    roomType: 'ประเภทห้อง', roomName: 'ชื่อห้อง (ถ้ามี)', roomCount: 'จำนวนห้อง', beds: 'เตียง',
    maxGuests: 'รับได้สูงสุด (คน)', price: 'ราคาต่อคืน (บาท)', bathroom: 'ห้องน้ำ', inRoom: 'ในห้อง', shared: 'ใช้ร่วม', aircon: 'แอร์',
    addRoom: '+ เพิ่มประเภทห้อง',
    overHomestay: 'เกินเกณฑ์โฮมสเตย์ที่ไม่ต้องขอใบอนุญาตโรงแรม',
    photoNext: 'ถัดไปต้องมีอย่างน้อย 1 รูป', under5: 'Agoda แนะนำอย่างน้อย 5 รูป',
    brighten: 'ปรับให้สว่าง',
    facilities: 'สิ่งอำนวยความสะดวก', meal: 'อาหาร', nearby: 'ที่เที่ยวใกล้ๆ', nearbyOther: 'อื่นๆ',
    rules: 'กฎของบ้าน', checkin: 'เช็คอิน', checkout: 'เช็คเอาท์', smoking: 'สูบบุหรี่', pets: 'สัตว์เลี้ยง', quiet: 'เงียบหลัง',
    yes: 'ได้', no: 'ไม่ได้',
    tellMore: 'อยากเล่าอะไรเพิ่มไหม', contactName: 'ชื่อผู้ติดต่อ', phone: 'เบอร์โทร', email: 'อีเมล', lineId: 'LINE ID',
    licence: 'เลขทะเบียนโฮมสเตย์', pdpa: 'ยินยอมให้เก็บข้อมูลนี้เพื่อลงประกาศที่พัก',
  },
  gen: {
    steps: ['อ่านข้อมูลและรูปภาพ', 'เขียนชื่อและคำอธิบาย (ไทย / อังกฤษ)', 'แปลเป็นภาษาจีน', 'ตรวจความถูกต้อง', 'เตรียมการ์ดสำหรับคัดลอกไป Agoda'],
    writing: (n) => `AI เขียนแล้ว ${n} ตัวอักษร`, useSaved: 'ใช้ฉบับที่บันทึกไว้',
  },
  preview: {
    note: 'ตัวอย่างประกาศบน Agoda (ภาพจำลอง)', why: 'ทำไมราคานี้', recommend: 'ราคาแนะนำ',
    approve: 'อนุมัติ', requestChange: 'ขอแก้ไข', perNight: '/ คืน',
    rooms: 'ห้องพัก', facilities: 'สิ่งอำนวยความสะดวก', rules: 'กฎของบ้าน',
    reqTitle: 'ขอแก้ไขส่วนไหน', reqSend: 'ส่งคำขอแก้ไข', maxRounds: 'ติดต่อทีมงาน',
  },
  conn: {
    title: 'การเชื่อมต่อ', sub: 'เชื่อมต่อเพื่อให้นักท่องเที่ยวจองที่พักของคุณได้',
    agodaWhy: 'แอปจองที่พักที่คนไทยใช้มาก รับจองและโอนเงินให้คุณเอง', agodaTime: 'ใช้เวลาประมาณ 20-30 นาที',
    docs: 'เอกสารที่ต้องใช้: บัตรประชาชน, หน้าสมุดบัญชี, เบอร์โทร, อีเมล',
    add: 'เพิ่มการเชื่อมต่อ', cont: 'ทำต่อ', waitBtn: 'รอไม่เกิน 72 ชม.', viewListing: 'ดูประกาศ', fix: 'แก้ไข', soon: 'เร็วๆ นี้',
  },
  coach: {
    title: 'เชื่อมต่อ Agoda', step: (x) => `ขั้น ${x} / 6`,
    readyTitle: 'ตรวจความพร้อม', readyBtn: 'พร้อมแล้ว ไปต่อ',
    openSignup: 'เปิดหน้าสมัคร Agoda', signupIntro: 'เราจะเปิดหน้าสมัครของ Agoda ให้ดูทีละขั้น คุณกรอกตามการ์ดที่เราเตรียมให้',
    banner: 'ภาพหน้าจอจำลองการสมัคร Agoda (เพื่อสาธิต ไม่ใช่เว็บจริง)',
    copyBtn: 'คัดลอก', copied: 'คัดลอกแล้ว', seeAll: 'ดูทั้งหมด', seeLess: 'ย่อ',
    askAi: 'ส่งภาพหน้าจอให้ AI ช่วย', pickFile: 'เลือกไฟล์จากเครื่อง', next: 'ขั้นต่อไป',
    cantRead: 'ยังอ่านหน้านี้ไม่ออก ลองส่งภาพที่เห็นทั้งหน้าจออีกครั้ง หรือเลือกหน้าจอจากรายการ',
    otpCard: 'ขั้นนี้คุณต้องทำเอง: ใส่รหัส OTP ที่ได้ทาง SMS และกดยอมรับเงื่อนไขของ Agoda เราจะไม่ถามรหัสหรือรหัสผ่านของคุณ',
    otpDone: 'ทำเสร็จแล้ว', pasteLabel: 'วางลิงก์ประกาศ Agoda ของคุณ', paste: 'วาง', checkLink: 'ตรวจลิงก์',
    readyDocs: { id: 'บัตรประชาชน', bank: 'หน้าสมุดบัญชี', phone: 'เบอร์โทร', email: 'อีเมล' },
  },
  live: { flag: 'ออนไลน์แล้วบน Agoda', view: 'ดูประกาศ', share: 'แชร์ให้เพื่อน', shared: 'คัดลอกลิงก์แล้ว' },
  clipboardFail: 'กดค้างเพื่อคัดลอก',
};
