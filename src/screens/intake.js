<<<<<<< HEAD
// Chat + guided intake. Owner: A (frontend)
import { h, toast } from '../ui/dom.js';
import { getState, update, botMsg, meMsg } from '../ui/store.js';
import { QUESTIONS } from '../data/questions.js';
import { addPhotos, countPhotos } from '../ui/photos.js';
import { demoPhotoFiles } from '../../content/demo-photos.js';
import { generateAndStore } from '../ui/actions.js';
import { LANG_LABEL } from '../data/shapes.js';

let picked = []; // multi-choice draft (not saved until the owner confirms)
let uploading = false;

function answer(q, value, echoText) {
  update((s) => {
    s.answers[q.key] = value;
    meMsg(s, echoText ?? String(value));
    s.qIndex++;
    const next = QUESTIONS[s.qIndex];
    if (next) botMsg(s, next.ask(s.answers));
  });
}

function textBox(q) {
  const input = h('input', { type: q.kind === 'number' ? 'number' : 'text', placeholder: q.placeholder || '', min: 1, inputmode: q.kind === 'number' ? 'numeric' : 'text', 'aria-label': 'ตอบคำถาม' });
  const form = h(
    'form',
    {
      class: 'composer',
      onsubmit: (e) => {
        e.preventDefault();
        const raw = input.value.trim();
        if (!raw && !q.optional) return toast('พิมพ์คำตอบก่อนนะคะ');
        if (q.kind === 'number') {
          const n = Number(raw);
          if (!(n > 0)) return toast('ใส่ตัวเลขที่มากกว่า 0 ค่ะ');
          return answer(q, n, `${n} ${q.unit || ''}`.trim());
        }
        answer(q, raw, q.echo ? q.echo(raw) : raw);
      },
    },
    input,
    q.unit ? h('span', { class: 'unit' }, q.unit) : null,
    h('button', { class: 'send', type: 'submit' }, 'ส่ง'),
    q.optional ? h('button', { type: 'button', class: 'ghost', onclick: () => answer(q, '', '(ข้ามไป)') }, 'ข้าม') : null,
  );
  setTimeout(() => input.focus(), 0);
  return form;
}

function multiBox(q) {
  const chips = q.options.map((o) =>
    h('button', {
      type: 'button',
      class: 'chip' + (picked.includes(o.key) ? ' on' : ''),
      onclick: (e) => {
        picked = picked.includes(o.key) ? picked.filter((k) => k !== o.key) : [...picked, o.key];
        e.currentTarget.classList.toggle('on');
      },
    }, o.th),
  );
  return h('div', { class: 'composer col' }, h('div', { class: 'chips' }, chips), h('button', {
    class: 'send wide',
    onclick: () => {
      const v = picked;
      picked = [];
      answer(q, v, q.echo(v));
    },
  }, 'ยืนยันตัวเลือก'));
}

function photoBox(q) {
  const s = getState();
  const n = s.answers.photoCount || 0;
  const file = h('input', { type: 'file', accept: 'image/*', multiple: true, hidden: true });
  const add = async (files) => {
    if (uploading || !files.length) return;
    uploading = true;
    toast('กำลังบันทึกรูป...');
    try {
      const total = await addPhotos(files);
      update((st) => (st.answers.photoCount = total));
    } catch (e) {
      console.error(e);
      toast('บันทึกรูปไม่สำเร็จ ลองใหม่อีกครั้ง');
    }
    uploading = false;
  };
  file.addEventListener('change', () => add([...file.files]));
  return h('div', { class: 'composer col' },
    h('div', { class: 'hint' }, n ? `เลือกรูปแล้ว ${n} รูป` : 'ยังไม่มีรูป'),
    h('div', { class: 'row' },
      h('button', { class: 'ghost', onclick: () => file.click() }, '📷 เลือกรูป'),
      h('button', { class: 'ghost', onclick: async () => add(await demoPhotoFiles()) }, 'ใช้รูปตัวอย่าง'),
    ),
    file,
    h('button', { class: 'send wide', disabled: n === 0 ? true : null, onclick: async () => answer(q, await countPhotos(), q.echo(await countPhotos())) }, 'ถัดไป'),
  );
}

function composer(s) {
  if (s.stage === 'generating') return null;
  if (s.stage !== 'intake') {
    return h('div', { class: 'composer col' }, h('button', { class: 'send wide', onclick: () => update((st) => (st.tab = st.stage === 'live' ? 'live' : st.approved ? 'connect' : 'preview')) }, 'ไปต่อ →'));
  }
  const q = QUESTIONS[s.qIndex];
  if (!q) return null;
  if (q.kind === 'multi') return multiBox(q);
  if (q.kind === 'photos') return photoBox(q);
  if (q.kind === 'confirm') {
    return h('div', { class: 'composer col' }, h('button', { class: 'send wide', onclick: () => generateAndStore() }, 'เขียนประกาศให้เลย ✨'));
  }
  return textBox(q);
}

export function render(root, s) {
  if (!s.chat.length) {
    update((st) => botMsg(st, QUESTIONS[0].ask(st.answers)));
    return;
  }
  const list = h('div', { class: 'chat' },
    s.chat.map((m) => h('div', { class: `msg ${m.from}` }, m.from === 'bot' ? h('div', { class: 'avatar' }, '🏡') : null, h('div', { class: 'bubble' }, m.text))),
    s.stage === 'generating'
      ? h('div', { class: 'msg bot' }, h('div', { class: 'avatar' }, '🏡'), h('div', { class: 'bubble typing' }, `กำลังเขียนประกาศ${s.busy?.lang ? ` (${LANG_LABEL[s.busy.lang]})` : ''}…`))
      : null,
  );
  root.replaceChildren(list, composer(s) || '');
  list.scrollTop = list.scrollHeight;
=======
// S2 — intake form, 3 steps (place+rooms, photos, questions+contact).
import { h, chip, stepper, toast, icon, TEXT } from '../ui/ui.js';
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
    (getState().intake && work.rooms.length > 1) ? h('button', { class: 'rm-del', title: 'ลบ', on: { click: () => { work.rooms.splice(idx, 1); rerender(); } } }, icon('trash', 16)) : null,
    field(TEXT.intake.roomType, typeChips),
    field(TEXT.intake.roomName, textInput(room.name, v => room.name = v)),
    h('div', { style: 'display:flex;gap:14px;flex-wrap:wrap' },
      field(TEXT.intake.roomCount, stepper(room.count, 1, 8, v => { room.count = v; updateSummary(); })),
      field(TEXT.intake.maxGuests, stepper(room.maxGuests, 1, 10, v => { room.maxGuests = v; updateSummary(); })),
    ),
    field(TEXT.intake.beds + ' <span class="hint">(แตะเพื่อเพิ่มจำนวน)</span>', bedChips),
    field(TEXT.intake.price, textInput(room.price, v => room.price = Number(v) || 0, { type: 'number', inputmode: 'numeric' })),
    h('div', { class: 'row2' },
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
    h('div', { class: 'row2' },
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
  { slot: 'front', th: 'ด้านหน้าบ้าน', hint: 'ถ่ายตอนกลางวัน เห็นทั้งหลัง', ic: 'home' },
  { slot: 'bedroom', th: 'ห้องนอน', hint: 'เปิดไฟ จัดเตียงให้เรียบร้อย', ic: 'bed' },
  { slot: 'bathroom', th: 'ห้องน้ำ', hint: 'เช็ดให้แห้ง เปิดไฟ', ic: 'shower' },
  { slot: 'view', th: 'วิวรอบบ้าน', hint: 'ถ่ายจุดที่สวยที่สุด', ic: 'mountain' },
  { slot: 'food', th: 'อาหาร', hint: 'จานจริงที่เสิร์ฟแขก', ic: 'food' },
  { slot: 'activity', th: 'กิจกรรม', hint: 'สิ่งที่แขกทำได้', ic: 'bike' },
];

async function paintThumb(img, photoId) {
  const url = await photoURL(photoId);
  if (url) img.src = url;
}

// one photo tile: empty slot (tap to add) or filled (remove / brighten)
function photoTile(existing, label, rerender, emptyDef) {
  if (existing) {
    const img = h('img', { alt: '' });
    paintThumb(img, existing.id);
    return h('div', { class: 'slot filled' },
      img,
      h('button', { class: 'slot-bright', title: TEXT.intake.brighten, on: { click: async (e) => { e.stopPropagation(); await brightenPhoto(existing.id); toast('ปรับแสงแล้ว'); rerender(); } } }, icon('sun', 15), TEXT.intake.brighten),
      h('button', { class: 'slot-x', 'aria-label': 'ลบรูป', on: { click: (e) => { e.stopPropagation(); deletePhoto(existing.id); work.photos = work.photos.filter(p => p !== existing); rerender(); } } }, icon('close', 15)),
      h('div', { class: 'slot-label' }, label),
    );
  }
  const tile = h('div', { class: 'slot' },
    icon(emptyDef.ic, 26),
    h('div', { class: 'slot-name' }, emptyDef.th),
    emptyDef.hint ? h('div', { class: 'slot-hint' }, emptyDef.hint) : null);
  tile.addEventListener('click', () => pickPhoto(emptyDef.slot, rerender));
  return tile;
}

function slotTile(def, rerender) {
  return photoTile(work.photos.find(p => p.slot === def.slot), def.th, rerender, def);
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
      if (slot !== 'extra') work.photos = work.photos.filter(p => p.slot !== slot);
      work.photos.push({ id, slot });
      rerender();
    } catch (e) { toast('อัปโหลดรูปไม่สำเร็จ'); }
  });
  inp.click();
}

function step2(rerender) {
  const grid = h('div', { class: 'slot-grid' }, ...SLOTS.map(d => slotTile(d, rerender)));
  const known = SLOTS.map(d => d.slot);
  const extras = work.photos.filter(p => !known.includes(p.slot));
  const count = work.photos.length;
  const extraTiles = extras.map((p, i) => photoTile(p, `รูปเพิ่มเติม ${i + 1}`, rerender));
  if (count < 10) extraTiles.push(photoTile(null, '', rerender, { slot: 'extra', th: 'เพิ่มรูป', hint: '', ic: 'photoPlus' }));
  return h('div', {},
    grid,
    h('div', { class: 'sub-title' }, 'รูปเพิ่มเติม'),
    h('div', { class: 'slot-grid' }, ...extraTiles),
    h('div', { class: 'photo-counter' }, `${count} / 10 รูป`),
    count < 5 ? h('div', { class: 'note-amber' }, TEXT.intake.under5) : null,
  );
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
    h('div', { class: 'row2' },
      field(TEXT.intake.checkin, timeSel(a.checkin, v => a.checkin = v)),
      field(TEXT.intake.checkout, timeSel(a.checkout, v => a.checkout = v)),
    ),
    h('div', { class: 'row2' },
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
      return h('label', { class: 'pdpa' }, cb, h('span', {}, TEXT.intake.pdpa));
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

// called by the LIFF header's close button: keep what was typed, go back to the chat
export function saveIntakeWork() {
  if (work) setState({ intake: JSON.parse(JSON.stringify(work)), intakeStep: step });
  resetIntakeWork();
}

const STEP_TITLES = [TEXT.intake.s1, TEXT.intake.s2, TEXT.intake.s3];

export function intakeScreen(state) {
  ensureWork();
  const bodyEl = h('div', { class: 'page-body' });
  // re-check the Next/Submit button as the owner types (text inputs don't re-render the step)
  bodyEl.addEventListener('input', () => updateFoot());
  bodyEl.addEventListener('change', () => updateFoot());

  const rerender = () => { const y = bodyEl.scrollTop; renderBody(); bodyEl.scrollTop = y; };
  function renderBody() {
    bodyEl.replaceChildren(
      h('div', { class: 'step-head' },
        h('span', { class: 'st-title' }, STEP_TITLES[step - 1]),
        h('span', { class: 'st-count' }, `ขั้น ${step} / 3`)),
      h('div', { class: 'step-dots' }, ...[1, 2, 3].map(n => h('i', { class: step >= n ? 'on' : '' }))),
      step === 1 ? step1(rerender) : step === 2 ? step2(rerender) : step3(rerender),
    );
    buildFoot();
    updateFoot();
  }

  const foot = h('div', { class: 'page-foot' });
  footEl = foot;
  function buildFoot() {
    const back = h('button', { class: 'btn ghost', disabled: step === 1, on: { click: () => { if (step > 1) { step--; renderBody(); bodyEl.scrollTop = 0; } } } }, TEXT.intake.back);
    const next = step === 3
      ? h('button', { class: 'btn primary foot-next', disabled: !stepValid(), on: { click: onSubmit } }, TEXT.intake.submit)
      : h('button', { class: 'btn primary foot-next', disabled: !stepValid(), on: { click: () => { step++; renderBody(); bodyEl.scrollTop = 0; } } }, TEXT.intake.next);
    foot.replaceChildren(back, next);
  }

  function onSubmit() {
    setState({ intake: JSON.parse(JSON.stringify(work)), intakeStep: step });
    resetIntakeWork();
    go('generating');
    startGeneration();
  }

  renderBody();
  return h('div', { class: 'page' }, bodyEl, foot);
>>>>>>> 447771f9d51be470a567afa55bbb068f5d6b55bb
}
