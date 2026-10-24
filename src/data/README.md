# src/data: data formats and saved demo data

- `shapes.js`: the formats for the owner's form, the AI draft and the copy cards. Update it whenever a format changes.
- `demoHomestay.js`: the made-up homestay loaded with Shift+L
- `savedDraft.js`: a ready listing for the demo homestay, used when the live AI is off or fails. On stage, describe it as "AI-generated earlier, cached for speed".
- `platforms.js`: every booking/discovery channel (Agoda, Google Business Profile) as data — screens, copy-card mapping, link check and verify, all in one object per platform. The Connections page, coach walk-through and staff console render from this array, so adding a channel is adding one object here.
- `agodaFields.js`: backward-compatible view of Agoda's sign-up fields (derived from `platforms.js`); kept for older imports and `test.html`
- `coachScreens.js`: the Thai coach answer for each sign-up screen
- `options.js`: every choice in the form (Thai), the photo limits, and the English / Chinese name of each choice (`TERMS`)
- `i18n.js`: the listing preview's interface text in Thai, English and Chinese, plus helpers that show a choice or place name in the page language
- `snapshots.js`: saved points in the demo for Shift+1 … 7
