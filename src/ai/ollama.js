import { config } from '../config.js';
export async function ping() {
  try { return (await fetch(config.ollamaUrl + '/api/tags', { signal: AbortSignal.timeout(1500) })).ok; }
  catch { return false; }
}
export async function askJson(model, prompt, images, signal) {
  const r = await fetch(config.ollamaUrl + '/api/generate', {
    method: 'POST', signal,
    body: JSON.stringify({ model, prompt, images, stream: false, format: 'json' }),
  });
  return JSON.parse((await r.json()).response);
}
