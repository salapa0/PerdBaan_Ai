// S1 — LINE chat with the official account: messages, Flex-style cards, rich menu / keyboard bar.
import { h, fmtTime, toast, icon, logo, TEXT } from '../ui/ui.js';
import { doAction } from '../router.js';
import { markCardDone } from '../ui/chat.js';

let dockMode = 'menu'; // 'menu' (rich menu) | 'keyboard' (input bar), like a LINE OA chat

const avatar = () => h('div', { class: 'av' }, logo(34));
const meta = (msg, read) => h('div', { class: 'meta' }, read ? h('div', {}, 'อ่านแล้ว') : null, fmtTime(msg.ts));

function typingBubble() {
  return h('div', { class: 'msg bot' }, avatar(), h('div', { class: 'typing' }, h('span'), h('span'), h('span')));
}

function cardMsg(msg) {
  const c = msg.card;
  const btns = (c.buttons || []).map((b, i) =>
    h('button', {
      class: i === 0 ? '' : 'secondary',
      disabled: msg.done,
      on: { click: () => { if (msg.done) return; doAction(b.action, b.payload); markCardDone(msg.id); } },
    }, b.label));
  return h('div', { class: 'msg bot' },
    avatar(),
    h('div', { class: 'msg-col' },
      h('div', { class: 'mcard' + (c.kind === 'live' ? ' livecard' : '') },
        c.thumb ? h('img', { class: 'thumb', src: c.thumb, alt: '' }) : null,
        h('div', { class: 'mcard-body' },
          c.kind === 'live' ? h('span', { class: 'live-flag' }, TEXT.live.flag) : null,
          h('div', { class: 'mcard-title' }, c.title),
          c.body ? h('div', { class: 'mcard-text' }, c.body) : null,
        ),
        btns.length ? h('div', { class: 'mcard-btns' }, ...btns) : null,
      ),
      meta(msg),
    ),
  );
}

export function chatHome(state) {
  const wrap = h('div', { class: 'chat' }, h('div', { class: 'chat-date' }, 'วันนี้'));
  for (const msg of state.chat) {
    if (msg.kind === 'typing') { wrap.append(typingBubble()); continue; }
    if (msg.kind === 'card') { wrap.append(cardMsg(msg)); continue; }
    if (msg.kind === 'image') {
      wrap.append(h('div', { class: 'msg me' }, h('div', { class: 'msg-col' }, h('div', { class: 'bubble me img' }, h('img', { src: msg.imgUrl, alt: '' })), meta(msg, true))));
      continue;
    }
    if (msg.from === 'bot') {
      wrap.append(h('div', { class: 'msg bot' }, avatar(), h('div', { class: 'msg-col' }, h('div', { class: 'bubble bot' }, msg.text), meta(msg))));
    } else {
      wrap.append(h('div', { class: 'msg me' }, h('div', { class: 'msg-col' }, h('div', { class: 'bubble me' }, msg.text), meta(msg, true))));
    }
  }
  return wrap;
}

export function buildDock(state) {
  const hasDraft = !!state.draft;
  const rerender = (mode) => { dockMode = mode; const d = document.getElementById('dock'); if (d) d.replaceChildren(buildDock(state)); };

  if (dockMode === 'keyboard') {
    return h('div', {},
      h('div', { class: 'composer' },
        h('button', { class: 'icon-btn', 'aria-label': 'more' }, icon('plus', 22)),
        h('button', { class: 'icon-btn', 'aria-label': 'camera' }, icon('camera', 21)),
        h('button', { class: 'icon-btn', 'aria-label': 'photos' }, icon('image', 21)),
        h('div', { class: 'field-aa' }, 'Aa', icon('smile', 19)),
        h('button', { class: 'icon-btn', 'aria-label': 'rich menu', on: { click: () => rerender('menu') } }, icon('menu', 21)),
      ),
      h('div', { class: 'dock-safe' }),
    );
  }

  const tile = (label, ic, onClick, disabled) =>
    h('button', { class: 'rm-tile', disabled, on: { click: onClick } }, h('span', { class: 'rm-ic' }, icon(ic, 19)), label);
  return h('div', {},
    h('div', { class: 'richmenu' },
      tile(TEXT.dock.post, 'home', () => doAction(hasDraft ? 'open_preview' : 'open_intake')),
      tile(TEXT.dock.connect, 'link', () => doAction('open_connections')),
      tile(TEXT.dock.edit, 'copy', () => toast(TEXT.dock.soon), true),
      tile(TEXT.dock.contact, 'phone', () => toast(TEXT.dock.soon), true),
    ),
    h('div', { class: 'rm-bar', on: { click: () => rerender('keyboard') } },
      h('span', { class: 'kb' }, h('span', { class: 'icon-btn' }, icon('keyboard', 22))),
      'เมนู', icon('chevronRight', 14)),
    h('div', { class: 'dock-safe', style: 'height:22px' }),
  );
}
