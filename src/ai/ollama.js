// Thin Ollama client (browser fetch to localhost:11434). Owner: B (AI and logic)
import { getConfig, autoPick } from './config.js';

async function fetchT(url, opts = {}, ms = 5000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...opts, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

/** Is Ollama reachable? Also picks installed models. */
export async function ping() {
  const cfg = getConfig();
  if (cfg.offline) return { ok: false, offline: true, error: 'โหมดออฟไลน์เปิดอยู่', models: [] };
  try {
    const r = await fetchT(`${cfg.host}/api/tags`, {}, 3000);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const j = await r.json();
    const models = (j.models || []).map((m) => m.name);
    if (models.length) autoPick(models);
    return { ok: models.length > 0, models, error: models.length ? null : 'ยังไม่ได้ดาวน์โหลดโมเดล' };
  } catch (e) {
    return { ok: false, models: [], error: e.name === 'AbortError' ? 'ไม่ตอบสนอง' : String(e.message || e) };
  }
}

/** One non-streaming generation. Throws on any failure so callers can fall back. */
export async function generate({ model, prompt, images, json = false }) {
  const cfg = getConfig();
  if (cfg.offline) throw new Error('offline');
  const body = { model, prompt, stream: false, options: { temperature: 0.5 } };
  if (images?.length) body.images = images;
  if (json) body.format = 'json';
  const r = await fetchT(
    `${cfg.host}/api/generate`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) },
    cfg.timeoutMs,
  );
  if (!r.ok) throw new Error(`Ollama HTTP ${r.status}`);
  const j = await r.json();
  if (!j.response) throw new Error('empty response');
  return j.response;
}

export function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result).split(',')[1]);
    fr.onerror = reject;
    fr.readAsDataURL(blob);
  });
}
