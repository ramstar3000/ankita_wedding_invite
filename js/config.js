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
    { id: "e1", name: "Welcome evening",             date: "Wed 18 Nov", time: "from afternoon", venue: "Sambrama"},
    { id: "e2", name: "Haldi & day rituals",         date: "Thu 19 Nov", time: "morning",        venue: "Sambrama"},
    { id: "e3", name: "Baarat, welcome & reception", date: "Thu 19 Nov", time: "evening",        venue: "Sambrama"},
    { id: "e4", name: "Wedding ceremony",            date: "Fri 20 Nov", time: "early morning",  venue: "Sambrama"}
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
    description:
      "Sambrama has a block of on-site rooms and two villas held for our wedding guests, " +
      "all en-suite and a short walk from where the events happen. Let us know your " +
      "preference and we'll do our best to allocate before the date.",
    options: [
      "On-site room at Sambrama (please arrange)",
      "On-site villa share at Sambrama (please arrange)",
      "Self-arranged hotel nearby",
      "Staying locally with family",
      "Day visitor only — no overnight needed"
    ]
  },

  gifts: {
    message:
      "Your presence at the wedding is more than enough. If you'd still like to mark " +
      "the occasion with a gift, a few options below — please don't feel obliged.",
    registryLinks: [
      { label: "Amazon UK wishlist (TBC)",    url: "https://www.amazon.co.uk/" },
      { label: "Amazon India wishlist (TBC)", url: "https://www.amazon.in/" }
    ],
    bankDetails:
      "UPI ID:  ankita-shyam@TBC\n" +
      "Bank transfer (India):\n" +
      "  Account name:   TBC\n" +
      "  Account number: TBC\n" +
      "  IFSC:           TBC\n" +
      "International transfer (UK):\n" +
      "  Account name:   TBC\n" +
      "  Sort code:      TBC\n" +
      "  Account number: TBC"
  },

  travel: {
    airport: {
      name: "Kempegowda International Airport (BLR), Bengaluru",
      note: "About 50 km / 90 minutes by road from Sambrama — south of the city, on Kanakapura Road."
    },
    arrival: {
      suggested: "Arrive into Bengaluru on or before Wednesday 18 November, in time for the welcome evening at Sambrama from the afternoon onwards.",
      departure: "Most events wrap up by Friday afternoon (20 November), so any flights out from Friday evening onwards work."
    },
    transport: [
      {
        label: "Pre-arranged airport transfer",
        description:
          "We can help coordinate a car from BLR airport to Sambrama, especially for guests arriving together. " +
          "Reply on your RSVP with your flight details and we'll match you up."
      },
      {
        label: "Ola / Uber",
        description:
          "Both apps work well in Bengaluru. Allow roughly ₹2,000–₹2,500 and 2 hours including traffic. " +
          "Ride-share availability at Sambrama itself is patchier — better to pre-book the return."
      },
      {
        label: "Self-drive",
        description:
          "Sambrama has on-site parking for 250 cars. The Google Maps link on the cover takes you to the venue gate."
      }
    ],
    visa: {
      heading: "Visa for overseas guests",
      body:
        "Most nationalities can apply online for the Indian e-Visa — it's quick (typically a few business days) " +
        "and covers tourist travel. Apply about a month before you fly. UK, US, EU, Australia, Singapore and many " +
        "others are eligible. Check indianvisaonline.gov.in for the latest."
    },
    notes: "Closer to the date we'll share a single 'on the day' info sheet with venue directions, who-to-call numbers and a packing list."
  },

  rsvp: {
    // Paste a Formspree / Netlify Forms / Google Apps Script URL here when ready.
    // Leave blank to use the mailto: fallback below.
    endpoint: "https://script.google.com/macros/s/AKfycbyNrojWeAjwX3EIVjekhBWmr0R36LrOBDJhCDY6w85-VotAz4aARknxKOQJggAh05Vi/exec",
    mailtoAddress: "you@example.com"
  }
};
