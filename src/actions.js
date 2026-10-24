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
import { toast } from './ui/dom.js';
import { fileToPhoto } from './photos.js';
import { MAX_PHOTOS } from './data/options.js';

let ctl = null;
// Sample guests used by simulateCustomer to demo an incoming enquiry/booking.
const CUSTOMER_POOL = [
  { name: 'คุณมานี', msg: 'สนใจห้องพักช่วงเสาร์–อาทิตย์นี้ ว่างไหมคะ', nights: 2 },
  { name: 'คุณสมชาย', msg: 'ขอจอง 2 คืนครับ มีที่จอดรถไหม', nights: 2 },
  { name: 'Emma', msg: 'Hi! Is the room available next weekend for 3 nights?', nights: 3 },
  { name: 'คุณกานต์', msg: 'มากัน 4 คน พักคืนเดียว ราคาเท่าไรคะ', nights: 1 },
  { name: '李伟', msg: '你好，下周有空房吗？住两晚', nights: 2 },
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
    else if (i == 1) s.previewSent ? go('preview') : toast('ยังไม่มีตัวอย่าง กรอกข้อมูลให้ AI เขียนประกาศก่อนนะคะ');
    else if (i == 2) s.approved ? go('connections') : toast('อนุมัติตัวอย่างประกาศก่อนนะคะ');
    else if (i == 3) { if (!s.approved) return toast('อนุมัติตัวอย่างประกาศก่อนนะคะ'); s.active = 'agoda'; const c = conn('agoda'); c.step = getPlatform('agoda').screens.length; c.coach = null; go('coach'); }
    else if (i == 4) go('finance');
    else go('help');
  },
  // ช่วยเหลือ / ติดต่อเจ้าหน้าที่: send a message to staff.
  contactStaff() { toast('ส่งข้อความถึงเจ้าหน้าที่แล้ว ทีมงานจะตอบในแชทโดยเร็วค่ะ'); },
  askStaff(topic) { toast(`ส่งคำถามเรื่อง “${topic}” ให้เจ้าหน้าที่แล้วค่ะ`); },
  // Demo: a guest pings the owner. The first ping flips billing on (free until first customer).
  simulateCustomer() {
    const s = state;
    const pick = CUSTOMER_POOL[s.customers.length % CUSTOMER_POOL.length];
    const price = suggestPrice(s.intake).value || 800;
    const now = new Date(), time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    const first = s.customers.length === 0;
    s.customers.push({ name: pick.name, msg: pick.msg, nights: pick.nights, amount: pick.nights * price, time });
    if (s.step !== 'chat') go('chat'); else emit();
    toast(first ? '🎉 ลูกค้าคนแรกทักเข้ามาแล้ว!' : `🔔 ${pick.name} ส่งข้อความถึงคุณ`);
  },
  reset: () => resetState(),
  setLang: l => { state.lang = l; emit(); },
  loadDemo() { state.intake = clone(demoHomestay); state.photoIdx = 0; emit(); toast('โหลดบ้านตัวอย่างแล้ว'); },
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
  // Photos: the owner picks files (shrunk to small JPEGs); the first photo is the cover.
  async addPhotos(files) {
    const ph = state.intake.photos, room = MAX_PHOTOS - ph.length;
    const imgs = [...files].filter(f => /^image\//.test(f.type));
    if (!imgs.length) return toast('เลือกไฟล์รูปภาพเท่านั้นนะคะ');
    if (room <= 0) return toast(`เพิ่มรูปได้ไม่เกิน ${MAX_PHOTOS} รูปค่ะ`);
    const done = (await Promise.all(imgs.slice(0, room).map(f => fileToPhoto(f).catch(() => null)))).filter(Boolean);
    const cur = state.intake.photos; cur.push(...done.slice(0, Math.max(0, MAX_PHOTOS - cur.length))); emit();
    toast(!done.length ? 'เปิดรูปไม่ได้ ลองใช้ไฟล์ JPG หรือ PNG' : done.length < imgs.length ? `เพิ่มรูปได้ ${done.length} จาก ${imgs.length} รูป` : `เพิ่มรูปแล้ว ${done.length} รูป`);
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
  simulateAgoda() { const c = conn(); if (c.linkSent) { c.live = true; go('live'); } else toast('ยังไม่มีลิงก์จากเจ้าของ'); },
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
