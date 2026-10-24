// Hidden presenter toolbar (Shift+D) + keyboard shortcuts + stage snapshots.
import { getState, setState, loadState, resetState } from './state.js';
import { toast, TEXT } from './ui/ui.js';
import { botSay } from './ui/chat.js';
import { CONFIG } from './config.js';
import { demoHomestay, demoPhotos } from './data/demoHomestay.js';
import { loadDemoPhotos } from './photos.js';
import { makeSnapshot } from './data/snapshots.js';
import { warmup } from './ai/ollama.js';
import { goLive } from './screens/liveCard.js';
import { approveSend } from './console/console.js';
import { useSavedNow } from './ai/generateListing.js';
import { resetIntakeWork } from './screens/intake.js';

let toolbarEl = null;

async function loadDemo() {
  const intake = JSON.parse(JSON.stringify(demoHomestay));
  intake.photos = await loadDemoPhotos(demoPhotos);
  resetIntakeWork();
  setState({ intake, stage: 'intake', intakeStep: 3 });
  toast('โหลดข้อมูลเดโมแล้ว');
}

function toggleMode() {
  const s = getState();
  const next = s.settings.aiMode === 'live' ? 'saved' : 'live';
  setState({ settings: { ...s.settings, aiMode: next } });
  updateModeLabel();
  import('./app.js').then(m => m.refreshOllama && m.refreshOllama());
  toast('AI mode: ' + next);
}

function updateModeLabel() {
  if (!toolbarEl) return;
  const el = toolbarEl.querySelector('.tb-mode');
  if (el) { const m = getState().settings.aiMode; el.textContent = 'AI: ' + m; el.className = 'tb-mode ' + m; }
}

async function jumpTo(n) {
  // ensure demo photos exist so thumbnails render after a jump
  if ((getState().intake?.photos || []).length === 0 || n >= 2) {
    try { await loadDemoPhotos(demoPhotos); } catch {}
  }
  resetIntakeWork();
  loadState(makeSnapshot(n));
  toast('Jump → S' + n);
}

async function doReset() {
  if (!confirm('ล้างข้อมูลทั้งหมดและเริ่มใหม่?')) return;
  resetIntakeWork();
  await resetState();
  await botSay(TEXT.welcome1);
  await botSay({ card: { title: TEXT.startCard.title, body: TEXT.startCard.body, thumb: 'public/demo-photos/02-bedroom.jpg', buttons: [{ label: TEXT.startCard.btn, action: 'open_intake' }] } });
}

const BUTTONS = [
  ['Load demo (⇧L)', loadDemo],
  ['Use saved now (⇧F)', () => { useSavedNow(); toast('Using saved'); }],
  ['Warm up (⇧W)', () => { toast('warming…'); warmup().then(() => toast('models warm')); }],
  ['Approve (⇧P)', () => approveSend()],
  ['Simulate live (⇧A)', () => goLive()],
  ['Reset (⇧R)', doReset],
];

export function mountToolbar() {
  toolbarEl = document.getElementById('toolbar');
  if (!toolbarEl) return;
  toolbarEl.replaceChildren();
  toolbarEl.append(el('span', 'tb-title', 'DEMO'));
  const mode = el('button', 'tb-mode', '');
  mode.addEventListener('click', toggleMode);
  toolbarEl.append(mode);
  for (const [label, fn] of BUTTONS) {
    const b = el('button', '', label); b.addEventListener('click', fn); toolbarEl.append(b);
  }
  toolbarEl.append(el('span', '', 'Jump:'));
  for (let i = 1; i <= 7; i++) { const b = el('button', '', 'S' + i); b.addEventListener('click', () => jumpTo(i)); toolbarEl.append(b); }
  updateModeLabel();
}

function el(tag, cls, text) { const n = document.createElement(tag); if (cls) n.className = cls; if (text) n.textContent = text; return n; }

function showToolbar(show) {
  if (!toolbarEl) return;
  toolbarEl.hidden = !show;
  document.body.classList.toggle('has-toolbar', show);
  import('./app.js').then(m => m.fitDevice && m.fitDevice());
}

export function registerShortcuts() {
  document.addEventListener('keydown', (e) => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
    if (e.key === 'D' && e.shiftKey && !typing) { showToolbar(toolbarEl.hidden); return; }
    if (!e.shiftKey || typing) return;
    switch (e.key) {
      case 'L': loadDemo(); break;
      case 'S': toggleMode(); break;
      case 'F': useSavedNow(); toast('Using saved'); break;
      case 'W': warmup().then(() => toast('models warm')); break;
      case 'P': approveSend(); break;
      case 'A': goLive(); break;
      case 'R': doReset(); break;
      case '!': case '1': jumpTo(1); break;
      case '@': case '2': jumpTo(2); break;
      case '#': case '3': jumpTo(3); break;
      case '$': case '4': jumpTo(4); break;
      case '%': case '5': jumpTo(5); break;
      case '^': case '6': jumpTo(6); break;
      case '&': case '7': jumpTo(7); break;
      default: break;
    }
  });
}
