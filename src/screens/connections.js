<<<<<<< HEAD
// Connections page: step-by-step Agoda onboarding. Owner: A (frontend)
import { h } from '../ui/dom.js';
import { copyText } from '../ui/dom.js';
import { update } from '../ui/store.js';
import { AGODA_STEPS } from '../../content/agoda-steps.js';
import { buildCopyCards } from '../console/copycards.js';
import { coachPanel } from './coach.js';
import { submitToStaff } from '../ui/actions.js';

let openId = null;

export function render(root, s) {
  if (!s.approved) {
    root.replaceChildren(h('div', { class: 'empty' }, h('div', { class: 'big' }, '🔗'), 'ยังไม่ถึงขั้นนี้', h('small', {}, 'อนุมัติประกาศก่อน แล้วโค้ชจะพาเชื่อม Agoda ค่ะ')));
    return;
  }
  const done = AGODA_STEPS.filter((st) => s.connect.done[st.id]).length;
  const cards = buildCopyCards(s);
  const current = openId ?? AGODA_STEPS.find((st) => !s.connect.done[st.id])?.id ?? null;

  const rows = AGODA_STEPS.map((st, i) => {
    const isDone = !!s.connect.done[st.id];
    const isOpen = current === st.id;
    return h('div', { class: `step ${isDone ? 'done' : ''} ${isOpen ? 'open' : ''}` },
      h('button', { class: 'step-head', onclick: () => { openId = isOpen ? '' : st.id; update(() => {}); } },
        h('span', { class: 'num' }, isDone ? '✓' : i + 1), h('span', { class: 'ttl' }, st.title)),
      isOpen ? h('div', { class: 'step-body' },
        h('p', {}, st.what),
        st.copy.length ? h('div', { class: 'copies' }, st.copy.map((id) => cards.find((c) => c.id === id)).filter(Boolean).map((c) =>
          h('div', { class: 'copycard' }, h('div', { class: 'lbl' }, c.label), h('div', { class: 'txt' }, c.text.length > 90 ? `${c.text.slice(0, 90)}…` : c.text),
            h('button', { class: 'ghost', onclick: () => copyText(c.text) }, 'คัดลอก')))) : null,
        h('ul', { class: 'tips' }, st.tips.map((t) => h('li', {}, t))),
        coachPanel(st),
        h('button', { class: 'send wide', onclick: () => { openId = null; update((x) => { x.connect.done[st.id] = !isDone; }); } }, isDone ? 'ยกเลิกเครื่องหมายเสร็จ' : 'ทำขั้นนี้เสร็จแล้ว ✓'),
      ) : null,
    );
  });

  const all = done === AGODA_STEPS.length;
  root.replaceChildren(
    h('div', { class: 'scroll' },
      h('div', { class: 'progress' }, h('div', { class: 'bar' }, h('i', { style: `width:${(done / AGODA_STEPS.length) * 100}%` })), h('small', {}, `เสร็จแล้ว ${done}/${AGODA_STEPS.length} ขั้น`)),
      rows,
    ),
    h('div', { class: 'composer col' },
      s.submitted
        ? h('div', { class: 'hint' }, s.live ? 'ประกาศขึ้น Agoda แล้ว 🎉' : 'แจ้งทีมงานแล้ว รอเจ้าหน้าที่ตรวจและยืนยัน')
        : h('button', { class: 'send wide', disabled: all ? null : true, onclick: submitToStaff }, all ? 'ส่งให้ทีมงานตรวจ' : 'ทำให้ครบทุกขั้นก่อนส่ง'),
      s.live ? h('button', { class: 'send wide', onclick: () => update((x) => (x.tab = 'live')) }, 'ดูการ์ดที่พักออนไลน์ →') : null,
    ),
  );
}
=======
// S5 — Connections page. Agoda card with status-driven button + greyed future platforms.
import { h, badge, TEXT } from '../ui/ui.js';
import { doAction } from '../router.js';

function mainButton(status) {
  switch (status) {
    case 'not_connected': return h('button', { class: 'btn primary block', on: { click: () => doAction('start_agoda') } }, TEXT.conn.add);
    case 'connecting': return h('button', { class: 'btn primary block', on: { click: () => doAction('continue_agoda') } }, TEXT.conn.cont);
    case 'waiting_check': return h('button', { class: 'btn ghost block', disabled: true }, TEXT.conn.waitBtn);
    case 'live': return h('button', { class: 'btn outline block', on: { click: () => doAction('open_agoda_listing') } }, TEXT.conn.viewListing);
    case 'needs_attention': return h('button', { class: 'btn warn block', on: { click: () => doAction('continue_agoda') } }, TEXT.conn.fix);
    default: return null;
  }
}

function futureRow(name) {
  return h('div', { class: 'conn-card disabled' },
    h('div', { class: 'cc-top' }, h('span', { class: 'cc-logo' }, name), h('span', { class: 'badge grey', style: 'margin-left:auto' }, TEXT.conn.soon)),
  );
}

export function connectionsScreen(state) {
  const ag = state.agoda;
  const stepLine = ag.status === 'connecting' ? h('div', { class: 'cc-meta' }, TEXT.coach.step(ag.step)) : null;
  return h('div', { class: 'page' }, h('div', { class: 'page-body page-grey' },
    h('p', { class: 'conn-sub' }, TEXT.conn.sub),
    h('div', { class: 'conn-card' },
      h('div', { class: 'cc-top' },
        h('span', { class: 'cc-logo' }, 'Agoda'),
        h('span', { style: 'margin-left:auto' }, badge(ag.status)),
      ),
      h('div', { class: 'cc-why' }, TEXT.conn.agodaWhy),
      h('div', { class: 'cc-meta' }, TEXT.conn.agodaTime),
      stepLine,
      h('div', { class: 'cc-docs' }, TEXT.conn.docs),
      mainButton(ag.status),
    ),
    futureRow('Booking.com'),
    futureRow('Trip.com'),
    futureRow('Google Maps'),
  ));
}
>>>>>>> 447771f9d51be470a567afa55bbb068f5d6b55bb
