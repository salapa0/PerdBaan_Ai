<<<<<<< HEAD
// S6 — AI connection coach (LIFF page), 6 sub-steps driven by state.agoda.step.
import { h, toast, icon, logo, TEXT } from '../ui/ui.js';
import { getState, setState } from '../state.js';
import { botSay } from '../ui/chat.js';
import { go } from '../router.js';
import { CONFIG } from '../config.js';
import { agodaScreens } from '../data/agodaFields.js';
import { coachScreenshot } from '../ai/coach.js';
import { checkAgodaLink } from '../rules/checkAgodaLink.js';
import { resize, rasterize, toBase64 } from '../rules/photoEdit.js';
import { sampleListingLink } from '../data/demoHomestay.js';

const SIGNUP_SCREENS = agodaScreens.map(s => ({ id: s.screen, name: s.name_th, file: `public/agoda/${s.screen}.${CONFIG.agodaScreenExt}` }));
const STEP_NAMES = ['ตรวจความพร้อม', 'เปิดหน้าสมัคร', 'การ์ดสำหรับคัดลอก', 'ถาม AI จากภาพหน้าจอ', 'ขั้นที่คุณทำเอง', 'วางลิงก์ประกาศ'];

function setStep(n, extra = {}) {
  const ag = getState().agoda;
  setState({ agoda: { ...ag, status: 'connecting', step: n, ...extra } });
}

function copy(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
  return Promise.resolve(false);
}

const modalRoot = () => document.getElementById('modal-root');
const closeModal = () => modalRoot().replaceChildren();

// ---------- full-screen image viewer (also used offline for "view listing") ----------
export function openImageViewer(src, banner, { screens, startIdx = 0, onDone } = {}) {
  let idx = startIdx;
  const img = h('img', { src: screens ? screens[idx].file : src, alt: '' });
  const cap = h('div', { class: 'v-cap' }, '');
  const imgBox = h('div', { class: 'v-img' }, img);
  const paint = () => { if (screens) { img.src = screens[idx].file; cap.textContent = `${idx + 1} / ${screens.length} · ${screens[idx].name}`; imgBox.scrollTop = 0; } };
  paint();
  const foot = screens
    ? h('div', { class: 'v-foot' },
        h('button', { class: 'btn ghost', 'aria-label': 'previous', on: { click: () => { idx = (idx - 1 + screens.length) % screens.length; paint(); } } }, icon('back', 18)),
        h('button', { class: 'btn ghost', 'aria-label': 'next', on: { click: () => { idx = (idx + 1) % screens.length; paint(); } } }, icon('chevronRight', 18)),
        h('button', { class: 'btn primary', style: 'flex:2', on: { click: () => { closeModal(); onDone && onDone(); } } }, 'เข้าใจแล้ว'))
    : h('div', { class: 'v-foot' }, h('button', { class: 'btn primary block', on: { click: closeModal } }, 'ปิด'));
  modalRoot().replaceChildren(h('div', { class: 'viewer' }, h('div', { class: 'v-banner' }, banner), imgBox, cap, foot));
}

// ---------- copy card ----------
function copyCardEl(card, pulse = false) {
  const val = h('div', { class: 'cc-val' }, card.value || '—');
  const more = (card.value || '').length > 70
    ? h('button', { class: 'cc-more', on: { click: () => { val.classList.toggle('expand'); more.textContent = val.classList.contains('expand') ? TEXT.coach.seeLess : TEXT.coach.seeAll; } } }, TEXT.coach.seeAll)
    : h('span');
  const ok = h('span', { class: 'ok' }, icon('check', 14));
  const btn = h('button', { class: 'btn outline sm', on: { click: async () => {
    const done = await copy(card.value);
    toast(done ? TEXT.coach.copied : TEXT.clipboardFail);
    if (done) ok.classList.add('show');
  } } }, icon('copy', 15), TEXT.coach.copyBtn);
  return h('div', { class: 'copycard' + (pulse ? ' pulse' : '') },
    h('div', { class: 'cc-label' }, card.label_th, ok),
    val,
    h('div', { class: 'cc-row' }, more, card.hintOnly ? h('span', { class: 'cc-hint' }, 'กรอกเองจากเอกสาร') : btn),
  );
}

// ---------- sub-steps ----------
function stepReadiness() {
  const ICONS = { id: 'idCard', bank: 'book', phone: 'phone', email: 'mail' };
  const rows = Object.entries(TEXT.coach.readyDocs).map(([k, label]) =>
    h('div', { class: 'ready-row' }, h('span', { class: 'ic-box' }, icon(ICONS[k] || 'check', 19)), h('span', {}, label), h('span', { class: 'tick' }, icon('check', 14))));
  return h('div', { class: 'coach-body' },
    h('div', { class: 'coach-intro' }, 'เตรียมสิ่งเหล่านี้ไว้ข้างตัวก่อนเริ่มสมัคร Agoda'),
    ...rows,
    h('button', { class: 'btn primary block', style: 'margin-top:6px', on: { click: () => setStep(2) } }, TEXT.coach.readyBtn));
}

function stepOpenSignup() {
  return h('div', { class: 'coach-body' },
    h('div', { class: 'info-card' }, TEXT.coach.signupIntro),
    h('button', { class: 'btn primary block', on: { click: () => openImageViewer(null, TEXT.coach.banner, { screens: SIGNUP_SCREENS, onDone: () => setStep(3) }) } }, icon('external', 18), TEXT.coach.openSignup));
}

function stepCopyCards() {
  const cards = getState().copyCards || [];
  const groups = {};
  for (const c of cards) { (groups[c.screen] ||= { name: c.screen_th, items: [] }).items.push(c); }
  return h('div', { class: 'coach-body' },
    h('div', { class: 'coach-intro' }, 'คัดลอกการ์ดไปวางในหน้าสมัคร Agoda ตามลำดับหน้าจอ'),
    ...Object.values(groups).map(g => h('div', { class: 'copy-group' }, h('div', { class: 'cg-title' }, g.name), ...g.items.map(c => copyCardEl(c)))),
    h('button', { class: 'btn primary block', on: { click: () => setStep(4) } }, TEXT.coach.next));
}

function stepScreenshot() {
  const log = h('div', { class: 'coach-chat' });
  const av = () => h('div', { class: 'av' }, logo(30));

  function renderLog() {
    const turns = getState().agoda.coachLog;
    const typing = turns.some(t => t.source === 'pending');
    log.replaceChildren();
    if (!turns.length && !typing) log.append(h('div', { class: 'empty' }, 'ยังไม่มีภาพหน้าจอ กดปุ่มด้านล่างเพื่อส่งภาพหน้าที่ติดอยู่'));
    for (const turn of turns) {
      if (turn.thumbUrl) log.append(h('div', { class: 'msg me' }, h('div', { class: 'bubble me img' }, h('img', { src: turn.thumbUrl, alt: '' }))));
      if (turn.source === 'pending') continue;
      if (turn.explanation_th) {
        log.append(h('div', { class: 'msg bot' }, av(), h('div', { class: 'bubble bot' }, turn.explanation_th)));
        const matched = (getState().copyCards || []).filter(c => (turn.cardIds || []).includes(c.id));
        if (matched.length) log.append(h('div', { class: 'coach-cards' }, ...matched.map(c => copyCardEl(c, true))));
        if (turn.next_step_th) log.append(h('div', { class: 'msg bot' }, av(), h('div', { class: 'bubble bot tip' }, TEXT.coach.next + ': ' + turn.next_step_th)));
      } else {
        log.append(h('div', { class: 'msg bot' }, av(), h('div', { class: 'bubble bot' }, TEXT.coach.cantRead)));
      }
    }
    if (typing) log.append(h('div', { class: 'msg bot' }, av(), h('div', { class: 'typing' }, h('span'), h('span'), h('span'))));
  }
  renderLog();

  async function analyze({ base64, fileName, thumbUrl }) {
    const id = 'coach' + Date.now();
    const cur = getState().agoda;
    setState({ agoda: { ...cur, coachLog: [...cur.coachLog, { id, thumbUrl, screenId: null, source: 'pending', ts: Date.now() }] } });
    const res = await coachScreenshot({ base64, fileName }, getState().copyCards, cur.step);
    const ag2 = getState().agoda;
    const entry = { id, thumbUrl, screenId: res.screen_id, source: res.source, ms: res.ms, cardIds: res.card_ids, explanation_th: res.explanation_th, next_step_th: res.next_step_th, fileName, ts: Date.now() };
    setState({ agoda: { ...ag2, coachLog: ag2.coachLog.map(t => t.id === id ? entry : t) } });
  }

  function openPicker() {
    const thumbs = SIGNUP_SCREENS.map(s =>
      h('div', { class: 'ss-thumb', on: { click: async () => {
        closeModal();
        try {
          const blob = await (await fetch(s.file)).blob();
          const png = await rasterize(blob, 1280);       // vision model needs a bitmap
          analyze({ base64: await toBase64(png), fileName: s.id, thumbUrl: s.file });
        } catch { analyze({ base64: null, fileName: s.id, thumbUrl: s.file }); }
      } } }, h('img', { src: s.file, alt: '' }), h('div', { class: 'ss-cap' }, s.name)));
    const fileInput = h('input', { type: 'file', accept: 'image/*', style: 'display:none' });
    fileInput.addEventListener('change', async () => {
      const f = fileInput.files[0]; closeModal(); if (!f) return;
      try {
        const small = await resize(f, 1280);
        analyze({ base64: await toBase64(small), fileName: f.name, thumbUrl: URL.createObjectURL(small) });
      } catch { toast('อ่านรูปไม่สำเร็จ'); }
    });
    modalRoot().replaceChildren(h('div', { class: 'sheet' },
      h('div', { class: 'sheet-grab' }),
      h('div', { class: 'sheet-head' }, h('span', { class: 's-title' }, TEXT.coach.askAi), h('button', { class: 'icon-btn', 'aria-label': 'close', on: { click: closeModal } }, icon('close', 20))),
      h('div', { class: 'sheet-body' },
        h('div', { class: 'coach-intro', style: 'margin-bottom:12px' }, 'เลือกภาพหน้าจอที่เตรียมไว้ หรือเลือกไฟล์จากเครื่อง'),
        h('div', { class: 'ss-picker' }, ...thumbs),
        h('button', { class: 'btn ghost block', style: 'margin-top:12px', on: { click: () => fileInput.click() } }, icon('image', 18), TEXT.coach.pickFile),
        fileInput,
      ),
    ));
  }

  return h('div', { class: 'coach-body' },
    h('div', { class: 'coach-intro' }, 'ติดหน้าไหน ส่งภาพหน้าจอมา AI จะอธิบายเป็นภาษาไทยและบอกว่าต้องวางการ์ดไหน'),
    log,
    h('button', { class: 'btn primary block', on: { click: openPicker } }, icon('camera', 18), TEXT.coach.askAi),
    h('button', { class: 'btn ghost block', on: { click: () => setStep(5) } }, TEXT.coach.next));
}

function stepOwnerOnly() {
  return h('div', { class: 'coach-body' },
    h('div', { class: 'note-amber', style: 'font-size:14.5px;display:flex;gap:10px' }, icon('lock', 20), h('span', {}, TEXT.coach.otpCard)),
    h('button', { class: 'btn primary block', on: { click: () => setStep(6) } }, TEXT.coach.otpDone));
}

function stepPasteLink() {
  const input = h('input', { type: 'text', class: 'inp', placeholder: 'https://www.agoda.com/...', value: '' });
  const err = h('div', { class: 'err', hidden: true });
  const tryCheck = async () => {
    const r = checkAgodaLink(input.value);
    if (!r.ok) { err.textContent = r.reason_th; err.hidden = false; return; }
    err.hidden = true;
    const ag = getState().agoda;
    setState({ agoda: { ...ag, status: 'waiting_check', step: 6, listingUrl: r.url }, stage: 'waiting' });
    await botSay(TEXT.waitingMsg);
  };
  const pasteBtn = h('button', { class: 'btn ghost', on: { click: async () => {
    try { input.value = await navigator.clipboard.readText(); } catch { toast('วางเองได้เลย'); }
  } } }, TEXT.coach.paste);
  return h('div', { class: 'coach-body' },
    h('div', { class: 'field', style: 'margin:0' }, h('label', {}, TEXT.coach.pasteLabel),
      h('div', { style: 'display:flex;gap:8px' }, input, pasteBtn), err),
    h('button', { class: 'btn ghost sm', style: 'align-self:flex-start', on: { click: () => { input.value = sampleListingLink; } } }, icon('link', 15), 'ใช้ลิงก์ตัวอย่าง (เดโม)'),
    h('button', { class: 'btn primary block', on: { click: tryCheck } }, TEXT.coach.checkLink));
}

export function coachScreen(state) {
  const step = Math.min(6, Math.max(1, state.agoda.step || 1));
  const bodyMap = { 1: stepReadiness, 2: stepOpenSignup, 3: stepCopyCards, 4: stepScreenshot, 5: stepOwnerOnly, 6: stepPasteLink };
  return h('div', { class: 'page' },
    h('div', { class: 'coach-progress' },
      h('div', { class: 'cp-row' },
        h('button', { on: { click: () => go('connections') } }, icon('back', 15), 'การเชื่อมต่อ'),
        h('span', {}, `${TEXT.coach.step(step)} · ${STEP_NAMES[step - 1]}`)),
      h('div', { class: 'progress' }, h('i', { style: `width:${(step / 6) * 100}%` })),
    ),
    (() => {
      const body = h('div', { class: 'page-body' }, bodyMap[step]());
      // on the screenshot step, keep the newest AI answer in view
      if (step === 4 && state.agoda.coachLog.length) requestAnimationFrame(() => { body.scrollTop = body.scrollHeight; });
      return body;
    })(),
=======
// Per-step coach panel (text question + optional screenshot). Owner: B (AI and logic)
import { h, toast } from '../ui/dom.js';
import { getState, update } from '../ui/store.js';
import { askCoach } from '../ai/coach.js';

let pending = null; // step id waiting for an answer

export function coachPanel(step) {
  const s = getState();
  const thread = s.connect.coach[step.id] || [];
  const input = h('input', { type: 'text', placeholder: 'ถามโค้ช หรือแนบภาพหน้าจอ', 'aria-label': 'ถามโค้ช' });
  const file = h('input', { type: 'file', accept: 'image/*', hidden: true });

  const send = async (image) => {
    const question = input.value.trim();
    if (pending) return;
    if (!question && !image) return toast('พิมพ์คำถามหรือแนบภาพก่อนนะคะ');
    pending = step.id;
    update((st) => {
      (st.connect.coach[step.id] ||= []).push({ from: 'me', text: image ? `📷 ส่งภาพหน้าจอ${question ? ` · ${question}` : ''}` : question });
    });
    const reply = await askCoach({ step, listing: getState().listing, question, image });
    pending = null;
    update((st) => st.connect.coach[step.id].push({ from: 'bot', text: reply.text, src: reply.src }));
  };

  file.addEventListener('change', () => file.files[0] && send(file.files[0]));

  return h('div', { class: 'coach' },
    h('div', { class: 'coach-title' }, '🤖 โค้ชเชื่อม Agoda'),
    thread.map((m) => h('div', { class: `cmsg ${m.from}` }, m.text, m.src ? h('small', {}, m.src === 'ai' ? ' · AI ในเครื่อง' : ' · คำตอบสำรอง') : null)),
    pending === step.id ? h('div', { class: 'cmsg bot typing' }, 'กำลังดูให้ค่ะ…') : null,
    h('form', { class: 'composer', onsubmit: (e) => { e.preventDefault(); send(null); input.value = ''; } },
      input,
      h('button', { type: 'button', class: 'ghost', onclick: () => file.click(), 'aria-label': 'แนบภาพหน้าจอ' }, '📷'),
      h('button', { class: 'send', type: 'submit' }, 'ถาม'),
    ),
    file,
>>>>>>> parent of 1b829a5 (ver1 of 1)
  );
}
