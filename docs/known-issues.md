# Known issues / to-fix

Running list of things that need attention. Add new items at the top.

## Older screen and AI files are still in the repo but not loaded

**Status:** open · noted 2026-10-25

**Symptom:** Editing `src/screens/chatHome.js`, `intake.js`, `generating.js`, `preview.js`, `connections.js`, `coach.js`, `liveCard.js` or `src/ui/ui.js` changes nothing on the page. The same goes for `src/ai/generateListing.js`, `prompts.js`, `schemas.js`, `templateDraft.js`, `src/data/coachScreens.js`, `snapshots.js`, `src/rules/photoEdit.js`, `src/ui/chat.js`, `src/ui/style.css`, `public/agoda/*.svg` and `content/*.js`.

**Cause:** The running app (`src/app.js` → `actions.js`, `router.js`, `screens/owner.js`, `console/console.js`) replaced an earlier set of separate screens. `src/ui/ui.js` still imports a `doAction` that `router.js` no longer exports, so those files cannot run as they are. Features that exist only there: the 3-step form with the "brighten" photo button, the readiness checklist and OTP step in the coach, the "request change" flow, and the Shift+1 … 7 snapshots.

**Fix options:** Delete them once the team agrees nothing is needed, or move the features worth keeping into `owner.js`. The README files in `src/` describe which files are live.

## Other text and assets to refresh

**Status:** open · noted 2026-10-25

- `docs/images/hero.jpg` shows an older preview page (no photo gallery or price badge).
- The help page's hotline (02-123-4567), hours and "answers within 1 hour" are sample data; the page marks the number as a sample.
- The coach draws simplified placeholder sign-up pages instead of real Agoda / Google screenshots.

## GitHub Pages is not publishing a live site

**Status:** open · noted 2026-10-25

**Symptom:** The pricing branch work never showed up as a live GitHub page.

**Root cause:** GitHub Pages is turned off for the repo — the API reports
`has_pages: false`, and there is no Pages deploy workflow under
`.github/workflows/`. So nothing is being published anywhere; this is not a
branch/merge problem.

- The pricing code *did* reach `main`: `origin/pricing-page` is fully merged
  (`main` is 3 commits ahead, 0 behind).
- Commit `5cd5d25` ("Move pricing into the LINE app; drop the standalone web
  page") removed the standalone pricing page, so pricing now lives inside the
  LINE app. `index.html` at the repo root is the app demo (the phone mockup),
  not a marketing page.

**Fix options:**
- Enable GitHub Pages serving `main` at root (`/`) — publishes `index.html`
  (the app demo) to a public URL. Settings → Pages, or
  `gh api -X POST repos/salapa0/PerdBaan_Ai/pages -f 'source[branch]=main' -f 'source[path]=/'`.
- Or add a `.github/workflows/` Pages deploy workflow if a build step is wanted.
- Decide what the live page *should* be, since the standalone pricing page was
  intentionally dropped.

## Finance feature branch was held, pending main's new structure

**Status:** appears resolved · noted 2026-10-25

The finance tile and simulated customer pings now exist in the current code (`financeHtml()` in `src/screens/owner.js`, `simulateCustomer()` in `src/actions.js`, Shift+C). The text below is the original note; confirm that the `finance-tile-and-customer-ping` branch (`bc8f638`) can be closed.

`main` received commit `6dfbdb1` ("Add files via upload") that restructured the
app (split `screens/owner.js` into separate screen files, added a photos
feature, etc.). The `finance-tile-and-customer-ping` branch (`bc8f638`, the
การเงิน tile + simulated customer pings) was built on the **older** structure,
so pushing/opening a PR against the rewritten `main` would conflict heavily.

**Decision:** held for now — not pushed, no PR. Reconcile by re-applying the
finance feature onto main's new structure before opening a PR.
