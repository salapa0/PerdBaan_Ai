// Every booking/discovery channel the demo can connect, as DATA.
// Adding a channel = adding one object here (screens, copy cards, link check, verify).
// The Connections page, the coach walk-through and the staff console all read from this array,
// so platform #3 is nearly free — that is the whole pitch: "a channel is data, not a rebuild".
import { allAmenities, MIN_PHOTOS } from './options.js';

// Link validators (shared shape: (url) => { ok, msg }).
const agodaOk = url => /^(https?:\/\/)?(www\.)?agoda\.com\/[^\s/][^\s]*$/i.test((url || '').trim());
const googleOk = url => /^(https?:\/\/)?(www\.)?(google\.[a-z.]+\/maps\/|maps\.app\.goo\.gl\/|goo\.gl\/maps\/|g\.page\/|business\.google\.[a-z.]+\/)[^\s]+$/i.test((url || '').trim());

// Step 4 of every platform's sign-up is the photos page: the coach shows the photos from the owner's form.
const photoCard = intake => {
  const n = (intake.photos || []).length;
  return { screen: 'photos', label: 'รูปภาพ', hintOnly: true,
    value: n ? `อัปโหลดรูปทั้ง ${n} รูปที่เพิ่มไว้ โดยรูปแรกเป็นรูปปก` : `ยังไม่ได้เพิ่มรูป กรุณากลับไปหน้ากรอกข้อมูลแล้วเพิ่มอย่างน้อย ${MIN_PHOTOS} รูป` };
};

export const platforms = [
  {
    id: 'agoda', name: 'Agoda', short: 'Agoda', kind: 'booking',
    role: 'ช่องทางรับจองและชำระเงิน',
    blurb: 'รับการจองและชำระเงินออนไลน์ โดย Agoda คิดค่าคอมมิชชันต่อการจอง (เปิดบ้านไม่คิดค่าคอมมิชชัน)',
    needs: '',
    verify: { btn: 'จำลองว่า Agoda อนุมัติแล้ว', wait: 'รอ Agoda ตรวจสอบที่พัก (ปกติประมาณ 72 ชั่วโมง)' },
    screens: [
      { screen: 'property',    title: 'ชื่อที่พัก',       field: 'Property name' },
      { screen: 'location',    title: 'ที่ตั้งและการติดต่อ', field: 'Location & contact' },
      { screen: 'rooms',       title: 'ห้องพักและราคา',   field: 'Rooms & rates' },
      { screen: 'photos',      title: 'รูปภาพ',           field: 'Photos' },
      { screen: 'description', title: 'คำอธิบายที่พัก',   field: 'Property description' },
    ],
    cards(draft, intake) {
      const c = [];
      c.push({ screen: 'property', label: 'ชื่อที่พัก (EN)', value: draft.title_en });
      c.push({ screen: 'property', label: 'ชื่อที่พัก (TH)', value: draft.title_th });
      c.push({ screen: 'location', label: 'ที่อยู่', value: intake.location });
      c.push({ screen: 'location', label: 'เบอร์โทรศัพท์', value: intake.contact.phone });
      c.push({ screen: 'location', label: 'หมุดแผนที่', value: 'ปักหมุดตรงทางเข้าบ้านพัก', hintOnly: true });
      intake.rooms.forEach(r => c.push({ screen: 'rooms', label: `${r.name} (${r.count} ห้อง) ราคา/คืน`, value: String(r.price) }));
      c.push(photoCard(intake));
      c.push({ screen: 'description', label: 'คำอธิบาย (EN)', value: draft.desc_en });
      c.push({ screen: 'description', label: 'คำอธิบาย (TH)', value: draft.desc_th });
      const am = allAmenities(intake);
      if (am.length) c.push({ screen: 'description', label: 'สิ่งอำนวยความสะดวก', value: am.join(', ') });
      return c;
    },
    link: {
      title: 'สมัครเสร็จแล้ว กรุณาวางลิงก์หน้าที่พักของคุณบน Agoda',
      label: 'ลิงก์ Agoda', placeholder: 'https://www.agoda.com/…',
      sent: '✓ ส่งลิงก์แล้ว รอ Agoda อนุมัติ',
      wait: 'ได้รับลิงก์แล้วค่ะ รอ Agoda อนุมัติ',
      check: url => ({ ok: agodaOk(url), msg: agodaOk(url) ? 'ลิงก์ถูกต้อง' : 'ต้องเป็นลิงก์หน้าที่พักบน agoda.com' }),
    },
    liveMsg: name => `🎉 ประกาศของ ${name} ขึ้นบน Agoda แล้ว รับการจองได้เลยค่ะ`,
    // Lines on this channel's own announcement card in the chat (shown the moment the channel goes live).
    announce: i => { const ps = i.rooms.map(r => +r.price).filter(Boolean); return [`ห้องพัก ${i.rooms.reduce((n, r) => n + (+r.count || 0), 0)} ห้อง${ps.length ? ` · เริ่ม ${Math.min(...ps)} บาท/คืน` : ''}`, 'รับการจองและชำระเงินผ่าน Agoda']; },
    sample: 'https://www.agoda.com/baan-suan-rim-nan/hotel/nan-th.html',
  },
  {
    id: 'google', name: 'Google Business Profile', short: 'Google', kind: 'discovery',
    role: 'ให้แขกค้นเจอบน Google Maps และรีวิว',
    blurb: 'แสดงบน Google Maps และการค้นหา ให้แขกค้นเจอและเขียนรีวิวได้ ไม่มีระบบจองหรือชำระเงิน และไม่มีค่าคอมมิชชัน',
    needs: 'ต้องมีบัญชี Gmail ก่อนเริ่มสมัคร หากยังไม่มี เจ้าหน้าที่ช่วยสมัครให้ได้ค่ะ',
    verify: { btn: 'จำลองว่า Google ยืนยันแล้ว', wait: 'รอ Google ยืนยันตัวตน (ทางวิดีโอหรือไปรษณียบัตร ปกติ 2–5 วัน)' },
    screens: [
      { screen: 'name',     title: 'ชื่อธุรกิจ',           field: 'Business name' },
      { screen: 'category', title: 'หมวดหมู่ธุรกิจ',       field: 'Business category' },
      { screen: 'address',  title: 'ที่อยู่และหมุดแผนที่', field: 'Address & map pin' },
      { screen: 'photos',   title: 'รูปภาพ',               field: 'Photos' },
      { screen: 'contact',  title: 'โทรศัพท์และเว็บไซต์',   field: 'Phone & website' },
      { screen: 'hours',    title: 'เวลาทำการ',            field: 'Opening hours' },
    ],
    cards(draft, intake) {
      const c = [];
      c.push({ screen: 'name', label: 'ชื่อธุรกิจ (EN)', value: draft.title_en });
      c.push({ screen: 'name', label: 'ชื่อธุรกิจ (TH)', value: draft.title_th });
      c.push({ screen: 'name', label: 'คำอธิบายธุรกิจ (EN)', value: draft.desc_en });
      c.push({ screen: 'category', label: 'หมวดหมู่', value: 'Guest house' });
      c.push({ screen: 'category', label: 'หมวดหมู่ทางเลือก', value: 'Bed & breakfast' });
      c.push({ screen: 'address', label: 'ที่อยู่', value: intake.location });
      c.push({ screen: 'address', label: 'หมุดแผนที่', value: 'ลากหมุดให้ตรงทางเข้าบ้านพัก แขกใช้นำทาง', hintOnly: true });
      c.push(photoCard(intake));
      c.push({ screen: 'contact', label: 'เบอร์โทรศัพท์', value: intake.contact.phone });
      c.push({ screen: 'hours', label: 'เวลาทำการ (เช็กอิน/เช็กเอาต์)', value: 'เช็กอิน 14:00 · เช็กเอาต์ 11:00 (ปรับได้)', hintOnly: true });
      return c;
    },
    link: {
      title: 'ยืนยันเสร็จแล้ว กรุณาวางลิงก์โปรไฟล์ธุรกิจ / Google Maps ของคุณ',
      label: 'ลิงก์ Google Maps / โปรไฟล์ธุรกิจ', placeholder: 'https://maps.app.goo.gl/… หรือ https://g.page/…',
      sent: '✓ ส่งลิงก์แล้ว รอ Google ยืนยันตัวตน',
      wait: 'ได้รับลิงก์แล้วค่ะ รอ Google ยืนยันตัวตน',
      check: url => ({ ok: googleOk(url), msg: googleOk(url) ? 'ลิงก์ถูกต้อง' : 'ต้องเป็นลิงก์ Google Maps หรือโปรไฟล์ธุรกิจ (maps.app.goo.gl, g.page, google.com/maps)' }),
    },
    liveMsg: name => `🎉 ${name} ขึ้นบน Google Maps แล้ว แขกค้นเจอและเขียนรีวิวได้เลยค่ะ`,
    announce: i => [`📍 ${i.location}`, `📞 ${i.contact.phone}`],
    sample: 'https://maps.app.goo.gl/baan-suan-rim-nan',
  },
];

export const getPlatform = id => platforms.find(p => p.id === id) || platforms[0];
