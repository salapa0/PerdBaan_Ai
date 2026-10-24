// Fixed listing checks (no AI). Returns [{level,id,msg}].
const SUPER = /ดีที่สุด|อันดับ ?1|ถูกที่สุด|best in|#1|cheapest/i;
export function runChecks(draft, intake) {
  const f = [], add = (level, id, msg) => f.push({ level, id, msg });
  if (intake.rooms.some(r => !(+r.price > 0))) add('error', 'E1', 'ราคาห้องต้องมากกว่า 0');
  const text = [draft.desc_th, draft.desc_en, draft.title_th, draft.title_en].join(' ');
  if (SUPER.test(text)) add('error', 'E4', 'มีคำโอ้อวดสูงสุด เช่น "ดีที่สุด" (Agoda ไม่รับ)');
  if (!/^0\d{1,2}-?\d{3}-?\d{4}$/.test((intake.contact.phone || '').trim())) add('error', 'E5', 'เบอร์โทรไม่ถูกต้อง');
  if (intake.rooms.reduce((n, r) => n + (+r.count || 0), 0) > 8) add('warn', 'W7', 'มีมากกว่า 8 ห้อง อาจไม่ใช่โฮมสเตย์');
  if (/https?:\/\/|www\./i.test(draft.desc_th + ' ' + draft.desc_en)) add('warn', 'W8', 'มีลิงก์ในคำอธิบาย');
  return f;
}
