# src/ai: talking to the local AI

- `ollama.js`: the only file that calls Ollama (`localhost:11434`): `ping()` and `askJson()`
- `draft.js`: `generateDraft()` writes the listing in Thai and English (Typhoon), then Chinese (Qwen-VL), plus the English / Chinese place name and the names of any custom room types or amenities. If the AI is off, slow, stopped (Shift+F) or returns a broken answer, it uses the saved draft for the demo homestay, or a plain listing built from the owner's own answers
- `validate.js`: catches broken output (wrong language, missing parts)
- `coach.js`: reads a sign-up screenshot for the chosen channel and says which screen it is, with a Thai explanation and the card to copy. Without the AI it matches the file name, or uses the current step

Every AI call has a fallback, so the demo never stalls. The result carries `source`: **Live AI** or **Saved (cached)**.

Not loaded by the app: `generateListing.js`, `prompts.js`, `schemas.js`, `templateDraft.js` (an earlier pipeline replaced by `draft.js`).
