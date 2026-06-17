# Ankita & Shyam — Wedding Invitation Site

Static, single-page wedding invitation. Built with plain HTML, CSS and vanilla JS so it can be hosted on GitHub Pages with no build step.

Live URL (once Pages is enabled):
**https://ramstar3000.github.io/ankita_wedding_invite/**

## Editing the content

All copy, dates, events, food options, accommodation and gift register live in **`js/config.js`**. Edit that file, commit, push — Pages will redeploy automatically.

> The repo is **public**, so only put information in `config.js` you're happy for anyone to see.

## Wiring the RSVP backend (optional)

Out of the box, when a guest submits an RSVP the site opens their email client with the answers pre-filled (`mailto:` to the address in `config.js`). To collect replies centrally instead:

1. Pick a no-code form endpoint. Both work fine:
   - [Formspree](https://formspree.io) — free tier, dashboard + email notifications.
   - [Google Apps Script web app](https://developers.google.com/apps-script/guides/web) writing to a Google Sheet — also free.
2. Paste the endpoint URL into `js/config.js`:
   ```js
   rsvp: {
     endpoint: "https://formspree.io/f/XXXXXXXX",
     mailtoAddress: "you@example.com"
   }
   ```
3. Commit + push. The site will POST JSON RSVPs to the endpoint and silently fall back to `mailto:` if the endpoint ever fails.

The URL is not a secret — it's safe in a public repo.

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
