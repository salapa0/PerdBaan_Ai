import { state, subscribe, emit, conn } from './state.js';
import { actions } from './actions.js';
import { renderPhone, renderDock } from './router.js';
import { renderConsole, renderChecks } from './console/console.js';
import { initToolbar } from './toolbar.js';
import { ping } from './ai/ollama.js';
import { $ } from './ui/dom.js';
import { roomSumHtml } from './screens/owner.js';
import { getPlatform } from './data/platforms.js';

subscribe(() => { renderPhone(); renderConsole(); });

document.addEventListener('click', e => {
  const t = e.target.closest('[data-a]'); if (!t || t.disabled) return;
  const fn = actions[t.dataset.a]; if (fn) fn(t.dataset.v);
});
document.addEventListener('input', e => {
  const t = e.target;
  if (t.dataset.f) { actions.setField(t.dataset.f, t.value); renderDock(); }
  else if (t.hasAttribute('data-link')) { conn().link = t.value; renderDock(); const m = $('#link-msg'), c = getPlatform(state.active).link.check(t.value); m.className = c.ok ? 'ok' : 'err'; m.textContent = t.value ? c.msg : ''; }
  else if (t.dataset.r) { actions.setRoom(...t.dataset.r.split(':'), t.value); $('#room-sum').innerHTML = roomSumHtml(); renderDock(); }
  else if (t.dataset.d) { actions.editDraft(t.dataset.d, t.value); renderChecks(); }
});
document.addEventListener('change', e => {
  if (e.target.hasAttribute('data-shot') && e.target.files[0]) actions.screenshot(e.target.files[0]);
  if (e.target.hasAttribute('data-link')) emit();
});

// Scale the 413x872 phone to fit the window
function fit() {
  const sc = Math.min(1, (innerHeight - 24) / 872, (innerWidth > 900 ? innerWidth * 0.45 : innerWidth - 24) / 413);
  $('#device').style.transform = `scale(${sc})`;
  $('#phone-col').style.width = 413 * sc + 'px'; $('#phone-col').style.height = 872 * sc + 'px';
}
addEventListener('resize', fit); fit();

const poll = async () => { const ok = await ping(); if (ok !== state.ollama) { state.ollama = ok; renderConsole(); } };
poll(); setInterval(poll, 5000);
initToolbar(); emit();
