// Copy cards: bite-size text the owner pastes into Agoda. Owner: B (AI and logic)
import { provinceOf } from '../data/shapes.js';

/** @returns {{id:string,label:string,text:string}[]} */
export function buildCopyCards(state) {
  const a = state.answers || {};
  const L = state.listing;
  const prov = provinceOf(a.place);
  const cards = [
    { id: 'name_en', label: 'ชื่อที่พัก (อังกฤษ)', text: L?.en?.title || '' },
    { id: 'name_th', label: 'ชื่อที่พัก (ไทย)', text: a.name || '' },
    { id: 'place', label: 'ที่อยู่', text: a.place ? `${a.place}${prov ? '' : ''}` : '' },
    { id: 'rooms', label: 'จำนวนห้อง', text: a.rooms != null ? String(a.rooms) : '' },
    { id: 'guests', label: 'แขกสูงสุด', text: a.guests != null ? String(a.guests) : '' },
    { id: 'price', label: 'ราคาเริ่มต้นต่อคืน (บาท)', text: a.price != null ? String(a.price) : '' },
    { id: 'desc_en', label: 'คำอธิบาย (อังกฤษ)', text: L?.en?.description || '' },
    { id: 'desc_th', label: 'คำอธิบาย (ไทย)', text: L?.th?.description || '' },
    { id: 'desc_zh', label: 'คำอธิบาย (จีน)', text: L?.zh?.description || '' },
  ];
  return cards.filter((c) => c.text);
}
