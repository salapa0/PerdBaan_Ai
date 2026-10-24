<div align="center">

# เปิดบ้าน · Poet Baan

### AI helps rural homestays get listed on Agoda — in Thai, English & Chinese

Homestay owners fill a short guided form inside LINE. AI writes their listing in three
languages, staff check it, and an AI coach walks the owner through Agoda's sign-up until the
listing is live. **No bookings, no payments, no commission.**

![Runs offline](https://img.shields.io/badge/runs-100%25%20offline-2ea44f)
![Cloud AI](https://img.shields.io/badge/cloud%20AI-none-informational)
![Cost](https://img.shields.io/badge/cost-%240-brightgreen)
![Languages](https://img.shields.io/badge/listing-TH%20%2F%20EN%20%2F%20%E4%B8%AD%E6%96%87-orange)
![Platform](https://img.shields.io/badge/runs%20on-one%20laptop-lightgrey)

<img src="docs/images/hero.jpg" alt="The owner's phone shows the AI-written listing in Thai, English and Chinese; the staff console shows every check passed" width="820">

## [⬇️ &nbsp; Download the demo](https://github.com/salapa0/PerdBaan_Ai/archive/refs/heads/main.zip)

**[Quick start](#-quick-start)** · **[Turn on the live AI](#-turn-on-the-live-ai-optional)** · **[Demo flow](#-demo-flow-about-3-minutes)** · **[Pricing](pricing.html)** · **[Docs](#-docs)**

</div>

---

## ✨ What it does

- 📝 **Guided form in LINE** — the owner answers a few friendly questions on their phone; no typing a listing from scratch.
- 🌏 **AI writes the listing in 3 languages** — Thai, English and Chinese, ready to paste into Agoda.
- ✅ **Staff review console** — every listing is checked and editable before it goes out.
- 🤝 **AI sign-up coach** — walks the owner through Agoda's real sign-up, step by step, and reads screenshots to point at the right button.
- 🔌 **Offline by design** — runs fully on one laptop. Works even with no AI installed: every AI step falls back to a saved answer.

---

## 🖥️ Requirements

You install just **two things** — the demo, and (optionally) the local AI. Everything else is built in.

| For | You need | Where to get it |
| --- | --- | --- |
| The demo (required) | Python 3 | https://www.python.org/downloads/ — tick **Add Python to PATH** during install |
| Live AI (optional) | Ollama + about 11 GB free RAM | https://ollama.com |

Without the live AI the demo still runs end to end: every AI step falls back to a saved answer, and the staff console shows **Live AI** or **Saved (cached)** for each result.

---

## 🚀 Quick start

**1. Get the demo** — click **[⬇️ Download the demo](https://github.com/salapa0/PerdBaan_Ai/archive/refs/heads/main.zip)** and unzip it (or `git clone https://github.com/salapa0/PerdBaan_Ai.git`).

**2. Run it** — double-click **`start-demo.bat`** (Windows). It starts the local server and opens Chrome at **http://localhost:5173**.

On Mac / Linux, run this from the project folder, then open **http://localhost:5173** in Chrome:

```
python3 -m http.server 5173
```

> Don't double-click `index.html` — the app needs the local server to load its files.

That's it; the demo is fully usable now. The next step is optional.

---

## 🤖 Turn on the live AI (optional)

Do this only if you want to watch the AI generate live instead of using saved answers.

1. Install Ollama from https://ollama.com and start it.
2. Run **`setup-ollama.bat`**. It lets the page talk to Ollama (`OLLAMA_ORIGINS`) and downloads the two models below (several GB — do this ahead of time).
3. Quit Ollama from the tray, start it again, then reload the page. The console's **Ollama** light turns green.

| Model | Job | Tag |
| --- | --- | --- |
| Typhoon 8B (SCB 10X) | Thai + English listing | `hf.co/scb10x/llama-3-typhoon-v1.5-8b-instruct-gguf` |
| Qwen2.5-VL 7B | Chinese translation, reading Agoda screenshots | `qwen2.5vl:7b` (use `:3b` if it feels slow) |

The default tags are already set in `src/config.js`, so there's nothing to edit unless you pull a different size (e.g. `:3b`). Together the models need about 11 GB of RAM.

---

## 🎬 Demo flow (about 3 minutes)

1. **Shift+R** to reset. Tap **เริ่มเลย** in the chat (or the **กรอกข้อมูล** tile in the menu grid at the bottom). Every page has a back arrow (top left).
2. **Shift+L** loads the demo homestay. Submit with **ให้ AI เขียนประกาศ**.
3. In the staff console: point at a check, edit a word, click **Approve & send preview**.
4. On the phone: **ดูตัวอย่าง**, switch TH / EN / 中文, tap **อนุมัติ**.
5. **ไปที่หน้าการเชื่อมต่อ** → **เพิ่มการเชื่อมต่อ** → follow the coach. At step 4, send a screenshot: the AI explains the page in Thai and highlights which card to copy.
6. Paste the sample link, then **Shift+A** to show the listing going live.

<details>
<summary><b>Presenter shortcuts</b></summary>

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

</details>

---

## 🧩 What is simulated

Agoda itself (screenshots and a "simulate approval" key; the real site is never automated), ID and bank-book checks (shown ticked), the map pin, and LINE itself (the phone is a web page styled like LINE). Not built: real LINE Official Account integration, servers, logins, booking alerts, billing.

---

## 📚 Docs

- [Project baseline](docs/project-baseline.md): the whole project in one place
- [Demo MVP scope](docs/demo-mvp-scope-local.md): what is built, faked and left out
- [Prototype build spec](docs/prototype-build-spec.md): stack and build details

---

<details>
<summary><b>🛠️ For contributors & maintainers</b></summary>

### Project layout

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

### Saving your work

See [CONTRIBUTING.md](CONTRIBUTING.md) for the GitHub Desktop flow, handling conflicts, and what not to commit.

### Before demo day

- [ ] Replace the simulated sign-up screens in `public/agoda/` with real captured Agoda screens (`agoda-01.png` … `agoda-08.png`), then set `agodaScreenExt: 'png'` in `src/config.js`.
- [ ] Regenerate `src/data/savedDraft.js` with the real local models (best of 3 runs, fix any Thai / Chinese errors).
- [ ] Swap the illustrated demo photos in `public/demo-photos/` for real ones (same file names, under 500 KB each).
- [ ] Run the full demo once with Wi-Fi off, and record a backup video.

</details>
