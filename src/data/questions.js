// Guided intake questions (the chat the owner sees). Owner: C (content and data)
import { HIGHLIGHTS } from './shapes.js';

const labels = (keys = []) => keys.map((k) => HIGHLIGHTS.find((h) => h.key === k)?.th).filter(Boolean).join(', ');

export const QUESTIONS = [
  {
    key: 'name', kind: 'text', placeholder: 'เช่น บ้านสวนลุงแดง',
    ask: () => 'สวัสดีค่ะ 🌾 เปิดบ้านช่วยเขียนประกาศที่พักของคุณให้ขึ้น Agoda ได้ใน 3 ภาษา ตอบสั้นๆ ไม่กี่ข้อก็พอค่ะ\n\nที่พักของคุณชื่ออะไรคะ?',
  },
  {
    key: 'place', kind: 'text', placeholder: 'เช่น ต.ปัว อ.ปัว จ.น่าน',
    ask: (a) => `ยินดีที่ได้รู้จัก “${a.name}” ค่ะ ตั้งอยู่ที่ตำบล อำเภอ จังหวัดอะไรคะ?`,
  },
  {
    key: 'rooms', kind: 'number', unit: 'ห้อง', placeholder: '4',
    ask: () => 'มีห้องพักให้แขกกี่ห้องคะ?',
  },
  {
    key: 'guests', kind: 'number', unit: 'คน', placeholder: '10',
    ask: () => 'รับแขกได้สูงสุดรวมกันกี่คนคะ?',
  },
  {
    key: 'price', kind: 'number', unit: 'บาท/คืน', placeholder: '900',
    ask: () => 'ราคาห้องที่ถูกที่สุดต่อคืนเท่าไหร่คะ? (บาท)',
  },
  {
    key: 'highlights', kind: 'multi', options: HIGHLIGHTS,
    ask: () => 'ที่พักของคุณมีอะไรน่าสนใจบ้างคะ? เลือกได้หลายข้อค่ะ',
    echo: (v) => labels(v) || 'ไม่มี',
  },
  {
    key: 'story', kind: 'text', optional: true, placeholder: 'เล่าสั้นๆ ตามที่คุณพูดได้เลยค่ะ',
    ask: () => 'เล่าเรื่องบ้านให้ฟังสั้นๆ ได้ไหมคะ เช่น ใครดูแล แขกจะได้ทำอะไร (ข้ามได้ค่ะ)',
    echo: (v) => v || '(ข้ามไป)',
  },
  {
    key: 'photoCount', kind: 'photos',
    ask: () => 'ขอรูปที่พักหน่อยค่ะ อย่างน้อย 5 รูป เช่น ห้องนอน ห้องน้ำ วิว และทางเข้า',
    echo: (v) => `ส่งรูป ${v} รูป`,
  },
  {
    key: 'confirm', kind: 'confirm',
    ask: (a) => `สรุปนะคะ\n• ${a.name} (${a.place})\n• ${a.rooms} ห้อง รับได้ ${a.guests} คน\n• เริ่มต้น ${a.price} บาท/คืน\n• จุดเด่น: ${labels(a.highlights) || '-'}\n• รูป ${a.photoCount || 0} รูป\n\nพร้อมให้เปิดบ้านเขียนประกาศแล้วใช่ไหมคะ?`,
  },
];
