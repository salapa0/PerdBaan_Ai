// The owner's screens, styled like LINE: chat with a rich-menu grid, and LIFF mini-app pages.
import { state } from '../state.js';
import { esc } from '../ui/dom.js';
import { agodaScreens } from '../data/agodaFields.js';
import { buildCopyCards } from '../rules/buildCopyCards.js';
import { checkAgodaLink } from '../rules/checkAgodaLink.js';
import { ROOM_TYPES, AMENITIES, allAmenities } from '../data/options.js';
import { suggestPrice } from '../rules/suggestPrice.js';

export const HEAD = {
  chat: ['line'], review: ['line'], live: ['line'],
  form: ['liff', 'กรอกข้อมูลบ้านพัก'], writing: ['liff', 'AI กำลังเขียน'], preview: ['liff', 'ดูตัวอย่างประกาศ'],
  connections: ['liff', 'การเชื่อมต่อ'], coach: ['liff', 'สมัคร Agoda'],
};
export const isChat = st => HEAD[st][0] === 'line';
const canBack = () => state.step !== 'writing' && (state.hist.length > 0 || (state.step === 'coach' && state.coachStep > 1));

export function headerHtml() {
  const back = `<button class="hb" data-a="back" aria-label="ย้อนกลับ" ${canBack() ? '' : 'disabled'}><i class="chev"></i></button>`;
  if (isChat(state.step)) return `${back}<div class="hn"><b>เปิดบ้าน</b><small>✔ บัญชีทางการ</small></div><span class="hi" aria-hidden="true">⌕ ✆ ☰</span>`;
  return `${back}<b class="ht">${HEAD[state.step][1]}</b><button class="hb" data-a="close" aria-label="ปิดและกลับไปที่แชท">✕</button>`;
}

// ---- LINE chat ----
const T = '9:41';
const bot = h => `<div class="row"><span class="av">เ</span><div class="bub">${h}</div><time>${T}</time></div>`;
const me = h => `<div class="row me"><time>อ่านแล้ว ${T}</time><div class="bub me">${h}</div></div>`;
const fx = (txt, label, v) => `<div class="row"><span class="av">เ</span><div class="bub fx"><p>${txt}</p><button data-a="go" data-v="${v}">${label}</button></div></div>`;

function chatHtml() {
  const s = state; let h = '<div class="date">วันนี้</div>';
  h += bot('สวัสดีค่ะ 👋 เปิดบ้านช่วยให้บ้านพักของคุณขึ้น Agoda ได้ ตอบไม่กี่ข้อ แล้ว AI เขียนประกาศให้ ไม่เก็บค่าคอมมิชชัน');
  if (s.started) h += me('เริ่มเลย') + bot('ยินดีค่ะ กรอกข้อมูลบ้านพักไม่กี่ข้อ แล้ว AI จะเขียนประกาศให้');
  if (s.draft) h += me('ให้ AI เขียนประกาศ') + bot('ได้รับข้อมูลแล้วค่ะ AI เขียนเสร็จแล้ว เจ้าหน้าที่กำลังตรวจให้');
  if (s.previewSent) h += fx(`ตัวอย่างประกาศของ ${esc(s.intake.name)} พร้อมแล้ว`, 'ดูตัวอย่าง', 'preview');
  if (s.approved) h += me('อนุมัติ') + fx('ขอบคุณค่ะ ต่อไปเชื่อมต่อกับ Agoda เพื่อให้ประกาศขึ้นจริง', 'ไปที่หน้าการเชื่อมต่อ', 'connections');
  if (s.linkSent) h += me(esc(s.link)) + bot('ได้รับลิงก์แล้วค่ะ รอ Agoda อนุมัติ');
  if (s.step === 'live') h += bot(`🎉 ประกาศของ ${esc(s.intake.name)} ขึ้น Agoda แล้ว พร้อมรับแขกค่ะ`);
  if (!s.draft) h += `<div class="chips"><button data-a="go" data-v="form">${s.started ? 'กรอกข้อมูลต่อ' : 'เริ่มเลย'}</button></div>`;
  return h;
}

// ---- rich menu grid (bottom of the chat) ----
const TILES = [['📝', 'กรอกข้อมูล'], ['👀', 'ดูตัวอย่าง'], ['🔗', 'การเชื่อมต่อ'], ['📷', 'ถามเรื่อง Agoda'], ['❓', 'ช่วยเหลือ'], ['📞', 'คุยกับเจ้าหน้าที่']];
function menuHtml() {
  const s = state, on = [true, s.previewSent, s.approved, s.approved, true, true];
  return `<button class="menubar" data-a="toggleMenu" aria-expanded="${s.menuOpen}"><span>เมนู</span><i class="chev ${s.menuOpen ? 'dn' : 'up'}"></i></button>`
    + (s.menuOpen ? `<div class="grid">${TILES.map(([e, l], i) => `<button class="tile ${on[i] ? '' : 'off'}" data-a="menu" data-v="${i}"><b aria-hidden="true">${e}</b><span>${l}</span></button>`).join('')}</div>` : '');
}

// ---- LIFF pages ----
const field = (id, label, v, attr = '') => `<label for="f-${id}">${label}</label><input id="f-${id}" data-f="${id}" value="${esc(v)}" ${attr}>`;
const btn = (label, a, v = '', dis = false, cls = '') => `<button class="btn ${cls}" data-a="${a}" ${v ? `data-v="${v}"` : ''} ${dis ? 'disabled' : ''}>${label}</button>`;

export function screenHtml() {
  const s = state, i = s.intake, r = i.rooms[0];
  if (isChat(s.step)) return chatHtml();
  switch (s.step) {
    case 'form': return formHtml();
    case 'writing': return `<div class="spin"></div><p class="center">กำลังเขียนไทย อังกฤษ จีน…</p>`;
    case 'preview': {
      const L = s.lang, d = s.draft, p = suggestPrice(i);
      return `<div class="tabs">${[['th', 'ไทย'], ['en', 'EN'], ['zh', '中文']].map(([k, n]) => `<button data-a="setLang" data-v="${k}" class="${L === k ? 'on' : ''}">${n}</button>`).join('')}</div>`
        + `<h3>${esc(d['title_' + L])}</h3><p>${esc(d['desc_' + L])}</p>${previewExtra(i)}<p class="muted">ราคาที่แนะนำ ${p.value} บาท/คืน (ช่วง ${p.low}–${p.high}) · ${esc(i.contact.phone)}</p>`
        + (s.approved ? `<p class="ok">✓ คุณอนุมัติแล้ว</p>` : '');
    }
    case 'connections': return `<div class="card"><b>Agoda</b><small>ยังไม่ได้เชื่อมต่อ · เจ้าหน้าที่จะพาทำทีละขั้น</small></div>`;
    case 'coach': return coachHtml();
  }
}

function coachHtml() {
  const s = state;
  if (s.coachStep === 5) {
    const ck = s.link ? checkAgodaLink(s.link) : null;
    return `<p>สมัครเสร็จแล้ว วางลิงก์หน้าที่พักของคุณบน Agoda</p><label for="f-link">ลิงก์ Agoda</label><input id="f-link" data-link placeholder="https://www.agoda.com/…" value="${esc(s.link)}">`
      + `<p id="link-msg" class="${ck ? (ck.ok ? 'ok' : 'err') : ''}">${ck ? ck.msg : ''}</p>` + (s.linkSent ? `<p class="ok">✓ ส่งลิงก์แล้ว รอ Agoda อนุมัติ</p>` : '');
  }
  const sc = agodaScreens[s.coachStep - 1], cards = buildCopyCards(s.draft, s.intake);
  const hl = s.coach && s.coach.screen_id === sc.screen ? s.coach.highlight : '';
  return `<div class="agoda"><small>Agoda · ขั้นที่ ${s.coachStep}/4</small><b>${sc.agoda}</b><i></i><i></i></div><p><b>${sc.title}</b> แตะการ์ดเพื่อคัดลอก</p>`
    + cards.map((c, n) => c.screen !== sc.screen ? '' : `<button class="card ${c.label === hl ? 'hl' : ''}" data-a="copy" data-v="${n}"><small>${esc(c.label)}${c.hintOnly ? ' · คำแนะนำ' : ''}</small>${esc(c.value)}</button>`).join('')
    + (s.coachStep === 4 ? `<label for="f-shot">ติดขัด? ส่งภาพหน้าจอ Agoda ให้ AI อธิบาย</label><input id="f-shot" type="file" accept="image/*" data-shot>` : '')
    + (s.coach ? `<p class="note">${esc(s.coach.explain_th)}</p>` : '');
}

export function dockHtml() {
  const s = state;
  if (isChat(s.step)) return menuHtml();
  switch (s.step) {
    case 'form': return btn('ให้ AI เขียนประกาศ', 'write', '', !formValid()) + btn('ใช้บ้านตัวอย่าง', 'loadDemo', '', false, 'ghost');
    case 'preview': return s.approved ? btn('กลับไปที่แชท', 'close') : btn('อนุมัติ', 'approveOwner');
    case 'connections': return btn('เพิ่มการเชื่อมต่อ', 'go', 'coach');
    case 'coach': return s.coachStep < 5 ? btn('ถัดไป', 'nextCoach') : btn('ส่งลิงก์', 'sendLink', '', !checkAgodaLink(s.link).ok || s.linkSent);
    default: return '';
  }
}

// ---- form: room count, room types, amenities ----
const roomsSum = i => i.rooms.reduce((n, r) => n + (+r.count || 0), 0);
export const formValid = () => {
  const i = state.intake;
  return !!(i.name && i.location && i.contact.phone && i.rooms.length && roomsSum(i) === i.totalRooms
    && i.rooms.every(r => r.name.trim() && +r.price > 0));
};
export function roomSumHtml() {
  const i = state.intake, n = roomsSum(i);
  if (!i.rooms.length) return '<span class="err">เลือกประเภทห้องอย่างน้อย 1 แบบ</span>';
  return n === i.totalRooms ? `<span class="ok">✓ จัดครบ ${n}/${i.totalRooms} ห้อง</span>` : `<span class="err">จัดประเภทแล้ว ${n}/${i.totalRooms} ห้อง (ต้องรวมเท่ากับจำนวนห้องทั้งหมด)</span>`;
}
const chip = (label, on, a, v) => `<button type="button" class="chip ${on ? 'on' : ''}" data-a="${a}" data-v="${esc(v)}" aria-pressed="${on}">${esc(label)}</button>`;
const stepper = (id, n, a, vm, vp, sm = '') => `<div class="stepper ${sm}"><button type="button" data-a="${a}" data-v="${vm.replace('%', id)}" aria-label="ลด">−</button><b>${n}</b><button type="button" data-a="${a}" data-v="${vp.replace('%', id)}" aria-label="เพิ่ม">+</button></div>`;

function formHtml() {
  const i = state.intake;
  let h = field('name', 'ชื่อบ้านพัก', i.name) + field('location', 'ที่ตั้ง', i.location) + field('phone', 'เบอร์โทร', i.contact.phone, 'inputmode="tel"');
  h += `<p class="lbl">ที่พักของคุณมีกี่ห้อง</p><div class="rowline">${stepper('', i.totalRooms, 'setTotal', '-1', '1')}<span>ห้อง</span></div>`;
  h += `<p class="lbl">ประเภทห้อง (เลือกได้หลายแบบ)</p><div class="chipset">${ROOM_TYPES.map(t => chip(t, i.rooms.some(r => r.name === t && !r.custom), 'toggleType', t)).join('')}${chip('อื่นๆ (ระบุเอง)', i.rooms.some(r => r.custom), 'toggleType', '__other')}</div>`;
  h += i.rooms.map(r => `<div class="room"><div>${r.custom ? `<input data-r="${r.id}:name" placeholder="ชื่อประเภทห้อง" value="${esc(r.name)}" aria-label="ชื่อประเภทห้อง">` : `<b>${esc(r.name)}</b>`}</div>`
    + `<div class="rowline"><span>จำนวน</span>${stepper(r.id, r.count, 'stepRoom', '%:-1', '%:1', 'sm')}<input class="price" data-r="${r.id}:price" inputmode="numeric" placeholder="ราคา" value="${esc(r.price)}" aria-label="ราคาต่อคืน (บาท)"><span>บาท/คืน</span></div></div>`).join('');
  h += `<p id="room-sum" class="rsum">${roomSumHtml()}</p>`;
  h += `<p class="lbl">สิ่งอำนวยความสะดวก</p><div class="chipset">${AMENITIES.map(a => chip(a, i.amenities.includes(a), 'toggleAmenity', a)).join('')}${chip('อื่นๆ', i.amenityOtherOn, 'toggleAmenity', '__other')}</div>`;
  if (i.amenityOtherOn) h += field('amenityOther', 'ระบุสิ่งอำนวยความสะดวกอื่น ๆ (คั่นด้วยจุลภาค)', i.amenityOther);
  return h + field('features', 'เรื่องอื่น ๆ ที่อยากบอกแขก (ไม่บังคับ)', i.features);
}

function previewExtra(i) {
  const am = allAmenities(i);
  return `<ul class="plist">${i.rooms.map(r => `<li>${esc(r.name)} × ${r.count} ห้อง · ${esc(r.price)} บาท/คืน</li>`).join('')}</ul>` + (am.length ? `<div class="chipset">${am.map(a => `<span class="chip on">${esc(a)}</span>`).join('')}</div>` : '');
}
