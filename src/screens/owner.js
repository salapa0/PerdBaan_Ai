// The owner's screens (chat, form, writing, preview, connections, coach). Return HTML strings.
import { state } from '../state.js';
import { esc } from '../ui/dom.js';
import { agodaScreens } from '../data/agodaFields.js';
import { buildCopyCards } from '../rules/buildCopyCards.js';
import { checkAgodaLink } from '../rules/checkAgodaLink.js';
import { suggestPrice } from '../rules/suggestPrice.js';

export const HEAD = {
  chat: ['line', 'เปิดบ้าน'], form: ['liff', 'กรอกข้อมูลบ้านพัก'], writing: ['liff', 'AI กำลังเขียน'],
  review: ['liff', 'รอเจ้าหน้าที่ตรวจ'], preview: ['liff', 'ดูตัวอย่างประกาศ'],
  connections: ['liff', 'การเชื่อมต่อ'], coach: ['liff', 'สมัคร Agoda'], live: ['liff', 'ขึ้นประกาศแล้ว'],
};
const field = (id, label, v, attr = '') => `<label for="f-${id}">${label}</label><input id="f-${id}" data-f="${id}" value="${esc(v)}" ${attr}>`;
const btn = (label, a, v = '', dis = false, cls = '') => `<button class="btn ${cls}" data-a="${a}" ${v ? `data-v="${v}"` : ''} ${dis ? 'disabled' : ''}>${label}</button>`;

export function screenHtml() {
  const s = state, i = s.intake, r = i.rooms[0];
  switch (s.step) {
    case 'chat': return `<div class="bub">สวัสดีค่ะ 👋 เปิดบ้านช่วยให้บ้านพักของคุณขึ้น Agoda ได้ ตอบไม่กี่ข้อ แล้ว AI เขียนประกาศให้ ไม่เก็บค่าคอมมิชชัน</div>`;
    case 'form': return field('name', 'ชื่อบ้านพัก', i.name) + field('location', 'ที่ตั้ง', i.location)
      + field('price', 'ราคาห้องหลักต่อคืน (บาท)', r.price, 'inputmode="numeric"') + field('rooms', 'จำนวนห้องหลัก', r.count, 'inputmode="numeric"')
      + field('phone', 'เบอร์โทร', i.contact.phone, 'inputmode="tel"') + field('features', 'จุดเด่น', i.features);
    case 'writing': return `<div class="spin"></div><p class="center">กำลังเขียนไทย อังกฤษ จีน…</p>`;
    case 'review': return `<div class="center pad"><p>เจ้าหน้าที่กำลังตรวจประกาศของคุณ</p><p class="muted">จะส่งตัวอย่างให้ในไม่ช้า</p></div>`;
    case 'preview': {
      const L = s.lang, d = s.draft, p = suggestPrice(i);
      return `<div class="tabs">${[['th', 'ไทย'], ['en', 'EN'], ['zh', '中文']].map(([k, n]) => `<button data-a="setLang" data-v="${k}" class="${L === k ? 'on' : ''}">${n}</button>`).join('')}</div>`
        + `<h3>${esc(d['title_' + L])}</h3><p>${esc(d['desc_' + L])}</p><p class="muted">ราคาที่แนะนำ ${p.value} บาท/คืน (ช่วง ${p.low}–${p.high}) · ${esc(i.contact.phone)}</p>`
        + (s.approved ? `<p class="ok">✓ คุณอนุมัติแล้ว</p>` : '');
    }
    case 'connections': return `<div class="card"><b>Agoda</b><small>ยังไม่ได้เชื่อมต่อ · เจ้าหน้าที่จะพาทำทีละขั้น</small></div>`;
    case 'coach': return coachHtml();
    case 'live': return `<div class="center pad"><p class="big ok">ประกาศขึ้น Agoda แล้ว 🎉</p><p>${esc(i.name)} พร้อมรับแขก</p></div>`;
  }
}

function coachHtml() {
  const s = state;
  if (s.coachStep === 5) {
    const ck = s.link ? checkAgodaLink(s.link) : null;
    return `<p>สมัครเสร็จแล้ว วางลิงก์หน้าที่พักของคุณบน Agoda</p><label for="f-link">ลิงก์ Agoda</label><input id="f-link" data-link placeholder="https://www.agoda.com/…" value="${esc(s.link)}">`
      + `<p id="link-msg" class="${ck ? (ck.ok ? 'ok' : 'err') : ''}">${ck ? ck.msg : ''}</p>` + (s.linkSent ? `<p class="ok">✓ ส่งลิงก์แล้ว รอ Agoda อนุมัติ</p>` : '');
  }
  const sc = agodaScreens[s.coachStep - 1], cards = buildCopyCards(s.draft, s.intake);
  const hl = s.coach && s.coach.screen_id === sc.screen ? s.coach.highlight : '';
  return `<div class="agoda"><small>Agoda · ขั้นที่ ${s.coachStep}/4</small><b>${sc.agoda}</b><i></i><i></i></div><p><b>${sc.title}</b> แตะการ์ดเพื่อคัดลอก</p>`
    + cards.map((c, n) => c.screen !== sc.screen ? '' : `<button class="card ${c.label === hl ? 'hl' : ''}" data-a="copy" data-v="${n}"><small>${esc(c.label)}${c.hintOnly ? ' · คำแนะนำ' : ''}</small>${esc(c.value)}</button>`).join('')
    + (s.coachStep === 4 ? `<label for="f-shot">ติดขัด? ส่งภาพหน้าจอ Agoda ให้ AI อธิบาย</label><input id="f-shot" type="file" accept="image/*" data-shot>` : '')
    + (s.coach ? `<p class="note">${esc(s.coach.explain_th)}</p>` : '');
}

export function dockHtml() {
  const s = state;
  switch (s.step) {
    case 'chat': return btn('เริ่มเลย', 'go', 'form');
    case 'form': return btn('ให้ AI เขียนประกาศ', 'write', '', !(s.intake.name && s.intake.location && +s.intake.rooms[0].price > 0 && s.intake.contact.phone)) + btn('ใช้บ้านตัวอย่าง', 'loadDemo', '', false, 'ghost');
    case 'preview': return s.approved ? btn('ไปที่หน้าการเชื่อมต่อ', 'go', 'connections') : btn('อนุมัติ', 'approveOwner');
    case 'connections': return btn('เพิ่มการเชื่อมต่อ', 'go', 'coach');
    case 'coach': return s.coachStep < 5 ? btn('ถัดไป', 'nextCoach') : btn('ส่งลิงก์', 'sendLink', '', !checkAgodaLink(s.link).ok || s.linkSent);
    default: return '';
  }
}
