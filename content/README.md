# content: our working material (not part of the app)

**What goes here:** things the team uses to build and pitch, which the running app does not load: screenshots, slides, scripts, videos.
**Who:** C (content and data).
**Not here:** code (`src/`), photos or fonts the app shows (`public/`) or written decisions (`docs/`).

| Subfolder | What it holds |
| --- | --- |
| `agoda-screenshots/` | Real screenshots of Agoda's English sign-up screens, named in order |
| `pitch/` | Business slide, demo script, backup screen recording |

## C's checklist (do in this order, B is blocked until item 1 is done)

1. **Agoda sign-up screenshots** in `agoda-screenshots/`, named in order (`01-...png`, `02-...png`). Also write down the **field order** Agoda asks for.
2. **Demo homestay**: owner name, place, rooms and prices, the quick-question answers, contact. Save as `src/data/demoHomestay.json` using the shapes in `src/data/shapes.js`.
3. **Demo photos** in `public/demo-photos/` (under 500 KB each).
4. **Saved fallback answers**: `src/data/savedDraft.json` (a good AI listing for the demo homestay) and pre-written Thai coach answers for each screenshot.
5. **Pitch material** in `pitch/`: business slide (pricing tiers, value logic, break-even, sponsor model), demo script, backup screen recording.
