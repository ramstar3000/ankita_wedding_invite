// Hash-based step router. Each step is a <section data-step="..."> in index.html.
// The 'event' step is dynamic — state.currentEventIndex selects which cfg.events
// entry it renders. Guards bounce users back if they jump to a step whose
// prerequisites are unmet.

(function () {
  const STEPS = ["cover", "rsvp", "event", "notes", "thanks", "gift", "results", "travel"];
  const DEFAULT_STEP = "cover";

  function currentStep() {
    const raw = (location.hash || "").replace(/^#/, "");
    return STEPS.includes(raw) ? raw : DEFAULT_STEP;
  }

  function eventCount() {
    return ((window.WEDDING_CONFIG || {}).events || []).length;
  }

  function guard(step) {
    const s = window.RSVP.state;
    switch (step) {
      case "event":
        if (s.attending !== true) return "rsvp";
        // Clamp index into range; if it overflowed, push to notes.
        if (s.currentEventIndex >= eventCount()) return "notes";
        if (s.currentEventIndex < 0) {
          window.RSVP.set({ currentEventIndex: 0 });
        }
        return step;
      case "notes":
        if (s.attending !== true) return "rsvp";
        return step;
      case "thanks":
        if (!s.submittedAt) return "rsvp";
        return step;
      default:
        return step;
    }
  }

  function render() {
    const target = guard(currentStep());
    if (target !== currentStep()) {
      location.hash = "#" + target;
      return; // hashchange will re-fire render
    }
    document.querySelectorAll("section[data-step]").forEach((el) => {
      el.hidden = el.dataset.step !== target;
    });
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
    window.dispatchEvent(new CustomEvent("rsvp:step", { detail: target }));
  }

  function go(step) {
    if (!STEPS.includes(step)) return;
    if (("#" + step) === location.hash) {
      render();
    } else {
      location.hash = "#" + step;
    }
  }

  window.addEventListener("hashchange", render);
  window.addEventListener("DOMContentLoaded", render);

  window.ROUTER = { go, currentStep, render };
})();
