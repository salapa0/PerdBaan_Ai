# src/rules: plain checks and builders (no AI)

**What goes here:** normal code with fixed rules:
- Draft checks: missing price or max guests, fewer than 5 photos, text too short or too long, banned words like "best" or "No.1"
- Copy-card builder: turns the listing into Agoda's sign-up fields, in Agoda's order
- Agoda link check: is this link really an Agoda link?
- Price suggestion: simple rule based on the owner's own price

**Who:** B (AI and logic).
**Not here:** anything that calls the AI (`src/ai/`) or draws a screen (`src/screens/`).

These must give the same answer every time, so they are easy to test.
