# src/ai: talking to the local AI

- `ollama.js`: the only file that calls Ollama (`localhost:11434`)
- `prompts.js`, `schemas.js`: what we ask the AI, and the exact JSON format we require back
- `generateListing.js`: writes the listing in Thai and English (Typhoon), then Chinese (Qwen-VL)
- `validate.js`: catches broken output (wrong language, too long, missing parts)
- `templateDraft.js`: builds a plain listing from the owner's own answers when the AI fails for a homestay that is not the demo one
- `coach.js`: reads an Agoda screenshot and says which sign-up screen it is

Every AI call has a timeout and a fallback, so the demo never stalls.
