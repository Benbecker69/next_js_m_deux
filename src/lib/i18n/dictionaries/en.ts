import type { Dictionary } from "./fr";

/**
 * `satisfies Dictionary` checks this has exactly fr.ts's shape — every
 * section and key present, nothing extra — without forcing en's own string
 * values to match fr's (Dictionary's leaves are widened to `string`; see
 * the comment on it in fr.ts).
 */
export const en = {
  common: {
    login: "Log in",
    bookSpace: "Book a space",
    logout: "Log out",
    backToHome: "Back to home",
    seeLocations: "See locations",
    skipToContent: "Skip to content",
    siteTitle: "Repère — book your coworking space",
    siteDescription: "Repère, the platform to find and book a coworking space near you.",
  },
  nav: {
    features: "Features",
    pricing: "Pricing",
    locations: "Locations",
    mobileVision: "Mobile vision",
    faq: "FAQ",
  },
  footer: {
    tagline: "Find and book a coworking space near you.",
    copyright: "© 2026 Repère. All rights reserved.",
  },
  home: {
    heroTitle: "A desk, not an address to guess at.",
    heroSubtitle:
      "Repère lists coworking spaces all across France and lets you book a desk, a room, or a flex seat for the day, in a few clicks.",
    howItWorks: "How it works",
    steps: [
      {
        title: "Search",
        description: "Filter locations by city, space type, and today's availability.",
      },
      {
        title: "Book",
        description:
          "Pick a time slot: the space is blocked instantly, no surprise once you get there.",
      },
      {
        title: "Work",
        description: "Show up at the front desk — your booking is already confirmed.",
      },
    ],
    loungeAlt: "A bright coworking lounge, with plants and armchairs.",
    featuredTitle: "A few locations",
    seeAll: "See all",
    finalTitle: "Your desk for the day, booked in under two minutes.",
    createAccount: "Create an account",
  },
  features: {
    title: "Features",
    subtitle:
      "From finding a desk to managing a location, here's what Repère can do today.",
    items: [
      {
        title: "Search and booking",
        description:
          "Filter locations by city, space type, and availability. Sort by distance using your browser's location. A booked slot is blocked instantly.",
      },
      {
        title: "Dashboard and history",
        description:
          "Your upcoming and past bookings, your remaining credits, and one-click cancellation as long as the slot hasn't started yet.",
      },
      {
        title: "Back office for locations",
        description:
          "Every listed location has its own management space: availability, bookings, users, occupancy stats.",
      },
      {
        title: "Built for mobile",
        description:
          "A mobile app is in the works: an NFC badge for entering locations, real-time geolocation to find a free space nearby.",
      },
    ],
  },
  pricing: {
    title: "Pricing",
    subtitle:
      "Repère runs on credits. Every booking spends credits based on the space type and its duration — no subscription required.",
    costByType: "Cost by space type",
    spaces: [
      {
        type: "Flex seat",
        price: "4 credits / hour",
        detail: "One desk among others, in the shared space.",
      },
      {
        type: "Phone booth",
        price: "3 credits / hour",
        detail: "Soundproofed booth for a call or a video meeting.",
      },
      {
        type: "Private office",
        price: "8 to 9 credits / hour",
        detail: "An enclosed office, for one person.",
      },
      {
        type: "Meeting room",
        price: "17 to 22 credits / hour",
        detail: "4 to 6 people depending on the location.",
      },
    ],
    howToGetCredits: "How to get credits",
    packs: [
      {
        name: "Pay as you go",
        credits: "Credits bought one at a time",
        price: "1 credit = €1",
      },
      { name: "100 pack", credits: "100 credits, valid for 6 months", price: "€90" },
      {
        name: "Monthly subscription",
        credits: "150 credits renewed every month",
        price: "€120 / month",
      },
    ],
  },
  faq: {
    title: "Frequently asked questions",
    metaDescription:
      "Frequently asked questions about Repère: credits, cancellations, partner locations.",
    questions: [
      {
        question: "How do credits work?",
        answer:
          "Every booking spends a number of credits based on the space type and duration. You can buy credits one at a time or through a monthly subscription — see the Pricing page.",
      },
      {
        question: "Can I cancel a booking?",
        answer:
          "Yes, as long as the slot hasn't started yet, from your booking history. Credits are refunded automatically.",
      },
      {
        question: "Are the locations verified?",
        answer:
          "Every location is added manually by the Repère team after a visit, before going live on the platform.",
      },
      {
        question: "Is there a mobile app?",
        answer:
          "An app is in the works. It will use NFC to access locations and geolocation to find a nearby free space — not just a copy of the website.",
      },
      {
        question: "How do I list my location on Repère?",
        answer:
          "Message us from your account once you've signed up: we organize a visit before anything goes live.",
      },
      {
        question: "Is my data protected?",
        answer:
          "Your account information and bookings are only visible to you and to the administrators of the relevant location.",
      },
    ],
  },
  locations: {
    title: "Locations",
    metaDescription: "Every coworking space listed by Repère, city by city.",
    subtitle: "locations listed so far, added one by one after a visit.",
    startingFrom: "Starting from",
    perHour: "credits / hour",
    backToAll: "← All locations",
    availableSpaces: "Available spaces",
    amenities: "Amenities",
    bookHere: "Book a space here",
  },
  visionMobile: {
    metaDescription:
      "What the Repère mobile app will enable: an NFC badge to enter locations, and real-time geolocation to find a free space.",
    badge: "In the works",
    title: "The mobile app, designed before it's built.",
    subtitle:
      "Two uses are planned for the Repère mobile app: badging in at a location's entrance, and finding the nearest free space in real time. Here's how it will work.",
    nfcTitle: "NFC badge at the entrance",
    nfcDescription:
      "A simple tap of your phone on the location's reader confirms your booking and unlocks access — no need to show anything at the front desk.",
    geoTitle: "Free spaces around you",
    geoDescription:
      "Once inside, the app locates desks and offices still available in real time, rather than a fixed list per floor.",
    comparisonTitle: "What already exists, what's still to be built",
    todayTitle: "Already real, in the browser",
    todayDescription:
      'The "near me" sort on the booking page uses your real GPS position (the browser\'s Geolocation API) to rank locations by distance. No mockup: the distance calculation actually runs.',
    tomorrowTitle: "In the works, on the mobile app side",
    tomorrowDescription:
      "The NFC badge at a location's entrance and continuous position tracking require an installed native or PWA app, with hardware access to the phone's NFC reader. This page lays out the principle; the integration will come in a later phase of the project.",
    exploreCta: "See locations now",
  },
  auth: {
    loginTitle: "Log in",
    loginSubtitle: "Access your Repère account.",
    email: "Email",
    password: "Password",
    loginCta: "Log in",
    loginPending: "Logging in…",
    noAccount: "No account yet?",
    signupLink: "Create an account",
    registerTitle: "Create an account",
    registerSubtitle: "20 free credits to get you started.",
    name: "Name",
    registerCta: "Create an account",
    registerPending: "Creating…",
    hasAccount: "Already have an account?",
    loginLink: "Log in",
  },
  errors: {
    notFoundMetaTitle: "Page not found",
    notFoundCode: "404",
    notFoundTitle: "This landmark doesn't exist.",
    notFoundBody:
      "The page you're looking for is gone, or never existed. Check the address, or head back to familiar ground.",
    errorLabel: "Error",
    errorTitle: "Something went wrong.",
    errorBody: "This page couldn't display properly. You can retry, or go back home.",
    retry: "Retry",
    forbiddenMetaTitle: "Access denied",
    forbiddenCode: "403",
    forbiddenTitle: "Access denied.",
    forbiddenBody:
      "This page is reserved for administrators. If you think this is a mistake, contact an administrator at your organization.",
    goToDashboard: "Go to my dashboard",
  },
} as const satisfies Dictionary;
