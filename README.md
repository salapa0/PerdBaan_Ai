# Rural Tourism AI Listing

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

## Stack (prototype)
Plain HTML + vanilla JS (ES modules), Tailwind standalone CLI, Noto Sans Thai, served with `python -m http.server 5173`. Local AI through Ollama on localhost:11434: Typhoon (Thai and English listing) and Qwen-VL (Chinese and screenshot coach). State in localStorage, photos in IndexedDB.

## Docs
- [Project baseline](docs/project-baseline.md): read this first
- [Demo MVP scope](docs/demo-mvp-scope-local.md): what we code, fake and drop
- [Prototype build spec](docs/prototype-build-spec.md): stack, sections and build order

## Team
3 people. Roles not set yet.
