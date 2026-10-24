# src/rules: fixed checks and builders (no AI)

- `runChecks.js`: listing checks. Errors: **E1** a room price is missing or 0, **E4** banned claims such as "ดีที่สุด" / "best in", **E5** phone number format. Warnings: **W7** more than 8 rooms, **W8** a link in the description, **W9** room types do not add up to the total number of rooms, **W10** fewer than 5 photos
- `suggestPrice.js`: suggested price and band from the owner's first room price
- `buildCopyCards.js`: turns the listing into the tap-to-copy cards for a channel's sign-up; the channel-specific mapping lives in `../data/platforms.js`
- `checkAgodaLink.js`: checks that a pasted link is an Agoda listing link (Google's link check is in `../data/platforms.js`)

These give the same answer every time; `test.html` checks them. Not loaded by the app: `photoEdit.js` (resize and brighten photos on a canvas, used only by the older form screens).
