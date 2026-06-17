# Things you need to provide

A single place to track what's blocking the site from being "ready to share". Tick items off as you provide them and I'll wire them in.

---

## 1. A&S logo file

- **File:** `assets/logo.svg` (or `.png` — just update the path in `js/config.js` under `logoSrc`)
- **Where it shows up:** Small brand band at the top of every page (cover, RSVP, event pages, thanks, etc.). Acts as a "back home" link.
- **Recommended size:** square or wide rectangle, at least 200 × 100 px. Transparent background preferred.
- **Current state:** The site looks for `./assets/logo.svg`. If the file 404s, the brand band auto-hides — so nothing breaks if you push first and add the file later.

## 2. Invitation card PDF

- **File:** `assets/invitation.pdf`
- **Where it shows up:** "View your invitation" button on the cover page. Opens the PDF in a new tab.
- **Then:** I'll set `invitationPdf: "./assets/invitation.pdf"` in `js/config.js` (currently `""` so the button is hidden).
- **Note:** PDFs render natively in Chrome/Safari/Firefox; on iOS Safari it'll download — that's fine.

## 3. Map QR code SVG

- **File:** `assets/map-qr.svg`
- **What it points at:** the venue Google Maps URL already in `js/config.js` → `venue.mapUrl`.
- **How to generate:** one-shot CLI on any machine with `qrencode` installed:
  ```
  qrencode -t svg -o assets/map-qr.svg "https://www.google.com/maps/search/?api=1&query=Sambrama+by+Swanlines+Kaggalipura+Bengaluru"
  ```
  Or use any free online QR generator (qr-code-generator.com, qrcode-monkey.com — SVG output, no logo, plain black/white).
- **Where it shows up:** Below the RSVP buttons on the cover.
- **Current state:** the cover code looks for `./assets/map-qr.svg`; if missing, the whole QR block auto-hides.
- **Alternative:** if you'd rather I switch to a runtime JS QR generator (no file needed), say the word — adds ~5 kb of vendored JS.

## 4. Gift register details

Currently `js/config.js` → `gifts` has `TBC` placeholders. When you have real numbers, replace these:

- **`gifts.registryLinks`** — actual Amazon UK and Amazon IN wishlist URLs (or remove either if not using one). Label can be whatever you want shown on the button.
- **`gifts.bankDetails`** — replace the `TBC` lines with real values for any of:
  - UPI ID
  - India bank: account name, account number, IFSC
  - UK bank: account name, sort code, account number
- **Leave blank** any rows you don't want to share publicly — the block accepts free-form text, so just delete unused lines.
- **Public-repo warning:** the repo is public. Anything you put here is world-readable. If you'd rather not publish bank details, we can move that block behind a password gate similar to `/#results` — say the word.

## 5. RSVP confirmation email (Apps Script change)

You asked for a flow where the guest gets an email summary of their RSVP so they don't need to revisit the link. **Recommended approach:** add `MailApp.sendEmail` to `apps_script.gs`.

**What I need from you to wire this up:**

- Confirmation that you're OK with the email **sending from your personal Gmail address** (the Gmail account the Apps Script is bound to). That address will appear in the From header.
- Confirmation that the daily quota of **100 emails/day** is fine — comfortably above any realistic wedding RSVP rate.
- Whether you want a **BCC of yourself** on every guest email, so you have a running thread of confirmations in your inbox (cleaner audit than the Sheet).
- Optional: a small "signature" line you'd like at the bottom of the auto-email, e.g.
  > — Ankita & Shyam · +91 …
- Optional: a custom subject line. Default I'll use is: `Your RSVP — Ankita & Shyam's wedding`.

Once you confirm: I add the function, you redeploy Apps Script as a New Version (the existing endpoint URL stays the same), click through the one-time MailApp authorisation prompt, and we test with one dummy RSVP. Maybe 5 minutes end to end.

## 6. (Optional) Cover photo / hero image

If you want a soft background or hero image on the cover, drop a file at `assets/cover.jpg` and we'll wire it. Otherwise the current text-on-cream cover stays.

## 7. (Optional) Favicon + WhatsApp / OG share preview

When someone pastes the link into WhatsApp, by default it shows a plain "github.io" preview. To replace this:

- `assets/favicon.png` (32×32 or 64×64, square)
- `assets/og-preview.jpg` (1200×630 ideal, ~80–200 kb) — what shows in the link unfurl
- Caption line — e.g. "Ankita & Shyam · Bengaluru · 19–20 Nov 2026"

I add a few `<meta>` tags and that's it.

## 8. (Optional) RSVP deadline

If you want a "please reply by **X**" message + a countdown on the cover, give me a date and I'll wire it in `config.js`.

## 9. Existing security item

You shared the results-viewer password (`password123`) in chat — recommend rotating it via Apps Script → Project Settings → Script Properties → `RESULTS_PASSWORD` to something less guessable. No code change needed; the script reads it live.

---

## What's already done (so you know what NOT to send)

- ✅ Real venue + map URL (Sambrama by Swanlines)
- ✅ Confirmed dates (19–20 Nov 2026)
- ✅ All three event descriptions, times, meals, dress codes (drafted from your spec — easy to tweak in `js/config.js` → `events`)
- ✅ Travel & arrival info page
- ✅ RSVP backend (Google Sheets via Apps Script — live URL already in `config.js`)
- ✅ Password-protected `/#results` dashboard with pie charts and per-event aggregation

## How to hand things off

Just message me with any of:
- File paths (if you put files in `assets/` yourself)
- Pasted URLs / bank details / phone numbers
- Confirmations on the email-flow questions (item 5)

I'll patch and push. The slow ones (logo, invitation PDF, QR) you can drop in any time — the site is already coded to use them the moment they exist.
