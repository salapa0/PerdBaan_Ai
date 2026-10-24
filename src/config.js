// Central config. Edit MODEL TAGS to match what you pulled with `ollama pull`.
export const CONFIG = {
  product: 'เปิดบ้าน',            // Poet Baan

  ollama: {
    host: 'http://localhost:11434',
    // === EDIT THESE to your actual pulled tags (see README §Ollama) ===
    textModel: 'hf.co/scb10x/llama-3-typhoon-v1.5-8b-instruct-gguf',  // Typhoon 8B (Thai text), ~5 GB — 16 GB budget
    visionModel: 'qwen2.5vl:7b',  // Qwen2.5-VL 7B (vision + Chinese), ~6 GB. Switch to 'qwen2.5vl:3b' if the coach feels slow
    keepAlive: '30m',
    timeouts: { listing: 120000, translate: 60000, coach: 25000, rewrite: 40000, ping: 2500 },
  },

  // Agoda sign-up screens shown in the coach live in public/agoda/agoda-01..08.<ext>.
  // 'svg' = the bundled simulation mockups. Switch to 'png' after you drop in real captured screenshots.
  agodaScreenExt: 'svg',

  // Timing / behaviour
  savedProgressMs: 3000,   // fake-but-honest progress when running in saved mode
  typingDelayMs: 600,
  storageKey: 'poetbaan.v1',
  stateVersion: 3,
};
