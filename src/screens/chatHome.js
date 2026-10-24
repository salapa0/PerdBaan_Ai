// S1 — LINE chat home. Renders state.chat and the rich-menu dock.
import { h, fmtTime, toast, TEXT } from '../ui/ui.js';
import { CONFIG } from '../config.js';
import { doAction } from '../router.js';
import { markCardDone } from '../ui/chat.js';
import { getState } from '../state.js';

function typingBubble() {
  return h('div', { class: 'msg bot' },
    h('div', { class: 'av' }, CONFIG.botAvatar),
    h('div', { class: 'typing' }, h('span'), h('span'), h('span')),
  );
}

function cardMsg(msg) {
  const c = msg.card;
  const btns = (c.buttons || []).map(b =>
    h('button', {
      disabled: msg.done,
      on: { click: () => { if (msg.done) return; doAction(b.action, b.payload); markCardDone(msg.id); } },
    }, b.label)
  );
  return h('div', { class: 'msg bot' },
    h('div', { class: 'av' }, CONFIG.botAvatar),
    h('div', { class: 'mcard' + (c.kind === 'live' ? ' livecard' : '') + (msg.done ? ' done' : '') },
      c.kind === 'live' ? h('div', { style: 'padding:11px 13px 0' }, h('span', { class: 'live-flag' }, '● ' + TEXT.live.flag)) : null,
      c.thumb ? h('img', { class: 'thumb', src: c.thumb, alt: '' }) : null,
      h('div', { class: 'mcard-body' },
        h('div', { class: 'mcard-title' }, c.title),
        c.body ? h('div', { class: 'mcard-text' }, c.body) : null,
      ),
      btns.length ? h('div', { class: 'mcard-btns' }, ...btns) : null,
    ),
  );
}

export function chatHome(state) {
  const wrap = h('div', { class: 'chat' });
  for (const msg of state.chat) {
    if (msg.kind === 'typing') { wrap.append(typingBubble()); continue; }
    if (msg.kind === 'card') { wrap.append(cardMsg(msg)); continue; }
    if (msg.kind === 'image') {
      wrap.append(h('div', { class: 'msg me' },
        h('div', { class: 'bubble me img' }, h('img', { src: msg.imgUrl, alt: '' })),
      ));
      continue;
    }
    // text
    if (msg.from === 'bot') {
      wrap.append(h('div', { class: 'msg bot' },
        h('div', { class: 'av' }, CONFIG.botAvatar),
        h('div', { class: 'bubble bot' }, msg.text),
      ));
    } else {
      wrap.append(h('div', { class: 'msg me' }, h('div', { class: 'bubble me' }, msg.text)));
    }
  }
  return wrap;
}

export function buildDock(state) {
  const hasDraft = !!state.draft;
  const tile = (label, onClick, disabled) =>
    h('button', { class: 'btn ghost', style: 'flex:1;border-radius:10px;font-size:13px', disabled, on: { click: onClick } }, label);
  return h('div', { style: 'display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:10px' },
    tile(TEXT.dock.post, () => doAction(hasDraft ? 'open_preview' : 'open_intake')),
    tile(TEXT.dock.connect, () => doAction('open_connections')),
    tile(TEXT.dock.edit, () => toast(TEXT.dock.soon), true),
    tile(TEXT.dock.contact, () => toast(TEXT.dock.soon), true),
  );
}
