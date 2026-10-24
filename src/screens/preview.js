<<<<<<< HEAD
// Listing preview (3 languages, editable). Owner: A (frontend)
import { h } from '../ui/dom.js';
import { update } from '../ui/store.js';
import { LANGS, LANG_LABEL } from '../data/shapes.js';
import { getPhotoUrls } from '../ui/photos.js';
import { generateAndStore, approveListing } from '../ui/actions.js';
import { runChecks } from '../rules/checks.js';

const view = { lang: 'th', edit: false };

function sourceBadge(src) {
  if (!src) return '';
  if (src.kind === 'ai') return `เขียนโดย AI ในเครื่อง (${src.model})`;
  if (src.kind === 'saved') return 'ข้อความที่บันทึกไว้ล่วงหน้า (โหมดสำรอง)';
  return 'ข้อความจากเทมเพลต (ไม่ได้ใช้ AI)';
}

export function render(root, s) {
  if (!s.listing) {
    root.replaceChildren(h('div', { class: 'empty' }, h('div', { class: 'big' }, '📝'), 'ยังไม่มีร่างประกาศ', h('small', {}, 'ตอบคำถามในแชทให้ครบก่อนนะคะ')));
    return;
  }
  const L = s.listing[view.lang];
  const src = s.listing.meta.source[view.lang];
  const checks = runChecks(s);
  const errors = checks.filter((c) => c.level === 'error').length;
  const warns = checks.filter((c) => c.level === 'warn').length;

  const tabs = h('div', { class: 'langs' }, LANGS.map((l) => h('button', { class: view.lang === l ? 'on' : '', onclick: () => { view.lang = l; view.edit = false; update(() => {}); } }, LANG_LABEL[l])));

  const strip = h('div', { class: 'strip' });
  getPhotoUrls().then((urls) => strip.replaceChildren(...urls.map((u) => h('img', { src: u, alt: 'รูปที่พัก' }))));

  let body;
  if (view.edit) {
    const t = h('input', { value: L.title, 'aria-label': 'ชื่อประกาศ' });
    const sm = h('textarea', { rows: 3, 'aria-label': 'สรุปสั้น' }); sm.value = L.summary;
    const d = h('textarea', { rows: 10, 'aria-label': 'คำอธิบาย' }); d.value = L.description;
    body = h('div', { class: 'edit' }, t, sm, d, h('div', { class: 'row' },
      h('button', { class: 'ghost', onclick: () => { view.edit = false; update(() => {}); } }, 'ยกเลิก'),
      h('button', { class: 'send', onclick: () => { view.edit = false; update((st) => { st.listing[view.lang] = { ...st.listing[view.lang], title: t.value, summary: sm.value, description: d.value, storyUntranslated: false }; st.listing.meta.source[view.lang] = { kind: 'saved' }; }); } }, 'บันทึก')));
  } else {
    body = h('div', { class: 'card' },
      h('h3', {}, L.title),
      h('p', { class: 'summary' }, L.summary),
      h('div', { class: 'desc' }, L.description.split(/\n\n+/).map((p) => h('p', {}, p))),
      L.highlights?.length ? h('div', { class: 'tags' }, L.highlights.map((t) => h('span', {}, t))) : null,
      h('div', { class: 'src' }, sourceBadge(src)),
    );
  }

  root.replaceChildren(
    h('div', { class: 'scroll' },
      tabs, strip, body,
      h('div', { class: `checks ${errors ? 'bad' : warns ? 'warn' : 'good'}` }, errors ? `มี ${errors} ข้อที่ต้องแก้ก่อนส่ง (ดูในหน้าจอเจ้าหน้าที่)` : warns ? `ผ่านแล้ว มี ${warns} ข้อให้เจ้าหน้าที่ช่วยดู` : 'ตรวจแล้ว ไม่พบปัญหา ✓'),
    ),
    h('div', { class: 'composer col' },
      h('div', { class: 'row' },
        h('button', { class: 'ghost', onclick: () => { view.edit = true; update(() => {}); } }, '✏️ แก้ไข'),
        h('button', { class: 'ghost', onclick: () => generateAndStore() }, '🔄 เขียนใหม่'),
      ),
      s.approved ? h('button', { class: 'send wide', onclick: () => update((st) => (st.tab = 'connect')) }, 'ไปขั้นเชื่อม Agoda →') : h('button', { class: 'send wide', onclick: approveListing }, 'ใช้ประกาศนี้ แล้วไปต่อ'),
=======
// S4 — Thai (and EN/ZH) preview of the listing + approve / request change.
import { h, money, toast, icon, TEXT } from '../ui/ui.js';
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
    photos.length > 1 ? h('button', { class: 'nav l', 'aria-label': 'previous', on: { click: () => go(-1) } }, icon('back', 20)) : null,
    photos.length > 1 ? h('button', { class: 'nav r', 'aria-label': 'next', on: { click: () => go(1) } }, icon('chevronRight', 20)) : null,
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
    h('div', { class: 'sheet-grab' }),
    h('div', { class: 'sheet-head' }, h('span', { class: 's-title' }, TEXT.preview.reqTitle), h('button', { class: 'icon-btn', 'aria-label': 'close', on: { click: () => onClose() } }, icon('close', 20))),
    h('div', { class: 'sheet-body' }, h('div', { class: 'field' }, chips), h('div', { class: 'field' }, ta)),
    h('div', { class: 'sheet-foot' }, h('button', { class: 'btn primary block', on: { click: () => onClose(picked, ta.value) } }, TEXT.preview.reqSend)),
  );
  return sheet;
}

export function previewScreen(state) {
  const d = state.draft;
  const i = state.intake;
  if (!d) return h('div', { class: 'page' }, h('div', { class: 'page-body', style: 'text-align:center;color:#888;padding-top:40px' }, 'ยังไม่มีร่างประกาศ'));
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

  return h('div', { class: 'page' + (lang === 'zh' ? ' zh' : '') },
   h('div', { class: 'page-body', style: 'padding:0' },
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
   ),
    h('div', { class: 'page-foot' },
      h('button', { class: 'btn ghost', disabled: rounds >= 2, on: { click: openRequestChange } }, rounds >= 2 ? TEXT.preview.maxRounds : TEXT.preview.requestChange),
      h('button', { class: 'btn primary', on: { click: approve } }, TEXT.preview.approve),
>>>>>>> 447771f9d51be470a567afa55bbb068f5d6b55bb
    ),
  );
}
