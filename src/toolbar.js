// Hidden presenter toolbar (Shift+D) and Shift+key shortcuts.
import { actions } from './actions.js';
import { $ } from './ui/dom.js';

const JUMP = ['chat', 'form', 'review', 'preview', 'connections', 'coach', 'live'];
const KEYS = {
  KeyL: ['Load demo', actions.loadDemo], KeyS: ['Live/Saved', actions.toggleMode], KeyF: ['Stop AI', actions.stop],
  KeyW: ['Warm up', actions.warm], KeyP: ['Approve & send', actions.approvePreview], KeyA: ['Agoda approves', actions.simulateAgoda], KeyR: ['Reset', actions.reset], KeyB: ['Back', actions.back],
};
export function initToolbar() {
  const t = $('#toolbar');
  t.innerHTML = Object.entries(KEYS).map(([c, [l]]) => `<button data-k="${c}">${l} (${c.slice(3)})</button>`).join('')
    + JUMP.map((s, n) => `<button data-j="${s}">${n + 1}</button>`).join('');
  t.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.k) KEYS[b.dataset.k][1](); else actions.jump(b.dataset.j);
  });
  document.addEventListener('keydown', e => {
    if (!e.shiftKey || e.ctrlKey || e.metaKey || /INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
    if (e.code === 'KeyD') { t.hidden = !t.hidden; return; }
    if (KEYS[e.code]) { e.preventDefault(); KEYS[e.code][1](); }
    const n = /^Digit([1-7])$/.exec(e.code); if (n) actions.jump(JUMP[+n[1] - 1]);
  });
}
