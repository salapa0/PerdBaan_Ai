// AI settings (stored in localStorage). Owner: B (AI and logic)
const KEY = 'kerpenbaan.ai.v1';

const DEFAULTS = {
  host: 'http://localhost:11434',
  // Exact tags are still open. The console picks installed ones automatically (see autoPick).
  models: { text: 'typhoon', zh: 'qwen-vl', vision: 'qwen-vl' },
  offline: false, // true = never call Ollama (safe mode for the stage)
  timeoutMs: 45000,
};

const mem = {};
const store = {
  get: (k) => (typeof localStorage !== 'undefined' ? localStorage.getItem(k) : mem[k] ?? null),
  set: (k, v) => (typeof localStorage !== 'undefined' ? localStorage.setItem(k, v) : (mem[k] = v)),
};

export function getConfig() {
  try {
    const saved = JSON.parse(store.get(KEY) || '{}');
    return { ...DEFAULTS, ...saved, models: { ...DEFAULTS.models, ...(saved.models || {}) } };
  } catch {
    return { ...DEFAULTS };
  }
}

export function setConfig(patch) {
  const cur = getConfig();
  const next = { ...cur, ...patch, models: { ...cur.models, ...(patch.models || {}) } };
  store.set(KEY, JSON.stringify(next));
  return next;
}

/** If a configured model is not installed, pick an installed one that looks right. */
export function autoPick(installed = []) {
  const cfg = getConfig();
  const has = (m) => installed.includes(m);
  const find = (re) => installed.find((m) => re.test(m));
  const models = { ...cfg.models };
  if (!has(models.text)) models.text = find(/typhoon/i) || find(/qwen/i) || installed[0] || models.text;
  if (!has(models.vision)) models.vision = find(/qwen.*vl|vl/i) || find(/llava|gemma3|minicpm/i) || models.text;
  if (!has(models.zh)) models.zh = find(/qwen/i) || models.vision;
  setConfig({ models });
  return models;
}
