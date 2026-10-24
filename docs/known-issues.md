# Known issues / to-fix

Running list of things that need attention. Add new items at the top.

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

## Finance feature branch is held, pending main's new structure

**Status:** open · noted 2026-10-25

`main` received commit `6dfbdb1` ("Add files via upload") that restructured the
app (split `screens/owner.js` into separate screen files, added a photos
feature, etc.). The `finance-tile-and-customer-ping` branch (`bc8f638`, the
การเงิน tile + simulated customer pings) was built on the **older** structure,
so pushing/opening a PR against the rewritten `main` would conflict heavily.

**Decision:** held for now — not pushed, no PR. Reconcile by re-applying the
finance feature onto main's new structure before opening a PR.
