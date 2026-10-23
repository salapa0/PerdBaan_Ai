# src/screens: what the owner sees on the phone

**What goes here:** one file per screen the owner sees, in order:
1. Chat (LINE style) with the "Load demo homestay" button
2. Intake form (3 steps: rooms and prices, photos, quick questions and phone)
3. "AI is writing your listing" loading screen
4. Preview of the Agoda listing, with Approve
5. Connections page (the Agoda card and its status)
6. AI coach screen (checklist, copy cards, send screenshot) **owned by B**
7. Live card after Agoda approval

**Who:** A (frontend), except the coach screen, which is B.
**Not here:** AI code (`src/ai/`), checks (`src/rules/`) or the staff screen (`src/console/`). A screen should call those, not contain them.
