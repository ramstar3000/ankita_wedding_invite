// Edit this file to fill in your wedding details. Everything below is a placeholder.
// This file is public (repo is public on GitHub) — only put info here you are happy to share.

window.WEDDING_CONFIG = {
  couple: {
    name1: "Ankita",
    name2: "Shyam"
  },
  date: "Wednesday 18 – Friday 20 November 2026",
  venue: {
    name: "Sambrama by Swanlines",
    address: "No 107 & 108, Thittahalli Rd, Kaggalipura, Bengaluru, Karnataka 560082",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Sambrama+by+Swanlines+Kaggalipura+Bengaluru"
  },

  // Path or URL to the invitation card PDF. When set, a 'View your invitation'
  // button appears on the cover page. Drop your file at ./assets/invitation.pdf
  // and uncomment the line below.
  invitationPdf: "",
  // invitationPdf: "./assets/invitation.pdf",


  // Up to 4 sub-events. Add/remove freely — pages 4 & 5 adapt.
  events: [
    { id: "e1", name: "Welcome evening",             date: "Wed 18 Nov", time: "from afternoon", venue: "Sambrama by Swanlines" },
    { id: "e2", name: "Haldi & day rituals",         date: "Thu 19 Nov", time: "morning",        venue: "Sambrama by Swanlines" },
    { id: "e3", name: "Baarat, welcome & reception", date: "Thu 19 Nov", time: "evening",        venue: "Sambrama by Swanlines" },
    { id: "e4", name: "Wedding ceremony",            date: "Fri 20 Nov", time: "early morning",  venue: "Sambrama by Swanlines" }
  ],

  // One entry per meal served. Link each to an event via eventId so page 5
  // only shows meals for events the guest is attending.
  foodEvents: [
    { id: "f1", eventId: "e1", label: "Wed dinner",            options: ["Veg", "Jain", "No meal"] },
    { id: "f2", eventId: "e2", label: "Thu breakfast",         options: ["Veg", "Jain", "No meal"] },
    { id: "f3", eventId: "e2", label: "Thu lunch",             options: ["Veg", "Jain", "No meal"] },
    { id: "f4", eventId: "e3", label: "Thu reception dinner",  options: ["Veg", "Jain", "No meal"] },
    { id: "f5", eventId: "e4", label: "Fri breakfast",         options: ["Veg", "Jain", "No meal"] },
    { id: "f6", eventId: "e4", label: "Fri lunch",             options: ["Veg", "Jain", "No meal"] }
  ],

  accommodation: {
    description: "We have a block of rooms at the venue hotel. Let us know if you need one.",
    options: ["Need a room (please arrange)", "Self-arranged", "Local — not needed"]
  },

  gifts: {
    message: "Your presence is the best present. If you'd still like to give something, options below.",
    registryLinks: [
      // { label: "John Lewis registry", url: "https://..." }
    ],
    bankDetails: ""
  },

  rsvp: {
    // Paste a Formspree / Netlify Forms / Google Apps Script URL here when ready.
    // Leave blank to use the mailto: fallback below.
    endpoint: "https://script.google.com/macros/s/AKfycbyNrojWeAjwX3EIVjekhBWmr0R36LrOBDJhCDY6w85-VotAz4aARknxKOQJggAh05Vi/exec",
    mailtoAddress: "you@example.com"
  }
};
