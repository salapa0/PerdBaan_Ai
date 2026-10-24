# src/screens: what the owner sees on the phone

1. `chatHome.js`: LINE chat with the official account, rich menu and keyboard bar
2. `intake.js`: the 3-step form (rooms and prices, photos, quick questions and contact)
3. `generating.js`: "AI is writing your listing"
4. `preview.js`: the listing preview in TH / EN / 中文, approve or request a change
5. `connections.js`: the Agoda card and its status
6. `coach.js`: the step-by-step Agoda sign-up coach, including screenshot help
7. `liveCard.js`: the "now live on Agoda" card

Screens 2 to 6 open like LINE mini-apps (LIFF pages) with their own header. Screens call `ai/` and `rules/`; they do not contain that logic.
