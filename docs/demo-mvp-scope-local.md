# Demo MVP Scope: What We Code, Fake and Drop (local-only, zero budget)

As of 24 Oct 2026 (01:30 Bangkok time). Demo: **25 Oct 2026**, about 1 day of build time, team of 3.
**This file replaces section 7 of docs/project-baseline.md for the build.** All other baseline decisions still apply (Agoda only, no voice, homestays first, online-only AI coach, no bookings/payments).

---

## 1. Constraints (decided 24 Oct)

- **No money at all.** No server, no hosting, no cloud AI, no paid APIs.
- **Everything runs on one laptop**, including the AI. Works offline at the venue once models are downloaded.
- Competition only says "prototype", no detailed scope. Assumption: a working, clickable prototype on our laptop (localhost) is acceptable. Ask organisers if possible.
- **Target level 2:** the local AI writes the listing live; the screenshot coach tries the local vision model (level 3) with saved answers as fallback.
- Be honest on stage: anything cached is described as "AI-generated earlier, cached for speed".

| Level | What runs | Risk |
| --- | --- | --- |
| 1. Clickable | All screens work, AI answers pre-written | None, weaker |
| **2. Target** | Local AI writes listing live; coach uses saved answers | Low |
| 3. Full | Local vision model also reads screenshots live | Medium (speed, Thai quality) |

## 2. Architecture

- **One web page, two panes on one laptop:** phone frame styled like LINE (owner) on the left, staff console on the right. No login, no database, no device sync.
- Run with a local dev server or plain HTML files.
- **No backend:** the page calls **Ollama** (or LM Studio) on `localhost` directly. Set `OLLAMA_ORIGINS` so the browser may call it.
- State in one JavaScript object saved to localStorage. **"Load demo homestay"** button so nothing is typed live.
- Model: a Thai-capable open model, e.g. **Qwen** family (has vision versions) or SCB 10X **Typhoon**. 8 GB RAM -> 3-4B model; 16 GB -> 7-8B; Mac M-series or GPU is much faster.
- Download models **the night before** and test Thai output with the demo homestay. If Thai is poor, hand-write Thai and let AI do English/Chinese.
- Expect 30-90 s to generate 3 languages on a normal laptop: run once live, keep a saved copy.

## 3. We ARE coding

**Owner screens (phone pane, LINE style)**
1. Fake LINE chat: bubbles, card messages with buttons, "Load demo homestay" button
2. Intake form, 3 steps: rooms and prices; photo upload with shot-list hint; tap-to-answer questions + contact phone
3. "AI is writing your listing" loading screen
4. Thai preview of the Agoda listing + **Approve**
5. Connections page: Agoda card with status states (not connected / connecting step x of y / waiting for Agoda check / live)
6. AI coach: readiness checklist, "Open Agoda sign-up" button, copy cards with Copy buttons, send screenshot -> Thai answer + highlighted card
7. Paste Agoda link -> hidden "Simulate Agoda approval" button -> **live card** in chat

**Staff screen (console pane)**
8. Console: draft + check flags, edit text, "Approve & send preview" (one draft, no queue)

**Logic (all local)**
9. `generateListing(intake)`: local model returns JSON (title/description in TH, EN, ZH, highlights, suggested price + reason); falls back to saved JSON if output breaks
10. `coachScreenshot(image, copyCards, step)`: Plan A local vision model; Plan B match our prepared screenshot by file name to a pre-written Thai answer. Returns `{explanation_th, card_id, next_step}`
11. `runChecks(draft, intake)`: rule checks (missing price/max guests, < 5 photos, text too short/long, banned claims like "best", "No.1")
12. `buildCopyCards(draft, intake)`: maps data to Agoda sign-up fields in Agoda's order (plain code, no AI)
13. `checkAgodaLink(url)`: pattern check that the link is an Agoda link
14. Photo brighten + crop on canvas (optional)
15. Saved AI answers for the demo homestay (fallback)
16. App state in localStorage

**Setup (not code, must be done)**
17. Ollama or LM Studio + Thai-capable model, downloaded and tested
18. Demo homestay data and photos, real screenshots of Agoda's English sign-up screens (+ field order list), business slide, backup screen recording

### Shared data shapes (agree first, 30 min)
- `intake`: owner, place, rooms[], photos[], answers{}, contact
- `draft`: title_{th,en,zh}, desc_{th,en,zh}, highlights[], price{value, reason}, flags[]
- `copyCard`: id, agodaField, value, order

## 4. We are FAKING

- Agoda itself: real screenshots of its sign-up; the 72 h check = simulate button. Never automate the real site
- ID / bank-book reading: checklist shown already ticked
- Map pin: address text or static map image
- Request change: skipped, or one canned revision
- Photo clean-up: pre-edited demo photos if the canvas effect isn't built

## 5. We are NOT coding

- Real LINE OA, Messaging API, webhook, rich menu, LIFF
- Any server, hosting or cloud AI
- Logins, accounts, database, multiple owners
- Photo quality detection and retake prompts
- Gmail help, Ask my helper, paid human help, reminders
- Booking alerts, after-care, editing a live listing
- Billing, subscriptions, plan picker (pricing goes on the slide)
- Console queue, monitoring, staff login
- PDPA consent screens (one checkbox line at most)

These go on a "Next steps" slide.

**Cut order if time runs short:** Request change -> photo clean-up -> Chinese -> console edit fields (keep Approve). **Never cut** the coach screenshot step or the live card.

## 6. Team split (proposed, roles not yet confirmed)

- **A, frontend:** chat shell, intake, preview, Connections page, live card (items 1, 2, 3, 4, 5, 7)
- **B, AI + logic + console:** local model setup, prompts, generateListing, coachScreenshot, checks, copy cards, coach screen, console, saved answers (items 6, 8-16)
- **C, content + pitch:** **first** capture Agoda sign-up screenshots and field order (B needs them); demo homestay data/photos; business slide (pricing, value logic, break-even, sponsor model); demo script; backup recording

## 7. Day plan (hours from start)

| Hours | Work |
| --- | --- |
| 0-1 | Agree stack and data shapes, empty app running locally, model downloading |
| 1-5 | Build in parallel |
| 5-6 | Join end to end with demo homestay |
| 6-8 | Coach screenshot flow, live card, saved-answer fallback |
| 8-10 | Polish, rehearse twice, record backup video |
| After 10 | Feature freeze |

## 8. Still open

- Laptop specs (RAM, Mac/Windows, GPU) -> decides model size
- Team roles, product name
- Do organisers accept a localhost prototype? Demo length and judging criteria?
