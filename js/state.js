// Single source of truth for the guest's answers. Persisted to sessionStorage
// so a mid-flow refresh doesn't wipe progress, but cleared when the tab closes.

(function () {
  const KEY = "ankita_wedding_rsvp_state_v2";

  const DEFAULTS = {
    name: "",
    side: null,             // "bride" | "groom" | null
    partySize: 1,           // total people incl. the lead guest
    partyNames: [],         // names of the additional people (length = partySize - 1)
    attending: null,        // true | false | null
    currentEventIndex: 0,   // which cfg.events[i] the event step is showing
    eventAttendees: {},     // { [eventId]: number[] }  party-member indices attending (0 = lead, 1+ = additional)
    eventCounts: {},        // legacy — derived from eventAttendees at submit time, kept for back-compat
    allergies: "",          // free-text allergies / additional food needs
    email: "",              // contact email for RSVP summary
    phone: "",              // optional phone
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
    Object.assign(state, DEFAULTS, { eventAttendees: {}, eventCounts: {}, partyNames: [] });
    try { sessionStorage.removeItem(KEY); } catch (e) {}
  }

  window.RSVP = { state, set, reset, save };
})();
