// Validate that a pasted link looks like an Agoda listing link.
export function checkAgodaLink(raw) {
  let url = String(raw || '').trim();
  if (!url) return { ok: false, reason_th: 'ยังไม่ได้วางลิงก์' };
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  let u;
  try { u = new URL(url); } catch { return { ok: false, reason_th: 'นี่ไม่ใช่ลิงก์' }; }
  const host = u.hostname.toLowerCase();
  if (host !== 'agoda.com' && !host.endsWith('.agoda.com')) {
    return { ok: false, reason_th: 'ลิงก์นี้ไม่ใช่ของ Agoda' };
  }
  if (u.pathname === '/' || u.pathname === '') {
    return { ok: false, reason_th: 'นี่คือหน้าแรกของ Agoda กรุณาวางลิงก์ประกาศของคุณ' };
  }
  return { ok: true, url: u.href };
}
