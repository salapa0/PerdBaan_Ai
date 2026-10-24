// Staff console — modelled on a real property-admin dashboard (channel-manager / extranet style):
// a KPI strip, a property record, a content-quality panel, a channel manager with per-channel
// status, and an activity log. English chrome (as worldwide partner hubs use) over Thai data.
// Staff no longer gate the draft — the AI draft goes straight to the owner, who is the only approver.
import { state, conn } from '../state.js';
import { $, esc } from '../ui/dom.js';
import { allAmenities } from '../data/options.js';
import { platforms } from '../data/platforms.js';
import { runChecks } from '../rules/runChecks.js';

const N = platforms.length;
const pill = (txt, cls = '') => `<span class="pill ${cls}">${esc(txt)}</span>`;
const section = (title, inner) => `<section class="sec"><h3 class="sec-h">${esc(title)}</h3><div class="sec-b">${inner}</div></section>`;
const kpi = (label, value, sub = '', cls = '') =>
  `<div class="kpi"><div class="kpi-label">${esc(label)}</div><div class="kpi-val ${cls}">${value}</div>${sub ? `<div class="kpi-sub">${esc(sub)}</div>` : ''}</div>`;

// Overall listing status, as a partner hub would badge it.
function listingStatus() {
  const s = state;
  if (s.step === 'writing') return { t: 'Generating', c: 'info' };
  if (!s.draft) return { t: 'Awaiting intake', c: 'idle' };
  if (platforms.some(p => conn(p.id).live)) return { t: 'Published', c: 'ok' };
  if (s.approved) return { t: 'Approved', c: 'ok' };
  return { t: 'Pending approval', c: 'warn' };
}

// Per-channel state + a 0–100 progress figure for the setup bar.
function channelStatus(p) {
  const c = conn(p.id), tot = p.screens.length;
  if (c.live) return { t: 'Live', c: 'ok', pct: 100 };
  if (c.linkSent) return { t: 'Awaiting verification', c: 'warn', pct: 90 };
  if (c.step > 1 || c.coach) return { t: `Setup ${Math.min(c.step, tot)}/${tot}`, c: 'info', pct: Math.round(Math.min(c.step, tot) / tot * 100) };
  return { t: 'Not started', c: 'idle', pct: 0 };
}

export function renderChecks() {
  if (!state.draft || !$('#checks')) return;
  const f = runChecks(state.draft, state.intake), bad = f.some(x => x.level === 'error');
  $('#checks').innerHTML = f.length
    ? f.map(x => `<div class="ck ${x.level}">${x.level === 'error' ? '✗' : '!'} ${x.id} ${esc(x.msg)}</div>`).join('')
    : `<div class="ck ok">✓ ผ่านทุกข้อ</div>`;
  const b = $('#approve'); if (b) b.disabled = bad;
}

function propertyCard() {
  const i = state.intake;
  const rooms = i.rooms.length
    ? i.rooms.map(r => `${esc(r.name || 'ห้อง')} ×${r.count} · ${r.price || '—'}฿`).join(' · ')
    : '—';
  const am = allAmenities(i);
  return `<dl class="kv">
    <dt>Property</dt><dd>${esc(i.name || '—')}</dd>
    <dt>Location</dt><dd>${esc(i.location || '—')}</dd>
    <dt>Contact</dt><dd>${esc(i.contact.phone || '—')}</dd>
    <dt>Rooms</dt><dd>${esc(String(i.totalRooms))} · ${rooms}</dd>
    <dt>Amenities</dt><dd>${esc(am.join(', ') || '—')}</dd>
  </dl>`;
}

function channelRow(p) {
  const c = conn(p.id), st = channelStatus(p);
  const canVerify = c.linkSent && !c.live && state.active === p.id;
  return `<div class="ch ${c.live ? 'ch-live' : ''}">
    <div class="ch-main">
      <div class="ch-ico" aria-hidden="true">${esc((p.short || p.name).slice(0, 1))}</div>
      <div class="ch-txt">
        <div class="ch-name">${esc(p.name)} ${pill(p.kind, 'kind')}</div>
        <div class="ch-role">${esc(p.role)}</div>
      </div>
      ${pill(st.t, st.c)}
    </div>
    <div class="ch-bar"><i style="width:${st.pct}%"></i></div>
    ${canVerify ? `<div class="ch-verify">
      <p class="muted small">${esc(p.verify.wait)}</p>
      <button class="btn sm" data-a="simulateAgoda">${esc(p.verify.btn)} (Shift+A)</button>
    </div>` : ''}
  </div>`;
}

function activityLog() {
  const s = state, ev = [];
  if (s.draft) ev.push(`AI draft generated · ${s.source}`);
  if (s.previewSent) ev.push('Listing sent to owner for approval');
  if (s.approved) ev.push('Owner approved the listing');
  platforms.forEach(p => {
    const c = conn(p.id);
    if (c.linkSent) ev.push(`${p.short || p.name}: link received from owner`);
    if (c.live) ev.push(`${p.short || p.name}: published and live`);
  });
  if (!ev.length) ev.push('No activity yet');
  return `<ol class="log">${ev.map(e => `<li>${esc(e)}</li>`).join('')}</ol>`;
}

export function renderConsole() {
  const s = state;
  $('#console-owner').textContent = s.intake.name ? `${s.intake.name} · ${s.intake.location}` : '—';
  $('#ollama-light').className = 'light ' + (s.ollama ? 'light-green' : 'light-red');
  $('#ollama-label').textContent = 'Ollama · ' + (s.mode === 'live' ? 'Live' : 'Saved');

  const ls = listingStatus();
  const liveCount = platforms.filter(p => conn(p.id).live).length;
  const f = s.draft ? runChecks(s.draft, s.intake) : [];
  const issues = f.filter(x => x.level === 'error' || x.level === 'warn').length;

  const kpis = `<div class="kpis">
    ${kpi('Listing', pill(ls.t, ls.c))}
    ${kpi('Channels live', `${liveCount}<span class="kpi-den">/${N}</span>`)}
    ${kpi('Content checks', s.draft ? (issues ? `${issues}<span class="kpi-den"> open</span>` : 'All clear') : '—', '', s.draft ? (issues ? 'warn' : 'ok') : '')}
    ${kpi('AI engine', s.mode === 'live' ? 'Live AI' : 'Saved', s.ollama ? 'Ollama online' : 'Ollama offline')}
  </div>`;

  let body;
  if (s.step === 'writing') {
    body = kpis
      + section('Property record', propertyCard())
      + section('Content quality', `<div class="genbox"><div class="spin"></div><p class="muted center">AI กำลังเขียนประกาศ…</p><button class="btn ghost sm" data-a="stop">หยุด AI ใช้คำตอบที่บันทึกไว้ (Shift+F)</button></div>`);
  } else if (!s.draft) {
    body = kpis
      + section('Intake queue', `<div class="empty-admin"><p class="muted">รอเจ้าของบ้านพักกรอกข้อมูล — ยังไม่มีร่างประกาศในคิว</p><button class="btn ghost sm" data-a="loadDemo">โหลดบ้านตัวอย่าง (Shift+L)</button></div>`);
  } else {
    body = kpis
      + section('Property record', propertyCard())
      + section('Content quality', `<span class="tag ${s.source === 'Live AI' ? 'tag-live' : ''}">${esc(s.source)}</span><div id="checks" class="checks"></div>`)
      + section('Channel manager', platforms.map(channelRow).join(''))
      + section('Activity', activityLog())
      + `<div class="admin-foot"><button class="ghostlink" data-a="reset">Reset session (Shift+R)</button></div>`;
  }

  $('#console-body').innerHTML = body;
  renderChecks();
}
