
import React from 'react';
import { Award, Flag, Star } from 'lucide-react';

// Performance data
export const performanceData = [
  { month: 'Jan', orders: 8, completed: 8, rating: 4.8 },
  { month: 'Feb', orders: 10, completed: 10, rating: 4.7 },
  { month: 'Mar', orders: 12, completed: 11, rating: 4.9 },
  { month: 'Apr', orders: 16, completed: 16, rating: 4.8 },
  { month: 'May', orders: 20, completed: 19, rating: 4.9 },
  { month: 'Jun', orders: 18, completed: 17, rating: 4.8 },
  { month: 'Jul', orders: 24, completed: 23, rating: 4.9 },
  { month: 'Aug', orders: 28, completed: 28, rating: 5.0 },
  { month: 'Sep', orders: 25, completed: 24, rating: 4.9 },
  { month: 'Oct', orders: 32, completed: 31, rating: 4.9 },
  { month: 'Nov', orders: 30, completed: 30, rating: 5.0 },
  { month: 'Dec', orders: 38, completed: 37, rating: 4.9 }
];

// Customer data
export const customerData = [
  { category: 'Corporate', value: 45 },
  { category: 'Private Parties', value: 28 },
  { category: 'Weddings', value: 17 },
  { category: 'Other Events', value: 10 }
];

// Review type
export interface Review {
  id: string;
  customer: string;
  event: string;
  date: string;
  rating: number;
  comment: string;
}

// Recent reviews
export const reviews: Review[] = [
  { 
    id: '1', 
    customer: 'Emily Chen', 
    event: 'Corporate Meeting', 
    date: '2025-04-18', 
    rating: 5, 
    comment: 'The staff was incredibly professional and attentive. They really made our corporate event special!' 
  },
  { 
    id: '2', 
    customer: 'Michael Scott', 
    event: 'Birthday Party', 
    date: '2025-04-15', 
    rating: 5, 
    comment: 'Great service! The bartender was amazing and everyone loved the drinks.' 
  },
  { 
    id: '3', 
    customer: 'Jessica Brown', 
    event: 'Wedding Reception', 
    date: '2025-04-10', 
    rating: 4, 
    comment: 'Overall good service. Staff arrived on time and were very helpful. Would use again.' 
  },
  { 
    id: '4', 
    customer: 'David Johnson', 
    event: 'Product Launch', 
    date: '2025-04-05', 
    rating: 5, 
    comment: 'Exceptional service! The staff was professional, well-presented, and handled our high-profile guests perfectly.' 
  }
];

// Benchmark type
export interface Benchmark {
  metric: string;
  value: string;
  benchmark: string;
  above: boolean;
  difference: string;
}

// Benchmark comparison 
export const benchmarks: Benchmark[] = [
  { metric: 'Avg. Order Value', value: '$525', benchmark: '$450', above: true, difference: '+16.7%' },
  { metric: 'Response Time', value: '1.2h', benchmark: '2.4h', above: true, difference: '-50%' },
  { metric: 'Acceptance Rate', value: '96%', benchmark: '89%', above: true, difference: '+7.9%' },
  { metric: 'Rating', value: '4.9', benchmark: '4.6', above: true, difference: '+6.5%' },
  { metric: 'Repeat Customers', value: '65%', benchmark: '42%', above: true, difference: '+54.8%' }
];

// Badge type with icon as string identifier instead of JSX
export interface Badge {
  id: string;
  name: string;
  iconName: 'award' | 'flag' | 'star';  // Using string identifiers instead of JSX
  description: string;
  progress: number;
  achieved: boolean;
}

// Badge progress
export const badges: Badge[] = [
  { 
    id: '1',
    name: 'Premier Provider',
    iconName: 'award',
    description: 'Maintain a 4.8+ rating with 95% on-time performance',
    progress: 95,
    achieved: true
  },
  { 
    id: '2',
    name: 'Reliability Champion',
    iconName: 'flag',
    description: 'Complete 50+ bookings with 100% fulfillment rate',
    progress: 80,
    achieved: false
  },
  { 
    id: '3',
    name: 'Client Favorite',
    iconName: 'star',
    description: 'Receive 25+ five-star reviews',
    progress: 68,
    achieved: false
  }
];

// Helper function to get the actual icon component based on name
export const getIconByName = (iconName: Badge['iconName']) => {
  switch (iconName) {
    case 'award':
      return Award;
    case 'flag':
      return Flag;
    case 'star':
      return Star;
    default:
      return Award;
  }
};
