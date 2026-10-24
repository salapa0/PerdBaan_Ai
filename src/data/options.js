// Choices shown in the owner's form.
export const ROOM_TYPES = ['ห้องเตียงเดี่ยว', 'ห้องเตียงคู่', 'ห้องครอบครัว', 'บ้านเดี่ยว/วิลล่า', 'ห้องริมน้ำ', 'ห้องสวน', 'ห้องนอนรวม'];
export const AMENITIES = ['Wi-Fi', 'แอร์', 'พัดลม', 'น้ำอุ่น', 'ห้องน้ำในตัว', 'ที่จอดรถ', 'อาหารเช้า', 'ครัว/ทำอาหารได้', 'ระเบียง/วิวริมน้ำ', 'ทีวี', 'ตู้เย็น', 'เครื่องซักผ้า', 'สระว่ายน้ำ', 'รับสัตว์เลี้ยง'];
// Ticked amenities plus whatever the owner typed under "อื่นๆ" (comma-separated).
export const allAmenities = i => [
  ...(i.amenities || []),
  ...(i.amenityOtherOn ? String(i.amenityOther || '').split(/[,，、]/).map(s => s.trim()).filter(Boolean) : []),
];

// Photo limits for the form (the preview and the checks use the same numbers).
export const MAX_PHOTOS = 10;
export const MIN_PHOTOS = 5;

// English and Chinese names for every choice above, so the EN / 中文 preview pages
// need no Thai. Anything the owner typed themselves is translated by the AI
// (draft.tr_en / draft.tr_zh) — see src/data/i18n.js.
export const TERMS = {
  'ห้องเตียงเดี่ยว': { en: 'Single Bed Room', zh: '单人床房' },
  'ห้องเตียงคู่': { en: 'Double Bed Room', zh: '双人床房' },
  'ห้องครอบครัว': { en: 'Family Room', zh: '家庭房' },
  'บ้านเดี่ยว/วิลล่า': { en: 'Private House / Villa', zh: '独栋房屋/别墅' },
  'ห้องริมน้ำ': { en: 'Riverside Room', zh: '河畔客房' },
  'ห้องสวน': { en: 'Garden Room', zh: '花园房' },
  'ห้องนอนรวม': { en: 'Dormitory Room', zh: '多人间' },
  'Wi-Fi': { en: 'Wi-Fi', zh: 'Wi-Fi' },
  'แอร์': { en: 'Air conditioning', zh: '空调' },
  'พัดลม': { en: 'Fan', zh: '风扇' },
  'น้ำอุ่น': { en: 'Hot water', zh: '热水' },
  'ห้องน้ำในตัว': { en: 'Private bathroom', zh: '独立卫生间' },
  'ที่จอดรถ': { en: 'Parking', zh: '停车位' },
  'อาหารเช้า': { en: 'Breakfast', zh: '早餐' },
  'ครัว/ทำอาหารได้': { en: 'Kitchen (cooking allowed)', zh: '厨房（可自行做饭）' },
  'ระเบียง/วิวริมน้ำ': { en: 'Balcony / riverside view', zh: '阳台/河景' },
  'ทีวี': { en: 'TV', zh: '电视' },
  'ตู้เย็น': { en: 'Refrigerator', zh: '冰箱' },
  'เครื่องซักผ้า': { en: 'Washing machine', zh: '洗衣机' },
  'สระว่ายน้ำ': { en: 'Swimming pool', zh: '游泳池' },
  'รับสัตว์เลี้ยง': { en: 'Pets allowed', zh: '可携带宠物' },
};

// Things the owner typed that the dictionary above does not cover
// (a custom room type, "other" amenities). The AI translates these.
export const customTerms = i => [...new Set([
  ...i.rooms.map(r => String(r.name || '').trim()),
  ...allAmenities(i),
].filter(t => t && !TERMS[t]))];
