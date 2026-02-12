/**
 * Analytics hook for tracking user events across the application
 * Supports Google Analytics 4 and custom tracking
 */
export function useAnalytics() {
  const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    // Google Analytics 4
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', eventName, properties);
    }
    
    // Log to console in development
    if (import.meta.env.DEV) {
      console.log('[Analytics]', eventName, properties);
    }
  };
  
  return { trackEvent };
}

/**
 * Common event tracking functions
 */
export const AnalyticsEvents = {
  // Hero Section
  heroCTAClick: (ctaText: string) => ({
    event: 'hero_cta_click',
    properties: { cta_text: ctaText }
  }),
  
  // Marketplace
  marketplaceFilter: (category: string, city?: string) => ({
    event: 'marketplace_filter',
    properties: { category, city }
  }),
  
  // Quote Request
  quoteRequestStarted: (eventType: string) => ({
    event: 'quote_request_started',
    properties: { event_type: eventType }
  }),
  
  quoteRequestCompleted: (eventType: string, guestCount: number, budgetRange?: string) => ({
    event: 'quote_request_completed',
    properties: { event_type: eventType, guest_count: guestCount, budget_range: budgetRange }
  }),
  
  // Booking
  bookingInitiated: (cartValue: number) => ({
    event: 'booking_initiated',
    properties: { cart_value: cartValue }
  }),
  
  bookingCompleted: (cartValue: number, categories: string[], paymentMethod: string) => ({
    event: 'booking_completed',
    properties: { 
      cart_value: cartValue,
      categories: categories.join(','),
      payment_method: paymentMethod
    }
  })
};
