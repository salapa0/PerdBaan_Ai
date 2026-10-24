// S8 — staff console (right pane). One owner's draft, flags, coach activity, Approve & send.
import { h, money, icon, TEXT } from '../ui/ui.js';
import { getState, setState } from '../state.js';
import { botSay } from '../ui/chat.js';
import { thLabel } from '../data/options.js';
import { runChecks } from '../rules/runChecks.js';
import { buildCopyCards } from '../rules/buildCopyCards.js';
import { generateListing } from '../ai/generateListing.js';

let consoleLang = 'th';
let overrideErrors = false;

const STAGE_LABELS = {
  chat: 'Idle', intake: 'Intake', generating: 'Writing', review: 'Needs review',
  preview: 'Preview sent', connections: 'Approved', coach: 'Connecting', waiting: 'Waiting for Agoda', live: 'Live',
};

function srcBadge(meta) {
  if (!meta || !meta.source) return h('span', { class: 'c-src saved' }, 'No draft');
  const map = { live: ['live', `Live AI · ${meta.model || ''} · ${Math.round((meta.ms || 0) / 100) / 10}s`], mixed: ['mixed', 'Mixed (some cached)'], saved: ['saved', 'Saved (cached)'] };
  const [cls, label] = map[meta.source] || ['saved', meta.source];
  return h('span', { class: 'c-src ' + cls }, label);
}

function intakeSummary(i) {
  if (!i) return h('div', { class: 'c-sec' }, h('h4', {}, 'Intake'), h('div', { style: 'color:#888' }, 'No intake yet'));
  const rows = (i.rooms || []).map(r => h('tr', {},
    h('td', {}, r.name || thLabel('room', r.type)), h('td', {}, r.count), h('td', {}, r.maxGuests), h('td', {}, money(r.price))));
  return h('details', { class: 'c-sec' },
    h('summary', { style: 'cursor:pointer;font-weight:700' }, `${i.place?.name || ''} — ${i.place?.district || ''} ${i.place?.province || ''}`),
    h('table', { class: 'c-table', style: 'margin-top:8px' },
      h('tr', {}, h('th', {}, 'Room'), h('th', {}, '#'), h('th', {}, 'Max'), h('th', {}, 'Rate')),
      ...rows),
    h('div', { style: 'margin-top:6px;font-size:12px;color:#555' },
      `Photos: ${(i.photos || []).length} · Contact: ${i.contact?.phone || '—'} / ${i.contact?.email || '—'} · Licence: ${i.contact?.licence || '—'}`),
  );
}

function draftEditor(d, review) {
  const edited = new Set(review.editedFields || []);
  const tab = (code, label) => h('button', { class: consoleLang === code ? 'on' : '', on: { click: () => { consoleLang = code; setState({}); } } }, label);

  const titleKey = `title_${consoleLang}`, descKey = `desc_${consoleLang}`;
  const titleInput = h('input', { value: d[titleKey] || '' });
  titleInput.addEventListener('input', () => { d[titleKey] = titleInput.value; edited.add(titleKey); });
  titleInput.addEventListener('change', () => setState({ draft: { ...d }, review: { ...review, editedFields: [...edited] } }));
  const descInput = h('textarea', {}); descInput.value = d[descKey] || '';
  descInput.addEventListener('input', () => { d[descKey] = descInput.value; edited.add(descKey); });
  descInput.addEventListener('change', () => setState({ draft: { ...d }, review: { ...review, editedFields: [...edited] } }));

  const hlRows = (d.highlights || []).map((hl, idx) => h('div', { class: 'hl-row' },
    ...['th', 'en', 'zh'].map(lng => { const inp = h('input', { value: hl[lng] || '' }); inp.addEventListener('change', () => { hl[lng] = inp.value; setState({ draft: { ...d } }); }); return inp; }),
    h('button', { class: 'mini-x', on: { click: () => { d.highlights.splice(idx, 1); setState({ draft: { ...d } }); } } }, icon('close', 14)),
  ));

  const reasonTa = h('textarea', { style: 'min-height:54px' }); reasonTa.value = d.price?.reason_th || '';
  reasonTa.addEventListener('change', () => { d.price.reason_th = reasonTa.value; setState({ draft: { ...d } }); });

  return h('div', { class: 'c-sec' },
    h('h4', {}, 'Draft editor'),
    h('div', { class: 'lang-tabs' }, tab('th', 'TH'), tab('en', 'EN'), tab('zh', 'ZH')),
    h('div', { class: 'c-field' }, h('label', {}, h('span', {}, `Title (${consoleLang})`), h('span', {}, `${(d[titleKey] || '').length}` + (edited.has(titleKey) ? ' · edited' : ''))), titleInput),
    h('div', { class: 'c-field' }, h('label', {}, h('span', {}, `Description (${consoleLang})`), h('span', {}, `${(d[descKey] || '').length}` + (edited.has(descKey) ? ' · edited' : ''))), descInput),
    h('div', { class: 'c-field' }, h('label', {}, 'Highlights (TH / EN / ZH)'), ...hlRows,
      h('button', { class: 'btn ghost sm', on: { click: () => { d.highlights = [...(d.highlights || []), { th: '', en: '', zh: '' }]; setState({ draft: { ...d } }); } } }, '+ add highlight')),
    h('div', { class: 'c-field' }, h('label', {}, `Price · suggested ${money(d.price?.value)} (band ${money(d.price?.low)}–${money(d.price?.high)})`), reasonTa),
    h('div', { class: 'c-actions' },
      h('button', { class: 'btn ghost sm', on: { click: regenerate } }, 'Regenerate'),
      h('button', { class: 'btn ghost sm', on: { click: () => setState({ draft: { ...d, flags: runChecks(d, getState().intake) } }) } }, 'Re-run checks'),
    ),
  );
}

async function regenerate() {
  const s = getState();
  if (!s.intake) return;
  const { draft, draftMeta, copyCards } = await generateListing(s.intake, () => {}, {});
  setState({ draft, draftMeta, copyCards });
}

function flagsPanel(d, review) {
  const flags = d.flags || [];
  const hasError = flags.some(f => f.level === 'error') && !overrideErrors;
  const rows = flags.length ? flags.map(f => h('div', { class: 'flag ' + f.level },
    h('span', { class: 'fid' }, f.id), h('span', {}, f.message_th))) : [h('div', { class: 'c-ok' }, icon('check', 16), 'No issues')];
  return h('div', { class: 'c-sec' },
    h('h4', {}, `Checks (${flags.length})`),
    ...rows,
    h('div', { class: 'c-actions' },
      h('button', { class: 'btn primary sm', disabled: hasError, on: { click: approveSend } }, 'Approve & send preview'),
      hasError ? h('button', { class: 'btn ghost sm', on: { click: () => { overrideErrors = true; setState({}); } } }, 'Override') : null,
    ),
  );
}

export async function approveSend() {
  const s = getState();
  const copyCards = buildCopyCards(s.draft, s.intake);
  setState({ review: { ...s.review, status: 'approved' }, approval: { status: 'sent' }, copyCards });
  await botSay({ card: { title: TEXT.previewReady.title, body: TEXT.previewReady.body, thumb: 'public/demo-photos/01-front.jpg', buttons: [{ label: TEXT.previewReady.btn, action: 'open_preview' }] } });
}

function connectionMonitor(s) {
  const ag = s.agoda;
  const ticks = 'Ready: ' + Object.entries(ag.readiness).filter(([, v]) => v).map(([k]) => TEXT.coach.readyDocs[k] || k).join(', ');
  const logRows = (ag.coachLog || []).filter(t => t.screenId !== undefined).map(t => h('div', { class: 'coachlog-row' },
    t.thumbUrl ? h('img', { src: t.thumbUrl }) : h('div', { style: 'width:46px;height:60px;background:#eef2f7;border-radius:6px' }),
    h('div', { class: 'cl-meta' },
      h('div', {}, `${t.screenId || '—'} · ${t.source}${t.ms ? ' · ' + (Math.round(t.ms / 100) / 10) + 's' : ''}`),
      h('div', {}, `cards: ${(t.cardIds || []).length}`)),
  ));
  return h('div', { class: 'c-sec' },
    h('h4', {}, 'Connection monitor'),
    h('div', { style: 'font-size:12px;margin-bottom:4px' }, `Agoda: ${ag.status} · step ${ag.step}/6`),
    h('div', { style: 'font-size:12px;color:#555;margin-bottom:8px' }, ticks),
    ag.listingUrl ? h('div', { style: 'font-size:11px;color:#2563eb;word-break:break-all;margin-bottom:8px' }, ag.listingUrl) : null,
    logRows.length ? h('div', {}, h('div', { style: 'font-size:11px;color:#888;margin-bottom:4px' }, 'Coach log'), ...logRows) : null,
  );
}

export function renderConsole(state = getState()) {
  const body = document.getElementById('console-body');
  const ownerEl = document.getElementById('console-owner');
  if (!body) return;
  if (ownerEl) ownerEl.textContent = state.intake?.place?.name ? `${state.intake.place.name} · ${STAGE_LABELS[state.stage] || state.stage}` : 'No owner yet';

  const parts = [h('div', { class: 'c-sec' }, h('h4', {}, 'Status'),
    h('span', { class: 'c-pill' }, STAGE_LABELS[state.stage] || state.stage), ' ', srcBadge(state.draftMeta))];
  parts.push(intakeSummary(state.intake));
  if (state.draft) { parts.push(draftEditor(state.draft, state.review)); parts.push(flagsPanel(state.draft, state.review)); }
  parts.push(connectionMonitor(state));
  body.replaceChildren(...parts);
}
