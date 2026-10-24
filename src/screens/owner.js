// The owner's screens, styled like LINE: chat with a rich-menu grid, and LIFF mini-app pages.
import { state, conn } from '../state.js';
import { esc } from '../ui/dom.js';
import { platforms, getPlatform } from '../data/platforms.js';
import { buildCopyCards } from '../rules/buildCopyCards.js';
import { ROOM_TYPES, AMENITIES, allAmenities, MAX_PHOTOS, MIN_PHOTOS } from '../data/options.js';
import { UI, LANGS, HTML_LANG, term, place } from '../data/i18n.js';
import { suggestPrice } from '../rules/suggestPrice.js';

export const HEAD = {
  chat: ['line'], review: ['line'], live: ['line'],
  form: ['liff', 'กรอกข้อมูลบ้านพัก'], writing: ['liff', 'AI กำลังเขียน'], preview: ['liff', 'ดูตัวอย่างประกาศ'],
  connections: ['liff', 'การเชื่อมต่อ'], coach: ['liff', 'สมัครช่องทาง'],
  finance: ['liff', 'การเงิน'], help: ['liff', 'ติดต่อเจ้าหน้าที่'],
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
// An incoming message from a (simulated) guest — a different person from the "เปิดบ้าน" bot.
const cust = (name, h) => `<div class="row"><span class="av cust" aria-hidden="true">${esc(name.slice(0, 1))}</span><div class="bub cust"><small class="cust-name">${esc(name)}</small>${h}</div></div>`;

function chatHtml() {
  const s = state; let h = '<div class="date">วันนี้</div>';
  h += bot('สวัสดีค่ะ 👋 เปิดบ้านช่วยให้บ้านพักของคุณขึ้น Agoda ได้ ตอบไม่กี่ข้อ แล้ว AI เขียนประกาศให้ ไม่เก็บค่าคอมมิชชัน');
  if (s.started) h += me('เริ่มเลย') + bot('ยินดีค่ะ กรอกข้อมูลบ้านพักไม่กี่ข้อ แล้ว AI จะเขียนประกาศให้');
  if (s.draft) h += me('ให้ AI เขียนประกาศ') + bot('ได้รับข้อมูลแล้วค่ะ AI เขียนประกาศให้เรียบร้อยแล้ว');
  if (s.previewSent) h += fx(`ตัวอย่างประกาศของ ${esc(s.intake.name)} พร้อมแล้ว`, 'ดูตัวอย่าง', 'preview');
  if (s.approved) h += me('อนุมัติ') + fx('ขอบคุณค่ะ ต่อไปเชื่อมต่อช่องทางเพื่อให้ประกาศขึ้นจริง', 'ไปที่หน้าการเชื่อมต่อ', 'connections');
  platforms.forEach(p => { const c = conn(p.id); if (c.linkSent && !c.live) h += me(esc(c.link)) + bot(p.link.wait); });
  platforms.forEach(p => { if (conn(p.id).live) h += bot(p.liveMsg(esc(s.intake.name))) + announceCard(p); });
  const pending = s.approved ? platforms.filter(p => !conn(p.id).live) : [];
  if (platforms.some(p => conn(p.id).live) && pending.length) h += fx(`เพิ่มช่องทาง ${esc(pending[0].short || pending[0].name)} ได้อีกนะคะ`, 'เพิ่มการเชื่อมต่อ', 'connections');
  if (s.customers.length) {
    s.customers.forEach(c => h += cust(c.name, esc(c.msg)));
    h += fx(`🎉 มีลูกค้าทักเข้ามา ${s.customers.length} ราย — ดูสรุปการเงินได้เลย`, 'ไปที่หน้าการเงิน', 'finance');
  }
  if (!s.draft) h += `<div class="chips"><button data-a="go" data-v="form">${s.started ? 'กรอกข้อมูลต่อ' : 'เริ่มเลย'}</button></div>`;
  return h;
}

// One announcement card per channel, posted the moment that channel goes live (cover photo, name, link).
function announceCard(p) {
  const i = state.intake, d = state.draft || {}, cover = (i.photos || [])[0];
  return `<div class="row"><span class="av">เ</span><div class="bub ann">`
    + (cover ? `<img src="${esc(cover)}" alt="รูปปกประกาศ">` : '')
    + `<div class="ann-b"><span class="ann-tag">ประกาศบน ${esc(p.short || p.name)}</span><b>${esc(d.title_th || i.name)}</b>`
    + p.announce(i).map(l => `<small>${esc(l)}</small>`).join('') + `<small class="ann-link">${esc(conn(p.id).link)}</small></div>`
    + `<button data-a="copyLink" data-v="${p.id}">คัดลอกลิงก์ประกาศ</button></div><time>${T}</time></div>`;
}

// ---- rich menu grid (bottom of the chat) ----
// 3×2 grid. Bottom row: ถามเรื่อง Agoda · การเงิน (middle) · ช่วยเหลือ (right, opens ติดต่อเจ้าหน้าที่).
const TILES = [['📝', 'กรอกข้อมูล'], ['👀', 'ดูตัวอย่าง'], ['🔗', 'การเชื่อมต่อ'], ['📷', 'ถามเรื่อง Agoda'], ['💵', 'การเงิน'], ['💬', 'ช่วยเหลือ']];
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
      const L = s.lang, d = s.draft, p = suggestPrice(i), U = UI[L];
      const tabs = `<div class="tabs">${LANGS.map(([k, n]) => `<button data-a="setLang" data-v="${k}" lang="${HTML_LANG[k]}" aria-pressed="${L === k}" class="${L === k ? 'on' : ''}">${n}</button>`).join('')}</div>`;
      return tabs + `<article class="listing" lang="${HTML_LANG[L]}">`
        + galleryHtml(i.photos || [], U)
        + `<div class="listing-head"><h3>${esc(d['title_' + L])}</h3><div class="listing-loc">📍 ${esc(place(i, d, L))}</div></div>`
        + `<div class="listing-body">`
        + `<div class="price-badge"><b>${p.value}</b><span class="unit">${U.perNight}</span><span class="rng">${U.range} ${p.low}–${p.high}</span></div>`
        + `<p>${esc(d['desc_' + L])}</p>${previewExtra(i, d, L)}`
        + `<p class="muted fine">${esc(U.tip(i.contact.phone))}</p>`
        + `</div></article>`
        + (s.approved ? `<p class="ok center" lang="${HTML_LANG[L]}">${U.approved}</p>` : '');
    }
    case 'connections': return connectionsHtml();
    case 'coach': return coachHtml();
    case 'finance': return financeHtml();
    case 'help': return helpHtml();
  }
}

// ---- Finance: billing status + a running summary of bookings from (simulated) guests ----
// Free until the first customer; the first guest ping flips billing on and starts the earnings tally.
function financeHtml() {
  const cs = state.customers, has = cs.length > 0;
  const nights = cs.reduce((n, c) => n + c.nights, 0);
  const gross = cs.reduce((n, c) => n + c.amount, 0);
  const row = (label, val, cls = '') => `<div class="fin-row"><span>${esc(label)}</span><b class="${cls}">${val}</b></div>`;
  return `<p class="big center">${has ? 'สรุปการเงิน' : 'ฟรีจนกว่าจะได้ลูกค้าคนแรก'}</p>`
    + (has
        ? `<div class="note"><b>เริ่มแพ็กเกจ Standard · ฿490/เดือน</b><br>คุณได้ลูกค้าคนแรกแล้ว 🎉 ค่าสมาชิกจะเริ่มในรอบบิลถัดไป (ขั้นต่ำ 6 เดือน)</div>`
        : `<div class="note"><b>ยังไม่มีค่าใช้จ่าย</b><br>ลงประกาศได้เต็มที่ ยังไม่ต้องจ่ายจนกว่าจะมีลูกค้าคนแรกเข้ามา</div>`)
    + `<p class="lbl">ยอดจองจากลูกค้า</p>`
    + `<div class="agoda">`
    + row('จำนวนการจอง', `${cs.length} ราย`)
    + row('จำนวนคืน', `${nights} คืน`)
    + row('รายได้รวม (ประมาณ)', `฿${gross.toLocaleString('en-US')}`, 'ok')
    + `</div>`
    + (has
        ? `<p class="lbl">ลูกค้าล่าสุด</p>`
          + cs.slice().reverse().map(c =>
              `<div class="agoda"><small>${esc(c.time)}</small><b>${esc(c.name)}</b>`
              + `<p class="muted">${esc(c.msg)}</p>`
              + `<p class="ok fine">${c.nights} คืน · ฿${c.amount.toLocaleString('en-US')}</p></div>`).join('')
        : `<p class="muted center">ยังไม่มีการจอง — เมื่อมีลูกค้าทักเข้ามา ยอดจะแสดงที่นี่</p>`)
    + `<p class="ok fine center">✓ ไม่หักค่าคอมมิชชัน · เงินทุกบาทเป็นของคุณ</p>`;
}

// ---- Help: the "ติดต่อเจ้าหน้าที่" feature, now reached from the ช่วยเหลือ tile ----
function helpHtml() {
  const q = (label, v) => `<button class="chip" data-a="askStaff" data-v="${esc(v)}">${esc(label)}</button>`;
  return `<p class="big center">ติดต่อเจ้าหน้าที่</p>`
    + `<p class="muted center">ทีมงานเปิดบ้านพร้อมช่วยคุณทุกขั้นตอน</p>`
    + `<div class="agoda"><small>เวลาทำการ</small><b>ทุกวัน 9:00–18:00 น.</b><p class="muted">ตอบในแชทไลน์นี้ โดยเฉลี่ยภายใน 1 ชั่วโมง</p></div>`
    + `<div class="agoda"><small>สายด่วน</small><b>02-123-4567</b><p class="muted">สายด่วนช่วยเหลือเจ้าของบ้านพัก</p></div>`
    + `<p class="lbl">คำถามที่พบบ่อย</p>`
    + `<div class="chipset">${q('สมัครช่องทางยังไง', 'การสมัครช่องทาง')}${q('ค่าบริการเท่าไร', 'ค่าบริการ')}${q('แก้ไขประกาศ', 'การแก้ไขประกาศ')}</div>`;
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
  return `<div class="agoda"><small>${esc(p.short || p.name)} · ขั้นที่ ${c.step}/${n}</small><b>${esc(sc.field)}</b>${sc.screen === 'photos' ? coachPhotosHtml() : '<i></i><i></i>'}</div><p><b>${esc(sc.title)}</b> แตะการ์ดเพื่อคัดลอก</p>`
    + (c.step === 1 && p.needs ? `<p class="note">${esc(p.needs)}</p>` : '')
    + cards.map((cd, idx) => cd.screen !== sc.screen ? '' : `<button class="card ${cd.label === hl ? 'hl' : ''}" data-a="copy" data-v="${idx}"><small>${esc(cd.label)}${cd.hintOnly ? ' · คำแนะนำ' : ''}</small>${esc(cd.value)}</button>`).join('')
    + (c.step === n ? `<label for="f-shot">ติดขัด? ส่งภาพหน้าจอ ${esc(p.short || p.name)} ให้ AI อธิบาย</label><input id="f-shot" type="file" accept="image/*" data-shot>` : '')
    + (c.coach ? `<p class="note">${esc(c.coach.explain_th)}</p>` : '');
}

// The photos page of a sign-up: the owner's photos from the form, cover first.
function coachPhotosHtml() {
  const ph = state.intake.photos || [];
  if (!ph.length) return '<p class="note">ยังไม่มีรูป กลับไปหน้ากรอกข้อมูลเพื่อเพิ่มรูปที่พัก</p>';
  return `<div class="photos coach-photos">${ph.map((src, k) => `<div class="ph"><img src="${esc(src)}" alt="รูปที่ ${k + 1}">${k === 0 ? '<span class="cover">ปก</span>' : ''}</div>`).join('')}</div>`;
}

export function dockHtml() {
  const s = state;
  if (isChat(s.step)) return menuHtml();
  switch (s.step) {
    case 'form': return btn('ให้ AI เขียนประกาศ', 'write', '', !formValid()) + btn('ใช้บ้านตัวอย่าง', 'loadDemo', '', false, 'ghost');
    case 'preview': return s.approved ? btn('กลับไปที่แชท', 'close') : btn('อนุมัติ', 'approveOwner');
    case 'connections': return '';
    case 'finance': return '';
    case 'help': return btn('ส่งข้อความหาเจ้าหน้าที่', 'contactStaff');
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
  return h + photosHtml() + field('features', 'เรื่องอื่น ๆ ที่อยากบอกแขก (ไม่บังคับ)', i.features);
}

// ---- form: photos (add, see, remove; the first photo is the cover) ----
function photosHtml() {
  const ph = state.intake.photos || [];
  return `<p class="lbl">รูปภาพที่พัก</p>`
    + `<p class="muted fine hint">เพิ่มได้ไม่เกิน ${MAX_PHOTOS} รูป · แนะนำอย่างน้อย ${MIN_PHOTOS} รูป เช่น หน้าบ้าน ห้องนอน ห้องน้ำ วิว · รูปแรกจะเป็นรูปปก</p>`
    + `<div class="photos">`
    + ph.map((src, k) => `<div class="ph"><img src="${esc(src)}" alt="รูปที่ ${k + 1}">${k === 0 ? '<span class="cover">ปก</span>' : ''}<button type="button" class="ph-x" data-a="removePhoto" data-v="${k}" aria-label="ลบรูปที่ ${k + 1}">✕</button></div>`).join('')
    + (ph.length >= MAX_PHOTOS ? '' : `<label class="ph-add" for="f-photos"><b aria-hidden="true">＋</b><span>เพิ่มรูป</span><input id="f-photos" class="sr" type="file" accept="image/*" multiple data-photos></label>`)
    + `</div><p class="rsum">${photoSumHtml(ph.length)}</p>`;
}
const photoSumHtml = n => !n ? '<span class="muted">ยังไม่มีรูป</span>'
  : n < MIN_PHOTOS ? `<span class="muted">เพิ่มแล้ว ${n} รูป (แนะนำอย่างน้อย ${MIN_PHOTOS} รูป)</span>` : `<span class="ok">✓ เพิ่มแล้ว ${n} รูป</span>`;

// ---- preview: photo gallery (big photo + thumbnails) ----
function galleryHtml(photos, U) {
  if (!photos.length) return '';
  const k = Math.min(Math.max(+state.photoIdx || 0, 0), photos.length - 1);
  return `<div class="gallery"><img class="g-main" src="${esc(photos[k])}" alt="${esc(U.photo(k + 1))}">`
    + (photos.length > 1 ? `<div class="g-thumbs">${photos.map((src, n) => `<button type="button" class="g-thumb ${n === k ? 'on' : ''}" data-a="setPhoto" data-v="${n}" aria-label="${esc(U.photo(n + 1))}" aria-pressed="${n === k}"><img src="${esc(src)}" alt=""></button>`).join('')}</div>` : '')
    + `</div>`;
}

function previewExtra(i, d, L) {
  const U = UI[L], am = allAmenities(i);
  return `<div><p class="plabel">${U.rooms}</p><ul class="plist">${i.rooms.map(r => `<li>${esc(U.roomLine(term(r.name, L, d), r.count, r.price))}</li>`).join('')}</ul></div>`
    + (am.length ? `<div><p class="plabel">${U.amenities}</p><div class="chipset">${am.map(a => `<span class="chip on">${esc(term(a, L, d))}</span>`).join('')}</div></div>` : '');
}
