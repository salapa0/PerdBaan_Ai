# src/data: data formats and saved demo data

- `shapes.js`: the formats for the owner's form, the AI draft and the copy cards (documentation only, nothing imports it). Update it whenever a format changes.
- `demoHomestay.js`: the made-up homestay loaded with Shift+L (3 rooms in 2 types, amenities, 6 demo photos)
- `savedDraft.js`: a ready listing for the demo homestay, used when the live AI is off or fails. On stage, describe it as "AI-generated earlier, cached for speed".
- `platforms.js`: every channel (Agoda, Google Business Profile) as data: sign-up screens, copy-card mapping, link check, the "simulate approval" text, chat messages and the announcement card. The Connections page, the coach and the staff console all render from this array, so adding a channel is adding one object here.
- `agodaFields.js`: Agoda's sign-up screens, derived from `platforms.js`; kept for `test.html`
- `options.js`: every choice in the form (Thai), the photo limits, and the English / Chinese name of each choice (`TERMS`)
- `i18n.js`: the listing preview's interface text in Thai, English and Chinese, plus helpers that show a choice or place name in the page language

Not loaded by the app: `coachScreens.js` and `snapshots.js` (from the earlier screens; Shift+1 … 7 now use `jump()` in `../actions.js`).
