// Live card: what the listing looks like once it is on Agoda (simulated). Owner: A (frontend)
import { h } from '../ui/dom.js';
import { LANG_LABEL } from '../data/shapes.js';
import { getPhotoUrls } from '../ui/photos.js';

export function render(root, s) {
  if (!s.live) {
    root.replaceChildren(h('div', { class: 'empty' }, h('div', { class: 'big' }, '⏳'), s.submitted ? 'รอเจ้าหน้าที่ยืนยัน' : 'ยังไม่ขึ้นระบบ',
      h('small', {}, s.submitted ? 'ทีมงานกำลังตรวจข้อมูลที่ส่งไป Agoda' : 'ทำขั้นเชื่อม Agoda ให้ครบก่อนค่ะ')));
    return;
  }
  const L = s.listing.th;
  const cover = h('div', { class: 'cover' });
  getPhotoUrls().then((urls) => { if (urls[0]) cover.style.backgroundImage = `url(${urls[0]})`; });
  root.replaceChildren(h('div', { class: 'scroll' },
    h('div', { class: 'live-banner' }, '🎉 ที่พักของคุณขึ้น Agoda แล้ว'),
    h('div', { class: 'livecard' },
      cover,
      h('div', { class: 'in' },
        h('h3', {}, L.title),
        h('div', { class: 'price' }, `เริ่มต้น ${s.answers.price} บาท/คืน`),
        h('div', { class: 'tags' }, Object.keys(LANG_LABEL).map((l) => h('span', {}, LANG_LABEL[l]))),
        h('p', { class: 'summary' }, L.summary),
      )),
    h('p', { class: 'fine' }, 'การ์ดนี้เป็นภาพจำลองเพื่อการสาธิต เปิดบ้านไม่รับจอง ไม่รับชำระเงิน และไม่เก็บค่าคอมมิชชัน การจองทั้งหมดเกิดบน Agoda'),
  ));
}
