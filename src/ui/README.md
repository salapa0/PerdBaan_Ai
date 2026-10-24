# src/ui: styles and small helpers

- `app.css`: all styles, including the phone frame, the LINE look and the bundled Thai font (`public/fonts/`)
- `dom.js`: `$` (query), `esc` (escape text for HTML) and `toast` (the short message at the bottom of the phone)

Almost all Thai interface text is written directly in `../screens/owner.js`, `../console/console.js`, `../actions.js` and `../data/platforms.js`. The text inside the listing preview is in `../data/i18n.js` (Thai, English, Chinese).

Not loaded by the app: `ui.js` (an older helper set with a `TEXT` table), `chat.js` and `style.css`.
