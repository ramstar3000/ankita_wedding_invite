// Submission layer. POST to a configured endpoint if available,
// otherwise open a pre-filled mailto: so submissions still reach the couple.

(function () {
  function buildPayload() {
    const s = window.RSVP.state;
    const cfg = window.WEDDING_CONFIG;

    const eventNameById = Object.fromEntries(cfg.events.map((e) => [e.id, e.name]));
    const foodById = Object.fromEntries(cfg.foodEvents.map((f) => [f.id, f]));

    const attendingEventIds =
      s.scope === "whole" ? cfg.events.map((e) => e.id) : s.selectedEventIds;

    const attendingEvents = attendingEventIds.map((id) => eventNameById[id]).filter(Boolean);

    const foodSummary = Object.entries(s.foodChoices).map(([fid, choice]) => {
      const f = foodById[fid];
      return { meal: f ? f.label : fid, choice };
    });

    return {
      submittedAt: s.submittedAt || new Date().toISOString(),
      name: s.name,
      attending: s.attending,
      scope: s.scope,
      attendingEvents,
      foodChoices: foodSummary,
      accommodation: s.accommodation,
      notes: s.notes
    };
  }

  function asText(payload) {
    const lines = [
      `Name: ${payload.name || "(not provided)"}`,
      `Attending: ${payload.attending === true ? "Yes" : payload.attending === false ? "No" : "—"}`,
    ];
    if (payload.attending) {
      lines.push(`Scope: ${payload.scope || "—"}`);
      if (payload.attendingEvents.length) {
        lines.push(`Events: ${payload.attendingEvents.join(", ")}`);
      }
      if (payload.foodChoices.length) {
        lines.push("Food:");
        payload.foodChoices.forEach((f) => lines.push(`  - ${f.meal}: ${f.choice}`));
      }
      if (payload.accommodation) lines.push(`Accommodation: ${payload.accommodation}`);
    }
    if (payload.notes) lines.push(`Notes: ${payload.notes}`);
    lines.push(`Submitted: ${payload.submittedAt}`);
    return lines.join("\n");
  }

  async function submit() {
    const cfg = window.WEDDING_CONFIG.rsvp || {};
    const payload = buildPayload();

    if (cfg.endpoint) {
      try {
        // text/plain keeps this as a CORS "simple request" so the browser
        // skips the preflight OPTIONS — which Google Apps Script web apps
        // don't handle. The Apps Script reads the raw body and JSON-parses it.
        const res = await fetch(cfg.endpoint, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(payload),
          redirect: "follow"
        });
        if (!res.ok) throw new Error("HTTP " + res.status);
        window.RSVP.set({ submittedAt: payload.submittedAt });
        return { ok: true, via: "endpoint" };
      } catch (err) {
        // Fall through to mailto so the guest can still get their reply through.
        console.warn("RSVP endpoint failed, falling back to mailto:", err);
      }
    }

    const to = cfg.mailtoAddress || "";
    const subject = encodeURIComponent(
      `Wedding RSVP — ${payload.name || "guest"} — ${payload.attending ? "attending" : "not attending"}`
    );
    const body = encodeURIComponent(asText(payload));
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
    window.RSVP.set({ submittedAt: payload.submittedAt });
    return { ok: true, via: "mailto" };
  }

  window.SUBMIT = { submit, buildPayload, asText };
})();
