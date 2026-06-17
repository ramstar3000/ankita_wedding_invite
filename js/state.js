// Single source of truth for the guest's answers. Persisted to sessionStorage
// so a mid-flow refresh doesn't wipe progress, but cleared when the tab closes.

(function () {
  const KEY = "ankita_wedding_rsvp_state_v1";

  const DEFAULTS = {
    name: "",
    side: null,             // "bride" | "groom" | null
    partySize: 1,           // total people incl. the lead guest
    partyNames: [],         // names of the additional people (length = partySize - 1)
    attending: null,        // true | false | null
    scope: null,            // "whole" | "part" | null
    selectedEventIds: [],   // string[]
    foodChoices: {},        // { [foodId]: optionString }
    accommodation: null,    // string | null
    notes: "",
    submittedAt: null
  };

  function load() {
    try {
      const raw = sessionStorage.getItem(KEY);
      if (!raw) return { ...DEFAULTS };
      return { ...DEFAULTS, ...JSON.parse(raw) };
    } catch (e) {
      return { ...DEFAULTS };
    }
  }

  const state = load();

  function save() {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      // sessionStorage full or disabled — fine, state still lives in memory.
    }
  }

  function set(patch) {
    Object.assign(state, patch);
    save();
  }

  function reset() {
    Object.assign(state, DEFAULTS, { selectedEventIds: [], foodChoices: {} });
    try { sessionStorage.removeItem(KEY); } catch (e) {}
  }

  window.RSVP = { state, set, reset, save };
})();
