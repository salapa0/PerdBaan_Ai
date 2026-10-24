// Chat + guided intake. Owner: A (frontend)
import { h, toast } from '../ui/dom.js';
import { getState, update, botMsg, meMsg } from '../ui/store.js';
import { QUESTIONS } from '../data/questions.js';
import { addPhotos, countPhotos } from '../ui/photos.js';
import { demoPhotoFiles } from '../../content/demo-photos.js';
import { generateAndStore } from '../ui/actions.js';
import { LANG_LABEL } from '../data/shapes.js';

let picked = []; // multi-choice draft (not saved until the owner confirms)
let uploading = false;

function answer(q, value, echoText) {
  update((s) => {
    s.answers[q.key] = value;
    meMsg(s, echoText ?? String(value));
    s.qIndex++;
    const next = QUESTIONS[s.qIndex];
    if (next) botMsg(s, next.ask(s.answers));
  });
}

function textBox(q) {
  const input = h('input', { type: q.kind === 'number' ? 'number' : 'text', placeholder: q.placeholder || '', min: 1, inputmode: q.kind === 'number' ? 'numeric' : 'text', 'aria-label': 'ตอบคำถาม' });
  const form = h(
    'form',
    {
      class: 'composer',
      onsubmit: (e) => {
        e.preventDefault();
        const raw = input.value.trim();
        if (!raw && !q.optional) return toast('พิมพ์คำตอบก่อนนะคะ');
        if (q.kind === 'number') {
          const n = Number(raw);
          if (!(n > 0)) return toast('ใส่ตัวเลขที่มากกว่า 0 ค่ะ');
          return answer(q, n, `${n} ${q.unit || ''}`.trim());
        }
        answer(q, raw, q.echo ? q.echo(raw) : raw);
      },
    },
    input,
    q.unit ? h('span', { class: 'unit' }, q.unit) : null,
    h('button', { class: 'send', type: 'submit' }, 'ส่ง'),
    q.optional ? h('button', { type: 'button', class: 'ghost', onclick: () => answer(q, '', '(ข้ามไป)') }, 'ข้าม') : null,
  );
  setTimeout(() => input.focus(), 0);
  return form;
}

function multiBox(q) {
  const chips = q.options.map((o) =>
    h('button', {
      type: 'button',
      class: 'chip' + (picked.includes(o.key) ? ' on' : ''),
      onclick: (e) => {
        picked = picked.includes(o.key) ? picked.filter((k) => k !== o.key) : [...picked, o.key];
        e.currentTarget.classList.toggle('on');
      },
    }, o.th),
  );
  return h('div', { class: 'composer col' }, h('div', { class: 'chips' }, chips), h('button', {
    class: 'send wide',
    onclick: () => {
      const v = picked;
      picked = [];
      answer(q, v, q.echo(v));
    },
  }, 'ยืนยันตัวเลือก'));
}

function photoBox(q) {
  const s = getState();
  const n = s.answers.photoCount || 0;
  const file = h('input', { type: 'file', accept: 'image/*', multiple: true, hidden: true });
  const add = async (files) => {
    if (uploading || !files.length) return;
    uploading = true;
    toast('กำลังบันทึกรูป...');
    try {
      const total = await addPhotos(files);
      update((st) => (st.answers.photoCount = total));
    } catch (e) {
      console.error(e);
      toast('บันทึกรูปไม่สำเร็จ ลองใหม่อีกครั้ง');
    }
    uploading = false;
  };
  file.addEventListener('change', () => add([...file.files]));
  return h('div', { class: 'composer col' },
    h('div', { class: 'hint' }, n ? `เลือกรูปแล้ว ${n} รูป` : 'ยังไม่มีรูป'),
    h('div', { class: 'row' },
      h('button', { class: 'ghost', onclick: () => file.click() }, '📷 เลือกรูป'),
      h('button', { class: 'ghost', onclick: async () => add(await demoPhotoFiles()) }, 'ใช้รูปตัวอย่าง'),
    ),
    file,
    h('button', { class: 'send wide', disabled: n === 0 ? true : null, onclick: async () => answer(q, await countPhotos(), q.echo(await countPhotos())) }, 'ถัดไป'),
  );
}

function composer(s) {
  if (s.stage === 'generating') return null;
  if (s.stage !== 'intake') {
    return h('div', { class: 'composer col' }, h('button', { class: 'send wide', onclick: () => update((st) => (st.tab = st.stage === 'live' ? 'live' : st.approved ? 'connect' : 'preview')) }, 'ไปต่อ →'));
  }
  const q = QUESTIONS[s.qIndex];
  if (!q) return null;
  if (q.kind === 'multi') return multiBox(q);
  if (q.kind === 'photos') return photoBox(q);
  if (q.kind === 'confirm') {
    return h('div', { class: 'composer col' }, h('button', { class: 'send wide', onclick: () => generateAndStore() }, 'เขียนประกาศให้เลย ✨'));
  }
  return textBox(q);
}

export function render(root, s) {
  if (!s.chat.length) {
    update((st) => botMsg(st, QUESTIONS[0].ask(st.answers)));
    return;
  }
  const list = h('div', { class: 'chat' },
    s.chat.map((m) => h('div', { class: `msg ${m.from}` }, m.from === 'bot' ? h('div', { class: 'avatar' }, '🏡') : null, h('div', { class: 'bubble' }, m.text))),
    s.stage === 'generating'
      ? h('div', { class: 'msg bot' }, h('div', { class: 'avatar' }, '🏡'), h('div', { class: 'bubble typing' }, `กำลังเขียนประกาศ${s.busy?.lang ? ` (${LANG_LABEL[s.busy.lang]})` : ''}…`))
      : null,
  );
  root.replaceChildren(list, composer(s) || '');
  list.scrollTop = list.scrollHeight;
}
