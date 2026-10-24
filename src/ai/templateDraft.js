// Rule-based fallback listing built from the owner's OWN intake (no AI).
// Used when the AI fails/times out for a homestay that is NOT the prepared demo,
// so a judge typing their own data never sees the demo homestay's text.
import { enLabel, thLabel } from '../data/options.js';
import { suggestPrice } from '../rules/suggestPrice.js';

const ZH_FAC = { wifi: '免费Wi-Fi', parking: '停车位', hotwater: '热水', aircon: '空调', fan: '风扇', kitchen: '厨房', fridge: '冰箱', tv: '电视', towel: '毛巾', bike: '免费自行车', shuttle: '接送服务（收费）', laundry: '洗衣服务' };
const ZH_NEAR = { rice: '稻田', temple: '寺庙', waterfall: '瀑布', mountain: '山景', river: '河流/湖泊', market: '当地市场', farm: '农场', viewpoint: '观景点' };
const ZH_MEAL = { none: '', breakfast_incl: '含早餐', breakfast_paid: '可提供早餐（收费）', all_meals: '可提供三餐' };

export function templateDraft(intake) {
  const p = intake.place || {};
  const a = intake.answers || {};
  const name = p.name || 'โฮมสเตย์';
  const where = [p.district, p.province].filter(Boolean).join(' ');
  const whereEn = [p.district, p.province].filter(Boolean).join(', ');
  const rooms = intake.rooms || [];
  const totalRooms = rooms.reduce((s, r) => s + (r.count || 0), 0);
  const facTh = (a.facilities || []).map(id => thLabel('fac', id));
  const facEn = (a.facilities || []).map(id => enLabel('fac', id));
  const nearTh = (a.nearby || []).map(id => thLabel('nearby', id));
  const nearEn = (a.nearby || []).map(id => enLabel('nearby', id));
  const mealTh = a.meal && a.meal !== 'none' ? thLabel('meal', a.meal) : '';
  const mealEn = a.meal && a.meal !== 'none' ? enLabel('meal', a.meal) : '';
  const band = suggestPrice(intake);

  const desc_th = [
    `${name} ที่พักบรรยากาศเป็นกันเองใน${where || 'ชุมชน'}`,
    `มีห้องพักทั้งหมด ${totalRooms} ห้อง ${rooms.map(r => r.name || thLabel('room', r.type)).join(', ')}`,
    facTh.length ? `สิ่งอำนวยความสะดวก: ${facTh.join(', ')}` : '',
    mealTh ? `${mealTh}` : '',
    nearTh.length ? `ใกล้${nearTh.join(', ')}${a.nearbyOther ? ', ' + a.nearbyOther : ''}` : '',
    a.note || '',
    `เช็คอิน ${a.checkin || '14:00'} เช็คเอาท์ ${a.checkout || '11:00'}${a.pets ? ' พาสัตว์เลี้ยงมาได้' : ''}`,
  ].filter(Boolean).join(' ');

  const desc_en = [
    `${name} is a friendly local homestay${whereEn ? ' in ' + whereEn + ', Thailand' : ' in Thailand'}.`,
    `It has ${totalRooms} room${totalRooms === 1 ? '' : 's'}: ${rooms.map(r => (r.name ? r.name + ' (' + enLabel('room', r.type) + ')' : enLabel('room', r.type))).join(', ')}.`,
    facEn.length ? `Facilities include ${facEn.join(', ')}.` : '',
    mealEn ? `${mealEn}.` : '',
    nearEn.length ? `Nearby you can enjoy ${nearEn.join(', ')}.` : '',
    `Check-in from ${a.checkin || '14:00'}, check-out by ${a.checkout || '11:00'}.${a.pets ? ' Pets are welcome.' : ''}`,
  ].filter(Boolean).join(' ');

  const facZh = (a.facilities || []).map(id => ZH_FAC[id]).filter(Boolean);
  const nearZh = (a.nearby || []).map(id => ZH_NEAR[id]).filter(Boolean);
  const desc_zh = [
    `${name}是一家温馨的泰国本地民宿${p.province ? '（' + p.province + '）' : ''}。`,
    `共有${totalRooms}间客房。`,
    facZh.length ? `设施包括${facZh.join('、')}。` : '',
    ZH_MEAL[a.meal] ? `${ZH_MEAL[a.meal]}。` : '',
    nearZh.length ? `附近有${nearZh.join('、')}。` : '',
    `入住时间${a.checkin || '14:00'}，退房时间${a.checkout || '11:00'}。${a.pets ? '欢迎携带宠物。' : ''}`,
  ].filter(Boolean).join('');

  // highlights: up to 4 from nearby + meal + facilities + pets
  const hl = [];
  if (nearTh.length) hl.push({ th: `ใกล้${nearTh.slice(0, 2).join(' และ ')}`, en: `Near ${nearEn.slice(0, 2).join(' and ')}`, zh: `靠近${nearZh.slice(0, 2).join('与')}` });
  if (mealTh) hl.push({ th: mealTh, en: mealEn, zh: ZH_MEAL[a.meal] || mealEn });
  if (facTh.length) hl.push({ th: facTh.slice(0, 3).join(' · '), en: facEn.slice(0, 3).join(' · '), zh: facZh.slice(0, 3).join(' · ') || facEn.slice(0, 3).join(' · ') });
  if (a.pets) hl.push({ th: 'พาสัตว์เลี้ยงมาได้', en: 'Pet-friendly', zh: '可携带宠物' });
  while (hl.length < 3) hl.push({ th: 'เจ้าของเป็นกันเอง ดูแลใกล้ชิด', en: 'Friendly, hands-on hosts', zh: '主人热情周到' });

  return {
    title_th: `${name}${p.province ? ' จ.' + p.province : ''}`.slice(0, 60),
    title_en: `${name} — Homestay${p.province ? ' in ' + p.province : ''}`.slice(0, 70),
    title_zh: `${name} — 泰国民宿`,
    desc_th, desc_en, desc_zh,
    highlights: hl.slice(0, 5),
    price: { ...band, reason_th: `คำนวณจากราคาห้องหลักของคุณ ปัดเป็น ${band.value} บาท/คืน ช่วงแนะนำ ${band.low}-${band.high} บาท เป็นคำแนะนำจากราคาของคุณเอง ยังไม่ใช่ราคาตลาด` },
  };
}
