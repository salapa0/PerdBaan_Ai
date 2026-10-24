export const $ = s => document.querySelector(s);
export const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export function toast(t) {
  const r = $('#toast-root');
  r.innerHTML = `<div class="toast" role="status">${esc(t)}</div>`;
  clearTimeout(toast.t); toast.t = setTimeout(() => (r.innerHTML = ''), 1600);
}
