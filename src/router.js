// Routing: which screen renders for the current stage, and the button-action table.
import { getState, setState } from './state.js';
import { botSay, botSayNow } from './ui/chat.js';
import { TEXT, toast, h, icon, logo } from './ui/ui.js';
import { CONFIG } from './config.js';

import { chatHome, buildDock } from './screens/chatHome.js';
import { intakeScreen, saveIntakeWork } from './screens/intake.js';
import { generatingScreen } from './screens/generating.js';
import { previewScreen } from './screens/preview.js';
import { connectionsScreen } from './screens/connections.js';
import { coachScreen } from './screens/coach.js';

const screens = {
  chat: chatHome,
  review: chatHome,
  waiting: chatHome,
  live: chatHome,
  intake: intakeScreen,
  generating: generatingScreen,
  preview: previewScreen,
  connections: connectionsScreen,
  coach: coachScreen,
};

const CHAT_STAGES = ['chat', 'review', 'waiting', 'live'];
// LIFF (LINE mini-app) pages open on top of the chat with their own header, like the real LINE app.
const LIFF_TITLES = { intake: 'ลงประกาศที่พัก', generating: 'ลงประกาศที่พัก', preview: 'ตัวอย่างประกาศ', connections: 'การเชื่อมต่อ', coach: 'เชื่อมต่อ Agoda' };

function closeLiff() {
  const s = getState();
  if (s.stage === 'intake') saveIntakeWork();
  setState({ stage: s.draft && s.stage !== 'intake' ? (s.agoda.status === 'live' ? 'live' : 'review') : 'chat' });
}

function renderLineHeader(el) {
  if (el.dataset.ready) return;
  el.dataset.ready = '1';
  el.replaceChildren(
    h('button', { class: 'lh-back', 'aria-label': 'back' }, icon('back', 26)),
    logo(32),
    h('div', { class: 'lh-name' }, CONFIG.product, h('span', { class: 'lh-verified', title: 'Official account' }, icon('check', 11))),
    h('div', { class: 'lh-icons' },
      h('button', { class: 'icon-btn', 'aria-label': 'search' }, icon('search', 21)),
      h('button', { class: 'icon-btn', 'aria-label': 'call' }, icon('phone', 20)),
      h('button', { class: 'icon-btn', 'aria-label': 'menu' }, icon('menu', 22)),
    ),
  );
}

function renderLiffHeader(el, stage) {
  el.replaceChildren(
    stage === 'generating' ? h('span') : h('button', { class: 'icon-btn', 'aria-label': 'close', on: { click: closeLiff } }, icon('close', 22)),
    h('div', { class: 'lf-title' },
      h('div', { class: 'lf-name' }, LIFF_TITLES[stage] || CONFIG.product),
      h('div', { class: 'lf-domain' }, icon('lock', 11), 'poetbaan.app')),
    h('span'),
  );
}

export function renderPhone() {
  const mount = document.getElementById('screen');
  if (!mount) return;
  const state = getState();
  const isChat = CHAT_STAGES.includes(state.stage);

  const lineHeader = document.getElementById('line-header');
  const liffHeader = document.getElementById('liff-header');
  if (lineHeader && liffHeader) {
    lineHeader.hidden = !isChat;
    liffHeader.hidden = isChat;
    if (isChat) renderLineHeader(lineHeader); else renderLiffHeader(liffHeader, state.stage);
  }
  mount.classList.toggle('liff', !isChat);

  const fn = screens[state.stage] || chatHome;
  mount.replaceChildren(fn(state));

  // dock: LINE rich menu / keyboard on chat stages; a plain safe-area strip under LIFF pages
  const dock = document.getElementById('dock');
  if (dock) {
    dock.className = isChat ? 'dock' : 'dock safe';
    if (isChat) dock.replaceChildren(buildDock(state)); else dock.replaceChildren();
  }

  if (isChat) requestAnimationFrame(() => { mount.scrollTop = mount.scrollHeight; });
}

export function go(stage) {
  setState({ stage });
}

// The single action table. Every card/dock button routes through here.
export function doAction(action, payload = null) {
  const s = getState();
  switch (action) {
    case 'open_intake':
      if (!s.intake) initEmptyIntake();
      setState({ stage: 'intake', intakeStep: 1 });
      break;
    case 'open_preview':
      setState({ stage: 'preview' });
      break;
    case 'open_connections':
      setState({ stage: 'connections' });
      break;
    case 'start_agoda':
      setState({ agoda: { ...s.agoda, status: 'connecting', step: 1 }, stage: 'coach' });
      break;
    case 'continue_agoda':
      setState({ stage: 'coach' });
      break;
    case 'open_agoda_listing': {
      const url = s.agoda.listingUrl;
      if (url && navigator.onLine) { window.open(url, '_blank'); }
      else {
        // offline stand-in: open the saved live page image in the viewer
        import('./screens/coach.js').then(m => m.openImageViewer(`public/agoda/agoda-live.${CONFIG.agodaScreenExt}`, 'ตัวอย่างหน้าประกาศบน Agoda (ภาพจำลองออฟไลน์)'));
      }
      break;
    }
    case 'share_listing': {
      const url = s.agoda.listingUrl || 'https://www.agoda.com/';
      copy(url).then(ok => toast(ok ? TEXT.live.shared : TEXT.clipboardFail));
      break;
    }
    default:
      console.warn('unknown action', action);
  }
}

function copy(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
  }
  return Promise.resolve(false);
}

function initEmptyIntake() {
  setState({
    intake: {
      place: { name: '', village: '', district: '', province: '', address: '', postcode: '' },
      owner: { name: '' },
      rooms: [newRoom()],
      photos: [],
      answers: { facilities: [], meal: 'breakfast_incl', nearby: [], nearbyOther: '', checkin: '14:00', checkout: '11:00', smoking: false, pets: false, quietAfter: '22:00', note: '' },
      contact: { phone: '', email: '', line: '', licence: '' },
      pdpa: false,
    },
  });
}

export function newRoom() {
  return { id: 'r' + Math.random().toString(36).slice(2, 7), type: 'double', name: '', count: 1, beds: [{ type: 'double', qty: 1 }], maxGuests: 2, price: 800, bathroom: 'private', aircon: true };
}

// exposed so the generating pipeline can post the "ready" card into chat after review
export { botSay, botSayNow };
