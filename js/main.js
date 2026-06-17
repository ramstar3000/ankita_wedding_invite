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
  }

  function renderRsvp() {
    const nameInput = $("#rsvp-name");
    nameInput.value = state.name || "";
    nameInput.oninput = () => set({ name: nameInput.value.trim() });
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

    $("#rsvp-yes").addEventListener("click", () => {
      if (!state.name) {
        alert("Please enter your name first.");
        $("#rsvp-name").focus();
        return;
      }
      set({ attending: true });
      window.ROUTER.go("scope");
    });

    $("#rsvp-no").addEventListener("click", async () => {
      if (!state.name) {
        alert("Please enter your name first.");
        $("#rsvp-name").focus();
        return;
      }
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
    }
  });

  window.addEventListener("DOMContentLoaded", () => {
    renderCover();
    wireButtons();
  });
})();
