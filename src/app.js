// Boot. Order per spec §5.7.
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
  if (el) el.textContent = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
}

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

  // document title / bot name from config
  const bn = document.getElementById('bot-name'); if (bn) bn.textContent = CONFIG.botName;
  const av = document.getElementById('bot-avatar'); if (av) av.textContent = CONFIG.botAvatar;

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
