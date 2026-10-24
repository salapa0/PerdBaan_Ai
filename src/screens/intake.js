// S2 — intake form, 3 steps (place+rooms, photos, questions+contact).
import { h, chip, stepper, toast, TEXT } from '../ui/ui.js';
import { getState, setState } from '../state.js';
import { go, newRoom } from '../router.js';
import { ROOM_TYPES, BED_TYPES, FACILITIES, MEALS, NEARBY, PROVINCES, thLabel } from '../data/options.js';
import { putPhoto, getPhoto, deletePhoto, photoURL, invalidateUrl } from '../photos.js';
import { resize, brighten } from '../rules/photoEdit.js';
import { startGeneration } from './generating.js';

let work = null;
let step = 1;

export function resetIntakeWork() { work = null; }

function ensureWork() {
  if (!work) { work = JSON.parse(JSON.stringify(getState().intake)); step = getState().intakeStep || 1; }
}

function field(labelHtml, control, errId) {
  return h('div', { class: 'field' },
    h('label', { html: labelHtml }),
    control,
    errId ? h('div', { class: 'err', id: errId, hidden: true }) : null,
  );
}

function textInput(value, oninput, attrs = {}) {
  const el = h('input', { type: attrs.type || 'text', value: value || '', inputmode: attrs.inputmode, placeholder: attrs.placeholder || '', maxlength: attrs.maxlength });
  el.addEventListener('input', () => oninput(el.value));
  return el;
}
function textArea(value, oninput, max) {
  const el = h('textarea', { maxlength: max });
  el.value = value || '';
  el.addEventListener('input', () => oninput(el.value));
  return el;
}

// ---------- Step 1 ----------
function roomCard(room, idx, rerender) {
  const typeChips = h('div', { class: 'chip-row' },
    ...ROOM_TYPES.map(rt => chip(rt.th, room.type === rt.id, () => { room.type = rt.id; rerender(); })));
  const bedChips = h('div', { class: 'chip-row' },
    ...BED_TYPES.map(bt => {
      const found = room.beds.find(b => b.type === bt.id);
      return chip(bt.th + (found ? ` ×${found.qty}` : ''), !!found, () => {
        if (found) { found.qty += 1; if (found.qty > 4) room.beds = room.beds.filter(b => b.type !== bt.id); }
        else room.beds.push({ type: bt.id, qty: 1 });
        rerender();
      });
    }));
  return h('div', { class: 'roomcard' },
    (getState().intake && work.rooms.length > 1) ? h('button', { class: 'rm-del', title: 'ลบ', on: { click: () => { work.rooms.splice(idx, 1); rerender(); } } }, '🗑') : null,
    field(TEXT.intake.roomType, typeChips),
    field(TEXT.intake.roomName, textInput(room.name, v => room.name = v)),
    h('div', { style: 'display:flex;gap:14px;flex-wrap:wrap' },
      field(TEXT.intake.roomCount, stepper(room.count, 1, 8, v => { room.count = v; updateSummary(); })),
      field(TEXT.intake.maxGuests, stepper(room.maxGuests, 1, 10, v => { room.maxGuests = v; updateSummary(); })),
    ),
    field(TEXT.intake.beds + ' <span class="hint">(แตะเพื่อเพิ่มจำนวน)</span>', bedChips),
    field(TEXT.intake.price, textInput(room.price, v => room.price = Number(v) || 0, { type: 'number', inputmode: 'numeric' })),
    h('div', { style: 'display:flex;gap:14px' },
      field(TEXT.intake.bathroom, h('div', { class: 'toggle-row' },
        h('div', { class: 'seg' + (room.bathroom === 'private' ? ' on' : ''), on: { click: () => { room.bathroom = 'private'; rerender(); } } }, TEXT.intake.inRoom),
        h('div', { class: 'seg' + (room.bathroom === 'shared' ? ' on' : ''), on: { click: () => { room.bathroom = 'shared'; rerender(); } } }, TEXT.intake.shared),
      )),
      field(TEXT.intake.aircon, h('div', { class: 'toggle-row' },
        h('div', { class: 'seg' + (room.aircon ? ' on' : ''), on: { click: () => { room.aircon = true; rerender(); } } }, TEXT.intake.yes),
        h('div', { class: 'seg' + (!room.aircon ? ' on' : ''), on: { click: () => { room.aircon = false; rerender(); } } }, TEXT.intake.no),
      )),
    ),
  );
}

let summaryEl = null;
function updateSummary() {
  if (!summaryEl) return;
  const rooms = work.rooms.reduce((s, r) => s + (r.count || 0), 0);
  const guests = work.rooms.reduce((s, r) => s + (r.maxGuests || 0) * (r.count || 0), 0);
  summaryEl.querySelector('.sum-text').textContent = `รวม ${rooms} ห้อง รับได้สูงสุด ${guests} คน`;
  const amber = summaryEl.querySelector('.amber-note');
  amber.hidden = !(rooms > 8 || guests > 30);
}

function step1(rerender) {
  const box = h('div', {});
  const p = work.place;
  box.append(
    field(TEXT.intake.placeName, textInput(p.name, v => p.name = v, { maxlength: 60 })),
    field(TEXT.intake.village, textInput(p.village, v => p.village = v)),
    h('div', { style: 'display:flex;gap:12px' },
      field(TEXT.intake.district, textInput(p.district, v => p.district = v)),
      (() => {
        const dl = h('datalist', { id: 'prov-list' }, ...PROVINCES.map(pr => h('option', { value: pr })));
        const inp = textInput(p.province, v => p.province = v); inp.setAttribute('list', 'prov-list');
        return field(TEXT.intake.province, h('div', {}, inp, dl));
      })(),
    ),
    field(TEXT.intake.address, textArea(p.address, v => p.address = v)),
    field(TEXT.intake.postcode, textInput(p.postcode, v => p.postcode = v, { inputmode: 'numeric', maxlength: 5 })),
  );
  summaryEl = h('div', { class: 'summary-line' },
    h('span', { class: 'sum-text' }, ''),
    h('div', { class: 'amber-note', hidden: true }, TEXT.intake.overHomestay),
  );
  box.append(summaryEl);
  work.rooms.forEach((r, i) => box.append(roomCard(r, i, rerender)));
  box.append(h('button', { class: 'btn outline block', on: { click: () => { work.rooms.push(newRoom()); rerender(); } } }, TEXT.intake.addRoom));
  setTimeout(updateSummary, 0);
  return box;
}

// ---------- Step 2 (photos) ----------
const SLOTS = [
  { slot: 'front', th: 'ด้านหน้าบ้าน', hint: 'ถ่ายตอนกลางวัน เห็นทั้งหลัง', ic: '🏠' },
  { slot: 'bedroom', th: 'ห้องนอน', hint: 'เปิดไฟ จัดเตียงให้เรียบร้อย', ic: '🛏️' },
  { slot: 'bathroom', th: 'ห้องน้ำ', hint: '', ic: '🚿' },
  { slot: 'view', th: 'วิวรอบบ้าน', hint: '', ic: '🌄' },
  { slot: 'food', th: 'อาหาร', hint: '', ic: '🍲' },
  { slot: 'activity', th: 'กิจกรรม', hint: '', ic: '🚲' },
];

async function paintThumb(el, photoId) {
  const url = await photoURL(photoId);
  if (url) { el.style.backgroundImage = ''; el.classList.add('filled'); el.querySelector('img')?.remove(); el.prepend(h('img', { src: url })); }
}

function slotTile(def, rerender) {
  const existing = work.photos.find(p => p.slot === def.slot);
  const tile = h('div', { class: 'slot' + (existing ? ' filled' : '') });
  if (existing) {
    tile.append(
      h('img', { src: '' }),
      h('button', { class: 'slot-x', on: { click: (e) => { e.stopPropagation(); deletePhoto(existing.id); work.photos = work.photos.filter(p => p !== existing); rerender(); } } }, '✕'),
      h('button', { class: 'slot-bright', on: { click: async (e) => { e.stopPropagation(); await brightenPhoto(existing.id); toast('ปรับแสงแล้ว'); rerender(); } } }, TEXT.intake.brighten),
      h('div', { class: 'slot-label' }, def.th),
    );
    paintThumb(tile, existing.id);
  } else {
    tile.append(h('div', { class: 'slot-ic' }, def.ic), h('div', {}, def.th), def.hint ? h('div', { style: 'font-size:10px;opacity:.8' }, def.hint) : null);
    tile.addEventListener('click', () => pickPhoto(def.slot, rerender));
  }
  return tile;
}

async function brightenPhoto(id) {
  const blob = await getPhoto(id);
  if (!blob) return;
  const out = await brighten(blob);
  await putPhoto(id, out);
  invalidateUrl(id); // so photoURL() re-creates the thumbnail
}

function pickPhoto(slot, rerender) {
  const inp = h('input', { type: 'file', accept: 'image/*', style: 'display:none' });
  document.body.append(inp);
  inp.addEventListener('change', async () => {
    const file = inp.files[0]; inp.remove();
    if (!file) return;
    try {
      const small = await resize(file, 1600);
      const id = 'up-' + Date.now() + '-' + slot;
      await putPhoto(id, small);
      work.photos = work.photos.filter(p => p.slot !== slot);
      work.photos.push({ id, slot });
      rerender();
    } catch (e) { toast('อัปโหลดรูปไม่สำเร็จ'); }
  });
  inp.click();
}

function step2(rerender) {
  const grid = h('div', { class: 'slot-grid' }, ...SLOTS.map(d => slotTile(d, rerender)));
  const count = work.photos.length;
  const counter = h('div', { class: 'photo-counter' }, `${count} / 10 รูป`);
  const amber = count < 5 ? h('div', { class: 'note-amber' }, TEXT.intake.under5) : null;
  return h('div', {}, grid, counter, amber);
}

// ---------- Step 3 (questions + contact) ----------
function step3(rerender) {
  const a = work.answers, c = work.contact;
  const facRow = h('div', { class: 'chip-row' }, ...FACILITIES.map(f => chip(f.th, a.facilities.includes(f.id), () => { toggle(a.facilities, f.id); rerender(); })));
  const mealRow = h('div', { class: 'chip-row' }, ...MEALS.map(m => chip(m.th, a.meal === m.id, () => { a.meal = m.id; rerender(); })));
  const nearRow = h('div', { class: 'chip-row' }, ...NEARBY.map(n => chip(n.th, a.nearby.includes(n.id), () => { toggle(a.nearby, n.id); rerender(); })));
  const timeSel = (val, on) => { const s = h('select'); for (let hh = 0; hh < 24; hh++) { const t = String(hh).padStart(2, '0') + ':00'; s.append(h('option', { value: t, selected: t === val }, t)); } s.addEventListener('change', () => on(s.value)); return s; };

  return h('div', {},
    field(TEXT.intake.facilities, facRow),
    field(TEXT.intake.meal, mealRow),
    field(TEXT.intake.nearby, nearRow),
    field(TEXT.intake.nearbyOther, textInput(a.nearbyOther, v => a.nearbyOther = v)),
    h('div', { style: 'display:flex;gap:12px' },
      field(TEXT.intake.checkin, timeSel(a.checkin, v => a.checkin = v)),
      field(TEXT.intake.checkout, timeSel(a.checkout, v => a.checkout = v)),
    ),
    h('div', { style: 'display:flex;gap:12px' },
      field(TEXT.intake.smoking, h('div', { class: 'toggle-row' },
        h('div', { class: 'seg' + (a.smoking ? ' on' : ''), on: { click: () => { a.smoking = true; rerender(); } } }, TEXT.intake.yes),
        h('div', { class: 'seg' + (!a.smoking ? ' on' : ''), on: { click: () => { a.smoking = false; rerender(); } } }, TEXT.intake.no))),
      field(TEXT.intake.pets, h('div', { class: 'toggle-row' },
        h('div', { class: 'seg' + (a.pets ? ' on' : ''), on: { click: () => { a.pets = true; rerender(); } } }, TEXT.intake.yes),
        h('div', { class: 'seg' + (!a.pets ? ' on' : ''), on: { click: () => { a.pets = false; rerender(); } } }, TEXT.intake.no))),
    ),
    field(TEXT.intake.tellMore, textArea(a.note, v => a.note = v, 200)),
    h('hr', { style: 'border:0;border-top:1px solid var(--line);margin:14px 0' }),
    field(TEXT.intake.contactName, textInput(work.owner.name, v => work.owner.name = v)),
    field(TEXT.intake.phone, textInput(c.phone, v => c.phone = v, { inputmode: 'tel' })),
    field(TEXT.intake.email, textInput(c.email, v => c.email = v, { type: 'email' })),
    field(TEXT.intake.lineId, textInput(c.line, v => c.line = v)),
    field(TEXT.intake.licence, textInput(c.licence, v => c.licence = v)),
    (() => {
      const cb = h('input', { type: 'checkbox' }); cb.checked = !!work.pdpa;
      cb.addEventListener('change', () => { work.pdpa = cb.checked; updateFoot(); });
      return h('label', { style: 'display:flex;gap:8px;align-items:flex-start;font-size:13px;margin-top:6px' }, cb, h('span', {}, TEXT.intake.pdpa));
    })(),
  );
}

function toggle(arr, id) { const i = arr.indexOf(id); if (i >= 0) arr.splice(i, 1); else arr.push(id); }

// ---------- validation gates ----------
function step1Valid() {
  const p = work.place;
  if (!p.name || p.name.length < 3 || p.name.length > 60) return false;
  if (!p.province || !p.address) return false;
  if (p.postcode && !/^\d{5}$/.test(p.postcode)) return false;
  return work.rooms.every(r => r.price >= 100 && r.price <= 20000 && r.maxGuests >= 1 && r.beds.length);
}
function step2Valid() { return work.photos.length >= 1; }
function step3Valid() {
  const c = work.contact;
  const phoneOk = /^0[689]\d{8}$/.test((c.phone || '').replace(/[\s-]/g, '')) || /^0[2-7]\d{7}$/.test((c.phone || '').replace(/[\s-]/g, ''));
  return phoneOk && work.pdpa;
}
function stepValid() { return step === 1 ? step1Valid() : step === 2 ? step2Valid() : step3Valid(); }

// ---------- shell ----------
let footEl = null;
function updateFoot() {
  if (!footEl) return;
  const nextBtn = footEl.querySelector('.foot-next');
  if (nextBtn) nextBtn.disabled = !stepValid();
}

export function intakeScreen(state) {
  ensureWork();
  const bodyEl = h('div', { class: 'sheet-body' });
  // re-check the Next/Submit button as the owner types (text inputs don't re-render the step)
  bodyEl.addEventListener('input', () => updateFoot());
  bodyEl.addEventListener('change', () => updateFoot());
  const dots = h('div', { class: 'step-dots' }, h('i', { class: step >= 1 ? 'on' : '' }), h('i', { class: step >= 2 ? 'on' : '' }), h('i', { class: step >= 3 ? 'on' : '' }));
  const stepTitle = h('span', { class: 's-step' }, `${step} / 3`);

  const rerender = () => { renderBody(); };
  function renderBody() {
    bodyEl.replaceChildren(step === 1 ? step1(rerender) : step === 2 ? step2(rerender) : step3(rerender));
    dots.children[0].className = step >= 1 ? 'on' : '';
    dots.children[1].className = step >= 2 ? 'on' : '';
    dots.children[2].className = step >= 3 ? 'on' : '';
    stepTitle.textContent = `${step} / 3`;
    buildFoot();
    updateFoot();
  }

  const foot = h('div', { class: 'sheet-foot' });
  footEl = foot;
  function buildFoot() {
    const back = h('button', { class: 'btn ghost', on: { click: () => { if (step > 1) { step--; renderBody(); } } } }, TEXT.intake.back);
    if (step === 3) {
      const submit = h('button', { class: 'btn primary foot-next', disabled: !stepValid(), on: { click: onSubmit } }, TEXT.intake.submit);
      foot.replaceChildren(back, submit);
    } else {
      const next = h('button', { class: 'btn primary foot-next', disabled: !stepValid(), on: { click: () => { step++; renderBody(); } } }, TEXT.intake.next);
      foot.replaceChildren(back, next);
    }
  }

  function onSubmit() {
    setState({ intake: JSON.parse(JSON.stringify(work)), intakeStep: step });
    resetIntakeWork();
    go('generating');
    startGeneration();
  }

  const sheet = h('div', { class: 'sheet' },
    h('div', { class: 'sheet-head' },
      h('span', { class: 's-title' }, TEXT.intake.title),
      stepTitle,
      h('button', { class: 'x', title: 'ปิด', on: { click: () => { setState({ intake: JSON.parse(JSON.stringify(work)) }); resetIntakeWork(); go('chat'); } } }, '✕'),
    ),
    dots,
    bodyEl,
    foot,
  );
  renderBody();
  return sheet;
}
