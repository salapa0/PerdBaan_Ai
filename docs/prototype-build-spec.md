# Prototype Build Spec (demo 25 Oct 2026)

As of 24 Oct 2026. Builds on docs/demo-mvp-scope-local.md. Baseline decisions still apply (Agoda only, no voice, homestays first, online-only AI coach, no bookings/payments).

## Locked stack (tech stack session, 24 Oct 01:42)
Plain HTML + vanilla JS (ES modules) + Tailwind standalone CLI + Noto Sans Thai (bundled), served with `python -m http.server 5173`. Ollama on localhost:11434 with **Typhoon** (Thai + English listing) and **Qwen-VL** (Chinese translation + screenshot coach). `/api/chat` with JSON-schema `format`; hand-written validator; saved JSON fallback per field. State in localStorage, photos in IndexedDB (idb-keyval). Coach "simple" mode: Qwen-VL returns screen_id only; Thai explanation is pre-written per screen.

## Spec sections
1. Stack + architecture diagram
2. Machine setup (OLLAMA_ORIGINS, model sizes by RAM, keep_alive, Tailwind CLI, offline check)
3. Folder structure (~30 files, owner per file)
4. Data model (state, intake, draft, copyCard, chatMessage, coachTurn, action strings)
5. App shell, store, router, ui/chat helpers, boot order
6. Owner screens S1-S7 (fields, Thai strings, rules, status table)
7. Staff console S8
8. AI layer: Ollama client, 2-pass generateListing, prompts, schemas, validateDraft, coachScreenshot Plan A/B, optional full coach and rewriteField
9. Rules: runChecks (E1-E5, W1-W9), suggestPrice (rule on owner's own price), buildCopyCards, checkAgodaLink, photoEdit, photos.js
10. Content: Agoda screenshots + agodaFields.js + coachScreens.js (C first), demo homestay, photos, savedDraft.json, pitch assets
11. Failsafes: hidden toolbar + Shift shortcuts, stage snapshots, fallback per step, Live/Saved badge
12. Tests and rehearsal path
13. 19-task build order with owners (A frontend, B AI/logic/console, C content/pitch), hours, done-when; cut order
14. Faked / not coded / open items

The full spec (with the architecture diagram) lives in the Claude project as an editable doc. This file is the summary.

## Open
Laptop specs and exact model tags; team roles; product and bot name; demo homestay; organisers accept localhost?; Plan A vs Plan B on stage.
