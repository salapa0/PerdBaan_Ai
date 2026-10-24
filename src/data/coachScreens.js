// One entry per Agoda sign-up screen: vision hint (Plan A), filename match (Plan B),
// and the pre-written Thai explanation + next step (the reliable answer on stage).
export const coachScreens = {
  'agoda-01': {
    screen_id: 'agoda-01',
    describe: 'A welcome / get-started page to register a property as a partner. Has a "List your property" or "Get started" button and a property type choice.',
    explanation_th: 'หน้านี้คือหน้าเริ่มสมัคร เลือกประเภทที่พักเป็น "Homestay" แล้วกดปุ่มเริ่ม (Get started / List your property)',
    next_step_th: 'กดเริ่ม แล้วหน้าถัดไปจะให้สร้างบัญชีด้วยอีเมล',
  },
  'agoda-02': {
    screen_id: 'agoda-02',
    describe: 'An account sign-up form with fields for contact name, email and phone number, and a password field.',
    explanation_th: 'หน้านี้ให้สร้างบัญชี กดช่อง Email แล้ววางการ์ด "อีเมล" กดช่อง Contact name วางการ์ด "ชื่อผู้ติดต่อ" และใส่เบอร์โทรจากการ์ด "เบอร์โทร" ส่วนรหัสผ่านให้คุณตั้งเองและเก็บเป็นความลับ',
    next_step_th: 'ตั้งรหัสผ่านเอง แล้วกด Create account / Next',
  },
  'agoda-03': {
    screen_id: 'agoda-03',
    describe: 'A property details form with a Property name field and a listing title/headline field.',
    explanation_th: 'หน้านี้ให้ใส่ชื่อและหัวข้อที่พัก กดช่อง Property name แล้ววางการ์ด "ชื่อที่พัก" และช่องหัวข้อภาษาอังกฤษ วางการ์ด "หัวข้อประกาศ (อังกฤษ)" ได้เลย',
    next_step_th: 'กรอกแล้วกด Next เพื่อไปหน้าที่ตั้ง',
  },
  'agoda-04': {
    screen_id: 'agoda-04',
    describe: 'A location form with street address, district, city/province, postal code and a map pin.',
    explanation_th: 'หน้านี้คือที่ตั้ง วางการ์ด "ที่อยู่", "อำเภอ", "จังหวัด" และ "รหัสไปรษณีย์" ตามช่อง ส่วนหมุดแผนที่ ลากให้ตรงกับหมู่บ้านของคุณ',
    next_step_th: 'ตรวจหมุดแผนที่ให้ตรง แล้วกด Next',
  },
  'agoda-05': {
    screen_id: 'agoda-05',
    describe: 'A rooms and pricing form with room name, number of rooms, bed type, max occupancy and base rate per night.',
    explanation_th: 'หน้านี้ให้เพิ่มห้องพัก ทำทีละห้องตามการ์ดกลุ่ม "ห้องพักและราคา" ใส่ชื่อห้อง จำนวนห้อง เตียง จำนวนคนสูงสุด และราคาต่อคืน',
    next_step_th: 'เพิ่มครบทุกห้องแล้วกด Next',
  },
  'agoda-06': {
    screen_id: 'agoda-06',
    describe: 'A facilities and house-rules form with checkboxes for amenities, breakfast, check-in/out times, smoking and pets.',
    explanation_th: 'หน้านี้ให้ติ๊กสิ่งอำนวยความสะดวกตามการ์ด "สิ่งอำนวยความสะดวก" และตั้งเวลาเช็คอิน/เช็คเอาท์ รวมถึงกฎเรื่องสูบบุหรี่และสัตว์เลี้ยง',
    next_step_th: 'ติ๊กครบแล้วกด Next ไปหน้าเนื้อหา',
  },
  'agoda-07': {
    screen_id: 'agoda-07',
    describe: 'A content form with a long property description text area and a highlights field.',
    explanation_th: 'หน้านี้คือคำอธิบายที่พัก กดช่อง Description แล้ววางการ์ด "คำอธิบาย (อังกฤษ)" และ "คำอธิบาย (ไทย)" ส่วนจุดเด่น วางการ์ด "จุดเด่น"',
    next_step_th: 'วางเนื้อหาครบแล้วกด Next ไปหน้าตรวจทาน',
  },
  'agoda-08': {
    screen_id: 'agoda-08',
    advancesStep: true,
    describe: 'A final review / payout page summarising the listing with bank payout fields and a Submit button.',
    explanation_th: 'หน้านี้คือหน้าตรวจทานและการรับเงิน กรอกชื่อธนาคารและชื่อบัญชีจากหน้าสมุดบัญชีของคุณเอง (เราไม่เก็บเลขบัญชี) ตรวจข้อมูลให้ครบแล้วกด Submit เพื่อส่งให้ Agoda ตรวจ',
    next_step_th: 'กด Submit แล้วคัดลอกลิงก์ประกาศมาวางในขั้นสุดท้าย',
  },
};

// list form for the vision prompt (Plan A)
export const coachScreenList = Object.values(coachScreens)
  .map(s => `${s.screen_id}: ${s.describe}`);
