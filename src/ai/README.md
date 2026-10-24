# src/ai: everything that talks to the local AI

**What goes here:**
- The code that calls Ollama on this laptop
- The prompts (the instructions we give the AI)
- The listing writer: takes the owner's form and returns the title and description in Thai, English and Chinese
- The screenshot coach: looks at an Agoda screenshot and says which screen it is

**Who:** B (AI and logic).
**Not here:** simple checks and copy cards (those go in `src/rules/`, they use no AI) and screens (`src/screens/`).

Important: the AI can be slow or give bad output. Every AI function must fall back to the saved answer in `src/data/` so the demo never breaks.
