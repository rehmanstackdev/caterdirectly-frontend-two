import { ReactNode } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Initialize Stripe with publishable key from environment variable
// Wrap in try-catch to handle ad blocker interference gracefully
const getStripePublishableKey = () => {
  const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  if (!key) {
    console.error('VITE_STRIPE_PUBLISHABLE_KEY is not set in environment variables');
    return null;
  }
  return key;
};

let stripePromise: Promise<any> | null = null;
try {
  const publishableKey = getStripePublishableKey();
  if (publishableKey) {
    stripePromise = loadStripe(publishableKey);
    // Handle potential errors from ad blockers
    stripePromise.catch((error) => {
      console.warn('Stripe initialization warning (may be blocked by ad blocker):', error);
    });
  }
} catch (error) {
  console.warn('Stripe initialization error (may be blocked by ad blocker):', error);
}

interface StripeProviderProps {
  children: ReactNode;
  amount?: number; // in cents
  clientSecret?: string; // Payment Intent client secret
}

const StripeProvider = ({ children, amount, clientSecret }: StripeProviderProps) => {
  const options: any = clientSecret 
    ? {
        clientSecret,
        appearance: {
          theme: 'stripe' as const,
        },
      }
    : {
        mode: 'payment' as const,
        currency: 'usd',
        amount: amount || 0, // amount in cents
        appearance: {
          theme: 'stripe' as const,
        },
      };

  // If Stripe failed to load (e.g., blocked by ad blocker), render children without Stripe
  if (!stripePromise) {
    console.warn('Stripe not available, rendering without payment elements');
    return <>{children}</>;
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
};

export default StripeProvider;