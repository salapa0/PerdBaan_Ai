import { state } from './state.js';
import { $ } from './ui/dom.js';
import { HEAD, screenHtml, dockHtml } from './screens/owner.js';

let last = '';
export const renderDock = () => { $('#dock').innerHTML = dockHtml(); };
export function renderPhone() {
  const [kind, title] = HEAD[state.step];
  $('#line-header').hidden = kind !== 'line'; $('#liff-header').hidden = kind !== 'liff';
  $('#line-header').innerHTML = '<span class="av">เ</span><b>เปิดบ้าน</b>'; $('#liff-header').textContent = title;
  const s = $('#screen'); s.className = 'screen' + (kind === 'line' ? ' chat' : '');
  s.innerHTML = screenHtml(); if (last !== state.step) s.scrollTop = 0; last = state.step;
  renderDock();
}
