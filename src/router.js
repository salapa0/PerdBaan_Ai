import { state } from './state.js';
import { $ } from './ui/dom.js';
import { isChat, headerHtml, screenHtml, dockHtml } from './screens/owner.js';

let last = '';
export function renderDock() {
  const d = $('#dock'); d.className = 'dock' + (isChat(state.step) ? ' rich' : ''); d.innerHTML = dockHtml();
}
export function renderPhone() {
  const chat = isChat(state.step);
  $('#line-header').hidden = !chat; $('#liff-header').hidden = chat;
  (chat ? $('#line-header') : $('#liff-header')).innerHTML = headerHtml();
  const s = $('#screen'); s.className = 'screen' + (chat ? ' chat' : ''); s.innerHTML = screenHtml();
  if (chat) s.scrollTop = s.scrollHeight; else if (last !== state.step) s.scrollTop = 0;
  last = state.step; renderDock();
}
