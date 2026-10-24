// Chip labels — every option as {id, th, en}. English feeds the AI prompt and copy cards.
export const ROOM_TYPES = [
  { id: 'double', th: 'ห้องเตียงคู่', en: 'Double room' },
  { id: 'twin', th: 'ห้องเตียงแฝด', en: 'Twin room' },
  { id: 'family', th: 'ห้องครอบครัว', en: 'Family room' },
  { id: 'dorm', th: 'ห้องรวม', en: 'Dormitory' },
  { id: 'floor', th: 'ที่นอนบนพื้น', en: 'Floor mattress room' },
];

export const BED_TYPES = [
  { id: 'single', th: 'เตียงเดี่ยว', en: 'Single bed' },
  { id: 'double', th: 'เตียงคู่', en: 'Double bed' },
  { id: 'queen', th: 'ควีน', en: 'Queen bed' },
  { id: 'king', th: 'คิง', en: 'King bed' },
  { id: 'mattress', th: 'ที่นอน', en: 'Mattress' },
];

export const FACILITIES = [
  { id: 'wifi', th: 'Wi-Fi', en: 'Free Wi-Fi' },
  { id: 'parking', th: 'ที่จอดรถ', en: 'Parking' },
  { id: 'hotwater', th: 'น้ำอุ่น', en: 'Hot water' },
  { id: 'aircon', th: 'แอร์', en: 'Air conditioning' },
  { id: 'fan', th: 'พัดลม', en: 'Fan' },
  { id: 'kitchen', th: 'ครัว', en: 'Kitchen' },
  { id: 'fridge', th: 'ตู้เย็น', en: 'Refrigerator' },
  { id: 'tv', th: 'ทีวี', en: 'TV' },
  { id: 'towel', th: 'ผ้าเช็ดตัว', en: 'Towels' },
  { id: 'bike', th: 'จักรยานให้ยืม', en: 'Free bicycle use' },
  { id: 'shuttle', th: 'รถรับส่ง (มีค่าบริการ)', en: 'Airport/transfer shuttle (surcharge)' },
  { id: 'laundry', th: 'ซักผ้า', en: 'Laundry' },
];

export const MEALS = [
  { id: 'none', th: 'ไม่มี', en: 'No meals' },
  { id: 'breakfast_incl', th: 'รวมอาหารเช้า', en: 'Breakfast included' },
  { id: 'breakfast_paid', th: 'อาหารเช้ามีค่าใช้จ่าย', en: 'Breakfast available (surcharge)' },
  { id: 'all_meals', th: 'มีอาหารทุกมื้อ', en: 'All meals available' },
];

export const NEARBY = [
  { id: 'rice', th: 'ทุ่งนา', en: 'Rice fields' },
  { id: 'temple', th: 'วัด', en: 'Temple' },
  { id: 'waterfall', th: 'น้ำตก', en: 'Waterfall' },
  { id: 'mountain', th: 'ภูเขา', en: 'Mountains' },
  { id: 'river', th: 'แม่น้ำ / ทะเลสาบ', en: 'River / lake' },
  { id: 'market', th: 'ตลาดชุมชน', en: 'Local market' },
  { id: 'farm', th: 'ฟาร์ม', en: 'Farm' },
  { id: 'viewpoint', th: 'จุดชมวิว', en: 'Viewpoint' },
];

export const PROVINCES = [
  'กระบี่','กรุงเทพมหานคร','กาญจนบุรี','กาฬสินธุ์','กำแพงเพชร','ขอนแก่น','จันทบุรี','ฉะเชิงเทรา','ชลบุรี','ชัยนาท',
  'ชัยภูมิ','ชุมพร','เชียงราย','เชียงใหม่','ตรัง','ตราด','ตาก','นครนายก','นครปฐม','นครพนม','นครราชสีมา','นครศรีธรรมราช',
  'นครสวรรค์','นนทบุรี','นราธิวาส','น่าน','บึงกาฬ','บุรีรัมย์','ปทุมธานี','ประจวบคีรีขันธ์','ปราจีนบุรี','ปัตตานี',
  'พระนครศรีอยุธยา','พะเยา','พังงา','พัทลุง','พิจิตร','พิษณุโลก','เพชรบุรี','เพชรบูรณ์','แพร่','ภูเก็ต','มหาสารคาม',
  'มุกดาหาร','แม่ฮ่องสอน','ยโสธร','ยะลา','ร้อยเอ็ด','ระนอง','ระยอง','ราชบุรี','ลพบุรี','ลำปาง','ลำพูน','เลย','ศรีสะเกษ',
  'สกลนคร','สงขลา','สตูล','สมุทรปราการ','สมุทรสงคราม','สมุทรสาคร','สระแก้ว','สระบุรี','สิงห์บุรี','สุโขทัย','สุพรรณบุรี',
  'สุราษฎร์ธานี','สุรินทร์','หนองคาย','หนองบัวลำภู','อ่างทอง','อำนาจเจริญ','อุดรธานี','อุตรดิตถ์','อุทัยธานี','อุบลราชธานี',
];

// helpers
const byId = (arr) => Object.fromEntries(arr.map(o => [o.id, o]));
export const MAP = {
  room: byId(ROOM_TYPES), bed: byId(BED_TYPES), fac: byId(FACILITIES),
  meal: byId(MEALS), nearby: byId(NEARBY),
};
export const enLabel = (group, id) => (MAP[group][id]?.en) || id;
export const thLabel = (group, id) => (MAP[group][id]?.th) || id;
