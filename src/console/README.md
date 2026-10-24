# src/console: the staff console

The right-hand pane. It does not approve anything: the AI draft goes straight to the owner, who is the only approver. It shows:

- who the owner is, and the **Ollama** light with the AI mode (Live / Saved)
- whether the draft came from **Live AI** or **Saved (cached)**, and the check results from `rules/runChecks.js`
- a summary of the owner's form (rooms, amenities)
- each channel's progress (not started, step x of y, waiting for confirmation, live)
- buttons for the presenter: stop the AI, load the demo homestay, simulate the channel's approval (Shift+A), simulate a guest enquiry (Shift+C), reset
