# Ankita & Shyam — Wedding Invitation Site

Static, single-page wedding invitation. Built with plain HTML, CSS and vanilla JS so it can be hosted on GitHub Pages with no build step.

Live URL (once Pages is enabled):
**https://ramstar3000.github.io/ankita_wedding_invite/**

## Editing the content

All copy, dates, events, food options, accommodation and gift register live in **`js/config.js`**. Edit that file, commit, push — Pages will redeploy automatically.

> The repo is **public**, so only put information in `config.js` you're happy for anyone to see.

## Wiring the RSVP backend → Google Sheet

Out of the box, when a guest submits an RSVP the site opens their email client with the answers pre-filled (`mailto:` to the address in `config.js`). To collect replies centrally in a Google Sheet instead:

1. Create a new Google Sheet (any name, e.g. "Ankita & Shyam RSVPs").
2. In the Sheet: **Extensions → Apps Script**. A new editor tab opens.
3. Delete the default `Code.gs` contents and paste in the contents of **`apps_script.gs`** from this repo.
4. Save, then **Deploy → New deployment**:
   - Gear icon → **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**  ← required
   - Click **Deploy** and authorise (click "Advanced → Go to … (unsafe)" if prompted — the script is yours, that warning is just because it's unverified).
5. Copy the **Web app URL** (ends in `/exec`).
6. Paste it into `js/config.js`:
   ```js
   rsvp: {
     endpoint: "https://script.google.com/macros/s/XXXXXXX/exec",
     mailtoAddress: "you@example.com"
   }
   ```
7. Commit + push. The site will POST JSON RSVPs to the script, which appends a row to the Sheet. If the endpoint ever fails the site silently falls back to `mailto:` so submissions still get through.

The endpoint URL is not a secret — safe to keep in this public repo.

**Re-deploying after script edits:** Deploy → Manage deployments → pencil icon → Version: **New version** → Deploy. The `/exec` URL stays the same.

## Deploying to GitHub Pages

1. Push to the `main` branch of `ramstar3000/ankita_wedding_invite`.
2. Repo Settings → **Pages** → Source: **Deploy from a branch**, Branch: **main**, Folder: **/ (root)**.
3. Save. After ~1 minute the site is live at the URL above.

The `.nojekyll` file in the repo root tells Pages to serve files as-is and skip Jekyll processing.

## Local preview

Just open `index.html` in a browser — no server needed. If `mailto:` testing isn't useful, leave the endpoint blank and watch the console: `SUBMIT.buildPayload()` shows exactly what would be sent.

## Project layout

```
index.html          One document, seven <section data-step="…"> panels
styles.css          Mobile-first styling
js/config.js        ← Edit this for all content
js/state.js         RSVP state object + sessionStorage persistence
js/router.js        Hash-based step navigation with prerequisite guards
js/submit.js        Endpoint POST with mailto: fallback
js/main.js          DOM wiring per step
.nojekyll           Disables Jekyll on GitHub Pages
```

## Step flow

```
cover  →  rsvp  ┬─ yes ─→  scope  ┬─ whole ─→  food  →  accommodation  →  thanks
                │                 └─ part ──→  events →  food → …
                └─ no ──→  gift
```

The gift register is also linked from the cover page.
