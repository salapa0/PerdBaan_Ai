# src: the app's code

**What goes here:** all the code that makes the app run, plus the small data files the code reads.
**Who:** A, B and C each own different subfolders (see below).
**Not here:** photos, fonts, screenshots, slides or written notes. Those go in `public/`, `content/` or `docs/`.

| Subfolder | What it holds | Owner |
| --- | --- | --- |
| `ui/` | Small reusable pieces: chat bubble, card, button, copy button | A |
| `screens/` | The owner's screens: chat, form, preview, Connections page, live card | A (the coach screen is B) |
| `ai/` | Talking to the local AI: prompts, listing writer, screenshot reader | B |
| `rules/` | Plain checks, no AI: missing price, too few photos, Agoda copy cards, link check | B |
| `console/` | The staff screen on the right side of the page | B |
| `data/` | Shared data formats and the saved demo data | C |

`app.js` is where the app starts. A owns it.
