# src/data: shared data formats and saved demo data

**What goes here:**
- `shapes.js`: the agreed formats for the owner's form, the AI draft and the copy cards. Everyone codes against this. Change it only after telling the team.
- `demoHomestay.js`: the made-up homestay we load with one button, so nobody types live
- `savedDraft.js`: a good, ready AI listing for the demo homestay (the backup if the live AI is slow or fails)
- `agodaFields.js` (Agoda sign-up fields in order), `coachScreens.js` (pre-written Thai coach answers per screen), `options.js` (chip labels TH/EN), `snapshots.js` (recovery states for Shift+1…7)

**Who:** C (content and data).
**Not here:** photos (`public/demo-photos/`), screenshots (`content/agoda-screenshots/`) or logic code.

Be honest on stage: anything saved here is described as "AI-generated earlier, saved for speed".
