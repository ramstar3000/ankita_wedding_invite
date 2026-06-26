// Edit this file to fill in your wedding details. Everything below is a placeholder.
// This file is public (repo is public on GitHub) — only put info here you are happy to share.

window.WEDDING_CONFIG = {
  couple: {
    name1: "Ankita",
    name2: "Shyam"
  },
  date: "Thursday 19 – Friday 20 November 2026",
  rsvpBy: "Kindly RSVP by 8 November 2026",
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
    // Single payment method — shown when the guest opens the gift-fund details.
    bankDetails:
      "Account name:    Ankita Vinjamuri\n" +
      "Sort code:       23-01-63\n" +
      "Account number:  02536136\n" +
      "IBAN:            GB73REVO23016302536136\n" +
      "BIC/SWIFT code:  REVOGB21"
  },

  travel: {
    // Map link to the venue, shown prominently at the top of the page.
    mapLabel: "Open Sambrama by Swanlines in Google Maps",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Sambrama+by+Swanlines+Kaggalipura+Bengaluru",
    airport: {
      name: "Kempegowda International Airport (BLR), Bengaluru",
      note: "About 50 km / 90 minutes by road from Sambrama — south of the city, on Kanakapura Road."
    },
    station: {
      name: "KSR Bengaluru City Junction (SBC), also known as Krantivira Sangolli Rayanna",
      note: "Bengaluru's main railhead, around 35 km / 1–1.5 hours by road from Sambrama depending on traffic."
    },
    arrival: {
      suggested: "We recommend arriving in Bengaluru by Wednesday, 18 November, so you have plenty of time to settle in before the Haldi ceremony on Thursday morning.",
      departure: "The wedding festivities conclude on Friday afternoon (20 November), allowing for departures from Friday evening onwards."
    },
    transport: [
      {
        label: "Ola / Uber",
        description:
          "Both apps operate well in Bengaluru. Allow approximately 2 hours for the journey (depending on traffic), " +
          "with fares typically ranging between ₹2,000–₹2,500. As ride availability from Sambrama can be limited, " +
          "we recommend arranging your return journey in advance."
      },
      {
        label: "Metro",
        description:
          "Namma Metro's Green Line runs south down Kanakapura Road to its terminus at Silk Institute (Anjanapura). " +
          "It's a quick, traffic-free way to cross the city; from Silk Institute it's roughly 20 km (about 40 minutes) " +
          "by cab or auto to Sambrama for the final stretch."
      },
      {
        label: "Self-drive",
        description:
          "If you're driving, Sambrama has ample on-site parking for up to 250 cars. The Google Maps link on the " +
          "cover page will take you directly to the venue entrance."
      }
    ],
    visa: {
      heading: "Visa for overseas guests",
      body:
        "Most visitors can apply for an Indian e-Visa online, making the process quick and straightforward. " +
        "We recommend applying around a month before your trip, although approvals are often issued within a few business days.\n\n" +
        "Please check the official Indian e-Visa website for the latest eligibility requirements and application details.",
      linkLabel: "Official Indian e-Visa website",
      linkUrl: "https://indianvisaonline.gov.in/"
    },
    useful: {
      heading: "Useful information",
      items: [
        { label: "Time zone", value: "India Standard Time (IST), UTC +5:30 — no daylight saving. That's 5½ hours ahead of the UK in November." },
        { label: "Weather", value: "November in Bengaluru is pleasant — warm days around 27°C and cooler evenings near 16–18°C. Bring light layers for the evenings." },
        { label: "Currency", value: "Indian Rupee (₹ / INR). Cards are widely accepted in the city; carry some cash for smaller vendors and tips. ATMs are easy to find." },
        { label: "Plugs & power", value: "230V, 50Hz with Type C, D and M sockets. A universal travel adapter is the easiest option." },
        { label: "Mobile & data", value: "Local prepaid SIMs (Airtel, Jio) and eSIMs are cheap and reliable; international roaming and hotel Wi-Fi also work well." }
      ],
      linkLabel: "Official UK travel advice for India",
      linkUrl: "https://www.gov.uk/foreign-travel-advice/india"
    }
  },

  rsvp: {
    endpoint: "https://script.google.com/macros/s/AKfycbw4_BwXW5veRL9tfnB9WwP_Gs9a07ZgBADbuCF1QhdUQ4m63VKpt41j_IRODSxUmQBu/exec",
    mailtoAddress: "you@example.com"
  }
};
