// Shared actions used by the phone screens and the staff console. Owner: A (frontend)
import { newState } from '../data/shapes.js';
import { QUESTIONS } from '../data/questions.js';
import { DEMO_ANSWERS } from '../../content/demo-homestay.js';
import { demoPhotoFiles } from '../../content/demo-photos.js';
import { generateListing } from '../ai/listing.js';
import { getState, update, setState, addLog, botMsg } from './store.js';
import { addPhotos, clearPhotos } from './photos.js';

export async function generateAndStore() {
  update((s) => {
    s.stage = 'generating';
    s.busy = { lang: 'th' };
    s.tab = 'chat';
  });
  const listing = await generateListing(getState().answers, (lang, phase) => {
    if (phase === 'start') update((s) => (s.busy = { lang }));
  });
  update((s) => {
    s.listing = listing;
    s.stage = 'preview';
    s.busy = null;
    s.approved = false;
    botMsg(s, 'เขียนประกาศเสร็จแล้วค่ะ ✨ ลองดูตัวอย่างทั้ง 3 ภาษา แก้ได้ถ้าอยากปรับ');
    const kinds = Object.values(listing.meta.source).map((x) => x.kind).join('/');
    addLog(s, `สร้างประกาศ 3 ภาษา (${kinds})`);
    s.tab = 'preview';
  });
}

export async function loadDemo() {
  await clearPhotos();
  await addPhotos(await demoPhotoFiles());
  const s0 = newState();
  s0.answers = { ...DEMO_ANSWERS };
  s0.qIndex = QUESTIONS.length - 1;
  s0.chat = [{ from: 'bot', text: 'โหลดข้อมูลตัวอย่าง “บ้านสวนลุงแดง” แล้วค่ะ' }];
  addLog(s0, 'โหลดข้อมูลตัวอย่าง');
  setState(s0);
  await generateAndStore();
}

export async function resetAll() {
  await clearPhotos();
  setState(newState());
}

export function approveListing() {
  update((s) => {
    s.approved = true;
    s.stage = 'connect';
    s.tab = 'connect';
    addLog(s, 'เจ้าของอนุมัติประกาศ');
  });
}

export function submitToStaff() {
  update((s) => {
    s.submitted = true;
    s.stage = 'submitted';
    addLog(s, 'เจ้าของแจ้งว่าส่งข้อมูลให้ Agoda แล้ว รอเจ้าหน้าที่ตรวจ');
  });
}

export function confirmLive() {
  update((s) => {
    s.live = true;
    s.stage = 'live';
    s.tab = 'live';
    addLog(s, 'เจ้าหน้าที่ยืนยันว่าขึ้น Agoda แล้ว');
  });
}
