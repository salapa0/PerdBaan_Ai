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
    ),
  );
}
