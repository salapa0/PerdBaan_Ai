# เปิดบ้าน (Poet Baan): AI helps rural homestays get listed on Agoda

Homestay owners fill a short guided form inside LINE. AI writes their listing in Thai, English and Chinese, staff check it, and an AI coach walks the owner through Agoda's sign-up until the listing is live. We take no bookings, payments or commission.

Competition prototype. Runs fully on one laptop, offline: no server, no cloud AI, no cost.

## Run it

Needs Python 3. Double-click **`start-demo.bat`** (Windows), or from this folder:

```
python -m http.server 5173
```

Open **http://localhost:5173** in Chrome. Do not double-click `index.html`; the app needs the local server.

The demo works without any AI installed: every AI step falls back to a saved answer. The staff console always shows whether a result came from **Live AI** or **Saved (cached)**.

## Turn on the live AI (optional)

1. Install Ollama from https://ollama.com
2. Run **`setup-ollama.bat`**. It allows the page to talk to Ollama (`OLLAMA_ORIGINS`) and downloads the two models (several GB, do it ahead of time).
3. Quit Ollama from the tray and start it again, then reload the page. The console's Ollama light turns green.

| Model | Job | Tag (set in `src/config.js`) |
| --- | --- | --- |
| Typhoon 8B (SCB 10X) | Thai + English listing | `hf.co/scb10x/llama-3-typhoon-v1.5-8b-instruct-gguf` |
| Qwen2.5-VL 7B | Chinese translation, reading Agoda screenshots | `qwen2.5vl:7b` (use `:3b` if it feels slow) |

Together they need about 11 GB of RAM.

## Demo flow (about 3 minutes)

1. **Shift+R** to reset. Tap **เริ่มเลย** in the chat (or the **กรอกข้อมูล** tile in the menu grid at the bottom). Every page has a back arrow (top left).
2. **Shift+L** loads the demo homestay. Submit with **ให้ AI เขียนประกาศ**.
3. In the staff console: point at a check, edit a word, click **Approve & send preview**.
4. On the phone: **ดูตัวอย่าง**, switch TH / EN / 中文, tap **อนุมัติ**.
5. **ไปที่หน้าการเชื่อมต่อ** → **เพิ่มการเชื่อมต่อ** → follow the coach. At step 4, send a screenshot: the AI explains the page in Thai and highlights which card to copy.
6. Paste the sample link, then **Shift+A** to show the listing going live.

### Presenter shortcuts

**Shift+D** shows a hidden toolbar with the same controls. Shortcuts are ignored while typing in a field.

| Key | Action |
| --- | --- |
| Shift+L | Load demo homestay |
| Shift+S | Switch AI mode Live / Saved |
| Shift+F | Stop the running AI call and use the saved answer |
| Shift+W | Warm up both models (do this ~5 minutes before presenting) |
| Shift+P | Approve & send preview |
| Shift+A | Simulate Agoda approval (live card) |
| Shift+1 … 7 | Jump to a saved point in the demo |
| Shift+B | Back one page |
| Shift+R | Reset everything |

## Project layout

| Path | What it is |
| --- | --- |
| `index.html` | The page: phone (left) and staff console (right) |
| `src/app.js` | Starts the app |
| `src/state.js`, `src/router.js`, `src/toolbar.js`, `src/config.js`, `src/photos.js` | App state, screen switching, presenter toolbar, settings, photo storage |
| `src/ui/` | Styles and shared pieces (icons, buttons, chat messages, Thai text) |
| `src/screens/` | The owner's screens: chat, form, writing, preview, connections, coach |
| `src/console/` | The staff console |
| `src/ai/` | Talking to the local AI, with a fallback for every call |
| `src/rules/` | Fixed checks and builders (no AI): listing checks, price, copy cards, link check, photo editing |
| `src/data/` | Data shapes, demo homestay, saved AI answers, Agoda field map |
| `public/` | Files the app loads: fonts, demo photos, Agoda sign-up screens |
| `content/` | Working material the app does not load: real screenshots, pitch |
| `docs/` | Decisions and specs |
| `test.html` | Logic self-tests: open http://localhost:5173/test.html |

## Saving your work (GitHub Desktop)

1. **Fetch origin**, then **Pull origin** if it appears, before you start.
2. Make your changes. They show in the **Changes** tab.
3. Write a short summary, click **Commit to main**, then **Push origin**.

See [CONTRIBUTING.md](CONTRIBUTING.md) for conflicts and what not to commit.

## Before demo day

- [ ] Replace the simulated sign-up screens in `public/agoda/` with real captured Agoda screens (`agoda-01.png` … `agoda-08.png`), then set `agodaScreenExt: 'png'` in `src/config.js`.
- [ ] Regenerate `src/data/savedDraft.js` with the real local models (best of 3 runs, fix any Thai / Chinese errors).
- [ ] Swap the illustrated demo photos in `public/demo-photos/` for real ones (same file names, under 500 KB each).
- [ ] Run the full demo once with Wi-Fi off, and record a backup video.

## What is simulated

Agoda itself (screenshots and a "simulate approval" key; the real site is never automated), ID and bank-book checks (shown ticked), the map pin, and LINE itself (the phone is a web page styled like LINE). Not built: real LINE Official Account integration, servers, logins, booking alerts, billing.

## Docs

- [Project baseline](docs/project-baseline.md): the whole project in one place
- [Demo MVP scope](docs/demo-mvp-scope-local.md): what is built, faked and left out
- [Prototype build spec](docs/prototype-build-spec.md): stack and build details
