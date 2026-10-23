# เปิดบ้าน : AI ช่วยโฮมสเตย์ชนบทขึ้น Agoda

*English working title: Rural Tourism AI Listing*

AI-assisted advertising and listing service for rural Thai tourism owners. Owners fill a guided form inside LINE, AI writes the listing in Thai, English and Chinese, and an AI connection coach walks them through getting live on Agoda. We take no bookings, payments or commission (B2B agency model).

Built for a tourism competition. **Demo: 25 Oct 2026.**

## Status
Competition prototype in progress. Runs fully on one laptop (no server, no cloud AI, no budget).

## Locked decisions
- B2B agency model: we advertise and list, we take no bookings, payments or commission
- Online only, AI-assisted (no field visits)
- Agoda is the only platform for now
- No voice input
- Homestay owners first

## Quick start
```
git clone https://github.com/salapa0/rural-tourism-ai-listing.git
cd rural-tourism-ai-listing
python -m http.server 5173
```
Then open http://localhost:5173 in the browser.

For the local AI (Ollama), set `OLLAMA_ORIGINS` so the browser may call it, then pull the models. The exact model tags are still open; see `docs/prototype-build-spec.md`.
```
# Mac/Linux example
OLLAMA_ORIGINS="http://localhost:5173" ollama serve
```
On Windows, set `OLLAMA_ORIGINS` as an environment variable, then restart Ollama.

## Stack (prototype)
Plain HTML + vanilla JS (ES modules), Tailwind standalone CLI, Noto Sans Thai, served with `python -m http.server 5173`. Local AI through Ollama on localhost:11434: Typhoon (Thai and English listing) and Qwen-VL (Chinese and screenshot coach). State in localStorage, photos in IndexedDB.

## Folder map
| Folder | What goes there | Owner |
| --- | --- | --- |
| `index.html`, `src/app.js`, `src/ui/`, `src/screens/` (except coach) | App shell, chat, intake, preview, Connections page, live card | A (frontend) |
| `src/ai/`, `src/rules/`, `src/console/`, `src/screens/coach.js` | Ollama client, prompts, listing generation, screenshot coach, checks, copy cards, staff console | B (AI and logic) |
| `src/data/`, `content/`, `public/demo-photos/` | Data shapes, demo homestay, saved fallback answers, Agoda screenshots, pitch material | C (content and data) |
| `docs/` | Project decisions and specs | everyone |

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to work in parallel without conflicts.

## Docs
- [Project baseline](docs/project-baseline.md): read this first
- [Demo MVP scope](docs/demo-mvp-scope-local.md): what we code, fake and drop
- [Prototype build spec](docs/prototype-build-spec.md): stack, sections and build order

## Team
3 people: one full-stack developer (A), one flex developer (B), and one for business, product and data (C). Roles are proposed, not final.
