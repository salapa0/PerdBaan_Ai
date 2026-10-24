// The owner's screens, styled like LINE: chat with a rich-menu grid, and LIFF mini-app pages.
import { state, conn } from '../state.js';
import { esc } from '../ui/dom.js';
import { platforms, getPlatform } from '../data/platforms.js';
import { buildCopyCards } from '../rules/buildCopyCards.js';
import { ROOM_TYPES, AMENITIES, allAmenities } from '../data/options.js';
import { suggestPrice } from '../rules/suggestPrice.js';

export const HEAD = {
  chat: ['line'], review: ['line'], live: ['line'],
  form: ['liff', 'กรอกข้อมูลบ้านพัก'], writing: ['liff', 'AI กำลังเขียน'], preview: ['liff', 'สรุปรายละเอียด'],
  looks: ['liff', 'ดูตัวอย่างแต่ละช่องทาง'],
  connections: ['liff', 'การเชื่อมต่อ'], coach: ['liff', 'สมัครช่องทาง'],
};
export const isChat = st => HEAD[st][0] === 'line';
const canBack = () => state.step !== 'writing' && (state.hist.length > 0 || (state.step === 'coach' && conn().step > 1));

export function headerHtml() {
  const back = `<button class="hb" data-a="back" aria-label="ย้อนกลับ" ${canBack() ? '' : 'disabled'}><i class="chev"></i></button>`;
  if (isChat(state.step)) return `${back}<div class="hn"><b>เปิดบ้าน</b><small>✔ บัญชีทางการ</small></div><span class="hi" aria-hidden="true">⌕ ✆ ☰</span>`;
  const title = state.step === 'coach' ? `สมัคร ${esc(getPlatform(state.active).short || getPlatform(state.active).name)}` : HEAD[state.step][1];
  return `${back}<b class="ht">${title}</b><button class="hb" data-a="close" aria-label="ปิดและกลับไปที่แชท">✕</button>`;
}

// ---- LINE chat ----
const T = '9:41';
const bot = h => `<div class="row"><span class="av">เ</span><div class="bub">${h}</div><time>${T}</time></div>`;
const me = h => `<div class="row me"><time>อ่านแล้ว ${T}</time><div class="bub me">${h}</div></div>`;
const fx = (txt, label, v) => `<div class="row"><span class="av">เ</span><div class="bub fx"><p>${txt}</p><button data-a="go" data-v="${v}">${label}</button></div></div>`;

function chatHtml() {
  const s = state; let h = '<div class="date">วันนี้</div>';
  h += bot('สวัสดีค่ะ เปิดบ้านช่วยให้บ้านพักของคุณขึ้นแพลตฟอร์มท่องเที่ยวได้ ตอบไม่กี่ข้อ แล้ว AI เขียนประกาศให้ ไม่เก็บค่าคอมมิชชัน');
  if (s.started) h += me('เริ่มเลย') + bot('ยินดีค่ะ กรอกข้อมูลบ้านพักไม่กี่ข้อ แล้ว AI จะเขียนประกาศให้');
  if (s.draft) h += me('ให้ AI เขียนประกาศ') + bot('ได้รับข้อมูลแล้วค่ะ AI เขียนประกาศให้เรียบร้อยแล้ว');
  if (s.previewSent) h += fx(`ตัวอย่างประกาศของ ${esc(s.intake.name)} พร้อมแล้ว`, 'ดูตัวอย่าง', 'preview');
  if (s.approved) h += me('อนุมัติ') + fx('ขอบคุณค่ะ ต่อไปเชื่อมต่อช่องทางเพื่อให้ประกาศขึ้นจริง', 'ไปที่หน้าการเชื่อมต่อ', 'connections');
  platforms.forEach(p => { const c = conn(p.id); if (c.linkSent && !c.live) h += me(esc(c.link)) + bot(p.link.wait); });
  platforms.forEach(p => { if (conn(p.id).live) h += bot(p.liveMsg(esc(s.intake.name))); });
  const pending = s.approved ? platforms.filter(p => !conn(p.id).live) : [];
  if (platforms.some(p => conn(p.id).live) && pending.length) h += fx(`เพิ่มช่องทาง ${esc(pending[0].short || pending[0].name)} ได้อีกนะคะ`, 'เพิ่มการเชื่อมต่อ', 'connections');
  if (!s.draft) h += `<div class="chips"><button data-a="go" data-v="form">${s.started ? 'กรอกข้อมูลต่อ' : 'เริ่มเลย'}</button></div>`;
  return h;
}

// ---- rich menu grid (bottom of the chat) ----
const TILES = [['📝', 'กรอกข้อมูล'], ['👀', 'ดูตัวอย่าง'], ['🔗', 'การเชื่อมต่อ'], ['📷', 'ถามเรื่องการสมัคร'], ['❓', 'ช่วยเหลือ'], ['📞', 'ติดต่อกับเจ้าหน้าที่']];
function menuHtml() {
  const s = state, on = [true, s.previewSent, s.approved, s.approved, true, true];
  return `<button class="menubar" data-a="toggleMenu" aria-expanded="${s.menuOpen}"><span>เมนู</span><i class="chev ${s.menuOpen ? 'dn' : 'up'}"></i></button>`
    + (s.menuOpen ? `<div class="grid">${TILES.map(([e, l], i) => `<button class="tile ${on[i] ? '' : 'off'}" data-a="menu" data-v="${i}"><b aria-hidden="true">${e}</b><span>${l}</span></button>`).join('')}</div>` : '');
}

// ---- LIFF pages ----
const field = (id, label, v, attr = '') => `<label for="f-${id}">${label}</label><input id="f-${id}" data-f="${id}" value="${esc(v)}" ${attr}>`;
const btn = (label, a, v = '', dis = false, cls = '') => `<button class="btn ${cls}" data-a="${a}" ${v ? `data-v="${v}"` : ''} ${dis ? 'disabled' : ''}>${label}</button>`;
const LANGS = [['th', 'ไทย'], ['en', 'EN'], ['zh', '中文']];
const langTabs = L => `<div class="tabs">${LANGS.map(([k, n]) => `<button data-a="setLang" data-v="${k}" class="${L === k ? 'on' : ''}">${n}</button>`).join('')}</div>`;

export function screenHtml() {
  const s = state, i = s.intake, r = i.rooms[0];
  if (isChat(s.step)) return chatHtml();
  switch (s.step) {
    case 'form': return formHtml();
    case 'writing': return `<div class="spin"></div><p class="center">กำลังเขียนไทย อังกฤษ จีน…</p>`;
    case 'preview': {
      const L = s.lang, d = s.draft, p = suggestPrice(i);
      return langTabs(L) + `<article class="listing">`
        + `<div class="listing-head"><h3>${esc(d['title_' + L])}</h3><div class="listing-loc">📍 ${esc(i.location)}</div></div>`
        + `<div class="listing-body">`
        + `<div class="price-badge"><b>${p.value}</b><span class="unit">บาท/คืน</span><span class="rng">ช่วง ${p.low}–${p.high}</span></div>`
        + `<p>${esc(d['desc_' + L])}</p>${previewExtra(i)}`
        + `<p class="muted fine">ราคาที่ AI แนะนำจากข้อมูลของคุณ · ติดต่อ ${esc(i.contact.phone)}</p>`
        + `</div></article>`
        + (s.approved ? `<p class="ok center">✓ คุณอนุมัติประกาศนี้แล้ว</p>` : '')
        + btn('👀 ดูตัวอย่างบนแต่ละช่องทาง', 'go', 'looks', false, 'ghost');
    }
    case 'looks': return looksHtml();
    case 'connections': return connectionsHtml();
    case 'coach': return coachHtml();
  }
}

// ---- Connections: one card per platform, rendered from platforms.js ----
function connStatus(p) {
  const c = conn(p.id), n = p.screens.length;
  if (c.live) return { cls: 'ok', text: '✓ เชื่อมต่อแล้ว · ขึ้นจริง' };
  if (c.linkSent) return { cls: 'muted', text: p.link.wait };
  if (c.step > 1 || c.coach) return { cls: 'muted', text: `กำลังเชื่อมต่อ · ขั้นที่ ${Math.min(c.step, n)}/${n}` };
  return { cls: 'muted', text: 'ยังไม่ได้เชื่อมต่อ · เจ้าหน้าที่จะพาทำทีละขั้น' };
}
function connectionsHtml() {
  return platforms.map(p => {
    const c = conn(p.id), st = connStatus(p), going = c.step > 1 || c.coach || c.linkSent;
    const action = c.live ? '' : btn(going ? 'ทำต่อ' : 'เชื่อมต่อ', 'connect', p.id, false, going ? '' : 'ghost');
    return `<div class="agoda"><small>${esc(p.role)}</small><b>${esc(p.short || p.name)}</b>`
      + `<p class="muted">${esc(p.blurb)}</p>`
      + (p.needs && !c.live ? `<p class="note">${esc(p.needs)}</p>` : '')
      + `<p class="${st.cls}">${esc(st.text)}</p>${action}</div>`;
  }).join('');
}

function coachHtml() {
  const s = state, p = getPlatform(s.active), c = conn(), n = p.screens.length;
  if (c.step === n + 1) {
    const lk = p.link, ck = c.link ? lk.check(c.link) : null;
    return `<p>${esc(lk.title)}</p><label for="f-link">${esc(lk.label)}</label><input id="f-link" data-link placeholder="${esc(lk.placeholder)}" value="${esc(c.link)}">`
      + `<p id="link-msg" class="${ck ? (ck.ok ? 'ok' : 'err') : ''}">${ck ? ck.msg : ''}</p>` + (c.linkSent ? `<p class="ok">${esc(lk.sent)}</p>` : '');
  }
  const sc = p.screens[c.step - 1], cards = buildCopyCards(s.draft, s.intake, s.active);
  const hl = c.coach && c.coach.screen_id === sc.screen ? c.coach.highlight : '';
  return `<div class="agoda"><small>${esc(p.short || p.name)} · ขั้นที่ ${c.step}/${n}</small><b>${esc(sc.field)}</b><i></i><i></i></div><p><b>${esc(sc.title)}</b> แตะการ์ดเพื่อคัดลอก</p>`
    + (c.step === 1 && p.needs ? `<p class="note">${esc(p.needs)}</p>` : '')
    + cards.map((cd, idx) => cd.screen !== sc.screen ? '' : `<button class="card ${cd.label === hl ? 'hl' : ''}" data-a="copy" data-v="${idx}"><small>${esc(cd.label)}${cd.hintOnly ? ' · คำแนะนำ' : ''}</small>${esc(cd.value)}</button>`).join('')
    + (c.step === n ? `<label for="f-shot">ติดขัด? ส่งภาพหน้าจอ ${esc(p.short || p.name)} ให้ AI อธิบาย</label><input id="f-shot" type="file" accept="image/*" data-shot>` : '')
    + (c.coach ? `<p class="note">${esc(c.coach.explain_th)}</p>` : '');
}

export function dockHtml() {
  const s = state;
  if (isChat(s.step)) return menuHtml();
  switch (s.step) {
    case 'form': return btn('ให้ AI เขียนประกาศ', 'write', '', !formValid()) + btn('ใช้บ้านตัวอย่าง', 'loadDemo', '', false, 'ghost');
    case 'preview': return s.approved ? btn('กลับไปที่แชท', 'close') : btn('อนุมัติ', 'approveOwner');
    case 'connections': return '';
    case 'coach': {
      const p = getPlatform(s.active), c = conn(), n = p.screens.length;
      return c.step <= n ? btn('ถัดไป', 'nextCoach') : btn('ส่งลิงก์', 'sendLink', '', !p.link.check(c.link).ok || c.linkSent);
    }
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
  return `<div><p class="plabel">ห้องพัก</p><ul class="plist">${i.rooms.map(r => `<li>${esc(r.name)} × ${r.count} ห้อง · ${esc(r.price)} บาท/คืน</li>`).join('')}</ul></div>`
    + (am.length ? `<div><p class="plabel">สิ่งอำนวยความสะดวก</p><div class="chipset">${am.map(a => `<span class="chip on">${esc(a)}</span>`).join('')}</div></div>` : '');
}

// ---- "preview on each platform": the same draft dressed up as each channel's own banner ----
// Layout follows platform.kind; brand colour and chrome labels come from platform.preview (platforms.js).
function looksHtml() {
  const s = state, i = s.intake, d = s.draft, L = s.lang, price = suggestPrice(i);
  return langTabs(L)
    + `<p class="looks-intro muted">นี่คือตัวอย่างว่าประกาศของคุณจะปรากฏบนแต่ละช่องทางอย่างไร (ภาพจำลอง ยังไม่ขึ้นจริง)</p>`
    + platforms.map(p => platformBanner(p, d, i, L, price)).join('');
}

function bannerChrome(pv) {
  return `<div class="pb-top"><span class="pb-mark">${esc(pv.wordmark)}</span>`
    + `<span class="pb-cap">${esc(pv.caption)}</span><span class="pb-sim">ภาพจำลอง</span></div>`;
}

function platformBanner(p, d, i, L, price) {
  const pv = p.preview, title = esc(d['title_' + L]), loc = esc(i.location);
  if (p.kind === 'discovery') {
    return `<section class="pbanner discovery" style="--brand:${esc(pv.brand)}">${bannerChrome(pv)}`
      + `<div class="pb-g"><div class="pb-thumb" aria-hidden="true">📷</div><div class="pb-ginfo">`
      + `<h4>${title}</h4>`
      + `<div class="pb-stars"><span aria-hidden="true">★★★★★</span><small class="muted">ยังไม่มีรีวิว</small></div>`
      + `<div class="pb-sub">${esc(pv.category)} · ${loc}</div>`
      + `<div class="pb-open">เปิดอยู่ · เช็คอิน 14:00</div>`
      + `</div></div>`
      + `<div class="pb-acts">${pv.actions.map(a => `<span>${esc(a)}</span>`).join('')}</div>`
      + `</section>`;
  }
  const am = allAmenities(i).slice(0, 3);
  return `<section class="pbanner booking" style="--brand:${esc(pv.brand)}">${bannerChrome(pv)}`
    + `<div class="pb-hero" aria-hidden="true"><span>📷</span></div>`
    + `<div class="pb-body"><div class="pb-line"><h4>${title}</h4><span class="pb-new">ใหม่</span></div>`
    + `<div class="pb-sub">📍 ${loc}</div>`
    + (am.length ? `<div class="pb-tags">${am.map(a => `<span>${esc(a)}</span>`).join('')}</div>` : '')
    + `<div class="pb-foot"><div class="pb-price"><b>฿${price.value.toLocaleString('en-US')}</b><small>${esc(pv.priceNote)}</small></div>`
    + `<span class="pb-cta">${esc(pv.cta)}</span></div>`
    + `</div></section>`;
}
