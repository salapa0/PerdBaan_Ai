// Staff console. Owner: B (AI and logic)
import { h, copyText, fmtTime } from '../ui/dom.js';
import { update } from '../ui/store.js';
import { getConfig, setConfig } from '../ai/config.js';
import { ping } from '../ai/ollama.js';
import { runChecks } from '../rules/checks.js';
import { buildCopyCards } from './copycards.js';
import { AGODA_STEPS } from '../../content/agoda-steps.js';
import { HIGHLIGHTS } from '../data/shapes.js';
import { loadDemo, resetAll, confirmLive } from '../ui/actions.js';

const STAGE = {
  intake: 'กำลังกรอกข้อมูล', generating: 'AI กำลังเขียนประกาศ', preview: 'รอเจ้าของอนุมัติประกาศ',
  connect: 'กำลังเชื่อม Agoda', submitted: 'รอเจ้าหน้าที่ตรวจ', live: 'ขึ้น Agoda แล้ว',
};

let ai = { checking: false, result: null };
let rerender = () => {};

async function refreshAi() {
  ai = { ...ai, checking: true };
  rerender();
  const result = await ping();
  ai = { checking: false, result };
  rerender();
}

function aiSection() {
  const cfg = getConfig();
  const r = ai.result;
  const installed = r?.models || [];
  const pick = (slot, label) => {
    const el = installed.length
      ? h('select', { onchange: (e) => { setConfig({ models: { [slot]: e.target.value } }); } }, installed.map((m) => h('option', { value: m, selected: m === cfg.models[slot] ? true : null }, m)))
      : h('input', { value: cfg.models[slot], size: 14, onchange: (e) => setConfig({ models: { [slot]: e.target.value } }), 'aria-label': label });
    return h('label', {}, `${label}: `, el);
  };
  return h('section', {},
    h('h3', {}, 'AI ในเครื่อง (Ollama) ', ai.checking ? h('span', { class: 'pill' }, 'กำลังตรวจ…') : r ? h('span', { class: `pill ${r.ok ? 'ok' : 'bad'}` }, r.ok ? 'พร้อมใช้' : r.offline ? 'โหมดออฟไลน์' : 'ไม่พร้อม') : h('span', { class: 'pill' }, 'ยังไม่ตรวจ')),
    r && !r.ok && !r.offline ? h('div', { class: 'alert' }, `ต่อ Ollama ไม่ได้ (${r.error}) ระบบจะใช้ข้อความสำรองแทน ตรวจว่าเปิด Ollama และตั้ง OLLAMA_ORIGINS แล้ว`) : null,
    h('div', { class: 'tools' },
      h('button', { onclick: refreshAi }, 'ตรวจใหม่'),
      h('label', {}, h('input', { type: 'checkbox', checked: cfg.offline ? true : null, onchange: (e) => { setConfig({ offline: e.target.checked }); refreshAi(); } }), ' โหมดออฟไลน์ (ไม่เรียก AI)'),
    ),
    h('div', { class: 'tools', style: 'margin-top:6px' }, pick('text', 'ไทย/อังกฤษ'), pick('zh', 'จีน'), pick('vision', 'โค้ชอ่านภาพ')),
  );
}

export function renderConsole(root, s) {
  rerender = () => renderConsole(root, s);
  const checks = runChecks(s);
  const cards = s.listing ? buildCopyCards(s) : [];
  const done = AGODA_STEPS.filter((st) => s.connect.done[st.id]).length;
  const a = s.answers;
  const hl = (a.highlights || []).map((k) => HIGHLIGHTS.find((x) => x.key === k)?.th).filter(Boolean).join(', ');

  const parts = [
    h('h2', {}, 'Staff console ', h('span', { class: `pill ${s.live ? 'ok' : s.submitted ? 'warn' : ''}` }, STAGE[s.stage] || s.stage)),

    s.submitted && !s.live ? h('section', {}, h('div', { class: 'alert' }, 'เจ้าของแจ้งว่าส่งข้อมูลให้ Agoda ครบแล้ว ตรวจสอบกับ Agoda แล้วกดยืนยันด้านล่าง'),
      h('div', { class: 'tools' }, h('button', { class: 'primary', onclick: confirmLive }, 'ยืนยันว่าขึ้น Agoda แล้ว'))) : null,

    aiSection(),

    h('section', {},
      h('h3', {}, 'เคสเจ้าของที่พัก'),
      a.name ? h('dl', { class: 'kv' },
        h('dt', {}, 'ชื่อ'), h('dd', {}, a.name),
        h('dt', {}, 'ที่ตั้ง'), h('dd', {}, a.place || '-'),
        h('dt', {}, 'ห้อง/แขก'), h('dd', {}, `${a.rooms ?? '-'} ห้อง / ${a.guests ?? '-'} คน`),
        h('dt', {}, 'ราคาเริ่มต้น'), h('dd', {}, a.price != null ? `${a.price} บาท/คืน` : '-'),
        h('dt', {}, 'จุดเด่น'), h('dd', {}, hl || '-'),
        h('dt', {}, 'เรื่องเล่า'), h('dd', {}, a.story || '-'),
        h('dt', {}, 'รูป'), h('dd', {}, `${a.photoCount || 0} รูป`),
        h('dt', {}, 'เชื่อม Agoda'), h('dd', {}, `${done}/${AGODA_STEPS.length} ขั้น`),
      ) : h('div', { class: 'hint' }, 'ยังไม่มีข้อมูล เจ้าของยังไม่ได้เริ่มตอบ'),
    ),

    s.listing ? h('section', {}, h('h3', {}, 'ตรวจก่อนส่ง'), checks.map((c) => h('div', { class: `chk ${c.level}` }, h('div', {}, c.label, c.detail ? h('small', {}, c.detail) : null)))) : null,

    cards.length ? h('section', {}, h('h3', {}, 'การ์ดคัดลอกไปวางใน Agoda'), cards.map((c) =>
      h('div', { class: 'ccard' }, h('div', {}, h('div', { class: 'lbl' }, c.label), h('div', { class: 'txt' }, c.text)), h('button', { class: 'ghost', onclick: () => copyText(c.text) }, 'คัดลอก')))) : null,

    h('section', {},
      h('h3', {}, 'เครื่องมือเดโม'),
      h('div', { class: 'tools' },
        h('button', { class: 'primary', onclick: () => loadDemo() }, 'โหลดบ้านตัวอย่าง + สร้างประกาศ'),
        h('button', { class: 'danger', onclick: () => { if (confirm('ล้างข้อมูลทั้งหมดและเริ่มใหม่?')) resetAll(); } }, 'รีเซ็ตทั้งหมด'),
      ),
    ),

    s.log.length ? h('section', {}, h('h3', {}, 'บันทึกเหตุการณ์'), h('ul', { class: 'log' }, s.log.map((l) => h('li', {}, `${fmtTime(l.t)} ${l.msg}`)))) : null,
  ];
  root.replaceChildren(...parts.filter(Boolean));
}

// First load: check Ollama once so the status is not blank.
let started = false;
export function initConsole() {
  if (started) return;
  started = true;
  refreshAi();
}
