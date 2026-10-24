// Choices shown in the owner's form.
export const ROOM_TYPES = ['ห้องเตียงเดี่ยว', 'ห้องเตียงคู่', 'ห้องครอบครัว', 'บ้านเดี่ยว/วิลล่า', 'ห้องริมน้ำ', 'ห้องสวน', 'ห้องนอนรวม'];
export const AMENITIES = ['Wi-Fi', 'แอร์', 'พัดลม', 'น้ำอุ่น', 'ห้องน้ำในตัว', 'ที่จอดรถ', 'อาหารเช้า', 'ครัว/ทำอาหารได้', 'ระเบียง/วิวริมน้ำ', 'ทีวี', 'ตู้เย็น', 'เครื่องซักผ้า', 'สระว่ายน้ำ', 'รับสัตว์เลี้ยง'];
// Ticked amenities plus whatever the owner typed under "อื่นๆ" (comma-separated).
export const allAmenities = i => [
  ...(i.amenities || []),
  ...(i.amenityOtherOn ? String(i.amenityOther || '').split(/[,，、]/).map(s => s.trim()).filter(Boolean) : []),
];
