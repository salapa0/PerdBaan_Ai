# src/screens: what the owner sees on the phone

All the screens the app shows are in `owner.js`. It returns HTML strings; `router.js` puts them in the phone. Screens call `rules/` and `data/`; they do not hold that logic.

**LINE chat** (`chat`, `review`, `live` steps)
- Bot and owner messages, cards with buttons (preview ready, go to connections, add another channel, finance), one announcement card per channel that is live, and simulated guest messages.
- The rich menu at the bottom is a 3 × 2 grid: กรอกข้อมูล · ดูตัวอย่าง · การเชื่อมต่อ/สมัคร · ราคา/แพ็กเกจ · การเงิน · ช่วยเหลือ. Tiles that are not ready yet are greyed and explain why when tapped.

**LIFF mini-app pages** (open with their own header: back arrow, title, ✕ to return to the chat)
- `form`: number of rooms, room types with count and price, amenities (with an "other" box), photos (first photo is the cover), optional notes
- `writing`: "AI is writing your listing"
- `preview`: the listing in ไทย / English / 中文 with photo gallery, price badge and the approve button
- `connections`: one card per channel, read from `data/platforms.js` (Agoda, Google Business Profile)
- `coach`: step-by-step sign-up for the chosen channel with tap-to-copy cards, and screenshot help at the last step
- `finance`: free until the first guest, then the Standard plan, plus a summary of simulated guests
- `help`: staff hours, hotline (sample data) and common questions

The older separate screen files in this folder (`chatHome.js`, `intake.js`, `generating.js`, `preview.js`, `connections.js`, `coach.js`, `liveCard.js`) are not loaded; see `../README.md`.
