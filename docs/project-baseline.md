# PROJECT BASELINE: AI-Assisted Advertising Platform for Rural Thai Tourism

Last updated: 24 Oct 2026 (01:15 Bangkok time). **Read this first in every new session.** It summarises the whole project.

---

## 1. Situation at a glance

| Item | Status |
| --- | --- |
| What | AI-assisted listing/advertising service for rural Thai tourism owners (B2B SaaS, works like an ad agency) |
| Operating mode | **Online only, AI-assisted (decided 24 Oct).** No field visits, no staff-led setup calls. Owners connect the platform themselves on a **Connections page**, guided by an **AI connection coach** in LINE. People handle exceptions only |
| Platform scope | **Agoda only (decided 24 Oct, 01:15).** All other channels dropped or moved to later |
| Input | **No voice input (decided 24 Oct, 01:15).** Owners tap answers and type short text |
| First users | **Homestay owners.** Experience hosts/guides deferred (Agoda does not take self-listed activities) |
| Why now | Tourism **competition**: needs an MVP and a **working app/prototype demo** |
| Demo date | **25 Oct 2026**; about 1 day of build time |
| Team | 3 people. **No set roles yet** |
| Product name | **เปิดบ้าน : AI ช่วยโฮมสเตย์ชนบทขึ้น Agoda** (decided 24 Oct) |
| Pilot province / DASTA area | **Not chosen** |
| Real-world testing | **None yet.** No owner has been pitched, listed or charged |

### Competition requirements (as stated by the user)
1. Must be clearly **focused on tourism** (bonus points).
2. Must have an **MVP and a demo**: a working app/prototype.
3. If it became a real business it must **monetise and make money**. A clear revenue model is required.

---

## 2. The product

**Problem:** Rural homestays, community-based tourism (CBT) villages, local guides and experience hosts are hard to find online. Thailand has ~3,273 OTOP Nawatwithi tourism villages, but DASTA lists only 55 CBT communities as "ready to sell". The binding constraint is the owners' digital readiness: connectivity, digital literacy, online channels and payments.

**Solution:** AI does the online work with them, remotely, inside LINE, and gets them live on **Agoda**.

**Flow (final):**
1. **User input**: the owner fills guided LIFF pages inside LINE: place and rooms (types, beds, prices, max guests), photos with a shot-list guide, **tap-to-answer quick questions** (facilities, meals, nearby things to do, house rules) plus one optional short text, contact and map pin, and documents for Agoda (ID, bank book, phone, email, licence number). A helper can do the document steps.
2. **Process input**: AI writes the title and description (Thai, English, Chinese) from the form answers and photos, tidies the photos, suggests a price and builds **Agoda copy cards**. Checks run on every draft.
3. **Approve**: the owner approves a Thai preview that shows how the Agoda listing will look. Request change = tap what is wrong + short text (max 2 rounds).
4. **Connections page**: the owner taps **Add connection** on the Agoda card; the AI coach guides the sign-up.
5. **Live**: Agoda checks the listing (up to 72 h); the live card in LINE carries the Agoda link.
6. **End.** Agoda handles bookings and payouts. Changes go through the rich menu.

**Connections page (decided 24 Oct; Agoda only):**
- Sits after approval; stays open for changes and, later, more platforms.
- Agoda card: why it matters, status (not connected / connecting step x of y / waiting for Agoda check / live / needs attention), time and documents needed, main button (Add connection / Continue / See listing / Fix).
- **Guided connect only.** Agoda has no open listing API for a small agency; the owner's own sign-up creates the listing from copy cards.
- **AI connection coach**: readiness check, then a one-tap link to Agoda sign-up, then **copy cards** (every field in Agoda's order, each with a Copy button), then **screenshot help** (owner sends a screenshot, AI explains in Thai what to tap and which card to paste; no voice), then owner-only steps (SMS code, terms; AI never asks for codes or passwords), then the owner pastes the listing link and a live-link checker confirms, then reminders while Agoda checks.
- Stuck: **Ask my helper** sends a link so family can open the same session; optional paid human help.

**Platform decision (24 Oct, 01:15):**

| Channel | Decision | Reason |
| --- | --- | --- |
| Agoda | **Keep (only platform)** | Free self sign-up, the app most Thai travellers use, handles bookings and payouts, no API needed |
| Booking.com, Trip.com | Later | Same guided work again; double bookings without a channel manager |
| Google Maps (Business Profile) | Later | Verification can take days; API needs approval; no bookings |
| Owner's Facebook page / TikTok (one-tap) | Drop | Meta app review and TikTok audit take weeks |
| Posts on our own Facebook / TikTok | Drop | No audience yet; daily content work |
| Our own directory site | Drop | Build and hosting, no traffic, possible ETDA notification |

**Decided (final):**
- **B2B agency model.** We advertise and list. We **take no bookings, payments or commission**.
- **Pricing tiers are agreed** (section 5); Plus and the extra-platform add-on need review now that there is one platform.
- **Online only, AI-assisted.** Owner owns the Agoda account; we never hold passwords or accounts.
- **Agoda only; no voice input; homestays first.**

**Users:** homestay owners. Helpers (family, village youth) can join a connection session. Experience hosts/guides later.
**Payers:** owners; village committees (community bundle); sponsors (province, DASTA, OTOP programme, corporate CSR, TCEB).

---

## 3. Market (summary)

- **Demand:** 202M domestic trips (THB 1.16T) in 2025; 32.97M foreign arrivals (THB 1.53T). Jan-Aug 2026 foreign arrivals 20.9M (-3.1% YoY). Agoda: searches for secondary cities growing faster than hubs.
- **Policy tailwind:** TAT promotes "value over volume" and the **55 secondary provinces**. The revamped Amazing Thailand app (AI planner "Nong TATAi") is framed as a "Platform Economy" that spreads income to communities.
- **White space:** no one combines **deep rural supply** with **mass reach**. The big channels can only show what is already digitised; offline villages stay invisible.
- **Stance:** be the **supply-side partner the big channels lack**, not another consumer app.

## 4. Competitors (threat level)

| Competitor | Threat | Note |
| --- | --- | --- |
| Self-listing on OTAs (free) | High | Owner does it alone, if able. Now the most direct alternative, since we list on Agoda only |
| Relatives / local youth | High | The real competitor: free, trusted (and a helper channel for us) |
| Airbnb co-hosts / managers | Medium | Take 10-30% of bookings |
| Klook / Agoda sales teams | Medium | Selective; potential partners |
| Thai social media agencies | Low | THB 10,500-35,000/mo; AIS SME from 9,000/mo per platform |
| Channel managers | Low | From USD 40/mo; need tech skill. Not needed with one platform |
| CBT enterprises (Local Alike, Find Folk, CBT-I) | Low | Deep but small; potential partners |
| Government training | Low | One-off; potential customer/sponsor |

**Gap we fill:** nobody helps rural owners get onto Agoda, in Thai, for under THB 1,000/month.

---

## 5. Business model and pricing (AGREED)

| Plan | Setup (THB) | Monthly (THB) | Notes |
| --- | --- | --- | --- |
| Pay after first booking | 0 | Plan price, starting from first booking | Entry offer; 6-month minimum |
| Starter | 1,500 | 290 | |
| **Standard (default)** | 2,500 | 490 | |
| Plus | 2,500 | 990 | Was "includes channel-manager sync". **Needs a new meaning with one platform, or pause** |
| Annual prepay | | 10 months' price for 12 | |
| Community bundle | 15,000 per village (10+ owners) | 390 per owner | |
| Sponsor package | 8,000 per owner | | Setup + 6 months Standard + quarterly report |
| Add-ons | | | Photo shoot 1,500 (decision needed under online-only); video reel 990; extra platform 150/mo (paused until a second platform); optional paid human help for stuck connections (price TBD) |

**Value logic:** Standard (THB 490/mo) costs an owner less than **one extra booked night a month** on Agoda (THB 800 room, 15% commission).

**Unit economics (modelled, not measured):**
- Contribution per subscriber/month: Starter 180, Standard 310, Plus 579, Community 240; blended ~325.
- Break-even: ~1,170 subscribers (blended), ~630 with 50 sponsored onboardings/month.
- Pilot year net: about -4.6M (self-paid, 25 new/month) vs -1.4M (sponsored, 50 new/month).
- Modelled with staff-led field onboarding and several channels; AI-led setup on one platform should cut onboarding and upkeep cost sharply but adds AI usage cost. **Re-estimate.**

**Business logic, all must hold:** value beats price / owners stay (churn < 5%/mo) / acquisition is cheap / **owners finish the Agoda sign-up with the AI coach** / each owner pays off.

---

## 6. Feasibility (summary)

- **Verdict:** conditionally feasible. Real-world plan: 6-month online pilot targeting one secondary province or sponsor area (~150 subscribers), ideally sponsor-funded.
- **Technical:** LINE OA + LIFF pages; AI for drafts, translation, photos, price hint, Agoda copy cards, screenshot reading and the connection coach; staff console for flagged cases; live-link checker. **No speech-to-text, no Meta/TikTok/Google APIs, no directory site, no channel manager, no booking engine.**
- **Legal (to confirm with a lawyer):** as an advertiser our duties are lighter. The supplier holds the tourism licence; we promote only licensed operators and show the licence number. Homestays up to 8 rooms / 30 guests are exempt from a hotel licence. ID/bank photos and screenshots need consent and short retention (PDPA).
- **Biggest risks:** churn if bookings are few; **owners giving up mid-sign-up**; Agoda changing its sign-up screens; **dependence on a single platform**; owners unable to use the Agoda app after handover.

---

## 7. IMMEDIATE PRIORITY: Competition MVP (demo 25 Oct)

The competition overrides the earlier "build nothing until the test passes" rule: **we must build a working prototype now.** The build scope is in docs/demo-mvp-scope-local.md.

**What the demo needs to show:**
1. Owner input: intake form with rooms, photos and tap-to-answer questions (styled like LINE LIFF). **No voice.**
2. AI processing: listing title and description in Thai + English + Chinese, photo tidy-up, suggested price, Agoda copy cards.
3. Check step in the console: approve / edit, send preview.
4. Owner approval: Thai preview of the Agoda listing + Approve in LINE.
5. **Agoda connection with the AI coach (strongest moment):** tap Add connection on Agoda, send a screenshot of an English Agoda sign-up screen, get a Thai answer and the matching copy card; then show the live card. The actual Agoda sign-up is mocked with real Agoda screenshots.
6. Business slide: pricing tiers, value logic, break-even, sponsor model.

**Still to decide:** team roles, sample owner/village, real LINE OA on the day or screenshots.

---

## 8. Real-world validation plan (after the competition, online)

- **1-day remote test:** recruit 8-10 homestay owners through village LINE groups, sponsor or CBT contacts and Facebook groups; they do intake and the Agoda sign-up with the AI coach, with no staff help; staff only watch and log.
- **Pass if:** 5+ agree, 3+ pay a deposit (THB 100-290), <= 2 corrections per draft, < 30% blocked by missing ID/bank/phone, **3+ owners finish the Agoda sign-up with the AI coach alone**.
- **Measure:** Agoda sign-up completion rate, median owner minutes, the step where owners give up, how often Ask my helper is used.
- **Pricing test:** same sheet to every owner (Standard / Starter / pay after first booking); record choice and deposit.
- **Then:** 30-day watch for enquiries and bookings.
- **Pilot gates:** M1-2 sponsor LOI + 10 test listings live; M3-4 onboarding cost < THB 4,500 and 30+ paying owners; M6 scale if churn < 5%/mo and a sponsor renews.

---

## 9. Open questions

**Competition (urgent)**
- Competition name, judging criteria, demo length and format?
- Team roles for the 3 members?

**Product**
- Keep human review of every draft, or automated checks with review only for flagged cases?
- Booking alerts: relay Agoda alerts into LINE in Thai, or teach owners the Agoda app?
- Languages beyond Thai and English: Chinese? Others?
- Price of optional paid human help for stuck sign-ups?
- Which platform comes second, and when?

**Business**
- Will owners really pay THB 490/month, or does Starter dominate? Does AI-led setup still justify the setup fee?
- Plus tier and extra-platform add-on with one platform: redefine or pause?
- Which province / DASTA area signs a sponsor LOI, and at what fee per village?
- Photo shoot add-on under online-only: partner photographer or drop it?
- Lawyer: confirm pure advertising needs no tourism licence.

---

## 10. Rules for future sessions
- Treat the B2B agency model (no bookings), the pricing tiers, **online-only operation**, the **Connections page + AI coach** setup model, **Agoda as the only platform** and **no voice input** as **final** unless the user changes them.
- Everything else (pilot plan, numbers) is modelled/proposed, not measured.
