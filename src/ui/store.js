// App state in localStorage + tiny pub/sub. Owner: A (frontend)
import { newState } from '../data/shapes.js';

const KEY = 'kerpenbaan.state.v1';

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && s.stage) {
      const merged = { ...newState(), ...s };
      // a reload during generation would leave the app stuck
      if (merged.stage === 'generating') merged.stage = 'intake';
      merged.busy = null;
      return merged;
    }
  } catch {}
  return newState();
}

let state = load();
const subs = new Set();

export const getState = () => state;

function emit() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
  subs.forEach((f) => f(state));
}

export function update(fn) {
  fn(state);
  emit();
}

export function setState(next) {
  state = next;
  emit();
}

export function subscribe(f) {
  subs.add(f);
  return () => subs.delete(f);
}

export function addLog(s, msg) {
  s.log.unshift({ t: Date.now(), msg });
  s.log = s.log.slice(0, 40);
}

export const botMsg = (s, text) => s.chat.push({ from: 'bot', text });
export const meMsg = (s, text) => s.chat.push({ from: 'me', text });
