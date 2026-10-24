<<<<<<< HEAD
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
=======
// App entry: restore state, render both panes, start the clock and the Ollama status check.
import { CONFIG } from './config.js';
import { getState, setState, subscribe, restore, notify } from './state.js';
import { renderPhone } from './router.js';
import { renderConsole } from './console/console.js';
import { botSay } from './ui/chat.js';
import { TEXT } from './ui/ui.js';
import { ping } from './ai/ollama.js';
import { mountToolbar, registerShortcuts } from './toolbar.js';

// clock
function tickClock() {
  const el = document.getElementById('clock');
  if (!el) return;
  const d = new Date();
  el.textContent = `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`; // iOS style: 9:41, 13:05
}

// Fit the real-size phone (419 x 878 incl. bezel) to the window height. Scaling a vector layout
// with CSS transform keeps text and icons sharp (no bitmap stretching).
const DEVICE_W = 419, DEVICE_H = 878;
function fitDevice() {
  const col = document.getElementById('phone-col');
  const dev = document.getElementById('device');
  if (!col || !dev) return;
  const top = document.body.classList.contains('has-toolbar') ? 64 : 20;
  const availH = window.innerHeight - top - 20;
  const scale = Math.min(1, availH / DEVICE_H);
  dev.style.setProperty('--scale', scale.toFixed(4));
  col.style.width = Math.round(DEVICE_W * scale) + 'px';
  col.style.height = Math.round(DEVICE_H * scale) + 'px';
}
export { fitDevice };

// Ollama status light
export async function refreshOllama() {
  const light = document.getElementById('ollama-light');
  const label = document.getElementById('ollama-label');
  if (!light) return;
  if (getState().settings.aiMode === 'saved') {
    light.className = 'light light-amber'; label.textContent = 'Saved mode'; return;
  }
  const r = await ping();
  if (!r.ok) { light.className = 'light light-red'; label.textContent = 'Ollama offline'; }
  else if (r.hasText && r.hasVision) { light.className = 'light light-green'; label.textContent = 'Ollama ready'; }
  else { light.className = 'light light-amber'; label.textContent = 'Ollama · model missing'; }
}

function boot() {
  restore();

  fitDevice();
  window.addEventListener('resize', fitDevice);

  // tap the dimmed backdrop to close a bottom sheet (like a real phone)
  const modal = document.getElementById('modal-root');
  modal.addEventListener('click', (e) => { if (e.target === modal && !modal.querySelector('.viewer')) modal.replaceChildren(); });

  // render both panes from the same state
  subscribe(renderPhone);
  subscribe(renderConsole);

  // toolbar + shortcuts
  mountToolbar();
  registerShortcuts();

  // first paint
  renderPhone();
  renderConsole();

  // welcome messages if fresh
  if (getState().chat.length === 0) {
    botSay(TEXT.welcome1).then(() => botSay({
      card: {
        title: TEXT.startCard.title, body: TEXT.startCard.body, thumb: 'public/demo-photos/02-bedroom.jpg',
        buttons: [{ label: TEXT.startCard.btn, action: 'open_intake' }],
      },
    }));
  }

  // clock + ollama polling
  tickClock(); setInterval(tickClock, 15000);
  refreshOllama(); setInterval(refreshOllama, 10000);
}

boot();
>>>>>>> 447771f9d51be470a567afa55bbb068f5d6b55bb
