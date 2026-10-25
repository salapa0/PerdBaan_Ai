// Everything the owner, the staff console and the presenter toolbar can do.
import { state, emit, resetState, clone, conn } from './state.js';
import { config } from './config.js';
import { demoHomestay } from './data/demoHomestay.js';
import { savedDraft } from './data/savedDraft.js';
import { generateDraft } from './ai/draft.js';
import { coachScreenshot } from './ai/coach.js';
import { askJson, ping } from './ai/ollama.js';
import { buildCopyCards } from './rules/buildCopyCards.js';
import { suggestPrice } from './rules/suggestPrice.js';
import { getPlatform, platforms } from './data/platforms.js';
import { $, esc, toast } from './ui/dom.js';
import { fileToPhoto } from './photos.js';
import { MAX_PHOTOS } from './data/options.js';

let ctl = null;
// Sample guest enquiries used by simulateCustomer. A ping is our server relaying an API signal
// from a channel (Agoda / Google), so the text describes the guest in the third person.
const CUSTOMER_POOL = [
  { name: 'คุณมานี', msg: 'คุณมานีสอบถามว่าห้องพักช่วงเสาร์–อาทิตย์นี้ยังว่างอยู่หรือไม่', nights: 2 },
  { name: 'คุณสมชาย', msg: 'คุณสมชายต้องการจอง 2 คืน และสอบถามว่ามีที่จอดรถหรือไม่', nights: 2 },
  { name: 'Emma', msg: 'Emma (แขกต่างชาติ) สอบถามว่าห้องว่างช่วงสุดสัปดาห์หน้า 3 คืนหรือไม่', nights: 3 },
  { name: 'คุณกานต์', msg: 'คุณกานต์มากัน 4 คน พักคืนเดียว และสอบถามราคาห้อง', nights: 1 },
  { name: '李伟', msg: '李伟 (แขกจีน) สอบถามว่าสัปดาห์หน้ามีห้องว่างสำหรับ 2 คืนหรือไม่', nights: 2 },
];
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
    if (state.step === 'coach' && conn().step > 1) { conn().step--; conn().coach = null; return emit(); }
    const p = state.hist.pop(); if (p) { state.step = p; emit(); }
  },
  close: () => go('chat'),
  toggleMenu() { state.menuOpen = !state.menuOpen; emit(); },
  menu(i) {
    const s = state;
    if (i == 0) go('form');
    else if (i == 1) s.previewSent ? go('preview') : toast('ยังไม่มีตัวอย่าง กรุณากรอกข้อมูลและให้ AI เขียนประกาศก่อนนะคะ');
    else if (i == 2) s.approved ? go('connections') : toast('อนุมัติตัวอย่างประกาศก่อนนะคะ');
    else if (i == 3) { if (!s.approved) return toast('อนุมัติตัวอย่างประกาศก่อนนะคะ'); s.active = 'agoda'; const c = conn('agoda'); c.step = getPlatform('agoda').screens.length; c.coach = null; go('coach'); }
    else if (i == 4) go('finance');
    else go('help');
  },
  // ช่วยเหลือ / ติดต่อเจ้าหน้าที่: send a message to staff.
  contactStaff() { toast('ส่งข้อความถึงเจ้าหน้าที่แล้วค่ะ ทีมงานจะตอบกลับในแชทโดยเร็ว'); },
  askStaff(topic) { toast(`ส่งคำถามเรื่อง “${topic}” ให้เจ้าหน้าที่แล้วค่ะ`); },
  // Demo: our server relays a guest enquiry from a channel's API; the chat links to a mock "send to channel" popup.
  // It only counts on the finance page once the owner confirms it became a real booking (we are the middleman).
  simulateCustomer() {
    const s = state;
    const pick = CUSTOMER_POOL[s.customers.length % CUSTOMER_POOL.length];
    const live = platforms.filter(p => conn(p.id).live), from = live.length ? live : platforms;
    const via = from[s.customers.length % from.length];
    const price = suggestPrice(s.intake).value || 800;
    const now = new Date(), time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    s.customers.push({ id: Date.now(), name: pick.name, msg: pick.msg, nights: pick.nights, amount: pick.nights * price, time,
      via: via.short || via.name, confirmed: false });
    if (s.step !== 'chat') go('chat'); else emit();
    toast(`🔔 ระบบได้รับคำขอจาก ${via.short || via.name}: ${pick.name} ทักเข้ามา`);
  },
  // The owner confirms a ping turned into a real booking; only then it reaches the finance page.
  confirmCustomer(id) {
    const c = state.customers.find(c => String(c.id) === String(id));
    if (!c || c.confirmed) return;
    const first = !state.customers.some(c => c.confirmed);
    c.confirmed = true; emit();
    toast(first ? '🎉 ยืนยันการจองจริงครั้งแรกแล้ว!' : `✓ ยืนยันการจองของ ${c.name} แล้ว`);
  },
  // Mock of sending the owner to the channel the ping came from: a popup on our page only, no copy of the channel's site.
  openChannel(id) {
    const c = state.customers.find(c => String(c.id) === String(id)); if (!c) return;
    const box = (title, body) => $('#modal-root').innerHTML = `<div class="pop-bg" data-a="closePopup"></div><div class="pop" role="dialog" aria-modal="true" aria-label="${esc(title)}">`
      + `<b>${esc(title)}</b>${body}<button class="btn" data-a="closePopup">ปิด</button></div>`;
    box(`กำลังส่งคุณไปที่ ${c.via}…`, '<div class="spin"></div>');
    clearTimeout(actions.openChannel.t);
    actions.openChannel.t = setTimeout(() => $('#modal-root .pop') && box(`✓ ส่งคุณไปที่ ${c.via} แล้ว`,
      `<p>คำขอของ ${esc(c.name)} · ${c.nights} คืน · ประมาณ ${c.amount.toLocaleString('en-US')} บาท</p>`
      + `<p class="muted fine">(จำลอง) ในระบบจริง ปุ่มนี้จะเปิดหน้าคำขอบน ${esc(c.via)} ให้คุณตอบแขกได้ทันที เมื่อแขกจองจริงแล้ว กลับมากด “ยืนยันว่ามีการจองจริง” ในแชท</p>`), 900);
  },
  closePopup() { clearTimeout(actions.openChannel.t); $('#modal-root').innerHTML = ''; },
  reset: () => { actions.closePopup(); resetState(); },
  setLang: l => { state.lang = l; emit(); },
  loadDemo() { state.intake = clone(demoHomestay); state.photoIdx = 0; emit(); toast('โหลดบ้านตัวอย่างแล้ว'); },
  toggleMode() { state.mode = state.mode === 'live' ? 'saved' : 'live'; emit(); toast('โหมด AI: ' + (state.mode === 'live' ? 'Live' : 'Saved')); },
  stop() { ctl && ctl.abort(); },
  async warm() {
    if (!(await ping())) return toast('ไม่พบ Ollama กรุณาเปิดโปรแกรมก่อน');
    toast('กำลังเตรียมโมเดล…');
    try { await askJson(config.textModel, 'ตอบ JSON {"ok":1}'); await askJson(config.visionModel, 'reply JSON {"ok":1}'); toast('โมเดลพร้อมใช้งานแล้ว'); }
    catch { toast('เตรียมโมเดลไม่สำเร็จ กรุณาตรวจชื่อโมเดล (tag) ใน config.js'); }
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
  // Photos: the owner picks files (shrunk to small JPEGs); the first photo is the cover.
  async addPhotos(files) {
    const ph = state.intake.photos, room = MAX_PHOTOS - ph.length;
    const imgs = [...files].filter(f => /^image\//.test(f.type));
    if (!imgs.length) return toast('เลือกไฟล์รูปภาพเท่านั้นนะคะ');
    if (room <= 0) return toast(`เพิ่มรูปได้ไม่เกิน ${MAX_PHOTOS} รูปค่ะ`);
    const done = (await Promise.all(imgs.slice(0, room).map(f => fileToPhoto(f).catch(() => null)))).filter(Boolean);
    const cur = state.intake.photos; cur.push(...done.slice(0, Math.max(0, MAX_PHOTOS - cur.length))); emit();
    toast(!done.length ? 'เปิดรูปไม่ได้ ลองใช้ไฟล์ JPG หรือ PNG' : done.length < imgs.length ? `เพิ่มรูปสำเร็จ ${done.length} จาก ${imgs.length} รูป` : `เพิ่มรูปแล้ว ${done.length} รูป`);
  },
  removePhoto(k) { state.intake.photos.splice(+k, 1); state.photoIdx = 0; emit(); },
  setPhoto(k) { state.photoIdx = +k; emit(); },
  editDraft: (k, v) => { state.draft[k] = v; },
  async write() {
    if (state.busy) return;
    state.busy = true; go('writing');
    ctl = new AbortController();
    const r = await generateDraft(state.intake, state.mode, ctl.signal);
    // No staff review: the AI draft goes straight to the owner, who is the only approver.
    Object.assign(state, { draft: r.draft, source: r.source, busy: false, previewSent: true, step: 'preview' }); emit();
  },
  approveOwner() { state.approved = true; go('chat'); },
  // Start (or resume) connecting a platform from the Connections page.
  connect(id) { const c = conn(id); if (c.live) return toast('เชื่อมต่อแล้ว'); state.active = id; go('coach'); },
  nextCoach() { const c = conn(), n = getPlatform(state.active).screens.length; c.step = Math.min(n + 1, c.step + 1); c.coach = null; emit(); },
  copy(i) {
    const c = buildCopyCards(state.draft, state.intake, state.active)[+i];
    try { navigator.clipboard.writeText(c.value); } catch { /* clipboard blocked */ }
    toast('คัดลอกแล้ว');
  },
  async screenshot(file) {
    const b64 = await new Promise(r => { const f = new FileReader(); f.onload = () => r(String(f.result).split(',')[1]); f.readAsDataURL(file); });
    conn().coach = await coachScreenshot({ base64: b64, fileName: file.name }, buildCopyCards(state.draft, state.intake, state.active), conn().step, state.mode, state.active);
    emit();
  },
  copyLink(id) {
    try { navigator.clipboard.writeText(conn(id).link); } catch { /* clipboard blocked */ }
    toast('คัดลอกลิงก์แล้ว');
  },
  sendLink() { const c = conn(); if (getPlatform(state.active).link.check(c.link).ok) { c.linkSent = true; emit(); toast('ส่งลิงก์ให้เจ้าหน้าที่แล้ว'); } },
  // Staff console: simulate the active platform's approval/verification going through.
  simulateAgoda() { const c = conn(); if (c.linkSent) { c.live = true; go('live'); } else toast('ยังไม่ได้รับลิงก์จากเจ้าของบ้านพัก'); },
  jump(step) {
    const J = ['chat', 'form', 'review', 'preview', 'connections', 'coach', 'live'], n = J.indexOf(step);
    if (!state.intake.name) state.intake = clone(demoHomestay);
    if (n < 2) state.draft = null;
    else if (!state.draft) { state.draft = clone(savedDraft); state.source = 'Saved (cached)'; }
    state.active = 'agoda';
    platforms.forEach(p => Object.assign(state.conns[p.id], { step: 1, coach: null, link: '', linkSent: false, live: false }));
    const a = state.conns.agoda;
    if (step === 'live') Object.assign(a, { link: getPlatform('agoda').sample, linkSent: true, live: true });
    Object.assign(state, { hist: J.slice(0, n), started: n >= 1, previewSent: n >= 2, approved: n >= 4, lang: 'th', step });
    emit();
  },
};
