# src: the app's code

| Folder / file | What it holds |
| --- | --- |
| `app.js` | Starts the app: restores state, draws both panes, starts the clock and the Ollama check |
| `state.js` | The single app state, saved in the browser |
| `router.js` | Which screen shows for each step, and what every button does |
| `toolbar.js` | Hidden presenter toolbar and Shift shortcuts |
| `config.js` | Product name, AI model tags, timeouts |
| `photos.js` | Stores uploaded photos in the browser (IndexedDB) |
| `ui/` | Styles and shared pieces |
| `screens/` | The owner's phone screens |
| `console/` | The staff console |
| `ai/` | Everything that talks to the local AI |
| `rules/` | Fixed checks and builders, no AI |
| `data/` | Data shapes and saved demo data |

Photos, fonts and sign-up screens live in `public/`, not here.
