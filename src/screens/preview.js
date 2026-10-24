// S4 — Thai (and EN/ZH) preview of the listing + approve / request change.
import { h, money, toast, TEXT } from '../ui/ui.js';
import { getState, setState } from '../state.js';
import { botSay } from '../ui/chat.js';
import { photoURL } from '../photos.js';
import { enLabel, thLabel } from '../data/options.js';
import { savedDraft } from '../data/savedDraft.js';
import { demoHomestay } from '../data/demoHomestay.js';

const L = (d, base, lang) => d[`${base}_${lang}`] || d[`${base}_th`] || '';

function carousel(intake) {
  const photos = intake.photos || [];
  let idx = 0;
  const img = h('img', { src: '', alt: '' });
  const dots = h('div', { class: 'dots' }, ...photos.map((_, i) => h('i', { class: i === 0 ? 'on' : '' })));
  async function paint() {
    const url = photos[idx] ? await photoURL(photos[idx].id) : null;
    img.src = url || 'public/demo-photos/01-front.jpg';
    [...dots.children].forEach((d, i) => d.className = i === idx ? 'on' : '');
  }
  const go = (d) => { idx = (idx + d + photos.length) % photos.length; paint(); };
  paint();
  return h('div', { class: 'carousel' },
    img,
    photos.length > 1 ? h('button', { class: 'nav l', on: { click: () => go(-1) } }, '‹') : null,
    photos.length > 1 ? h('button', { class: 'nav r', on: { click: () => go(1) } }, '›') : null,
    dots,
  );
}

function requestChangeSheet(onClose) {
  const picks = ['ชื่อ', 'คำอธิบาย', 'ราคา', 'รูป'];
  let picked = 'คำอธิบาย';
  const chips = h('div', { class: 'chip-row' }, ...picks.map(p => {
    const c = h('span', { class: 'chip' + (p === picked ? ' on' : ''), on: { click: () => { picked = p; [...chips.children].forEach(x => x.classList.toggle('on', x.textContent === picked)); } } }, p);
    return c;
  }));
  const ta = h('textarea', { maxlength: 100, placeholder: 'บอกสิ่งที่อยากแก้ เช่น อยากให้เน้นว่าเงียบสงบ' });
  const sheet = h('div', { class: 'sheet' },
    h('div', { class: 'sheet-head' }, h('span', { class: 's-title' }, TEXT.preview.reqTitle), h('button', { class: 'x', on: { click: onClose } }, '✕')),
    h('div', { class: 'sheet-body' }, h('div', { class: 'field' }, chips), h('div', { class: 'field' }, ta)),
    h('div', { class: 'sheet-foot' }, h('button', { class: 'btn primary block', on: { click: () => onClose(picked, ta.value) } }, TEXT.preview.reqSend)),
  );
  return sheet;
}

export function previewScreen(state) {
  const d = state.draft;
  const i = state.intake;
  if (!d) return h('div', { class: 'pv' }, h('div', { style: 'padding:30px;text-align:center;color:#888' }, 'ยังไม่มีร่างประกาศ'));
  const lang = state.review.activeLang || 'th';
  const rounds = state.review.changeRounds || 0;
  const modalRoot = document.getElementById('modal-root');

  const langSwitch = h('div', { class: 'lang-switch' },
    ...[['th', 'TH'], ['en', 'EN'], ['zh', '中文']].map(([code, label]) =>
      h('button', { class: lang === code ? 'on' : '', on: { click: () => setState({ review: { ...state.review, activeLang: code } }) } }, label)),
  );

  const reasonBox = h('div', { class: 'pv-reason', hidden: true }, d.price?.reason_th || '');
  const why = h('button', { class: 'pv-why', on: { click: () => { reasonBox.hidden = !reasonBox.hidden; } } }, TEXT.preview.why);

  function openRequestChange() {
    if (rounds >= 2) return;
    const close = (picked, text) => {
      modalRoot.replaceChildren();
      if (picked !== undefined) {
        // demo: apply one canned single-field revision
        // canned revision only applies to the prepared demo homestay; for anyone else
        // we just log the request for staff (never paste demo text into their listing)
        const isDemo = i.place?.name === demoHomestay.place.name;
        const rev = isDemo && savedDraft.revisions && savedDraft.revisions[0];
        const nd = JSON.parse(JSON.stringify(d));
        if (rev) nd[rev.field] = rev.value;
        if (!rev) { toast('ส่งคำขอแก้ไขให้ทีมงานแล้ว'); setState({ review: { ...state.review, changeRounds: rounds + 1, lastRequest: { picked, text } } }); return; }
        setState({ draft: nd, review: { ...state.review, changeRounds: rounds + 1, editedFields: [...(state.review.editedFields || []), rev ? rev.field : 'desc_th'] } });
        toast('แก้ไขให้แล้ว');
      }
    };
    modalRoot.replaceChildren(requestChangeSheet(close));
  }

  async function approve() {
    setState({ approval: { status: 'approved' }, review: { ...state.review, status: 'approved' }, stage: 'review' });
    await botSay(TEXT.afterApprove);
    await botSay({ card: { title: TEXT.conn.title, body: TEXT.conn.sub, buttons: [{ label: TEXT.goConnections, action: 'open_connections' }] } });
  }

  const rooms = (i.rooms || []).map(r => h('div', { class: 'pv-room' },
    h('div', { class: 'r-name' }, r.name || thLabel('room', r.type)),
    h('div', {}, `${(r.beds || []).map(b => `${thLabel('bed', b.type)}×${b.qty}`).join(', ')} · รับ ${r.maxGuests} คน · ${r.bathroom === 'private' ? 'ห้องน้ำในตัว' : 'ห้องน้ำรวม'}`),
    h('div', { style: 'font-weight:700;color:var(--line-green-d)' }, money(r.price) + ' ' + TEXT.preview.perNight),
  ));

  const facs = (i.answers.facilities || []).map(f => h('span', { class: 'pv-fac' }, thLabel('fac', f)));
  const hlChips = (d.highlights || []).map(hl => h('span', { class: 'chip on', style: 'cursor:default' }, lang === 'th' ? hl.th : lang === 'en' ? hl.en : (hl.zh || hl.en)));

  return h('div', { class: 'pv' },
    h('div', { class: 'pv-note' }, TEXT.preview.note),
    langSwitch,
    carousel(i),
    h('div', { class: 'pv-body' },
      h('h2', { class: 'pv-title' }, L(d, 'title', lang)),
      h('div', { class: 'pv-loc' }, `${i.place.district || ''} ${i.place.province || ''}`),
      h('div', { class: 'pv-price' }, `${TEXT.preview.recommend} ${money(d.price?.value)} ${TEXT.preview.perNight}`),
      why, reasonBox,
      h('div', { class: 'pv-hl' }, ...hlChips),
      h('div', { class: 'pv-desc' }, L(d, 'desc', lang)),
      h('div', { class: 'pv-sec-t' }, TEXT.preview.rooms),
      ...rooms,
      h('div', { class: 'pv-sec-t' }, TEXT.preview.facilities),
      h('div', { class: 'pv-facs' }, ...facs),
      h('div', { class: 'pv-sec-t' }, TEXT.preview.rules),
      h('div', { class: 'pv-rules' }, `เช็คอิน ${i.answers.checkin} · เช็คเอาท์ ${i.answers.checkout} · สูบบุหรี่: ${i.answers.smoking ? 'ได้' : 'ไม่ได้'} · สัตว์เลี้ยง: ${i.answers.pets ? 'ได้' : 'ไม่ได้'}`),
    ),
    h('div', { class: 'pv-foot' },
      h('button', { class: 'btn ghost', disabled: rounds >= 2, on: { click: openRequestChange } }, rounds >= 2 ? TEXT.preview.maxRounds : TEXT.preview.requestChange),
      h('button', { class: 'btn primary', on: { click: approve } }, TEXT.preview.approve),
    ),
  );
}
