// Wires the DOM to state + router. Static markup lives in index.html;
// anything driven by config.js is built here at runtime.

(function () {
  const cfg = window.WEDDING_CONFIG;
  const { state, set } = window.RSVP;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

  // ---- Brand band (logo across pages) ------------------------------------

  function renderBrand() {
    const band = $("#brand-band");
    const img = $("#brand-logo");
    if (cfg.logoSrc) {
      img.src = cfg.logoSrc;
      band.hidden = false;
      // If the logo file is missing the <img> 404s — hide the band so we don't
      // show a broken-image icon.
      img.addEventListener("error", () => { band.hidden = true; }, { once: true });
    } else {
      band.hidden = true;
    }
  }

  // ---- Cover -------------------------------------------------------------

  function renderCover() {
    $("#cover-name1").textContent = cfg.couple.name1;
    $("#cover-name2").textContent = cfg.couple.name2;
    $("#cover-date").textContent = cfg.date;

    const invitationLink = $("#cover-invitation-link");
    if (cfg.invitationPdf) {
      invitationLink.href = cfg.invitationPdf;
      invitationLink.hidden = false;
    } else {
      invitationLink.hidden = true;
    }

    const qrBlock = $("#cover-map-qr-block");
    const qrImg = $("#cover-map-qr");
    const mapLink = $("#cover-map-link");
    if (cfg.mapQrSrc) {
      qrImg.src = cfg.mapQrSrc;
      qrBlock.hidden = false;
      qrImg.addEventListener("error", () => { qrBlock.hidden = true; }, { once: true });
    } else {
      qrBlock.hidden = true;
    }
    if (cfg.venue && cfg.venue.mapUrl) {
      mapLink.href = cfg.venue.mapUrl;
    }
  }

  // ---- RSVP step ---------------------------------------------------------

  function renderPartyNameInputs() {
    const wrap = $("#rsvp-party-names");
    const list = $("#rsvp-party-names-list");
    const extraCount = Math.max(0, (state.partySize || 1) - 1);

    if (extraCount === 0) {
      wrap.hidden = true;
      list.innerHTML = "";
      return;
    }

    wrap.hidden = false;
    list.innerHTML = "";
    for (let i = 0; i < extraCount; i++) {
      const field = document.createElement("label");
      field.className = "field";
      field.innerHTML = `
        <span>Guest ${i + 2}</span>
        <input type="text" class="party-name-input" data-index="${i}"
               value="${(state.partyNames[i] || "").replace(/"/g, "&quot;")}"
               placeholder="Name" />
      `;
      const input = field.querySelector("input");
      input.addEventListener("input", () => {
        const next = state.partyNames.slice();
        while (next.length < extraCount) next.push("");
        next[i] = input.value.trim();
        next.length = extraCount;
        set({ partyNames: next });
      });
      list.appendChild(field);
    }
  }

  function renderSideButtons() {
    $$("#side-bride, #side-groom").forEach((btn) => {
      const isActive = state.side === btn.dataset.side;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  function renderRsvp() {
    const nameInput = $("#rsvp-name");
    nameInput.value = state.name || "";
    nameInput.oninput = () => set({ name: nameInput.value.trim() });

    const sizeInput = $("#rsvp-party-size");
    sizeInput.value = state.partySize || 1;
    sizeInput.oninput = () => {
      const n = Math.max(1, Math.min(20, parseInt(sizeInput.value, 10) || 1));
      const extra = n - 1;
      const next = state.partyNames.slice(0, extra);
      while (next.length < extra) next.push("");
      set({ partySize: n, partyNames: next });
      renderPartyNameInputs();
    };

    renderPartyNameInputs();
    renderSideButtons();
  }

  // ---- Event step (dynamic, paginated) -----------------------------------

  function currentEvent() {
    return (cfg.events || [])[state.currentEventIndex] || null;
  }

  function renderEventStep() {
    const ev = currentEvent();
    if (!ev) return; // router guard will move us to notes
    const total = (cfg.events || []).length;

    $("#event-step-pos").textContent = `Event ${state.currentEventIndex + 1} of ${total}`;
    $("#event-name").textContent = ev.name;
    $("#event-description").textContent = ev.description || "";
    $("#event-when").textContent = [ev.date, ev.time].filter(Boolean).join(" · ");
    $("#event-meals").textContent = ev.meals || "";
    $("#event-dress").textContent = ev.dressCode || "";

    const partySize = Math.max(1, state.partySize || 1);
    const max = Math.max(20, partySize);
    const stored = state.eventCounts[ev.id];
    const countInput = $("#event-count");
    countInput.max = String(max);
    countInput.value = stored != null ? stored : 0;

    $("#event-count-hint").textContent = `Up to ${partySize} (your party size)`;

    countInput.oninput = () => {
      const raw = parseInt(countInput.value, 10);
      const n = isNaN(raw) ? 0 : Math.max(0, Math.min(max, raw));
      const next = { ...state.eventCounts, [ev.id]: n };
      set({ eventCounts: next });
    };

    const backBtn = $("#event-back");
    backBtn.textContent = state.currentEventIndex === 0 ? "Back to RSVP" : "Previous event";

    const nextBtn = $("#event-next");
    nextBtn.textContent = state.currentEventIndex === total - 1
      ? "Continue to final step"
      : "Next event";
  }

  // ---- Notes step --------------------------------------------------------

  function renderNotesStep() {
    const a = $("#notes-allergies");
    a.value = state.allergies || "";
    a.oninput = () => set({ allergies: a.value });

    const e = $("#notes-email");
    e.value = state.email || "";
    e.oninput = () => set({ email: e.value.trim() });

    const p = $("#notes-phone");
    p.value = state.phone || "";
    p.oninput = () => set({ phone: p.value.trim() });
  }

  // ---- Travel ------------------------------------------------------------

  function renderTravel() {
    const t = cfg.travel || {};
    $("#travel-airport-name").textContent = (t.airport && t.airport.name) || "";
    $("#travel-airport-note").textContent = (t.airport && t.airport.note) || "";
    $("#travel-arrival").textContent = (t.arrival && t.arrival.suggested) || "";
    $("#travel-departure").textContent = (t.arrival && t.arrival.departure) || "";

    const dl = $("#travel-transport");
    dl.innerHTML = "";
    (t.transport || []).forEach((row) => {
      const dt = document.createElement("dt");
      dt.textContent = row.label;
      const dd = document.createElement("dd");
      dd.textContent = row.description;
      dl.appendChild(dt);
      dl.appendChild(dd);
    });

    const visaBlock = $("#travel-visa-block");
    if (t.visa && t.visa.body) {
      $("#travel-visa-heading").textContent = t.visa.heading || "Visa";
      $("#travel-visa-body").textContent = t.visa.body;
      visaBlock.hidden = false;
    } else {
      visaBlock.hidden = true;
    }

    const notes = $("#travel-notes");
    if (t.notes) { notes.textContent = t.notes; notes.hidden = false; }
    else { notes.hidden = true; }
  }

  // ---- Gift register -----------------------------------------------------

  function renderGift() {
    $("#gift-message").textContent = cfg.gifts.message || "";

    const linksWrap = $("#gift-links");
    linksWrap.innerHTML = "";
    (cfg.gifts.registryLinks || []).forEach((link) => {
      const a = document.createElement("a");
      a.href = link.url;
      a.target = "_blank";
      a.rel = "noopener";
      a.className = "btn btn-outline";
      a.textContent = link.label;
      linksWrap.appendChild(a);
    });

    const bank = $("#gift-bank");
    if (cfg.gifts.bankDetails) {
      bank.textContent = cfg.gifts.bankDetails;
      bank.hidden = false;
    } else {
      bank.hidden = true;
    }
  }

  // ---- Thanks ------------------------------------------------------------

  function renderThanks() {
    const name = state.name ? `, ${state.name}` : "";
    $("#thanks-line").textContent = state.attending
      ? `Thank you${name}! We can't wait to celebrate with you.`
      : `Thank you${name} for letting us know.`;

    const summary = $("#thanks-summary");
    const list = $("#thanks-summary-list");
    const emailNote = $("#thanks-email-note");

    if (!state.attending) {
      summary.hidden = true;
      emailNote.hidden = true;
      return;
    }

    list.innerHTML = "";

    function row(label, value) {
      const dt = document.createElement("dt");
      dt.textContent = label;
      const dd = document.createElement("dd");
      dd.textContent = value;
      list.appendChild(dt);
      list.appendChild(dd);
    }

    const sideLabel = state.side === "bride" ? "Bride's side"
                    : state.side === "groom" ? "Groom's side"
                    : "—";
    row("Guest of", sideLabel);
    row("Party size", String(state.partySize || 1));
    if (state.partyNames && state.partyNames.filter(Boolean).length) {
      row("Names", [state.name].concat(state.partyNames.filter(Boolean)).join(", "));
    }

    const eventNameById = Object.fromEntries((cfg.events || []).map((e) => [e.id, e.name]));
    (cfg.events || []).forEach((ev) => {
      const n = state.eventCounts[ev.id] || 0;
      row(eventNameById[ev.id] || ev.id, n === 0 ? "Not attending" : `${n} attending`);
    });

    if (state.allergies) row("Allergies / food notes", state.allergies);

    summary.hidden = false;

    if (state.email) {
      emailNote.textContent = `A copy has been recorded against ${state.email}.`;
      emailNote.hidden = false;
    } else {
      emailNote.hidden = true;
    }
  }

  // ---- Results viewer (password-gated) -----------------------------------

  function showResultsAuth(errorMsg) {
    $("#results-auth").hidden = false;
    $("#results-data").hidden = true;
    const err = $("#results-error");
    if (errorMsg) {
      err.textContent = errorMsg;
      err.hidden = false;
    } else {
      err.hidden = true;
    }
  }

  // ---- Results aggregation + render --------------------------------------

  function parseEventCounts(str) {
    if (!str) return {};
    try {
      const obj = JSON.parse(String(str));
      return (obj && typeof obj === "object") ? obj : {};
    } catch (e) {
      return {};
    }
  }

  // Legacy fallback for rows submitted by the old (pre-restructure) flow.
  // Old `attendingEvents` is a comma-separated list of event NAMES; assume each
  // such name pulls in the full partySize for headcount purposes.
  function legacyEventNames(str) {
    if (!str) return [];
    return String(str).split(",").map((s) => s.trim()).filter(Boolean);
  }

  function aggregate(headers, rows) {
    const idx = {};
    headers.forEach((h, i) => { idx[String(h)] = i; });
    const get = (row, key) => (key in idx ? row[idx[key]] : "");

    const records = rows.map((row) => ({
      submittedAt: get(row, "submittedAt"),
      name: String(get(row, "name") || ""),
      attending: String(get(row, "attending") || ""),
      side: String(get(row, "side") || ""),
      partySize: Math.max(1, Number(get(row, "partySize")) || 1),
      eventCounts: parseEventCounts(get(row, "eventCounts")),
      legacyEvents: legacyEventNames(get(row, "attendingEvents")),
      allergies: String(get(row, "allergies") || get(row, "notes") || ""),
      email: String(get(row, "email") || ""),
      phone: String(get(row, "phone") || "")
    }));

    const yes = records.filter((r) => r.attending === "Yes");
    const no = records.filter((r) => r.attending === "No");

    const totals = {
      responses: records.length,
      yes: yes.length,
      no: no.length,
      heads: yes.reduce((s, r) => s + r.partySize, 0),
      brideSide: records.filter((r) => /^Bride/.test(r.side)).length,
      groomSide: records.filter((r) => /^Groom/.test(r.side)).length
    };

    // Per-event headcount, summed across rows. Mix old + new schemas.
    const eventCounts = {};
    const eventNameById = Object.fromEntries((cfg.events || []).map((e) => [e.id, e.name]));
    yes.forEach((r) => {
      Object.entries(r.eventCounts).forEach(([id, n]) => {
        const name = eventNameById[id] || id;
        const num = Math.max(0, Number(n) || 0);
        if (num > 0) eventCounts[name] = (eventCounts[name] || 0) + num;
      });
      // Legacy rows: no per-event count → assume full party size for each named event.
      if (Object.keys(r.eventCounts).length === 0 && r.legacyEvents.length) {
        r.legacyEvents.forEach((name) => {
          eventCounts[name] = (eventCounts[name] || 0) + r.partySize;
        });
      }
    });

    const allergyNotes = records
      .filter((r) => r.allergies && r.allergies.trim())
      .map((r) => ({ name: r.name || "(unnamed)", text: r.allergies.trim() }));

    return { records, totals, eventCounts, allergyNotes };
  }

  // ---- Pie chart helpers --------------------------------------------------

  const SVG_NS = "http://www.w3.org/2000/svg";

  function pieSlicePath(cx, cy, r, startAngle, endAngle) {
    if (endAngle - startAngle >= Math.PI * 2 - 1e-6) {
      return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.001} ${cy - r} Z`;
    }
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const large = endAngle - startAngle > Math.PI ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
  }

  function makePie(segments, size) {
    const total = segments.reduce((s, x) => s + (x.value > 0 ? x.value : 0), 0);
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
    svg.setAttribute("width", size);
    svg.setAttribute("height", size);
    svg.setAttribute("class", "pie");

    if (total === 0) {
      const c = document.createElementNS(SVG_NS, "circle");
      c.setAttribute("cx", size / 2);
      c.setAttribute("cy", size / 2);
      c.setAttribute("r", size / 2 - 1);
      c.setAttribute("fill", "#f4e6d5");
      svg.appendChild(c);
      return svg;
    }

    const cx = size / 2, cy = size / 2, r = size / 2 - 1;
    let angle = -Math.PI / 2;
    segments.forEach((seg) => {
      if (seg.value <= 0) return;
      const next = angle + (seg.value / total) * 2 * Math.PI;
      const path = document.createElementNS(SVG_NS, "path");
      path.setAttribute("d", pieSlicePath(cx, cy, r, angle, next));
      path.setAttribute("fill", seg.color);
      svg.appendChild(path);
      angle = next;
    });
    return svg;
  }

  function makePieWithLegend(title, segments, size = 130) {
    const wrap = document.createElement("div");
    wrap.className = "pie-card";

    const heading = document.createElement("div");
    heading.className = "pie-title";
    heading.textContent = title;
    wrap.appendChild(heading);

    const total = segments.reduce((s, x) => s + (x.value > 0 ? x.value : 0), 0);

    if (total === 0) {
      const empty = document.createElement("p");
      empty.className = "muted small";
      empty.textContent = "No data yet.";
      wrap.appendChild(empty);
      return wrap;
    }

    const row = document.createElement("div");
    row.className = "pie-row-wrap";
    row.appendChild(makePie(segments, size));

    const legend = document.createElement("div");
    legend.className = "pie-legend";
    segments.forEach((seg) => {
      if (seg.value <= 0) return;
      const pct = Math.round((seg.value / total) * 100);
      const item = document.createElement("div");
      item.className = "pie-legend-item";
      item.innerHTML = `
        <span class="pie-swatch" style="background:${seg.color}"></span>
        <span class="pie-legend-label">${seg.label}</span>
        <span class="pie-legend-value">${seg.value} <span class="pie-pct">${pct}%</span></span>
      `;
      legend.appendChild(item);
    });
    row.appendChild(legend);
    wrap.appendChild(row);
    return wrap;
  }

  function card(value, label) {
    const el = document.createElement("div");
    el.className = "results-card";
    el.innerHTML = `<div class="results-card-value">${value}</div>
                    <div class="results-card-label">${label}</div>`;
    return el;
  }

  function barRow(label, count, max) {
    const pct = max > 0 ? Math.round((count / max) * 100) : 0;
    const el = document.createElement("div");
    el.className = "results-bar";
    el.innerHTML = `
      <div class="results-bar-head">
        <span class="results-bar-label">${label}</span>
        <span class="results-bar-count">${count}</span>
      </div>
      <div class="results-bar-track"><div class="results-bar-fill" style="width:${pct}%"></div></div>
    `;
    return el;
  }

  function fmtDate(v) {
    if (!v) return "";
    const d = v instanceof Date ? v : new Date(v);
    if (isNaN(d.getTime())) return String(v);
    return d.toLocaleString(undefined, {
      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
    });
  }

  function renderResultsDashboard(headers, rows) {
    const data = aggregate(headers, rows);

    // Headline cards
    const cards = $("#results-cards");
    cards.innerHTML = "";
    cards.appendChild(card(data.totals.responses, "responses"));
    cards.appendChild(card(data.totals.yes, "attending"));
    cards.appendChild(card(data.totals.no, "regrets"));
    cards.appendChild(card(data.totals.heads, "heads total"));
    cards.appendChild(card(data.totals.brideSide, "bride's side"));
    cards.appendChild(card(data.totals.groomSide, "groom's side"));

    // Pies
    const pies = $("#results-pies");
    pies.innerHTML = "";

    pies.appendChild(makePieWithLegend("Attending", [
      { label: "Yes", value: data.totals.yes, color: "#2a7a45" },
      { label: "No",  value: data.totals.no,  color: "#a23b3b" }
    ]));

    pies.appendChild(makePieWithLegend("Which side", [
      { label: "Bride's",  value: data.totals.brideSide, color: "#b25a6b" },
      { label: "Groom's",  value: data.totals.groomSide, color: "#7d8aa4" }
    ]));

    // Per-event attendance — order by cfg.events when possible.
    const eventList = $("#results-events");
    eventList.innerHTML = "";
    const eventOrder = (cfg.events || []).map((e) => e.name);
    const knownInOrder = eventOrder.filter((n) => data.eventCounts[n] != null);
    const unknown = Object.keys(data.eventCounts).filter((n) => !eventOrder.includes(n));
    const orderedEventNames = knownInOrder.concat(unknown);
    const maxEvent = Math.max(1, ...Object.values(data.eventCounts));
    if (orderedEventNames.length === 0) {
      eventList.innerHTML = `<p class="muted small">No 'yes' responses yet.</p>`;
    } else {
      orderedEventNames.forEach((name) => {
        eventList.appendChild(barRow(name, data.eventCounts[name], maxEvent));
      });
    }

    // Allergies / notes
    const allergies = $("#results-allergies");
    allergies.innerHTML = "";
    if (data.allergyNotes.length === 0) {
      allergies.innerHTML = `<p class="muted small">No allergy or food notes yet.</p>`;
    } else {
      data.allergyNotes.forEach((n) => {
        const item = document.createElement("div");
        item.className = "results-notes-item";
        item.innerHTML = `<span class="results-notes-name">${n.name}:</span><span>${n.text}</span>`;
        allergies.appendChild(item);
      });
    }

    // All-responses table
    const table = $("#results-table");
    table.innerHTML = "";
    const tableHeaders = ["When", "Name", "Side", "Size", "Status", "Per event", "Email"];
    const thead = document.createElement("thead");
    const trh = document.createElement("tr");
    tableHeaders.forEach((h) => {
      const th = document.createElement("th");
      th.textContent = h;
      trh.appendChild(th);
    });
    thead.appendChild(trh);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    const sorted = data.records.slice().sort((a, b) => {
      const da = new Date(a.submittedAt).getTime() || 0;
      const db = new Date(b.submittedAt).getTime() || 0;
      return db - da;
    });
    const eventNameById = Object.fromEntries((cfg.events || []).map((e) => [e.id, e.name]));
    sorted.forEach((r) => {
      const tr = document.createElement("tr");
      const counts = Object.entries(r.eventCounts)
        .filter(([, n]) => Number(n) > 0)
        .map(([id, n]) => `${eventNameById[id] || id}: ${n}`)
        .join("; ");
      const cells = [
        fmtDate(r.submittedAt),
        r.name || "—",
        r.side.replace("'s side", "") || "—",
        String(r.partySize),
        r.attending || "—",
        counts || (r.legacyEvents.length ? r.legacyEvents.join(", ") + " (legacy)" : "—"),
        r.email || "—"
      ];
      cells.forEach((c, i) => {
        const td = document.createElement("td");
        td.textContent = c;
        if (i === 4) td.className = "status-" + c.toLowerCase();
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    $("#results-auth").hidden = true;
    $("#results-data").hidden = false;
  }

  async function fetchResults(password) {
    const endpoint = (cfg.rsvp && cfg.rsvp.endpoint) || "";
    if (!endpoint) {
      showResultsAuth("No endpoint is configured — set rsvp.endpoint in config.js.");
      return;
    }
    const btn = $("#results-view-btn");
    if (btn) { btn.disabled = true; btn.textContent = "Checking…"; }
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action: "results", password })
      });
      const data = await res.json();
      if (!data.ok) {
        if (data.error === "auth") showResultsAuth("Wrong password — try again.");
        else if (data.error === "not-configured") showResultsAuth("Password not set in Apps Script yet.");
        else showResultsAuth("Couldn't load results: " + (data.error || "unknown error"));
        return;
      }
      sessionStorage.setItem("ankita_results_pwd", password);
      renderResultsDashboard(data.headers || [], data.rows || []);
    } catch (err) {
      showResultsAuth("Network error — " + err.message);
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = "View results"; }
    }
  }

  function renderResults() {
    const cached = sessionStorage.getItem("ankita_results_pwd");
    if (cached) {
      fetchResults(cached);
    } else {
      showResultsAuth();
      const input = $("#results-password");
      if (input) { input.value = ""; setTimeout(() => input.focus(), 50); }
    }
  }

  // ---- Button wiring -----------------------------------------------------

  function wireButtons() {
    $("#cover-rsvp-btn").addEventListener("click", () => window.ROUTER.go("rsvp"));
    $("#cover-gift-link").addEventListener("click", (e) => {
      e.preventDefault();
      window.ROUTER.go("gift");
    });
    $("#cover-travel-link").addEventListener("click", (e) => {
      e.preventDefault();
      window.ROUTER.go("travel");
    });

    $$("#side-bride, #side-groom").forEach((btn) => {
      btn.addEventListener("click", () => {
        set({ side: btn.dataset.side });
        renderSideButtons();
      });
    });

    function validateRsvp() {
      if (!state.side) {
        alert("Please choose whether you're a guest of the bride or groom.");
        return false;
      }
      if (!state.name) {
        alert("Please enter your name first.");
        $("#rsvp-name").focus();
        return false;
      }
      return true;
    }

    $("#rsvp-yes").addEventListener("click", () => {
      if (!validateRsvp()) return;
      // Default each event count to the full party size when first entering the flow,
      // so the common case (everyone attending everything) only needs taps to reduce.
      const defaults = {};
      (cfg.events || []).forEach((ev) => {
        defaults[ev.id] = state.eventCounts[ev.id] != null
          ? state.eventCounts[ev.id]
          : state.partySize;
      });
      set({ attending: true, currentEventIndex: 0, eventCounts: defaults });
      window.ROUTER.go("event");
    });

    $("#rsvp-no").addEventListener("click", async () => {
      if (!validateRsvp()) return;
      set({
        attending: false,
        eventCounts: {},
        allergies: ""
      });
      await window.SUBMIT.submit();
      window.ROUTER.go("gift");
    });

    $("#event-back").addEventListener("click", () => {
      if (state.currentEventIndex === 0) {
        window.ROUTER.go("rsvp");
      } else {
        set({ currentEventIndex: state.currentEventIndex - 1 });
        window.ROUTER.render();
      }
    });

    $("#event-next").addEventListener("click", () => {
      const total = (cfg.events || []).length;
      if (state.currentEventIndex >= total - 1) {
        window.ROUTER.go("notes");
      } else {
        set({ currentEventIndex: state.currentEventIndex + 1 });
        window.ROUTER.render();
      }
    });

    $("#notes-back").addEventListener("click", () => {
      // Step back into the last event page.
      const total = (cfg.events || []).length;
      set({ currentEventIndex: Math.max(0, total - 1) });
      window.ROUTER.go("event");
    });

    $("#notes-submit").addEventListener("click", async () => {
      await window.SUBMIT.submit();
      window.ROUTER.go("thanks");
    });

    $("#thanks-gift-link").addEventListener("click", (e) => {
      e.preventDefault();
      window.ROUTER.go("gift");
    });

    $("#gift-back").addEventListener("click", () => {
      window.ROUTER.go(state.submittedAt ? "thanks" : "cover");
    });

    $("#travel-back").addEventListener("click", () => window.ROUTER.go("cover"));

    $("#results-view-btn").addEventListener("click", () => {
      const pwd = $("#results-password").value;
      if (!pwd) return;
      fetchResults(pwd);
    });
    $("#results-password").addEventListener("keydown", (e) => {
      if (e.key === "Enter") $("#results-view-btn").click();
    });
    $("#results-refresh").addEventListener("click", () => {
      const cached = sessionStorage.getItem("ankita_results_pwd");
      if (cached) fetchResults(cached);
    });
    $("#results-back").addEventListener("click", () => window.ROUTER.go("cover"));
  }

  // ---- Step listener -----------------------------------------------------

  window.addEventListener("rsvp:step", (e) => {
    switch (e.detail) {
      case "cover": renderCover(); break;
      case "rsvp": renderRsvp(); break;
      case "event": renderEventStep(); break;
      case "notes": renderNotesStep(); break;
      case "thanks": renderThanks(); break;
      case "gift": renderGift(); break;
      case "travel": renderTravel(); break;
      case "results": renderResults(); break;
    }
  });

  window.addEventListener("DOMContentLoaded", () => {
    renderBrand();
    renderCover();
    wireButtons();
  });
})();
