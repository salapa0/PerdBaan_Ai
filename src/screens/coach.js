// Per-step coach panel (text question + optional screenshot). Owner: B (AI and logic)
import { h, toast } from '../ui/dom.js';
import { getState, update } from '../ui/store.js';
import { askCoach } from '../ai/coach.js';

let pending = null; // step id waiting for an answer

export function coachPanel(step) {
  const s = getState();
  const thread = s.connect.coach[step.id] || [];
  const input = h('input', { type: 'text', placeholder: 'ถามโค้ช หรือแนบภาพหน้าจอ', 'aria-label': 'ถามโค้ช' });
  const file = h('input', { type: 'file', accept: 'image/*', hidden: true });

  const send = async (image) => {
    const question = input.value.trim();
    if (pending) return;
    if (!question && !image) return toast('พิมพ์คำถามหรือแนบภาพก่อนนะคะ');
    pending = step.id;
    update((st) => {
      (st.connect.coach[step.id] ||= []).push({ from: 'me', text: image ? `📷 ส่งภาพหน้าจอ${question ? ` · ${question}` : ''}` : question });
    });
    const reply = await askCoach({ step, listing: getState().listing, question, image });
    pending = null;
    update((st) => st.connect.coach[step.id].push({ from: 'bot', text: reply.text, src: reply.src }));
  };

  file.addEventListener('change', () => file.files[0] && send(file.files[0]));

  return h('div', { class: 'coach' },
    h('div', { class: 'coach-title' }, '🤖 โค้ชเชื่อม Agoda'),
    thread.map((m) => h('div', { class: `cmsg ${m.from}` }, m.text, m.src ? h('small', {}, m.src === 'ai' ? ' · AI ในเครื่อง' : ' · คำตอบสำรอง') : null)),
    pending === step.id ? h('div', { class: 'cmsg bot typing' }, 'กำลังดูให้ค่ะ…') : null,
    h('form', { class: 'composer', onsubmit: (e) => { e.preventDefault(); send(null); input.value = ''; } },
      input,
      h('button', { type: 'button', class: 'ghost', onclick: () => file.click(), 'aria-label': 'แนบภาพหน้าจอ' }, '📷'),
      h('button', { class: 'send', type: 'submit' }, 'ถาม'),
    ),
    file,
  );
}
