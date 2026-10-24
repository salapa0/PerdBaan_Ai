# src/rules: fixed checks and builders (no AI)

- `runChecks.js`: listing checks (missing price or guests, banned claims like "best", phone format, too few photos, contact details in the description)
- `suggestPrice.js`: suggested price band from the owner's own room price
- `buildCopyCards.js`: turns the listing into Agoda's sign-up fields, in Agoda's order
- `checkAgodaLink.js`: checks that a pasted link is an Agoda listing link
- `photoEdit.js`: resize, brighten and convert photos on a canvas

These give the same answer every time; `test.html` checks them.
