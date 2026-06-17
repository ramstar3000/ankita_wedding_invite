# Custom domain plan

Step-by-step for when (if) you buy a domain and want to point it at this GitHub Pages site instead of the default `ramstar3000.github.io/ankita_wedding_invite/`.

## TL;DR

1. Buy domain at a registrar.
2. Tell Claude the domain → it pushes a `CNAME` file to the repo.
3. You add a handful of DNS records at the registrar.
4. In GitHub repo Settings → Pages, set the Custom domain and tick Enforce HTTPS.

Live URL goes from `ramstar3000.github.io/ankita_wedding_invite/` to `https://<yourdomain>/`.

## Naming options

A few naming styles to consider before buying:

| Style | Example | Notes |
|---|---|---|
| Names + year | `ankitashyam2026.com` | Clear, evergreen-looking |
| Names only | `ankitashyam.wedding` | Short, but `.wedding` TLD is pricier |
| Date-based | `nov2026.love` | Hard to remember |
| Hyphenated | `ankita-and-shyam.com` | Easier to read, harder to type |

`.com` is still the most forgiving on WhatsApp link parsing. `.wedding` and `.love` look nice but cost more and some message previews garble them.

## Pricing reality

Registrar pricing is **competitive on `.com` and similar mainstream TLDs, very variable on novelty TLDs**.

| Registrar | `.com` ~ first year | `.com` renewal | Vibe |
|---|---|---|---|
| Cloudflare Registrar | £8–9 | £8–9 (at-cost) | No upsells, 2FA default. **Recommended.** |
| Porkbun | £8 (often promo) | £10–11 | Clean UI, decent support |
| Namecheap | £6–8 first year | £12–13 | Lots of upsells but easy to skip |
| GoDaddy | £1–10 first year (heavy promos) | £18–25 | Aggressive upsells, expensive renewals |
| Squarespace Domains (ex-Google) | £12 | £12 | OK if you already use Squarespace |

For novelty TLDs (`.wedding`, `.love`, `.family`, `.party`):

- `.wedding` is typically £25–40/yr depending on registrar.
- `.love` is typically £30–50/yr.
- `.family` is typically £20–30/yr.

These prices are roughly the **same across registrars** because the underlying registry charges them all about the same — registrars can only undercut on `.com`/`.net`/etc. where competition is fiercer.

## Steps to plug it in

### 1. Buy the domain (you)

At your chosen registrar. Skip every upsell (privacy is usually free now under GDPR; email forwarding can wait; SSL is free via GitHub; "premium DNS" not needed). Pick the domain only.

### 2. Add a CNAME file (Claude)

When you give me the domain, I run:

```bash
echo "<yourdomain>" > CNAME
git add CNAME && git commit -m "Add CNAME for custom domain" && git push
```

That tells GitHub Pages to accept traffic for that hostname.

### 3. Set DNS records (you, at the registrar)

Pick **one** of these layouts.

#### Option A — apex + www (most natural)

Use this if the domain you bought is bare like `ankitashyam.com` and you want both `ankitashyam.com` AND `www.ankitashyam.com` to work.

Add four `A` records on the apex (`@`):

```
@   A   185.199.108.153
@   A   185.199.109.153
@   A   185.199.110.153
@   A   185.199.111.153
```

Plus one CNAME for `www`:

```
www   CNAME   ramstar3000.github.io.
```

GitHub Pages auto-redirects whichever the user didn't type to the canonical one set in repo Settings.

If your registrar supports `AAAA` records (IPv6), also add:

```
@   AAAA   2606:50c0:8000::153
@   AAAA   2606:50c0:8001::153
@   AAAA   2606:50c0:8002::153
@   AAAA   2606:50c0:8003::153
```

Not required, but nicer for modern browsers.

#### Option B — www only (simpler if your DNS host won't do apex A records)

Set the CNAME for the `CNAME` file and the registrar record to `www.<yourdomain>` instead of the bare name. Just one record:

```
www   CNAME   ramstar3000.github.io.
```

Then anyone typing the bare domain will need to type `www.` — usually that's fine because most people click links from WhatsApp anyway.

### 4. Tell GitHub to use it (you)

- Go to repo Settings → Pages.
- Under **Custom domain**, type the same domain you set in the CNAME file.
- Click Save. GitHub does a DNS check (will fail until DNS propagates — that's fine).
- Wait 5–30 minutes for DNS to propagate (faster on Cloudflare, slower elsewhere).
- Once GitHub shows a green check, the **Enforce HTTPS** checkbox unblocks. Tick it.

You're done. The site is now at `https://<yourdomain>/`.

## Gotchas

- **Cloudflare DNS proxying breaks the cert.** If you use Cloudflare as your DNS host (great choice), set each record to **DNS-only** (grey cloud, not orange). Orange cloud (proxied) puts Cloudflare's edge between GitHub and the visitor — GitHub can't then provision a Let's Encrypt cert, and you get an SSL warning.
- **HTTPS provisioning takes time.** First time after DNS propagates, GitHub takes up to an hour to issue the cert. If the Enforce HTTPS box is greyed out, just wait — don't toggle it on and off.
- **WhatsApp link preview cache.** Once a link is previewed on WhatsApp it's cached for ~24h. If you switch domains after sharing the old URL with someone, they may still see the old preview. Re-share to force a refresh.
- **WHOIS privacy.** Modern registrars default to redacting WHOIS so your name/email/address don't appear in public records. Worth checking once it's bought.

## Reverting

If you ever want to go back to the github.io URL:

1. Delete the `CNAME` file from the repo and push.
2. In GitHub Pages settings, clear the Custom domain field.
3. At the registrar, remove the records (or leave them; they'll be harmless).

The github.io URL keeps working in parallel the whole time anyway.

## What I (Claude) handle vs what you handle

| Step | Who |
|---|---|
| Pick + buy the domain | You |
| Add `CNAME` file to repo + push | Me, once you tell me the name |
| DNS records at registrar | You (I can't log in there) |
| GitHub repo Settings → Pages → Custom domain | You (behind your GitHub login) |
| Verifying it works | Both — I can fetch the new URL once it resolves |

## My recommendation if you do this

- Buy `ankitashyam.com` (or similar) from **Cloudflare Registrar** — no upsells, cheapest renewal, DNS in the same place.
- Use the **apex + www** DNS layout.
- Set canonical to `https://ankitashyam.com` in repo Pages settings.
- Tick Enforce HTTPS.

Total cost: ~£9/yr, forever (no renewal markup), single dashboard for everything.
