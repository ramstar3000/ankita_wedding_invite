// Edit this file to fill in your wedding details. Everything below is a placeholder.
// This file is public (repo is public on GitHub) — only put info here you are happy to share.

window.WEDDING_CONFIG = {
  couple: {
    name1: "Ankita",
    name2: "Shyam"
  },
  date: "Thursday 19 – Friday 20 November 2026",
  venue: {
    name: "Sambrama by Swanlines",
    address: "No 107 & 108, Thittahalli Rd, Kaggalipura, Bengaluru, Karnataka 560082",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Sambrama+by+Swanlines+Kaggalipura+Bengaluru"
  },

  // A&S monogram logo shown across pages. Drop your file at ./assets/logo.svg
  // (PNG also fine — update the extension). Leave blank to hide the brand band.
  logoSrc: "./assets/logo.png",

  // Invitation card images, shown in display order. When at least one is set,
  // a 'View invitation' button appears on the cover; tapping it slides a
  // viewer up from the bottom with the images as a swipeable carousel.
  // Drop the images in ./assets/ and list them here in the order to show.
  invitationImages: [
    "./assets/invite-1.jpg",
    "./assets/invite-2.jpg",
    "./assets/invite-3.jpg",
    "./assets/invite-4.jpg"
  ],

  // Pre-generated QR code SVG pointing at venue.mapUrl. Generate once with e.g.
  //   qrencode -t svg -o assets/map-qr.svg "<map url>"
  // then commit. Leave blank to hide the QR block.
  mapQrSrc: "./assets/map-qr.svg",

  // Three events at Sambrama. Each gets its own page in the RSVP flow.
  events: [
    {
      id: "haldi",
      name: "Nischayatartham & Haldi",
      date: "Thu 19 Nov",
      time: "8:00 am – 1:30 pm",
      startISO: "2026-11-19T08:00:00+05:30",
      endISO:   "2026-11-19T13:30:00+05:30",
      meals: "Breakfast and lunch",
      dressCode: "Traditional Indian wear in cheerful festive tones — bright yellows, oranges, mustard, and marigold hues.",
      description: "Join us for the Engagement and Haldi ceremonies as we seek blessings and celebrate the beginning of our wedding festivities."
    },
    {
      id: "reception",
      name: "Baraat & Reception",
      date: "Thu 19 Nov",
      time: "5:00 pm onwards",
      startISO: "2026-11-19T17:00:00+05:30",
      endISO:   "2026-11-19T23:00:00+05:30",
      meals: "Snacks and dinner",
      dressCode: "Formal, glamorous festive attire — dress to impress in your finest sarees, lehengas, sherwanis, or suits in vibrant celebratory colours.",
      description: "Celebrate with us as the groom's procession arrives, followed by an evening of music, joy, and warm wishes from family and friends."
    },
    {
      id: "wedding",
      name: "Wedding ceremony",
      date: "Fri 20 Nov",
      time: "5:00 am onwards",
      startISO: "2026-11-20T05:00:00+05:30",
      endISO:   "2026-11-20T12:00:00+05:30",
      meals: "Breakfast and lunch",
      dressCode: "Traditional South Indian attire — silk sarees, veshti/dhoti, or elegant ethnic wear in classic tones.",
      description: "Witness the sacred South Indian wedding ceremony featuring timeless rituals and countless blessings in the presence of our loved ones."
    }
  ],

  gifts: {
    message:
      "Your love, blessings, and presence at our wedding are the greatest gifts we " +
      "could ask for, and celebrating this special day with you means the world to us.\n\n" +
      "Should you still wish to bless us with a gift, we have set up a simple gift fund, " +
      "the details of which can be found below.",
    registryLinks: [],
    // GPay QR shown alongside the bank details once the guest opts in.
    // Replace assets/gpay-qr.svg with the real QR (PNG/SVG both fine), or
    // leave blank to hide the QR block.
    gpayQrSrc: "./assets/gpay-qr.svg",
    bankDetails:
      "GPay:    TBC\n" +
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
      suggested: "Arrive into Bengaluru on or before Wednesday 18 November, in time to settle before the Haldi ceremony on Thursday morning.",
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
    endpoint: "https://script.google.com/macros/s/AKfycbyNrojWeAjwX3EIVjekhBWmr0R36LrOBDJhCDY6w85-VotAz4aARknxKOQJggAh05Vi/exec",
    mailtoAddress: "you@example.com"
  }
};
