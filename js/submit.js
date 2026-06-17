// Submission layer. POST to a configured endpoint if available,
// otherwise open a pre-filled mailto: so submissions still reach the couple.

(function () {
  function memberNames() {
    const s = window.RSVP.state;
    const total = Math.max(1, s.partySize || 1);
    const out = [];
    for (let i = 0; i < total; i++) {
      if (i === 0) out.push((s.name || "").trim() || ("Guest 1"));
      else {
        const nm = ((s.partyNames || [])[i - 1] || "").trim();
        out.push(nm || `Guest ${i + 1}`);
      }
    }
    return out;
  }

  function buildPayload() {
    const s = window.RSVP.state;
    const names = memberNames();

    // Convert eventAttendees (party indices) → names + derive counts.
    const eventAttendees = {};
    const eventCounts = {};
    Object.entries(s.eventAttendees || {}).forEach(function ([eid, indices]) {
      const arr = Array.isArray(indices) ? indices : [];
      const resolved = arr
        .filter(function (i) { return Number.isInteger(i) && i >= 0 && i < names.length; })
        .map(function (i) { return names[i]; });
      eventAttendees[eid] = resolved;
      eventCounts[eid] = resolved.length;
    });

    return {
      submittedAt: s.submittedAt || new Date().toISOString(),
      name: s.name,
      side: s.side,                                                  // "bride" | "groom" | null
      partySize: s.partySize || 1,
      partyNames: (s.partyNames || []).filter(function (n) { return n && n.length; }),
      attending: s.attending,
      eventAttendees: eventAttendees,                                // { [eventId]: string[] }
      eventCounts: eventCounts,                                      // { [eventId]: number } (derived)
      allergies: s.allergies || "",
      email: s.email || "",
      phone: s.phone || ""
    };
  }

  function asText(payload) {
    const cfg = window.WEDDING_CONFIG || {};
    const eventNameById = Object.fromEntries((cfg.events || []).map((e) => [e.id, e.name]));
    const sideLabel = payload.side === "bride" ? "Bride's side"
                    : payload.side === "groom" ? "Groom's side"
                    : "—";
    const lines = [
      `Name: ${payload.name || "(not provided)"}`,
      `Side: ${sideLabel}`,
      `Party size: ${payload.partySize}`
    ];
    if (payload.partyNames && payload.partyNames.length) {
      lines.push(`Others joining: ${payload.partyNames.join(", ")}`);
    }
    lines.push(`Attending: ${payload.attending === true ? "Yes" : payload.attending === false ? "No" : "—"}`);
    if (payload.attending) {
      const entries = Object.entries(payload.eventAttendees || {});
      if (entries.length) {
        lines.push("Per event:");
        entries.forEach(([id, names]) => {
          const display = eventNameById[id] || id;
          if (Array.isArray(names) && names.length) {
            lines.push(`  - ${display}: ${names.join(", ")} (${names.length})`);
          } else {
            lines.push(`  - ${display}: no one attending`);
          }
        });
      }
      if (payload.allergies) lines.push(`Allergies / food notes: ${payload.allergies}`);
    }
    if (payload.email) lines.push(`Email: ${payload.email}`);
    if (payload.phone) lines.push(`Phone: ${payload.phone}`);
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
