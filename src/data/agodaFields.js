// Agoda sign-up screens in order, each field with Agoda's English label and a mapper.
// C should confirm exact labels/order against the real captured screenshots.
import { enLabel, MEALS, MAP } from './options.js';

export function bedString(room) {
  return (room.beds || []).map(b => `${b.qty} ${enLabel('bed', b.type)}${b.qty > 1 ? 's' : ''}`).join(', ');
}
export function facilitiesString(i) {
  return (i.answers.facilities || []).map(id => enLabel('fac', id)).join(', ');
}
const mealEn = (id) => (MAP.meal[id]?.en) || id;

export const agodaScreens = [
  {
    screen: 'agoda-01', name_th: 'เริ่มสมัครพาร์ทเนอร์', fields: [
      { agodaField: 'Property type', label_th: 'ประเภทที่พัก', from: () => 'Homestay' },
    ],
  },
  {
    screen: 'agoda-02', name_th: 'บัญชีผู้ใช้', fields: [
      { agodaField: 'Contact name', label_th: 'ชื่อผู้ติดต่อ', from: (d, i) => i.owner?.name || '' },
      { agodaField: 'Email', label_th: 'อีเมล', from: (d, i) => i.contact.email || '' },
      { agodaField: 'Phone number', label_th: 'เบอร์โทร', from: (d, i) => i.contact.phone || '' },
    ],
  },
  {
    screen: 'agoda-03', name_th: 'ข้อมูลที่พัก', fields: [
      { agodaField: 'Property name', label_th: 'ชื่อที่พัก', from: (d, i) => i.place.name || '' },
      { agodaField: 'Listing headline (EN)', label_th: 'หัวข้อประกาศ (อังกฤษ)', from: (d) => d.title_en || '' },
    ],
  },
  {
    screen: 'agoda-04', name_th: 'ที่ตั้ง', fields: [
      { agodaField: 'Street address', label_th: 'ที่อยู่', from: (d, i) => i.place.address || '' },
      { agodaField: 'District', label_th: 'อำเภอ', from: (d, i) => i.place.district || '' },
      { agodaField: 'Province', label_th: 'จังหวัด', from: (d, i) => i.place.province || '' },
      { agodaField: 'Postal code', label_th: 'รหัสไปรษณีย์', from: (d, i) => i.place.postcode || '' },
      { agodaField: 'Country', label_th: 'ประเทศ', from: () => 'Thailand' },
    ],
  },
  {
    screen: 'agoda-05', name_th: 'ห้องพักและราคา', repeatPerRoom: true, fields: [
      { agodaField: 'Room name', label_th: 'ชื่อห้อง', from: (room) => room.name || enLabel('room', room.type) },
      { agodaField: 'Number of rooms', label_th: 'จำนวนห้อง', from: (room) => String(room.count) },
      { agodaField: 'Bed configuration', label_th: 'เตียง', from: (room) => bedString(room) },
      { agodaField: 'Max occupancy', label_th: 'รับได้สูงสุด', from: (room) => String(room.maxGuests) },
      { agodaField: 'Bathroom', label_th: 'ห้องน้ำ', from: (room) => room.bathroom === 'private' ? 'Private' : 'Shared' },
      { agodaField: 'Base rate per night (THB)', label_th: 'ราคาต่อคืน', from: (room) => String(room.price) },
    ],
  },
  {
    screen: 'agoda-06', name_th: 'สิ่งอำนวยความสะดวกและกฎ', fields: [
      { agodaField: 'Facilities', label_th: 'สิ่งอำนวยความสะดวก', from: (d, i) => facilitiesString(i) },
      { agodaField: 'Breakfast', label_th: 'อาหารเช้า', from: (d, i) => mealEn(i.answers.meal) },
      { agodaField: 'Check-in time', label_th: 'เวลาเช็คอิน', from: (d, i) => i.answers.checkin },
      { agodaField: 'Check-out time', label_th: 'เวลาเช็คเอาท์', from: (d, i) => i.answers.checkout },
      { agodaField: 'Smoking allowed', label_th: 'สูบบุหรี่', from: (d, i) => i.answers.smoking ? 'Yes' : 'No' },
      { agodaField: 'Pets allowed', label_th: 'สัตว์เลี้ยง', from: (d, i) => i.answers.pets ? 'Yes' : 'No' },
    ],
  },
  {
    screen: 'agoda-07', name_th: 'เนื้อหาประกาศ', fields: [
      { agodaField: 'Property description (EN)', label_th: 'คำอธิบาย (อังกฤษ)', from: (d) => d.desc_en || '' },
      { agodaField: 'Property description (TH)', label_th: 'คำอธิบาย (ไทย)', from: (d) => d.desc_th || '' },
      { agodaField: 'Highlights', label_th: 'จุดเด่น', from: (d) => (d.highlights || []).map(hl => hl.en).join(' · ') },
    ],
  },
  {
    screen: 'agoda-08', name_th: 'การรับเงิน (ตรวจทานก่อนส่ง)', fields: [
      { agodaField: 'Bank name', label_th: 'ชื่อธนาคาร', hintOnly: true, from: () => 'ดูจากหน้าสมุดบัญชีของคุณ' },
      { agodaField: 'Account holder name', label_th: 'ชื่อบัญชี', hintOnly: true, from: () => 'ดูจากหน้าสมุดบัญชี (เราไม่เก็บเลขบัญชีของคุณ)' },
    ],
  },
];
