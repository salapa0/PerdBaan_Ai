// Everything the owner, the staff console and the presenter toolbar can do.
import { state, emit, resetState, clone } from './state.js';
import { config } from './config.js';
import { demoHomestay } from './data/demoHomestay.js';
import { savedDraft } from './data/savedDraft.js';
import { generateDraft } from './ai/draft.js';
import { coachScreenshot } from './ai/coach.js';
import { askJson, ping } from './ai/ollama.js';
import { runChecks } from './rules/runChecks.js';
import { buildCopyCards } from './rules/buildCopyCards.js';
import { checkAgodaLink } from './rules/checkAgodaLink.js';
import { toast } from './ui/dom.js';

let ctl = null;
// With a single room type, its count simply follows the total number of rooms.
const autoCount = () => { const rs = state.intake.rooms; if (rs.length === 1) rs[0].count = state.intake.totalRooms; };
const go = s => {
  if (s === state.step) return emit();
  if (s === 'form') state.started = true;
  state.hist.push(state.step); state.step = s; emit();
};

export const actions = {
  go,
  back() {
    if (state.step === 'writing') return;
    if (state.step === 'coach' && state.coachStep > 1) { state.coachStep--; state.coach = null; return emit(); }
    const p = state.hist.pop(); if (p) { state.step = p; emit(); }
  },
  close: () => go('chat'),
  toggleMenu() { state.menuOpen = !state.menuOpen; emit(); },
  menu(i) {
    const s = state;
    if (i == 0) go('form');
    else if (i == 1) s.previewSent ? go('preview') : toast('ยังไม่มีตัวอย่าง เจ้าหน้าที่กำลังตรวจอยู่');
    else if (i == 2) s.approved ? go('connections') : toast('อนุมัติตัวอย่างประกาศก่อนนะคะ');
    else if (i == 3) { if (!s.approved) return toast('อนุมัติตัวอย่างประกาศก่อนนะคะ'); s.coachStep = 4; s.coach = null; go('coach'); }
    else if (i == 4) toast('แตะ "กรอกข้อมูล" เพื่อเริ่ม หรือพิมพ์ถามเจ้าหน้าที่ได้เลย');
    else toast('เจ้าหน้าที่ตอบทุกวัน 9:00–18:00');
  },
  reset: () => resetState(),
  setLang: l => { state.lang = l; emit(); },
  loadDemo() { state.intake = clone(demoHomestay); emit(); toast('โหลดบ้านตัวอย่างแล้ว'); },
  toggleMode() { state.mode = state.mode === 'live' ? 'saved' : 'live'; emit(); toast('โหมด AI: ' + (state.mode === 'live' ? 'Live' : 'Saved')); },
  stop() { ctl && ctl.abort(); },
  async warm() {
    if (!(await ping())) return toast('ไม่พบ Ollama');
    toast('กำลังอุ่นโมเดล…');
    try { await askJson(config.textModel, 'ตอบ JSON {"ok":1}'); await askJson(config.visionModel, 'reply JSON {"ok":1}'); toast('โมเดลพร้อมแล้ว'); }
    catch { toast('อุ่นโมเดลไม่สำเร็จ ตรวจ tag ใน config.js'); }
  },
  setField(k, v) { if (k === 'phone') state.intake.contact.phone = v; else state.intake[k] = v; },
  setTotal(d) { const i = state.intake; i.totalRooms = Math.min(30, Math.max(1, i.totalRooms + +d)); autoCount(); emit(); },
  toggleType(t) {
    const rs = state.intake.rooms, k = t === '__other' ? rs.findIndex(r => r.custom) : rs.findIndex(r => r.name === t && !r.custom);
    if (k >= 0) rs.splice(k, 1);
    else rs.push({ id: 'n' + Math.random().toString(36).slice(2, 7), name: t === '__other' ? '' : t, custom: t === '__other', price: '', count: 1 });
    autoCount(); emit();
  },
  stepRoom(v) { const [id, d] = v.split(':'), r = state.intake.rooms.find(x => x.id === id); if (r) r.count = Math.min(30, Math.max(1, r.count + +d)); emit(); },
  setRoom(id, k, v) { const r = state.intake.rooms.find(x => x.id === id); if (r) r[k] = k === 'price' ? (v === '' ? '' : +v) : v; },
  toggleAmenity(a) {
    const i = state.intake;
    if (a === '__other') i.amenityOtherOn = !i.amenityOtherOn;
    else i.amenities = i.amenities.includes(a) ? i.amenities.filter(x => x !== a) : [...i.amenities, a];
    emit();
  },
  editDraft: (k, v) => { state.draft[k] = v; },
  async write() {
    if (state.busy) return;
    state.busy = true; go('writing');
    ctl = new AbortController();
    const r = await generateDraft(state.intake, state.mode, ctl.signal);
    Object.assign(state, { draft: r.draft, source: r.source, busy: false, step: 'review' }); emit();
  },
  approvePreview() {
    if (!state.draft || runChecks(state.draft, state.intake).some(f => f.level === 'error')) return toast('แก้รายการสีแดงก่อน');
    state.previewSent = true; emit(); toast('ส่งตัวอย่างให้เจ้าของแล้ว');
  },
  approveOwner() { state.approved = true; go('chat'); },
  nextCoach() { state.coachStep = Math.min(5, state.coachStep + 1); state.coach = null; emit(); },
  copy(i) {
    const c = buildCopyCards(state.draft, state.intake)[+i];
    try { navigator.clipboard.writeText(c.value); } catch { /* clipboard blocked */ }
    toast('คัดลอกแล้ว');
  },
  async screenshot(file) {
    const b64 = await new Promise(r => { const f = new FileReader(); f.onload = () => r(String(f.result).split(',')[1]); f.readAsDataURL(file); });
    state.coach = await coachScreenshot({ base64: b64, fileName: file.name }, buildCopyCards(state.draft, state.intake), state.coachStep, state.mode);
    emit();
  },
  sendLink() { if (checkAgodaLink(state.link).ok) { state.linkSent = true; emit(); toast('ส่งลิงก์ให้เจ้าหน้าที่แล้ว'); } },
  simulateAgoda() { if (state.linkSent) go('live'); else toast('ยังไม่มีลิงก์ Agoda จากเจ้าของ'); },
  jump(step) {
    const J = ['chat', 'form', 'review', 'preview', 'connections', 'coach', 'live'], n = J.indexOf(step);
    if (!state.intake.name) state.intake = clone(demoHomestay);
    if (n < 2) state.draft = null;
    else if (!state.draft) { state.draft = clone(savedDraft); state.source = 'Saved (cached)'; }
    Object.assign(state, { hist: J.slice(0, n), started: n >= 1, previewSent: n >= 3, approved: n >= 4, coachStep: 1, coach: null, lang: 'th', linkSent: step === 'live', step });
    if (step === 'live') state.link = 'https://www.agoda.com/baan-suan-rim-nan/hotel/nan-th.html';
    emit();
  },
};
