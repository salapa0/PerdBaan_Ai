# src: the app's code

| Folder / file | What it holds |
| --- | --- |
| `app.js` | Starts the app: wires clicks and typing, scales the phone to the window, checks Ollama every 5 seconds |
| `state.js` | The single app state, kept in memory only (reloading the page resets it) |
| `actions.js` | Everything the owner, the staff console and the presenter toolbar can do |
| `router.js` | Draws the phone: header, screen and bottom dock for the current step |
| `toolbar.js` | Hidden presenter toolbar and Shift shortcuts |
| `config.js` | Ollama address, AI model tags, default AI mode (`live` falls back to saved answers when Ollama is off) |
| `photos.js` | Shrinks a photo the owner picked into a small JPEG (a data URL kept in the app state) |
| `ui/` | `app.css` (all styles) and `dom.js` (small helpers) |
| `screens/` | The owner's phone screens (`owner.js`) |
| `console/` | The staff console |
| `ai/` | Everything that talks to the local AI |
| `rules/` | Fixed checks and builders, no AI |
| `data/` | Demo homestay, saved AI answer, channels, form choices, preview text |

Fonts, demo photos and the older sign-up images live in `public/`, not here.

## Files the app does not load

These belong to an earlier set of separate screens and a second AI pipeline. Nothing in `app.js` imports them (and `ui/ui.js` imports a `doAction` that `router.js` no longer has), so editing them changes nothing on the page. They are kept until the team decides whether to delete them (see `docs/known-issues.md`).

- `screens/`: `chatHome.js`, `intake.js`, `generating.js`, `preview.js`, `connections.js`, `coach.js`, `liveCard.js`
- `ui/`: `ui.js`, `chat.js`, `style.css`
- `ai/`: `generateListing.js`, `prompts.js`, `schemas.js`, `templateDraft.js`
- `data/`: `coachScreens.js`, `snapshots.js`
- `rules/`: `photoEdit.js`
