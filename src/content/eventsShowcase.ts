// Single source of truth for the Events Showcase section
// Focused on event categories we handle, platform capabilities, and service areas

export const EVENT_SHOWCASE_TITLE = "Events we plan & produce";

export const EVENT_SHOWCASE_SUBTITLE =
  "From private parties to full‑scale productions, we handle it all—planning, vendors, venues, logistics, and guest experience.";

// Event categories we support - prioritized for corporate focus (educational, not mock data)
export const EVENT_CATEGORIES: { key: string; name: string; blurb: string; badge?: string; hidden?: boolean }[] = [
  // TIER 1: Daily recurring revenue
  { key: "daily-office-meals", name: "Daily Office Meals & Recurring Programs", blurb: "Automated ordering, dietary tracking, budget management, NET-30 billing", badge: "Most Popular" },
  
  // TIER 2: High-value corporate
  { key: "corporate-offsites", name: "Company Offsites & Team Retreats", blurb: "Multi-day events with venues, meals, activities, and logistics", badge: "Enterprise" },
  { key: "conferences", name: "Conferences & Business Summits", blurb: "200-2000+ attendees, full production, ticketing, sponsor coordination", badge: "Enterprise" },
  
  // TIER 3: Premium one-time
  { key: "galas-fundraisers", name: "Galas & Fundraisers", blurb: "Premium venues, run of show, ticket tiers, donor engagement" },
  { key: "concerts-festivals", name: "Concerts & Festivals", blurb: "Full production: staging, lighting, sound, security, crowd flow" },
  
  // TIER 4: Lower priority (show all in listings, but below corporate)
  { key: "weddings", name: "Weddings & Receptions", blurb: "Catering, venues, rentals, day‑of coordination, guest comms" },
  { key: "yacht-parties", name: "Yacht & Waterfront Events", blurb: "Permits, charters, catering, bar, music, and guest logistics" },
  { key: "private-parties", name: "Private Parties & Birthdays", blurb: "Self‑service or full‑service: food, rentals, staffing, cleanup" },
];

// Platform capabilities we provide end‑to‑end
export const PLATFORM_FEATURES: { key: string; name: string; details: string }[] = [
  { key: "ticketing", name: "Ticket sales, RSVPs & guest lists", details: "Invite guests, track responses, issue tickets, and manage tiers." },
  { key: "guest-comms", name: "Guest communications", details: "Automated updates, reminders, and announcements via email/SMS." },
  { key: "vendor-hiring", name: "Vendor hiring & contracting", details: "Source, compare, and book vetted vendors across categories." },
  { key: "full-production", name: "Full‑scale production", details: "Stages, lighting, AV, seating, security, and onsite management." },
  { key: "logistics", name: "Logistics: valet & shuttles", details: "Parking operations, valet teams, shuttle routes, and scheduling." },
];

// Primary service area for launch: San Francisco Bay Area & nearby
export const SERVICE_AREAS_BAY_AREA = {
  region: "Northern California",
  primary: "San Francisco Bay Area",
  cities: [
    "San Francisco",
    "Oakland",
    "San Jose",
    "Berkeley",
    "Palo Alto",
    "Mountain View",
    "Sunnyvale",
    "Santa Clara",
    "Fremont",
    "San Mateo",
    "Redwood City",
    "Menlo Park",
    "Cupertino",
    "Walnut Creek",
    "Pleasanton",
    "Livermore",
    "San Rafael",
  ],
  surroundingAreas: [
    "Marin County",
    "Napa Valley",
    "Sonoma County",
    "Peninsula",
    "South Bay",
    "East Bay",
  ],
};

// JSON‑LD for services with geographic coverage
export function getEventServicesJsonLd(baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Event planning, production, and marketplace platform",
    provider: {
      "@type": "Organization",
      name: "CaterDirectly",
      url: baseUrl,
    },
    areaServed: [
      {
        "@type": "AdministrativeArea",
        name: `${SERVICE_AREAS_BAY_AREA.primary}, ${SERVICE_AREAS_BAY_AREA.region}`,
      },
      ...SERVICE_AREAS_BAY_AREA.cities.map((city) => ({
        "@type": "City",
        name: city,
        address: {
          "@type": "PostalAddress",
          addressRegion: "CA",
          addressCountry: "US",
        },
      })),
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Event services we provide",
      itemListElement: EVENT_CATEGORIES.map((c) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: c.name,
          description: c.blurb,
        },
      })),
    },
  };
}
