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
