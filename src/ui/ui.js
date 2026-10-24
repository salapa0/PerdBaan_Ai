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

// small inline icons
export const ICONS = {
  copy: '📋', check: '✓', camera: '📷', link: '🔗', star: '★',
  wifi: '📶', parking: '🅿️', food: '🍽️', bath: '🛁', bed: '🛏️',
};

// ---------- all Thai UI strings (C proofreads here) ----------
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
