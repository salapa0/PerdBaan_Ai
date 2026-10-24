// App shell: owner phone (LINE style) + staff console. Owner: A (frontend)
import { h } from './ui/dom.js';
import { getState, update, subscribe } from './ui/store.js';
import * as intake from './screens/intake.js';
import * as preview from './screens/preview.js';
import * as connections from './screens/connections.js';
import * as live from './screens/live.js';
import { renderConsole, initConsole } from './console/console.js';

const SCREENS = {
  chat: { label: 'แชท', icon: '💬', mod: intake },
  preview: { label: 'ประกาศ', icon: '📝', mod: preview },
  connect: { label: 'เชื่อม Agoda', icon: '🔗', mod: connections },
  live: { label: 'ออนไลน์', icon: '🌐', mod: live },
};

const phone = document.getElementById('phone');
const consoleEl = document.getElementById('console');

const header = h('header', { class: 'line-head' }, h('div', { class: 'logo' }, '🏡'), h('div', {}, h('b', {}, 'เปิดบ้าน'), h('small', {}, 'บัญชีทางการ · ช่วยลงที่พักบน Agoda')));
const screen = h('main', { class: 'screen', id: 'screen' });
const tabbar = h('nav', { class: 'tabbar', 'aria-label': 'เมนู' });
phone.replaceChildren(header, screen, tabbar);

let lastTab = null;

function renderPhone(s) {
  const prevScroll = screen.querySelector('.scroll')?.scrollTop ?? 0;
  const mod = SCREENS[s.tab].mod;
  mod.render(screen, s);
  if (lastTab === s.tab) {
    const sc = screen.querySelector('.scroll');
    if (sc) sc.scrollTop = prevScroll;
  }
  lastTab = s.tab;
  tabbar.replaceChildren(...Object.entries(SCREENS).map(([key, t]) =>
    h('button', { class: s.tab === key ? 'on' : '', onclick: () => update((x) => (x.tab = key)) }, h('span', {}, t.icon), t.label)));
}

function renderAll() {
  const s = getState();
  renderPhone(s);
  const keep = consoleEl.scrollTop;
  renderConsole(consoleEl, s);
  consoleEl.scrollTop = keep;
}

subscribe(renderAll);
renderAll();
initConsole();
