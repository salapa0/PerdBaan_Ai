import { config } from './config.js';
export const clone = o => JSON.parse(JSON.stringify(o));
const blank = () => ({
  step: 'chat', lang: 'th',
  intake: { name: '', location: '', contact: { phone: '' }, totalRooms: 1, rooms: [], amenities: [], amenityOtherOn: false, amenityOther: '', features: '' },
  draft: null, source: '', busy: false, approved: false,
  hist: [], started: false, previewSent: false, menuOpen: true,
  coachStep: 1, coach: null, link: '', linkSent: false,
  mode: config.defaultMode, ollama: false,
});
export const state = blank();
const subs = [];
export const subscribe = f => subs.push(f);
export const emit = () => subs.forEach(f => f());
export function resetState() {
  const keep = { mode: state.mode, ollama: state.ollama };
  Object.keys(state).forEach(k => delete state[k]);
  Object.assign(state, blank(), keep);
  emit();
}
