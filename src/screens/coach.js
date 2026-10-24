// S6 — AI connection coach, 6 sub-steps driven by state.agoda.step.
import { h, toast, TEXT } from '../ui/ui.js';
import { getState, setState } from '../state.js';
import { botSay } from '../ui/chat.js';
import { go } from '../router.js';
import { agodaScreens } from '../data/agodaFields.js';
import { coachScreens } from '../data/coachScreens.js';
import { coachScreenshot } from '../ai/coach.js';
import { checkAgodaLink } from '../rules/checkAgodaLink.js';
import { resize, toBase64 } from '../rules/photoEdit.js';
import { sampleListingLink } from '../data/demoHomestay.js';

const SIGNUP_SCREENS = agodaScreens.map(s => ({ id: s.screen, name: s.name_th, file: `public/agoda/${s.screen}.png` }));

function setStep(n, extra = {}) {
  const ag = getState().agoda;
  setState({ agoda: { ...ag, status: 'connecting', step: n, ...extra } });
}

function copy(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
  return Promise.resolve(false);
}

// ---------- shared image viewer (also used offline for "view listing") ----------
export function openImageViewer(src, banner, { screens, startIdx = 0, onDone } = {}) {
  const root = document.getElementById('modal-root');
  let idx = startIdx;
  const img = h('img', { src: screens ? screens[idx].file : src, alt: '' });
  const cap = h('div', { style: 'color:#cbd5e1;font-size:12px;text-align:center;padding:4px' }, screens ? screens[idx].name : '');
  const paint = () => { if (screens) { img.src = screens[idx].file; cap.textContent = `${idx + 1}/${screens.length} · ${screens[idx].name}`; } };
  paint();
  const close = () => root.replaceChildren();
  const foot = screens
    ? h('div', { class: 'v-foot' },
        h('button', { class: 'btn ghost', on: { click: () => { idx = (idx - 1 + screens.length) % screens.length; paint(); } } }, '‹ ก่อนหน้า'),
        h('button', { class: 'btn ghost', on: { click: () => { idx = (idx + 1) % screens.length; paint(); } } }, 'ถัดไป ›'),
        h('button', { class: 'btn primary', on: { click: () => { close(); onDone && onDone(); } } }, 'เข้าใจแล้ว'))
    : h('div', { class: 'v-foot' }, h('button', { class: 'btn primary block', on: { click: close } }, 'ปิด'));
  root.replaceChildren(h('div', { class: 'viewer' },
    h('div', { class: 'v-banner' }, banner),
    h('div', { class: 'v-img' }, img),
    cap,
    foot,
  ));
}

// ---------- copy card ----------
function copyCardEl(card, pulse = false) {
  const val = h('div', { class: 'cc-val' }, card.value || '—');
  const more = (card.value || '').length > 70
    ? h('button', { class: 'cc-more', on: { click: () => { val.classList.toggle('expand'); more.textContent = val.classList.contains('expand') ? TEXT.coach.seeLess : TEXT.coach.seeAll; } } }, TEXT.coach.seeAll)
    : null;
  const tick = h('span', { style: 'color:var(--line-green);font-weight:700;display:none' }, ' ✓');
  const btn = h('button', { class: 'btn outline sm', disabled: card.hintOnly, on: { click: async () => {
    const ok = await copy(card.value);
    toast(ok ? TEXT.coach.copied : TEXT.clipboardFail);
    if (ok) tick.style.display = 'inline';
  } } }, TEXT.coach.copyBtn);
  return h('div', { class: 'copycard' + (pulse ? ' pulse' : '') },
    h('div', { class: 'cc-label' }, card.label_th, tick),
    val, more,
    h('div', { class: 'cc-row' }, h('span'), card.hintOnly ? h('span', { style: 'font-size:11px;color:#888' }, card.value) : btn),
  );
}

// ---------- sub-steps ----------
function stepReadiness() {
  const rows = Object.entries(TEXT.coach.readyDocs).map(([k, label]) =>
    h('div', { class: 'ready-row' }, h('span', { class: 'tick' }, '✓'), h('span', {}, label)));
  return h('div', {}, h('div', { style: 'font-weight:700;margin-bottom:6px' }, TEXT.coach.readyTitle),
    ...rows,
    h('button', { class: 'btn primary block', style: 'margin-top:10px', on: { click: () => setStep(2) } }, TEXT.coach.readyBtn));
}

function stepOpenSignup() {
  return h('div', {},
    h('div', { style: 'background:#fff;border-radius:12px;padding:12px' }, TEXT.coach.signupIntro),
    h('button', { class: 'btn primary block', style: 'margin-top:10px', on: { click: () => openImageViewer(null, TEXT.coach.banner, { screens: SIGNUP_SCREENS, onDone: () => setStep(3) }) } }, TEXT.coach.openSignup));
}

function stepCopyCards() {
  const cards = getState().copyCards || [];
  const groups = {};
  for (const c of cards) { (groups[c.screen] ||= { name: c.screen_th, items: [] }).items.push(c); }
  const groupEls = Object.entries(groups).map(([screen, g]) =>
    h('div', { class: 'copy-group' }, h('div', { class: 'cg-title' }, g.name), ...g.items.map(c => copyCardEl(c))));
  return h('div', {},
    h('div', { style: 'font-size:12.5px;color:#374151;margin-bottom:8px' }, 'คัดลอกการ์ดไปวางในหน้าสมัคร Agoda ตามลำดับ'),
    ...groupEls,
    h('button', { class: 'btn primary block', on: { click: () => setStep(4) } }, TEXT.coach.next));
}

function stepScreenshot() {
  const ag = getState().agoda;
  const log = h('div', { style: 'display:flex;flex-direction:column;gap:10px' });

  function renderLog() {
    log.replaceChildren();
    for (const turn of getState().agoda.coachLog) {
      if (turn.thumbUrl) log.append(h('div', { class: 'msg me' }, h('div', { class: 'bubble me img' }, h('img', { src: turn.thumbUrl }))));
      if (turn.explanation_th) {
        log.append(h('div', { class: 'msg bot' }, h('div', { class: 'bubble bot' }, turn.explanation_th)));
        const matched = (getState().copyCards || []).filter(c => (turn.cardIds || []).includes(c.id));
        if (matched.length) log.append(h('div', { style: 'display:flex;flex-direction:column' }, ...matched.map(c => copyCardEl(c, true))));
        if (turn.next_step_th) log.append(h('div', { class: 'msg bot' }, h('div', { class: 'bubble bot', style: 'background:#eef7ff' }, '👉 ' + turn.next_step_th)));
      } else {
        log.append(h('div', { class: 'msg bot' }, h('div', { class: 'bubble bot' }, TEXT.coach.cantRead)));
      }
    }
  }
  renderLog();

  async function analyze({ base64, fileName, thumbUrl }) {
    const typingId = 'coach' + Date.now();
    const cur = getState().agoda;
    setState({ agoda: { ...cur, coachLog: [...cur.coachLog, { id: typingId, thumbUrl, screenId: null, source: 'pending', ts: Date.now() }] } });
    renderLog();
    log.append(h('div', { class: 'msg bot' }, h('div', { class: 'typing' }, h('span'), h('span'), h('span'))));

    const res = await coachScreenshot({ base64, fileName }, getState().copyCards, cur.step);
    const ag2 = getState().agoda;
    const entry = { id: typingId, thumbUrl, screenId: res.screen_id, source: res.source, ms: res.ms, cardIds: res.card_ids, explanation_th: res.explanation_th, next_step_th: res.next_step_th, fileName, ts: Date.now() };
    const newLog = ag2.coachLog.map(t => t.id === typingId ? entry : t);
    const patch = { ...ag2, coachLog: newLog };
    if (res.advancesStep && ag2.step < 6) { /* keep step; advancing handled by button */ }
    setState({ agoda: patch });
    renderLog();
  }

  function openPicker() {
    const root = document.getElementById('modal-root');
    const thumbs = SIGNUP_SCREENS.map(s =>
      h('div', { class: 'ss-thumb', on: { click: async () => {
        root.replaceChildren();
        try {
          const res = await fetch(s.file); const blob = await res.blob();
          const base64 = await toBase64(blob);
          analyze({ base64, fileName: s.id, thumbUrl: s.file });
        } catch { analyze({ base64: null, fileName: s.id, thumbUrl: s.file }); }
      } } }, h('img', { src: s.file }), h('div', { class: 'ss-cap' }, s.name)));
    const fileInput = h('input', { type: 'file', accept: 'image/*', style: 'display:none' });
    fileInput.addEventListener('change', async () => {
      const f = fileInput.files[0]; root.replaceChildren(); if (!f) return;
      try {
        const small = await resize(f, 1280);
        const base64 = await toBase64(small);
        analyze({ base64, fileName: f.name, thumbUrl: URL.createObjectURL(small) });
      } catch { toast('อ่านรูปไม่สำเร็จ'); }
    });
    root.replaceChildren(h('div', { class: 'sheet' },
      h('div', { class: 'sheet-head' }, h('span', { class: 's-title' }, TEXT.coach.askAi), h('button', { class: 'x', on: { click: () => root.replaceChildren() } }, '✕')),
      h('div', { class: 'sheet-body' },
        h('div', { style: 'font-size:12.5px;color:#666;margin-bottom:10px' }, 'เลือกภาพหน้าจอที่เตรียมไว้ หรือเลือกไฟล์จากเครื่อง'),
        h('div', { class: 'ss-picker' }, ...thumbs),
        h('button', { class: 'btn ghost block', style: 'margin-top:10px', on: { click: () => fileInput.click() } }, TEXT.coach.pickFile),
        fileInput,
      ),
    ));
  }

  return h('div', {},
    h('div', { style: 'font-size:12.5px;color:#374151;margin-bottom:8px' }, 'ติดหน้าไหน ส่งภาพหน้าจอมา เดี๋ยว AI อธิบายเป็นภาษาไทยและบอกว่าต้องวางการ์ดไหน'),
    log,
    h('button', { class: 'btn primary block', style: 'margin-top:10px', on: { click: openPicker } }, '📷 ' + TEXT.coach.askAi),
    h('button', { class: 'btn ghost block', style: 'margin-top:8px', on: { click: () => setStep(5) } }, TEXT.coach.next));
}

function stepOwnerOnly() {
  return h('div', {},
    h('div', { class: 'note-amber', style: 'font-size:13px' }, TEXT.coach.otpCard),
    h('button', { class: 'btn primary block', style: 'margin-top:12px', on: { click: () => setStep(6) } }, TEXT.coach.otpDone));
}

function stepPasteLink() {
  const input = h('input', { type: 'text', placeholder: TEXT.coach.pasteLabel, value: '' });
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
  return h('div', {},
    h('div', { class: 'field' }, h('label', {}, TEXT.coach.pasteLabel),
      h('div', { style: 'display:flex;gap:8px' }, input, pasteBtn), err),
    h('button', { class: 'btn ghost sm', style: 'margin-bottom:10px', on: { click: () => { input.value = sampleListingLink; } } }, 'ใช้ลิงก์ตัวอย่าง (เดโม)'),
    h('button', { class: 'btn primary block', on: { click: tryCheck } }, TEXT.coach.checkLink));
}

export function coachScreen(state) {
  const step = state.agoda.step || 1;
  const bodyMap = { 1: stepReadiness, 2: stepOpenSignup, 3: stepCopyCards, 4: stepScreenshot, 5: stepOwnerOnly, 6: stepPasteLink };
  const body = (bodyMap[step] || stepReadiness)();
  return h('div', { class: 'coach' },
    h('div', { class: 'coach-head' },
      h('div', { style: 'display:flex;align-items:center;gap:10px' },
        h('button', { class: 'icon-btn', on: { click: () => go('connections') } }, '‹'),
        h('div', { class: 'ch-title' }, TEXT.coach.title),
        h('div', { style: 'margin-left:auto;font-size:12px' }, TEXT.coach.step(step)),
      ),
      h('div', { class: 'progress' }, h('i', { style: `width:${(step / 6) * 100}%` })),
    ),
    h('div', { class: 'coach-body' }, body),
  );
}
