// Hash-based step router. Each step is a <section data-step="..."> in index.html.
// Guards bounce users back if they jump to a step whose prerequisites are unmet.

(function () {
  const STEPS = ["cover", "rsvp", "scope", "events", "food", "accommodation", "thanks", "gift", "results"];
  const DEFAULT_STEP = "cover";

  function currentStep() {
    const raw = (location.hash || "").replace(/^#/, "");
    return STEPS.includes(raw) ? raw : DEFAULT_STEP;
  }

  function guard(step) {
    const s = window.RSVP.state;
    switch (step) {
      case "scope":
        if (s.attending !== true) return "rsvp";
        return step;
      case "events":
        if (s.attending !== true || s.scope !== "part") return "rsvp";
        return step;
      case "food": {
        if (s.attending !== true) return "rsvp";
        // Need either whole-event scope OR at least one selected event.
        if (s.scope === "part" && s.selectedEventIds.length === 0) return "events";
        if (s.scope !== "whole" && s.scope !== "part") return "scope";
        return step;
      }
      case "accommodation":
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
    // Let listeners know which step is now active (main.js refreshes dynamic UI).
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

  window.ROUTER = { go, currentStep };
})();
