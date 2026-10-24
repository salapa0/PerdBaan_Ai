// The whole app is one state object. Every screen reads it and writes via setState().
import { CONFIG } from './config.js';
import { clearPhotos } from './photos.js';

function initialState() {
  return {
    version: CONFIG.stateVersion,
    stage: 'chat', // chat | intake | generating | review | preview | connections | coach | waiting | live
    chat: [],      // {id, from:'bot'|'me', kind:'text'|'card'|'image', text?, card?, photoId?, imgUrl?, done?, ts}
    intake: null,  // see data/demoHomestay.js for the shape
    draft: null,   // {title_th/en/zh, desc_th/en/zh, highlights[{th,en,zh}], price{value,low,high,reason_th}, flags[]}
    draftMeta: { source: null, model: null, ms: 0 }, // source: live|mixed|saved
    copyCards: [],
    agoda: {
      status: 'not_connected', // not_connected|connecting|waiting_check|live|needs_attention
      step: 0,                 // 0..6
      readiness: { id: true, bank: true, phone: true, email: true }, // faked ticked
      coachLog: [],            // {id, thumbUrl, screenId, source, ms, cardIds, ts}
      listingUrl: null,
      liveAt: null,
    },
    review: { status: 'draft', editedFields: [], activeLang: 'th' },
    approval: { status: 'none' }, // none|sent|approved
    settings: { aiMode: 'live', coachMode: 'simple' }, // aiMode: live|saved
    intakeStep: 1,
  };
}

let state = initialState();
const subscribers = new Set();
let saveTimer = null;

function safeGet(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}
function safeSet(key, val) {
  try { localStorage.setItem(key, val); } catch { /* storage may throw; app still runs */ }
}

function persist() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    // Never persist object URLs / blobs — only JSON-safe state.
    const clone = JSON.parse(JSON.stringify(state, (k, v) => {
      if (k === 'thumbUrl' || k === 'imgUrl') return undefined; // in-memory only
      return v;
    }));
    safeSet(CONFIG.storageKey, JSON.stringify(clone));
  }, 200);
}

export function getState() { return state; }

export function setState(patch) {
  // one-level deep merge for known nested keys
  const nested = ['agoda', 'review', 'approval', 'settings', 'draftMeta'];
  for (const key of Object.keys(patch)) {
    if (nested.includes(key) && state[key] && typeof patch[key] === 'object' && !Array.isArray(patch[key])) {
      state[key] = { ...state[key], ...patch[key] };
    } else {
      state[key] = patch[key];
    }
  }
  persist();
  for (const fn of subscribers) fn(state);
  return state;
}

// replace the whole state (used by snapshots / reset)
export function loadState(next) {
  state = next;
  persist();
  for (const fn of subscribers) fn(state);
}

export function subscribe(fn) {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

export function notify() { for (const fn of subscribers) fn(state); }

export async function resetState() {
  try { localStorage.removeItem(CONFIG.storageKey); } catch {}
  await clearPhotos();
  state = initialState();
  for (const fn of subscribers) fn(state);
}

export function restore() {
  const raw = safeGet(CONFIG.storageKey);
  if (!raw) return;
  try {
    const saved = JSON.parse(raw);
    if (saved && saved.version === CONFIG.stateVersion) {
      state = { ...initialState(), ...saved };
    }
    // if version differs, keep fresh initial state (effectively a reset)
  } catch { /* ignore corrupt state */ }
}
