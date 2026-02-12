export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

// Single source of truth for customer-facing FAQs
export const getCustomerFaqs = (): FaqItem[] => {
  const faqs: FaqItem[] = [
    {
      id: "pricing-transparency",
      question: "How does pricing work?",
      answer:
        "You see the exact vendor prices upfront with transparent fees added at checkout—no hidden markups or surprise charges. We show itemized pricing for catering, venues, staff, and rentals so you know exactly what you're paying for. Corporate clients can also get NET-30 billing terms."
    },
    {
      id: "service-area",
      question: "What areas do you serve?",
      answer:
        "We currently serve Northern California — including the San Francisco Bay Area, Silicon Valley, Napa & Sonoma, Sacramento, Monterey, and nearby cities. New locations are coming soon.",
    },
    {
      id: "large-events",
      question: "Do you handle large or complex events?",
      answer:
        "Yes — conferences, offsites, galas, concerts, and more. We manage vendors, AV, staging, logistics, guest experience, production, and more.",
    },
    {
      id: "lead-time",
      question: "How far in advance should we book?",
      answer:
        "For best availability in Northern California, book 2–8 weeks ahead. We can often accommodate rush requests — submit your details and we’ll confirm options quickly.",
    },
    {
      id: "work-with-venue",
      question: "Can you work with our venue or existing vendors?",
      answer:
        "Absolutely. We coordinate directly with your venue and any approved vendors to align logistics, access, load-in/load-out windows, and onsite operations.",
    },
    {
      id: "vendor-types",
      question: "What vendor categories can you provide?",
      answer:
        "Catering, bartending, staffing, rentals, decor, AV/lighting, staging, photo/video, transportation, and more — all curated for Northern California venues.",
    },
    {
      id: "pricing",
      question: "How does pricing work?",
      answer:
        "Pricing depends on headcount, menu, staffing, venue requirements, and seasonality. Share your event details and we’ll provide transparent, itemized quotes.",
    },
    {
      id: "licensed-insured",
      question: "Are your vendors licensed and insured?",
      answer:
        "We work with vetted, professional vendors who carry the appropriate licenses and insurance required by Northern California venues and municipalities.",
    },
    {
      id: "get-started",
      question: "How do we get started?",
      answer:
        "Browse top-rated options or tell us about your event — we’ll recommend the right venues and vendors for your Northern California event and coordinate everything end to end.",
    },
  ];

  return faqs;
};

export const getFaqJsonLd = (baseUrl: string) => {
  const faqs = getCustomerFaqs();
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  } as const;
};
