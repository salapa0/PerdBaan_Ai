export function checkAgodaLink(url) {
  const ok = /^(https?:\/\/)?(www\.)?agoda\.com\/[^\s/][^\s]*$/i.test((url || '').trim());
  return { ok, msg: ok ? 'ลิงก์ถูกต้อง' : 'ต้องเป็นลิงก์หน้าที่พักบน agoda.com' };
}
