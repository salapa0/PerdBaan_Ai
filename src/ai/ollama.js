// Minimal Ollama client. Only this file talks to the models.
import { CONFIG } from '../config.js';

export class AIError extends Error {
  constructor(kind, ms) { super('AIError:' + kind); this.kind = kind; this.ms = ms; }
}

const base = () => CONFIG.ollama.host.replace(/\/$/, '');

// GET /api/tags → model status
export async function ping() {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), CONFIG.ollama.timeouts.ping);
  try {
    const res = await fetch(base() + '/api/tags', { signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) return { ok: false, models: [] };
    const data = await res.json();
    const names = (data.models || []).map(m => m.name);
    const has = (tag) => names.some(n => n === tag || n.startsWith(tag.split(':')[0]));
    return {
      ok: true, models: names,
      hasText: has(CONFIG.ollama.textModel),
      hasVision: has(CONFIG.ollama.visionModel),
    };
  } catch {
    clearTimeout(t);
    return { ok: false, models: [] };
  }
}

// POST /api/chat (streamed). Returns parsed JSON content (if `format` given) or raw text.
// onToken(totalChars) fires as content streams in.
export async function chat({ model, messages, format, options = {}, timeout = 60000, onToken, register }) {
  const started = performance.now();
  const ctrl = new AbortController();
  if (register) register(ctrl); // lets callers (e.g. "use saved now") abort this request
  const timer = setTimeout(() => ctrl.abort(), timeout);
  let res;
  try {
    res = await fetch(base() + '/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: ctrl.signal,
      body: JSON.stringify({
        model, messages, stream: true,
        format: format || undefined,
        options: { temperature: 0.4, num_predict: 1500, num_ctx: 8192, ...options },
        keep_alive: CONFIG.ollama.keepAlive,
      }),
    });
  } catch (e) {
    clearTimeout(timer);
    throw new AIError(e.name === 'AbortError' ? 'timeout' : 'offline', Math.round(performance.now() - started));
  }
  if (!res.ok || !res.body) { clearTimeout(timer); throw new AIError('offline', Math.round(performance.now() - started)); }

  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = '', content = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let nl;
      while ((nl = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, nl).trim(); buf = buf.slice(nl + 1);
        if (!line) continue;
        try {
          const obj = JSON.parse(line);
          if (obj.message && obj.message.content) { content += obj.message.content; onToken && onToken(content.length); }
          if (obj.done) { /* final */ }
        } catch { /* skip partial */ }
      }
    }
  } catch (e) {
    clearTimeout(timer);
    throw new AIError(ctrl.signal.aborted ? 'timeout' : 'offline', Math.round(performance.now() - started));
  }
  clearTimeout(timer);
  const ms = Math.round(performance.now() - started);
  if (!format) return { text: content, ms };
  try {
    return { json: JSON.parse(content), ms };
  } catch {
    // try to salvage a JSON object from the text
    const m = content.match(/\{[\s\S]*\}/);
    if (m) { try { return { json: JSON.parse(m[0]), ms }; } catch {} }
    throw new AIError('parse', ms);
  }
}

export async function warmup() {
  const jobs = [CONFIG.ollama.textModel, CONFIG.ollama.visionModel].map(model =>
    chat({ model, messages: [{ role: 'user', content: 'hi' }], options: { num_predict: 1 }, timeout: 30000 }).catch(() => {})
  );
  await Promise.all(jobs);
}
