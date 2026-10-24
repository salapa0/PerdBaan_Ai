import { config } from './config.js';
import { platforms } from './data/platforms.js';
export const clone = o => JSON.parse(JSON.stringify(o));
// Per-platform connection progress (one per entry in platforms.js).
const blankConn = () => ({ step: 1, coach: null, link: '', linkSent: false, live: false });
const blank = () => ({
  step: 'chat', lang: 'th',
  intake: { name: '', location: '', contact: { phone: '' }, totalRooms: 1, rooms: [], amenities: [], amenityOtherOn: false, amenityOther: '', features: '' },
  draft: null, source: '', busy: false, approved: false,
  hist: [], started: false, previewSent: false, menuOpen: true,
  active: platforms[0].id,
  conns: Object.fromEntries(platforms.map(p => [p.id, blankConn()])),
  mode: config.defaultMode, ollama: false,
});
export const state = blank();
// The connection record for a platform (defaults to the one being coached).
export const conn = (id = state.active) => state.conns[id];
const subs = [];
export const subscribe = f => subs.push(f);
export const emit = () => subs.forEach(f => f());
export function resetState() {
  const keep = { mode: state.mode, ollama: state.ollama };
  Object.keys(state).forEach(k => delete state[k]);
  Object.assign(state, blank(), keep);
  emit();
}
