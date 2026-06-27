// Wires the DOM to state + router. Static markup lives in index.html;
// anything driven by config.js is built here at runtime.

(function () {
  const cfg = window.WEDDING_CONFIG;
  const { state, set } = window.RSVP;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

  // ---- Saved submission (localStorage) -----------------------------------
  // After an RSVP is sent we keep a full snapshot of the guest's answers in
  // localStorage, which (unlike sessionStorage) survives closing the tab. This
  // powers two things: the duplicate-submission guard, and the cover's
  // "View your RSVP" button that re-opens the summary on a return visit.
  const SAVED_KEY = "ankita_wedding_rsvp_saved_v1";

  function priorSubmission() {
    try {
      const obj = JSON.parse(localStorage.getItem(SAVED_KEY) || "null");
      return obj && obj.submittedAt ? obj : null;
    } catch (e) { return null; }
  }

  function recordSubmission() {
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify(state));
    } catch (e) { /* storage disabled — the server upsert still dedupes */ }
  }

  function confirmIfResubmitting() {
    const prior = priorSubmission();
    if (!prior) return true;
    const who = prior.name ? ` for ${prior.name}` : "";
    return window.confirm(
      `Our records show an RSVP has already been sent${who} from this device. ` +
      `Sending again will update your previous response. Continue?`
    );
  }

  // Reads what the server actually did after the write and surfaces it.
  // Returns true if the caller should proceed (navigate to thanks etc.),
  // false if the submission was rejected and the guest needs to retry.
  function handleSubmitResult(result) {
    if (!result || result.ok === false) {
      const reason = (result && result.error) ? `\n\n${result.error}` : "";
      window.alert(
        "We couldn't save your RSVP. Please check your connection and try again." +
        reason
      );
      return false;
    }
    if (result.updated) {
      window.alert("Thanks — your previous response has been updated.");
    }
    return true;
  }

  // Invitation images in display order (filters out any blanks).
  function invitationImageList() {
    const list = Array.isArray(cfg.invitationImages) ? cfg.invitationImages.slice() : [];
    return list.filter(Boolean);
  }

  // ---- Invitation viewer (slides up from the bottom) ---------------------

  let inviteIndex = 0;
  let inviteBuilt = false;

  function buildInvitationViewer() {
    if (inviteBuilt) return;
    const imgs = invitationImageList();
    if (!imgs.length) return;

    const track = $("#invite-viewer-track");
    const dots = $("#invite-viewer-dots");
    track.innerHTML = "";
    dots.innerHTML = "";

    imgs.forEach((src, i) => {
      const slide = document.createElement("div");
      slide.className = "invite-slide";
      const img = document.createElement("img");
      img.src = src;
      img.alt = "Invitation " + (i + 1);
      img.loading = i === 0 ? "eager" : "lazy";
      slide.appendChild(img);
      track.appendChild(slide);

      const dot = document.createElement("span");
      dot.className = "invite-dot";
      dots.appendChild(dot);
    });

    $("#invite-viewer-nav").hidden = imgs.length < 2;
    inviteBuilt = true;
    goToInvite(0);
  }

  function goToInvite(i) {
    const imgs = invitationImageList();
    inviteIndex = Math.max(0, Math.min(i, imgs.length - 1));
    const track = $("#invite-viewer-track");
    $$(".invite-slide", track).forEach((s) => {
      s.style.transform = `translateX(${-100 * inviteIndex}%)`;
    });
    $$(".invite-dot").forEach((d, di) => d.classList.toggle("is-active", di === inviteIndex));
    const prev = $("#invite-prev");
    const next = $("#invite-next");
    if (prev) prev.disabled = inviteIndex === 0;
    if (next) next.disabled = inviteIndex === imgs.length - 1;
  }

  function openInvitationViewer() {
    buildInvitationViewer();
    const viewer = $("#invite-viewer");
    viewer.hidden = false;
    viewer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    // Next frame so the transition runs from the off-screen start state.
    requestAnimationFrame(() => viewer.classList.add("is-open"));
  }

  function closeInvitationViewer() {
    const viewer = $("#invite-viewer");
    viewer.classList.remove("is-open");
    viewer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    const onDone = () => { viewer.hidden = true; };
    // Wait for the slide-down to finish before hiding outright.
    viewer.querySelector(".invite-viewer-panel")
      .addEventListener("transitionend", onDone, { once: true });
  }

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
    invitationLink.hidden = invitationImageList().length === 0;

    const rsvpBy = $("#cover-rsvp-by");
    if (cfg.rsvpBy) { rsvpBy.textContent = cfg.rsvpBy; rsvpBy.hidden = false; }
    else { rsvpBy.hidden = true; }

    // Returning guest who has already submitted on this device → offer a quick
    // way back to their summary.
    $("#cover-view-rsvp").hidden = !priorSubmission();

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

  // The party as an ordered list. Index 0 = lead guest (state.name);
  // subsequent indices = entries from state.partyNames (falling back to a
  // numbered placeholder so unnamed slots still get a tickbox).
  function partyMembers() {
    const total = Math.max(1, state.partySize || 1);
    const out = [];
    for (let i = 0; i < total; i++) {
      if (i === 0) {
        out.push({ index: 0, name: state.name || "Guest 1" });
      } else {
        const nm = (state.partyNames[i - 1] || "").trim();
        out.push({ index: i, name: nm || `Guest ${i + 1}` });
      }
    }
    return out;
  }

  function attendeesForCurrentEvent() {
    const ev = currentEvent();
    if (!ev) return [];
    const stored = state.eventAttendees[ev.id];
    if (!Array.isArray(stored)) return [];
    const max = Math.max(1, state.partySize || 1);
    return stored.filter((i) => Number.isInteger(i) && i >= 0 && i < max);
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

    const members = partyMembers();
    const ticked = new Set(attendeesForCurrentEvent());

    const list = $("#event-attendees-list");
    list.innerHTML = "";
    members.forEach((m) => {
      const row = document.createElement("label");
      row.className = "attendee-row";
      row.innerHTML = `
        <input type="checkbox" class="attendee-checkbox" data-index="${m.index}" ${ticked.has(m.index) ? "checked" : ""} />
        <span class="attendee-name"></span>
      `;
      row.querySelector(".attendee-name").textContent = m.name;
      const input = row.querySelector("input");
      input.addEventListener("change", () => {
        const next = new Set(attendeesForCurrentEvent());
        if (input.checked) next.add(m.index); else next.delete(m.index);
        const arr = Array.from(next).sort((a, b) => a - b);
        set({ eventAttendees: { ...state.eventAttendees, [ev.id]: arr } });
        updateAttendeeCount();
      });
      list.appendChild(row);
    });

    updateAttendeeCount();

    const backBtn = $("#event-back");
    backBtn.textContent = state.currentEventIndex === 0 ? "Back to RSVP" : "Previous event";

    const nextBtn = $("#event-next");
    nextBtn.textContent = state.currentEventIndex === total - 1
      ? "Continue to final step"
      : "Next event";
  }

  function updateAttendeeCount() {
    const total = Math.max(1, state.partySize || 1);
    const ticked = attendeesForCurrentEvent().length;
    const el = $("#event-attendees-count");
    if (el) el.textContent = `${ticked} of ${total}`;
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

    // Venue name + full address, shown above the map button.
    $("#travel-venue-name").textContent =
      t.venueName || (cfg.venue && cfg.venue.name) || "";
    $("#travel-venue-address").textContent =
      t.venueAddress || (cfg.venue && cfg.venue.address) || "";

    // Map link to the venue (falls back to venue.mapUrl).
    const mapLink = $("#travel-map-link");
    const mapUrl = t.mapUrl || (cfg.venue && cfg.venue.mapUrl) || "";
    if (mapUrl) {
      mapLink.href = mapUrl;
      mapLink.textContent = t.mapLabel || "Open in Google Maps";
      mapLink.hidden = false;
    } else {
      mapLink.hidden = true;
    }

    $("#travel-airport-name").textContent = (t.airport && t.airport.name) || "";
    $("#travel-airport-address").textContent = (t.airport && t.airport.address) || "";
    $("#travel-airport-distance").textContent = (t.airport && t.airport.distance) || "";
    $("#travel-station-name").textContent = (t.station && t.station.name) || "";
    $("#travel-station-address").textContent = (t.station && t.station.address) || "";
    $("#travel-station-distance").textContent = (t.station && t.station.distance) || "";

    const metroBlock = $("#travel-metro-block");
    if (t.metro && t.metro.name) {
      $("#travel-metro-name").textContent = t.metro.name || "";
      $("#travel-metro-address").textContent = t.metro.address || "";
      $("#travel-metro-distance").textContent = t.metro.distance || "";
      metroBlock.hidden = false;
    } else {
      metroBlock.hidden = true;
    }

    $("#travel-arrival").textContent = (t.arrival && t.arrival.suggested) || "";
    $("#travel-departure").textContent = (t.arrival && t.arrival.departure) || "";

    function fillDl(el, rows) {
      el.innerHTML = "";
      (rows || []).forEach((row) => {
        const dt = document.createElement("dt");
        dt.textContent = row.label;
        const dd = document.createElement("dd");
        dd.textContent = row.description != null ? row.description : row.value;
        el.appendChild(dt);
        el.appendChild(dd);
      });
    }

    fillDl($("#travel-transport"), t.transport);

    const visaBlock = $("#travel-visa-block");
    const visaLink = $("#travel-visa-link");
    if (t.visa && t.visa.body) {
      $("#travel-visa-heading").textContent = t.visa.heading || "Visa";
      $("#travel-visa-body").textContent = t.visa.body;
      if (t.visa.linkUrl) {
        visaLink.href = t.visa.linkUrl;
        visaLink.textContent = t.visa.linkLabel || t.visa.linkUrl;
        visaLink.hidden = false;
      } else {
        visaLink.hidden = true;
      }
      visaBlock.hidden = false;
    } else {
      visaBlock.hidden = true;
    }

    const usefulBlock = $("#travel-useful-block");
    const usefulLink = $("#travel-useful-link");
    if (t.useful && Array.isArray(t.useful.items) && t.useful.items.length) {
      $("#travel-useful-heading").textContent = t.useful.heading || "Useful information";
      fillDl($("#travel-useful"), t.useful.items);
      if (t.useful.linkUrl) {
        usefulLink.href = t.useful.linkUrl;
        usefulLink.textContent = t.useful.linkLabel || t.useful.linkUrl;
        usefulLink.hidden = false;
      } else {
        usefulLink.hidden = true;
      }
      usefulBlock.hidden = false;
    } else {
      usefulBlock.hidden = true;
    }
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

    const alt = $("#gift-alt");
    const bank = $("#gift-bank");
    if (cfg.gifts.bankDetails) {
      bank.textContent = cfg.gifts.bankDetails;
      // The disclosure itself is the gate — start collapsed, details show on click.
      alt.open = false;
      alt.hidden = false;
    } else {
      alt.hidden = true;
    }
  }

  // ---- Download helpers (summary + iCal) --------------------------------

  function downloadBlob(filename, mime, content) {
    const blob = new Blob([content], { type: mime + ";charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  function pad2(n) { return String(n).padStart(2, "0"); }

  function toUtcStamp(iso) {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.getUTCFullYear() +
      pad2(d.getUTCMonth() + 1) +
      pad2(d.getUTCDate()) + "T" +
      pad2(d.getUTCHours()) +
      pad2(d.getUTCMinutes()) +
      pad2(d.getUTCSeconds()) + "Z";
  }

  function icsEscape(s) {
    return String(s == null ? "" : s)
      .replace(/\\/g, "\\\\")
      .replace(/\r\n|\r|\n/g, "\\n")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;");
  }

  // Build an .ics covering the events the guest ticked at least one person for.
  // Each VEVENT gets summary, location (venue+address), and a description that
  // bundles the dress code + meals + Maps link so calendar reminders are useful.
  function buildIcs(includeEventIds) {
    const venue = cfg.venue || {};
    const locParts = [venue.name, venue.address].filter(Boolean);
    const location = locParts.join(", ");
    const mapUrl = venue.mapUrl || "";
    const stamp = toUtcStamp(new Date().toISOString());

    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Ankita & Shyam Wedding//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH"
    ];

    (cfg.events || []).forEach((ev) => {
      if (!includeEventIds.includes(ev.id)) return;
      if (!ev.startISO || !ev.endISO) return;
      const descParts = [];
      if (ev.description) descParts.push(ev.description);
      if (ev.meals) descParts.push("Meals: " + ev.meals);
      if (ev.dressCode) descParts.push("Dress code: " + ev.dressCode);
      if (mapUrl) descParts.push("Map: " + mapUrl);

      lines.push("BEGIN:VEVENT");
      lines.push("UID:" + ev.id + "-2026@ankita-shyam.wedding");
      lines.push("DTSTAMP:" + stamp);
      lines.push("DTSTART:" + toUtcStamp(ev.startISO));
      lines.push("DTEND:" + toUtcStamp(ev.endISO));
      lines.push("SUMMARY:" + icsEscape(ev.name + " — Ankita & Shyam"));
      if (location) lines.push("LOCATION:" + icsEscape(location));
      lines.push("DESCRIPTION:" + icsEscape(descParts.join("\n")));
      lines.push("END:VEVENT");
    });

    lines.push("END:VCALENDAR");
    return lines.join("\r\n");
  }

  function attendingEventIds() {
    const s = window.RSVP.state;
    const out = [];
    (cfg.events || []).forEach((ev) => {
      const arr = s.eventAttendees[ev.id];
      if (Array.isArray(arr) && arr.length > 0) out.push(ev.id);
    });
    return out;
  }

  // ---- Thanks ------------------------------------------------------------

  function renderThanks() {
    const name = state.name ? `, ${state.name}` : "";
    $("#thanks-line").textContent = state.attending
      ? `Thank you${name}! We can't wait to celebrate with you.`
      : `Thank you${name} for letting us know.`;

    const summary = $("#thanks-summary");
    const topList = $("#thanks-summary-list");
    const eventsWrap = $("#thanks-summary-events");
    const detailsList = $("#thanks-summary-details");
    const emailNote = $("#thanks-email-note");

    const downloads = $("#thanks-downloads");
    const icsBtn = $("#thanks-download-ics");

    topList.innerHTML = "";
    eventsWrap.innerHTML = "";
    detailsList.innerHTML = "";

    function row(listEl, label, value) {
      if (!value) return;
      const dt = document.createElement("dt");
      dt.textContent = label;
      const dd = document.createElement("dd");
      dd.textContent = value;
      listEl.appendChild(dt);
      listEl.appendChild(dd);
    }

    const sideLabel = state.side === "bride" ? "Bride's side"
                    : state.side === "groom" ? "Groom's side"
                    : "—";

    if (!state.attending) {
      row(topList, "Reply", "Sadly can't make it");
      row(topList, "Guest of", sideLabel);
      if (state.name) row(topList, "Name", state.name);
      summary.hidden = false;
      // Nothing to add to a calendar for a decline.
      downloads.hidden = true;
      emailNote.hidden = true;
      return;
    }

    row(topList, "Guest of", sideLabel);
    row(topList, "Party size", String(state.partySize || 1));
    if (state.partyNames && state.partyNames.filter(Boolean).length) {
      row(topList, "Names", [state.name].concat(state.partyNames.filter(Boolean)).join(", "));
    }

    // Per-event details — only events the party is actually attending, with
    // the full when/meals/dress code so guests don't need the invitation again.
    const members = partyMembers();
    const memberNameByIndex = Object.fromEntries(members.map((m) => [m.index, m.name]));
    const attendedEvents = (cfg.events || []).filter((ev) => {
      const arr = state.eventAttendees[ev.id];
      return Array.isArray(arr) && arr.filter((i) => memberNameByIndex[i] != null).length > 0;
    });

    if (attendedEvents.length) {
      const heading = document.createElement("p");
      heading.className = "summary-subheading";
      heading.textContent = "Events you're joining";
      eventsWrap.appendChild(heading);

      attendedEvents.forEach((ev) => {
        const indices = state.eventAttendees[ev.id].filter((i) => memberNameByIndex[i] != null);
        const names = indices.map((i) => memberNameByIndex[i]);

        const block = document.createElement("div");
        block.className = "summary-event";
        const nameEl = document.createElement("p");
        nameEl.className = "summary-event-name";
        nameEl.textContent = ev.name;
        block.appendChild(nameEl);

        const dl = document.createElement("dl");
        dl.className = "summary-list summary-event-dl";
        row(dl, "When", [ev.date, ev.time].filter(Boolean).join(" · "));
        row(dl, "Meals", ev.meals);
        row(dl, "Dress code", ev.dressCode);
        row(dl, "Who's coming", names.join(", ") + " (" + names.length + ")");
        block.appendChild(dl);
        eventsWrap.appendChild(block);
      });
    }

    // Remaining details + venue, so the page is a complete record.
    if (state.allergies) row(detailsList, "Allergies / food notes", state.allergies);
    if (state.email) row(detailsList, "Email", state.email);
    if (state.phone) row(detailsList, "Phone", state.phone);
    const venue = cfg.venue || {};
    if (venue.name) row(detailsList, "Venue", [venue.name, venue.address].filter(Boolean).join(", "));

    summary.hidden = false;
    downloads.hidden = false;
    icsBtn.hidden = false;

    if (state.email) {
      emailNote.textContent = `We've saved your details — we'll only use ${state.email} if we need to reach you.`;
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

  function parseJsonObject(str) {
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
      eventAttendees: parseJsonObject(get(row, "eventAttendees")),    // { [eventId]: string[] }
      eventCounts: parseJsonObject(get(row, "eventCounts")),
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

    // Per-event headcount, summed across rows. Prefer eventAttendees (names);
    // fall back to eventCounts (numbers); fall back to legacy attendingEvents.
    const eventCounts = {};
    const eventNamesPerEvent = {};   // { eventDisplayName: string[] of attendee names }
    const eventNameById = Object.fromEntries((cfg.events || []).map((e) => [e.id, e.name]));
    yes.forEach((r) => {
      const attendeesById = r.eventAttendees;
      const hasAttendees = Object.keys(attendeesById).length > 0;
      if (hasAttendees) {
        Object.entries(attendeesById).forEach(([id, names]) => {
          const display = eventNameById[id] || id;
          const arr = Array.isArray(names) ? names : [];
          if (arr.length === 0) return;
          eventCounts[display] = (eventCounts[display] || 0) + arr.length;
          eventNamesPerEvent[display] = (eventNamesPerEvent[display] || []).concat(arr);
        });
        return;
      }
      const counts = r.eventCounts;
      if (Object.keys(counts).length > 0) {
        Object.entries(counts).forEach(([id, n]) => {
          const display = eventNameById[id] || id;
          const num = Math.max(0, Number(n) || 0);
          if (num > 0) eventCounts[display] = (eventCounts[display] || 0) + num;
        });
        return;
      }
      // Legacy rows: each named event pulls in the full party size.
      r.legacyEvents.forEach((name) => {
        eventCounts[name] = (eventCounts[name] || 0) + r.partySize;
      });
    });

    const allergyNotes = records
      .filter((r) => r.allergies && r.allergies.trim())
      .map((r) => ({ name: r.name || "(unnamed)", text: r.allergies.trim() }));

    return { records, totals, eventCounts, eventNamesPerEvent, allergyNotes };
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
      let perEvent = "";
      if (Object.keys(r.eventAttendees).length > 0) {
        perEvent = Object.entries(r.eventAttendees)
          .filter(([, names]) => Array.isArray(names) && names.length)
          .map(([id, names]) => `${eventNameById[id] || id}: ${names.join(", ")}`)
          .join("; ");
      } else if (Object.keys(r.eventCounts).length > 0) {
        perEvent = Object.entries(r.eventCounts)
          .filter(([, n]) => Number(n) > 0)
          .map(([id, n]) => `${eventNameById[id] || id}: ${n}`)
          .join("; ");
      } else if (r.legacyEvents.length) {
        perEvent = r.legacyEvents.join(", ") + " (legacy)";
      }
      const cells = [
        fmtDate(r.submittedAt),
        r.name || "—",
        r.side.replace("'s side", "") || "—",
        String(r.partySize),
        r.attending || "—",
        perEvent || "—",
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
    $("#cover-view-rsvp").addEventListener("click", () => {
      const saved = priorSubmission();
      if (!saved) return;
      // Restore the saved answers into live state so the summary renders fully,
      // even if this session's sessionStorage was empty (e.g. a return visit).
      set(saved);
      window.ROUTER.go("thanks");
    });
    $("#cover-invitation-link").addEventListener("click", () => openInvitationViewer());
    $("#invite-viewer-close").addEventListener("click", () => closeInvitationViewer());
    $("#invite-viewer-backdrop").addEventListener("click", () => closeInvitationViewer());
    $("#invite-prev").addEventListener("click", () => goToInvite(inviteIndex - 1));
    $("#invite-next").addEventListener("click", () => goToInvite(inviteIndex + 1));
    document.addEventListener("keydown", (e) => {
      if ($("#invite-viewer").hidden) return;
      if (e.key === "Escape") closeInvitationViewer();
      else if (e.key === "ArrowLeft") goToInvite(inviteIndex - 1);
      else if (e.key === "ArrowRight") goToInvite(inviteIndex + 1);
    });
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
      // Default each event to "everyone attending" on first arrival. Subsequent
      // visits keep whatever the guest already ticked.
      const allIndices = partyMembers().map((m) => m.index);
      const defaults = {};
      (cfg.events || []).forEach((ev) => {
        defaults[ev.id] = Array.isArray(state.eventAttendees[ev.id])
          ? state.eventAttendees[ev.id]
          : allIndices.slice();
      });
      set({ attending: true, currentEventIndex: 0, eventAttendees: defaults });
      window.ROUTER.go("event");
    });

    $("#rsvp-no").addEventListener("click", async () => {
      if (!validateRsvp()) return;
      if (!confirmIfResubmitting()) return;
      set({
        attending: false,
        eventAttendees: {},
        eventCounts: {},
        allergies: ""
      });
      const btn = $("#rsvp-no");
      btn.disabled = true;
      try {
        const result = await window.SUBMIT.submit();
        if (!handleSubmitResult(result)) return;
        recordSubmission();
        window.ROUTER.go("gift");
      } finally {
        btn.disabled = false;
      }
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
      if (!confirmIfResubmitting()) return;
      const btn = $("#notes-submit");
      const orig = btn.textContent;
      btn.disabled = true;
      btn.textContent = "Sending…";
      try {
        const result = await window.SUBMIT.submit();
        if (!handleSubmitResult(result)) return;
        recordSubmission();
        window.ROUTER.go("thanks");
      } finally {
        btn.disabled = false;
        btn.textContent = orig;
      }
    });

    $("#thanks-gift-link").addEventListener("click", (e) => {
      e.preventDefault();
      window.ROUTER.go("gift");
    });
    $("#thanks-travel-link").addEventListener("click", (e) => {
      e.preventDefault();
      window.ROUTER.go("travel");
    });

    $("#thanks-download-ics").addEventListener("click", () => {
      const ids = attendingEventIds();
      if (ids.length === 0) {
        alert("No events are ticked, so there's nothing to add to the calendar.");
        return;
      }
      const ics = buildIcs(ids);
      downloadBlob("ankita-shyam-wedding.ics", "text/calendar", ics);
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
