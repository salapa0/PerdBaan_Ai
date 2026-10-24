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
  return h('div', { class: 'conn' },
    h('h3', {}, TEXT.conn.title),
    h('div', { class: 'sub' }, TEXT.conn.sub),
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
  );
}
