# เปิดบ้าน : AI helps rural homestays get listed on Agoda

AI-assisted advertising and listing service for rural Thai tourism owners. Owners fill a guided form inside LINE, AI writes the listing in Thai, English and Chinese, and an AI connection coach walks them through getting live on Agoda. We take no bookings, payments or commission (B2B agency model).

Built for a tourism competition. **Demo: 25 Oct 2026.**

## Status
Working prototype (v1, 24 Oct). Full demo path runs offline on one laptop; every AI call falls back to a saved answer, so the demo works even with no AI installed. Logic self-tests: open `test.html`.

## Locked decisions
- B2B agency model: we advertise and list, we take no bookings, payments or commission
- Online only, AI-assisted (no field visits)
- Agoda is the only platform for now
- No voice input
- Homestay owners first

## Quick start
```
git clone https://github.com/salapa0/PerdBaan_Ai.git
cd PerdBaan_Ai
python -m http.server 5173
```
Then open http://localhost:5173 in Chrome (never double-click `index.html`). On Windows you can just double-click **`start-demo.bat`**.

For the live local AI (optional), install Ollama and run **`setup-ollama.bat`** (Windows): it sets `OLLAMA_ORIGINS` and pulls the models. Chosen for a 16 GB budget: **Typhoon 8B** (`hf.co/scb10x/llama-3-typhoon-v1.5-8b-instruct-gguf`, Thai + English) and **Qwen2.5-VL 7B** (`qwen2.5vl:7b`, Chinese + screenshot coach). Tags live in `src/config.js`. The console's Ollama light turns green when both are found.
```
# Mac/Linux example
OLLAMA_ORIGINS="http://localhost:5173" ollama serve
```
On Windows, set `OLLAMA_ORIGINS` as an environment variable, then restart Ollama.

## Stack (prototype)
Plain HTML + vanilla JS (ES modules), hand-written CSS (`src/ui/app.css`, no build step), Thai system font with Noto Sans Thai if installed, served with `python -m http.server 5173`. Local AI through Ollama on localhost:11434: Typhoon (Thai and English listing) and Qwen-VL (Chinese and screenshot coach). State in localStorage, photos in IndexedDB.

## Folder map
| Folder | What goes there | Owner |
| --- | --- | --- |
| `index.html`, `src/app.js`, `src/state.js`, `src/router.js`, `src/toolbar.js`, `src/ui/`, `src/screens/` (except coach) | App shell, store, routing, presenter toolbar, chat, intake, preview, Connections page, live card | A (frontend) |
| `src/config.js`, `src/photos.js`, `src/ai/`, `src/rules/`, `src/console/`, `src/screens/coach.js` | Model tags, photo storage, Ollama client, prompts, listing generation, screenshot coach, checks, copy cards, staff console | B (AI and logic) |
| `src/data/`, `content/`, `public/demo-photos/`, `public/agoda/` | Data shapes, demo homestay, saved fallback answers, Agoda field map + sign-up screens the app shows, pitch material | C (content and data) |
| `docs/` | Project decisions and specs | everyone |

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to work in parallel without conflicts.

## Presenter controls
**Shift+D** shows a hidden demo toolbar. Shift+L load demo homestay · Shift+S toggle Live/Saved AI · Shift+F use saved answer now · Shift+W warm up models · Shift+P approve in console · Shift+A simulate Agoda approval (live card) · Shift+1…7 jump to a stage · Shift+R reset.

## Before demo day (C)
- `public/agoda/agoda-01.png` … `agoda-08.png` are **labelled simulation mockups**. Replace them with real captured Agoda sign-up screens (same names); the coach matches its Thai answers by file name. Field order lives in `src/data/agodaFields.js`.
- `src/data/savedDraft.js` holds placeholder AI text. Regenerate it from the real local models (best of 3 runs, hand-fix Thai/Chinese).
- Demo photos in `public/demo-photos/` are generated placeholders; swap in real ones (same names, under 500 KB).

## Docs
- [Project baseline](docs/project-baseline.md): read this first
- [Demo MVP scope](docs/demo-mvp-scope-local.md): what we code, fake and drop
- [Prototype build spec](docs/prototype-build-spec.md): stack, sections and build order

## Team
3 people: one full-stack developer (A), one flex developer (B), and one for business, product and data (C). Roles are proposed, not final.
