export const SITE_NAME = "Cater Directly";

export const HOMEPAGE_TITLE = "Corporate Catering & Office Meals | San Francisco Bay Area Event Marketplace | Cater Directly";

export const HOMEPAGE_DESCRIPTION =
  "Enterprise event planning for Bay Area businesses. Book corporate catering, venues, staff & rentals in one order. Trusted by Fortune 500 companies. Instant quotes, transparent pricing, NET-30 billing available.";

export const HERO_PARAGRAPH =
  "Your all-in-one marketplace for seamless event planning in the San Francisco Bay Area. Compare vetted vendors, see transparent pricing, and book everything you need in a single cart.";

export const OG_IMAGE = 
  "/lovable-uploads/5a0003fb-1412-482d-a6cb-4352fc398d2d.png";

export function getOrganizationJsonLd(baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: baseUrl,
    logo: baseUrl + OG_IMAGE,
    sameAs: [
      // Add your social profiles when available
    ],
  };
}

export function getWebsiteJsonLd(baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/marketplace?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function getLocalBusinessJsonLd(baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': baseUrl,
    name: SITE_NAME,
    url: baseUrl,
    logo: baseUrl + OG_IMAGE,
    description: HOMEPAGE_DESCRIPTION,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '250',
      bestRating: '5'
    },
    address: {
      '@type': 'PostalAddress',
      addressRegion: 'CA',
      addressLocality: 'San Francisco Bay Area',
      addressCountry: 'US'
    },
    areaServed: {
      '@type': 'GeoCircle',
      geoMidpoint: {
        '@type': 'GeoCoordinates',
        latitude: 37.7749,
        longitude: -122.4194
      },
      geoRadius: '50000'
    },
    priceRange: '$$',
    openingHours: 'Mo-Su 00:00-23:59',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Event Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Catering Services',
            description: 'Professional catering for events in the San Francisco Bay Area'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Venue Rentals',
            description: 'Event venues and spaces across the Bay Area'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Event Staffing',
            description: 'Professional event staff including servers, bartenders, and coordinators'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Party Rentals',
            description: 'Tables, chairs, decorations, and equipment rentals'
          }
        }
      ]
    }
  };
}

export function getBreadcrumbJsonLd(baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Marketplace',
        item: `${baseUrl}/marketplace`
      }
    ]
  };
}

export const HOMEPAGE_TYPEWRITER_PHRASES = [
  "Catering",
  "Venues",
  "Rentals",
  "Staffing"
];

// AI Event Planner Beta copy (single source of truth)
export const AI_PLANNER_BETA_TITLE = "AI Event Planner — Launching soon";
export const AI_PLANNER_BETA_SUBTITLE = "Private beta: join the waitlist";
export const AI_PLANNER_BETA_DESCRIPTION =
  "World’s first AI Event Planner with real-time access to vendors, services, locations, and availability across Cater Directly. Tell us why you’re a good fit for early access.";