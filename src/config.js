// Settings. Model tags must match what `ollama list` shows (see setup-ollama.bat).
export const config = {
  ollamaUrl: 'http://localhost:11434',
  textModel: 'hf.co/scb10x/llama-3-typhoon-v1.5-8b-instruct-gguf',
  visionModel: 'qwen2.5vl:7b', // use qwen2.5vl:3b if it feels slow
  agodaScreenExt: 'png',
  defaultMode: 'live', // 'saved' | 'live'
};
