import { Users, Shield, Building, HeartHandshake } from "lucide-react";

export const CONCIERGE_SERVICE = {
  icon: HeartHandshake,
  headline: "Your Dedicated Event Team — We Handle Everything",
  subheading: "From vendor sourcing to day-of coordination, we manage every detail so you don't have to.",
  benefits: [
    "One point of contact for all your event needs",
    "Expert coordination across catering, venues, staff, and rentals",
    "48-hour average response time for quotes and bookings",
    "Single invoice, NET-30 terms, PO support included"
  ]
};

export const BEFORE_AFTER_SCENARIOS = {
  before: {
    badge: "The Old Way",
    title: "Juggling Multiple Platforms",
    items: [
      "3 separate platforms to manage",
      "12+ email threads per event",
      "2-week planning cycles",
      "3 invoices to reconcile"
    ]
  },
  after: {
    badge: "With Cater Directly",
    title: "Single Platform Coordination",
    items: [
      "One conversation with your coordinator",
      "48-hour average turnaround",
      "Real-time vendor coordination",
      "Single invoice for all services"
    ]
  }
};

export const CORPORATE_VALUE_PROPS = [
  {
    icon: Users,
    title: "Cross-Vendor Coordination",
    description: "Your dedicated coordinator manages caterers, venues, staff & rentals",
    features: [
      "NET-30 billing terms",
      "Single consolidated invoice",
      "PO support & tracking"
    ]
  },
  {
    icon: Shield,
    title: "Vetted Marketplace",
    description: "Access pre-screened vendors with verified credentials",
    features: [
      "Professional staffing agencies (not gig workers)",
      "Background-checked staff",
      "Insurance certificates on file"
    ]
  },
  {
    icon: Building,
    title: "Enterprise Platform",
    description: "Built for corporate compliance and reporting needs",
    features: [
      "SOC 2 compliance ready",
      "SSO integration (Okta, Azure AD)",
      "Spending reports by department"
    ]
  }
];
