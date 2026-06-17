// Wires the DOM to state + router. Static markup lives in index.html;
// anything driven by config.js is built here at runtime.

(function () {
  const cfg = window.WEDDING_CONFIG;
  const { state, set } = window.RSVP;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

  function renderCover() {
    $("#cover-name1").textContent = cfg.couple.name1;
    $("#cover-name2").textContent = cfg.couple.name2;
    $("#cover-date").textContent = cfg.date;
    $("#cover-venue-name").textContent = cfg.venue.name;
    $("#cover-venue-address").textContent = cfg.venue.address;

    const mapLink = $("#cover-venue-map");
    if (cfg.venue.mapUrl) {
      mapLink.href = cfg.venue.mapUrl;
      mapLink.hidden = false;
    } else {
      mapLink.hidden = true;
    }

    const invitationLink = $("#cover-invitation-link");
    if (cfg.invitationPdf) {
      invitationLink.href = cfg.invitationPdf;
      invitationLink.hidden = false;
    } else {
      invitationLink.hidden = true;
    }
  }

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
      // Trim or pad partyNames to match the new size.
      const extra = n - 1;
      const next = state.partyNames.slice(0, extra);
      while (next.length < extra) next.push("");
      set({ partySize: n, partyNames: next });
      renderPartyNameInputs();
    };

    renderPartyNameInputs();
    renderSideButtons();
  }

  function renderEvents() {
    const list = $("#events-list");
    list.innerHTML = "";
    cfg.events.forEach((ev) => {
      const id = `ev-${ev.id}`;
      const wrap = document.createElement("label");
      wrap.className = "choice";
      wrap.innerHTML = `
        <input type="checkbox" id="${id}" value="${ev.id}">
        <span class="choice-body">
          <span class="choice-title">${ev.name}</span>
          <span class="choice-meta">${[ev.date, ev.time, ev.venue].filter(Boolean).join(" · ")}</span>
        </span>
      `;
      const input = wrap.querySelector("input");
      input.checked = state.selectedEventIds.includes(ev.id);
      input.addEventListener("change", () => {
        const next = new Set(state.selectedEventIds);
        if (input.checked) next.add(ev.id); else next.delete(ev.id);
        set({ selectedEventIds: Array.from(next) });
      });
      list.appendChild(wrap);
    });
  }

  function attendingEventIds() {
    return state.scope === "whole"
      ? cfg.events.map((e) => e.id)
      : state.selectedEventIds;
  }

  function renderFood() {
    const list = $("#food-list");
    list.innerHTML = "";
    const ids = new Set(attendingEventIds());
    const meals = cfg.foodEvents.filter((f) => ids.has(f.eventId));

    if (meals.length === 0) {
      list.innerHTML = `<p class="muted">No meals to choose for the events you selected.</p>`;
      return;
    }

    meals.forEach((meal) => {
      const block = document.createElement("fieldset");
      block.className = "food-block";
      block.innerHTML = `<legend>${meal.label}</legend>`;
      meal.options.forEach((opt) => {
        const radioId = `food-${meal.id}-${opt.replace(/\s+/g, "-")}`;
        const row = document.createElement("label");
        row.className = "choice";
        row.innerHTML = `
          <input type="radio" name="food-${meal.id}" id="${radioId}" value="${opt}">
          <span class="choice-body"><span class="choice-title">${opt}</span></span>
        `;
        const input = row.querySelector("input");
        input.checked = state.foodChoices[meal.id] === opt;
        input.addEventListener("change", () => {
          const next = { ...state.foodChoices, [meal.id]: opt };
          set({ foodChoices: next });
        });
        block.appendChild(row);
      });
      list.appendChild(block);
    });
  }

  function renderAccommodation() {
    $("#accommodation-desc").textContent = cfg.accommodation.description || "";
    const list = $("#accommodation-list");
    list.innerHTML = "";
    cfg.accommodation.options.forEach((opt) => {
      const row = document.createElement("label");
      row.className = "choice";
      row.innerHTML = `
        <input type="radio" name="accommodation" value="${opt}">
        <span class="choice-body"><span class="choice-title">${opt}</span></span>
      `;
      const input = row.querySelector("input");
      input.checked = state.accommodation === opt;
      input.addEventListener("change", () => set({ accommodation: opt }));
      list.appendChild(row);
    });

    const notes = $("#accommodation-notes");
    notes.value = state.notes || "";
    notes.oninput = () => set({ notes: notes.value });
  }

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

  // ---- Results viewer (password-gated) ------------------------------------

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

  // ---- Results aggregation + render ---------------------------------------

  function parseFoodChoices(str) {
    if (!str) return [];
    return String(str).split(";").map((s) => s.trim()).filter(Boolean).map((s) => {
      const i = s.indexOf(":");
      return i === -1
        ? { meal: s, choice: "" }
        : { meal: s.slice(0, i).trim(), choice: s.slice(i + 1).trim() };
    });
  }

  function aggregate(headers, rows) {
    const idx = {};
    headers.forEach((h, i) => { idx[String(h)] = i; });

    const get = (row, key) => (key in idx ? row[idx[key]] : "");

    const records = rows.map((row) => ({
      submittedAt: get(row, "submittedAt"),
      name: String(get(row, "name") || ""),
      attending: String(get(row, "attending") || ""),
      scope: String(get(row, "scope") || ""),
      attendingEvents: String(get(row, "attendingEvents") || "")
        .split(",").map((s) => s.trim()).filter(Boolean),
      foodChoices: parseFoodChoices(get(row, "foodChoices")),
      accommodation: String(get(row, "accommodation") || ""),
      notes: String(get(row, "notes") || ""),
      side: String(get(row, "side") || ""),
      partySize: Math.max(1, Number(get(row, "partySize")) || 1)
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

    const eventCounts = {};
    yes.forEach((r) => {
      r.attendingEvents.forEach((ev) => {
        eventCounts[ev] = (eventCounts[ev] || 0) + r.partySize;
      });
    });

    const mealCounts = {}; // { mealLabel: { choice: count } }
    yes.forEach((r) => {
      r.foodChoices.forEach(({ meal, choice }) => {
        if (!meal) return;
        mealCounts[meal] = mealCounts[meal] || {};
        const key = choice || "(no choice)";
        mealCounts[meal][key] = (mealCounts[meal][key] || 0) + r.partySize;
      });
    });

    const accomCounts = {};
    yes.forEach((r) => {
      if (!r.accommodation) return;
      accomCounts[r.accommodation] = (accomCounts[r.accommodation] || 0) + r.partySize;
    });

    return { records, totals, eventCounts, mealCounts, accomCounts };
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

    // Per-event attendance — order by cfg.events when possible, append unknowns.
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

    // Food preferences — group by meal, then list choices.
    const mealList = $("#results-meals");
    mealList.innerHTML = "";
    const mealOrder = (cfg.foodEvents || []).map((m) => m.label);
    const mealsInOrder = mealOrder.filter((n) => data.mealCounts[n] != null);
    const extraMeals = Object.keys(data.mealCounts).filter((n) => !mealOrder.includes(n));
    const allMeals = mealsInOrder.concat(extraMeals);
    if (allMeals.length === 0) {
      mealList.innerHTML = `<p class="muted small">No food choices yet.</p>`;
    } else {
      allMeals.forEach((mealName) => {
        const block = document.createElement("div");
        block.className = "results-meal-block";
        const choices = data.mealCounts[mealName];
        const total = Object.values(choices).reduce((a, b) => a + b, 0);
        const pills = Object.entries(choices)
          .sort((a, b) => b[1] - a[1])
          .map(([choice, n]) => `<span class="pill">${choice} · <strong>${n}</strong></span>`)
          .join("");
        block.innerHTML = `
          <div class="results-meal-head">
            <span class="results-meal-name">${mealName}</span>
            <span class="results-bar-count">${total}</span>
          </div>
          <div class="pill-row">${pills}</div>
        `;
        mealList.appendChild(block);
      });
    }

    // Accommodation
    const accomList = $("#results-accommodation");
    accomList.innerHTML = "";
    const accomNames = Object.keys(data.accomCounts);
    const maxAccom = Math.max(1, ...Object.values(data.accomCounts));
    if (accomNames.length === 0) {
      accomList.innerHTML = `<p class="muted small">No accommodation choices yet.</p>`;
    } else {
      accomNames.sort((a, b) => data.accomCounts[b] - data.accomCounts[a]).forEach((name) => {
        accomList.appendChild(barRow(name, data.accomCounts[name], maxAccom));
      });
    }

    // All-responses table (compact, key columns only, newest first)
    const table = $("#results-table");
    table.innerHTML = "";
    const tableHeaders = ["When", "Name", "Side", "Size", "Status", "Events"];
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
    sorted.forEach((r) => {
      const tr = document.createElement("tr");
      const cells = [
        fmtDate(r.submittedAt),
        r.name || "—",
        r.side.replace("'s side", "") || "—",
        String(r.partySize),
        r.attending || "—",
        r.attendingEvents.length ? r.attendingEvents.join(", ") : "—"
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

  function renderThanks() {
    const name = state.name ? `, ${state.name}` : "";
    $("#thanks-line").textContent = state.attending
      ? `Thank you${name}! We can't wait to celebrate with you.`
      : `Thank you${name} for letting us know.`;
  }

  // ---- Button wiring -------------------------------------------------------

  function wireButtons() {
    $("#cover-rsvp-btn").addEventListener("click", () => window.ROUTER.go("rsvp"));
    $("#cover-gift-link").addEventListener("click", (e) => {
      e.preventDefault();
      window.ROUTER.go("gift");
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
      set({ attending: true });
      window.ROUTER.go("scope");
    });

    $("#rsvp-no").addEventListener("click", async () => {
      if (!validateRsvp()) return;
      set({
        attending: false,
        scope: null,
        selectedEventIds: [],
        foodChoices: {},
        accommodation: null
      });
      await window.SUBMIT.submit();
      window.ROUTER.go("gift");
    });

    $("#scope-whole").addEventListener("click", () => {
      set({ scope: "whole", selectedEventIds: cfg.events.map((e) => e.id) });
      window.ROUTER.go("food");
    });
    $("#scope-part").addEventListener("click", () => {
      set({ scope: "part" });
      window.ROUTER.go("events");
    });

    $("#events-next").addEventListener("click", () => {
      if (state.selectedEventIds.length === 0) {
        alert("Please pick at least one event, or go back and choose 'Whole event'.");
        return;
      }
      window.ROUTER.go("food");
    });
    $("#events-back").addEventListener("click", () => window.ROUTER.go("scope"));

    $("#food-next").addEventListener("click", () => window.ROUTER.go("accommodation"));
    $("#food-back").addEventListener("click", () =>
      window.ROUTER.go(state.scope === "part" ? "events" : "scope")
    );

    $("#accommodation-back").addEventListener("click", () => window.ROUTER.go("food"));
    $("#accommodation-submit").addEventListener("click", async () => {
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

  // ---- Step listener -------------------------------------------------------

  window.addEventListener("rsvp:step", (e) => {
    switch (e.detail) {
      case "cover": renderCover(); break;
      case "rsvp": renderRsvp(); break;
      case "events": renderEvents(); break;
      case "food": renderFood(); break;
      case "accommodation": renderAccommodation(); break;
      case "thanks": renderThanks(); break;
      case "gift": renderGift(); break;
      case "results": renderResults(); break;
    }
  });

  window.addEventListener("DOMContentLoaded", () => {
    renderCover();
    wireButtons();
  });
})();
