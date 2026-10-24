// Chat message helpers. Messages live in state.chat so a reload restores the conversation.
import { getState, setState, notify } from '../state.js';
import { CONFIG } from '../config.js';

let seq = 0;
const uid = () => `m${Date.now()}_${seq++}`;

function push(msg) {
  const chat = getState().chat.slice();
  chat.push(msg);
  setState({ chat });
}

function stripTyping() {
  const chat = getState().chat.filter(m => m.kind !== 'typing');
  getState().chat = chat; // mutate without full persist churn; notify below
}

// botSay('text') or botSay({card})
export function botSay(payload, delayMs = CONFIG.typingDelayMs) {
  return new Promise((resolve) => {
    const typingId = uid();
    push({ id: typingId, from: 'bot', kind: 'typing', ts: Date.now() });
    setTimeout(() => {
      stripTyping();
      const base = { id: uid(), from: 'bot', ts: Date.now() };
      if (typeof payload === 'string') push({ ...base, kind: 'text', text: payload });
      else if (payload && payload.card) push({ ...base, kind: 'card', card: payload.card });
      else push({ ...base, kind: 'text', text: String(payload) });
      resolve();
    }, delayMs);
  });
}

export function botSayNow(payload) {
  const base = { id: uid(), from: 'bot', ts: Date.now() };
  if (typeof payload === 'string') push({ ...base, kind: 'text', text: payload });
  else if (payload && payload.card) push({ ...base, kind: 'card', card: payload.card });
}

export function ownerSay(payload) {
  const base = { id: uid(), from: 'me', ts: Date.now() };
  if (payload && payload.imgUrl) push({ ...base, kind: 'image', imgUrl: payload.imgUrl });
  else push({ ...base, kind: 'text', text: String(payload) });
}

// mark a card message's buttons done (so old steps can't restart)
export function markCardDone(msgId) {
  const chat = getState().chat.map(m => m.id === msgId ? { ...m, done: true } : m);
  setState({ chat });
}

export function clearTyping() { stripTyping(); notify(); }
