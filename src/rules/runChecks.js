// Fixed listing checks (no AI). Returns [{level,id,msg}].
import { MIN_PHOTOS } from '../data/options.js';
const SUPER = /ดีที่สุด|อันดับ ?1|ถูกที่สุด|best in|#1|cheapest/i;
export function runChecks(draft, intake) {
  const f = [], add = (level, id, msg) => f.push({ level, id, msg });
  if (intake.rooms.some(r => !(+r.price > 0))) add('error', 'E1', 'ราคาห้องต้องมากกว่า 0 บาท');
  const text = [draft.desc_th, draft.desc_en, draft.title_th, draft.title_en].join(' ');
  if (SUPER.test(text)) add('error', 'E4', 'มีคำโอ้อวดเกินจริง เช่น “ดีที่สุด” (Agoda ไม่อนุญาต)');
  if (!/^0\d{1,2}-?\d{3}-?\d{4}$/.test((intake.contact.phone || '').trim())) add('error', 'E5', 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง');
  if (intake.rooms.reduce((n, r) => n + (+r.count || 0), 0) > 8) add('warn', 'W7', 'มีมากกว่า 8 ห้อง อาจเข้าข่ายโรงแรมมากกว่าโฮมสเตย์');
  if (/https?:\/\/|www\./i.test(draft.desc_th + ' ' + draft.desc_en)) add('warn', 'W8', 'มีลิงก์เว็บไซต์ในคำอธิบาย (ไม่ควรใส่)');
  const sum = intake.rooms.reduce((n, r) => n + (+r.count || 0), 0);
  if (intake.totalRooms && sum !== intake.totalRooms) add('warn', 'W9', `ประเภทห้องรวม ${sum} ห้อง ไม่เท่ากับจำนวนห้องทั้งหมด ${intake.totalRooms}`);
  const np = (intake.photos || []).length;
  if (np < MIN_PHOTOS) add('warn', 'W10', np ? `มีรูปที่พักเพียง ${np} รูป (แนะนำอย่างน้อย ${MIN_PHOTOS} รูป)` : `ยังไม่ได้เพิ่มรูปที่พัก (แนะนำอย่างน้อย ${MIN_PHOTOS} รูป)`);
  return f;
}
