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
const go = s => { state.step = s; emit(); };

export const actions = {
  go,
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
  setField(k, v) {
    const i = state.intake, r = i.rooms[0];
    if (k === 'price') r.price = v === '' ? '' : +v;
    else if (k === 'rooms') r.count = +v || 1;
    else if (k === 'phone') i.contact.phone = v;
    else i[k] = v;
  },
  editDraft: (k, v) => { state.draft[k] = v; },
  async write() {
    if (state.busy) return;
    state.busy = true; state.step = 'writing'; emit();
    ctl = new AbortController();
    const r = await generateDraft(state.intake, state.mode, ctl.signal);
    Object.assign(state, { draft: r.draft, source: r.source, busy: false, step: 'review' }); emit();
  },
  approvePreview() {
    if (!state.draft || runChecks(state.draft, state.intake).some(f => f.level === 'error')) return toast('แก้รายการสีแดงก่อน');
    go('preview');
  },
  approveOwner() { state.approved = true; emit(); },
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
    if (!state.intake.name) state.intake = clone(demoHomestay);
    if (step !== 'chat' && step !== 'form' && !state.draft) { state.draft = clone(savedDraft); state.source = 'Saved (cached)'; }
    state.approved = ['connections', 'coach', 'live'].includes(step);
    state.coachStep = 1; state.coach = null;
    state.linkSent = step === 'live'; if (step === 'live') state.link = 'https://www.agoda.com/baan-suan-rim-nan/hotel/nan-th.html';
    go(step);
  },
};
