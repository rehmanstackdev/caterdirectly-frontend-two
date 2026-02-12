
import { ServiceItem } from '@/types/service-types';

export const createMockCateringService = (baseService: any): ServiceItem => ({
  ...baseService,
  service_details: {
    serviceStyles: ['buffet', 'plated'],
    minimumOrderAmount: 500,
    minGuests: 10,
    maxGuests: 200,
    leadTimeHours: 48,
    menuItems: [
      {
        id: 'menu-1',
        name: 'Grilled Chicken Caesar Salad',
        description: 'Fresh romaine lettuce with grilled chicken, parmesan cheese, and caesar dressing',
        price: 18.99,
        priceType: 'per_person',
        image: '/lovable-uploads/59be0028-eeda-4b3f-a247-d29e1e159d62.png',
        category: 'Salads',
        dietaryFlags: ['gluten_free'],
        isPopular: true
      },
      {
        id: 'menu-2',
        name: 'BBQ Pulled Pork Sandwich',
        description: 'Slow-cooked pulled pork with BBQ sauce on a brioche bun',
        price: 16.50,
        priceType: 'per_person',
        image: '/lovable-uploads/6f0a268d-6662-42bd-b118-47b7e2cc7109.png',
        category: 'Sandwiches'
      },
      {
        id: 'menu-3',
        name: 'Vegetarian Pasta Primavera',
        description: 'Fresh seasonal vegetables tossed with penne pasta in a light cream sauce',
        price: 15.99,
        priceType: 'per_person',
        image: '/lovable-uploads/98149e26-14a3-4fe6-bdf4-57ce59ab34ef.png',
        category: 'Pasta',
        dietaryFlags: ['vegetarian']
      },
      {
        id: 'menu-4',
        name: 'Chocolate Brownie Dessert',
        description: 'Rich chocolate brownie served with vanilla ice cream',
        price: 8.99,
        priceType: 'per_person',
        image: '/lovable-uploads/ddecb2bc-cb77-4f72-9fbb-29ba51e7ca47.png',
        category: 'Desserts'
      },
      {
        id: 'combo-1',
        name: 'Build Your Own Combo Meal',
        description: 'Customize your perfect meal with your choice of protein, sides, and drink',
        price: 22.99,
        priceType: 'per_person',
        image: '/lovable-uploads/e2744a28-e415-427b-b29f-d924ef943a5d.png',
        category: 'Combos',
        customizable: true,
        comboCategories: [
          {
            id: 'proteins',
            name: 'Choose Your Protein',
            description: 'Select your main protein',
            minSelections: 1,
            maxSelections: 2,
            items: [
              {
                id: 'chicken',
                name: 'Grilled Chicken Breast',
                description: 'Seasoned and grilled to perfection',
                additionalPrice: 0,
                image: '/lovable-uploads/59be0028-eeda-4b3f-a247-d29e1e159d62.png'
              },
              {
                id: 'salmon',
                name: 'Atlantic Salmon',
                description: 'Fresh grilled salmon with herbs',
                additionalPrice: 4.00,
                image: '/lovable-uploads/6d2c7650-448e-4a03-8e58-5951cfbd4818.png'
              },
              {
                id: 'beef',
                name: 'Beef Tenderloin',
                description: 'Premium cut beef tenderloin',
                additionalPrice: 6.00,
                image: '/lovable-uploads/6f0a268d-6662-42bd-b118-47b7e2cc7109.png'
              }
            ]
          },
          {
            id: 'sides',
            name: 'Choose Your Sides',
            description: 'Pick your favorite sides',
            minSelections: 1,
            maxSelections: 3,
            items: [
              {
                id: 'rice',
                name: 'Jasmine Rice',
                description: 'Fluffy jasmine rice',
                additionalPrice: 0,
                image: '/lovable-uploads/98149e26-14a3-4fe6-bdf4-57ce59ab34ef.png'
              },
              {
                id: 'vegetables',
                name: 'Seasonal Vegetables',
                description: 'Fresh seasonal mixed vegetables',
                additionalPrice: 0,
                image: '/lovable-uploads/155c9ba7-de32-4b40-acf4-97aa51f3a215.png'
              },
              {
                id: 'salad',
                name: 'Garden Salad',
                description: 'Fresh mixed greens with dressing',
                additionalPrice: 2.00,
                image: '/lovable-uploads/238ea469-c854-48b9-9c20-50303215a55c.png'
              }
            ]
          }
        ]
      }
    ],
    packagingOptions: {
      disposable: true,
      disposableFee: 2.50,
      reusable: true,
      reusableFee: 5.00
    },
    deliveryOptions: {
      delivery: true,
      pickup: true,
      deliveryRanges: [
        { range: '0-5 miles', fee: 25 },
        { range: '5-10 miles', fee: 45 }
      ],
      deliveryMinimum: 500
    }
  }
});

export const createMockPartyRentalService = (baseService: any): ServiceItem => ({
  ...baseService,
  service_details: {
    setupRequired: true,
    setupFee: 150,
    deliveryOptions: ['delivery', 'pickup'],
    availableQuantity: 50,
    minimumRentalPeriod: 4,
    rentalItems: [
      {
        id: 'rental-1',
        name: 'Round Tables (8-person)',
        description: '60-inch round tables that seat 8 guests comfortably',
        price: 12.00,
        priceType: 'per_day',
        image: '/lovable-uploads/1c6c016c-1e7b-4489-9502-1526ac81eeb8.png',
        category: 'Tables'
      },
      {
        id: 'rental-2',
        name: 'Chiavari Chairs',
        description: 'Elegant gold chiavari chairs with cushions',
        price: 4.50,
        priceType: 'per_day',
        image: '/lovable-uploads/222c480d-a37e-4db0-9030-ea80b042564e.png',
        category: 'Seating'
      },
      {
        id: 'rental-3',
        name: 'White Linens',
        description: 'Premium white tablecloths for round tables',
        price: 8.00,
        priceType: 'per_day',
        image: '/lovable-uploads/833f10c4-25ab-4c99-995b-e72f3b53521e.png',
        category: 'Linens'
      },
      {
        id: 'rental-4',
        name: 'String Lights',
        description: 'Warm white LED string lights for ambiance',
        price: 25.00,
        priceType: 'per_day',
        image: '/lovable-uploads/759e8177-e667-4af6-9a6b-5d6b17b2b0c4.png',
        category: 'Lighting'
      }
    ]
  }
});

export const createMockStaffService = (baseService: any): ServiceItem => ({
  ...baseService,
  service_details: {
    qualifications: ['ServSafe Certified', '3+ years experience'],
    minimumHours: 4,
    attire: ['formal', 'business_casual'],
    languages: ['English', 'Spanish'],
    staffServices: [
      {
        id: 'staff-1',
        name: 'Professional Server',
        description: 'Experienced server for fine dining events',
        price: 35.00,
        priceType: 'per_hour',
        image: '/lovable-uploads/98eaddf0-6879-4e9e-89a0-ae7693166d19.png',
        category: 'Service Staff'
      },
      {
        id: 'staff-2',
        name: 'Bartender',
        description: 'Licensed bartender with cocktail expertise',
        price: 45.00,
        priceType: 'per_hour',
        image: '/lovable-uploads/824855a1-bb8f-4191-a483-6c348edf8c30.png',
        category: 'Bar Staff'
      },
      {
        id: 'staff-3',
        name: 'Event Coordinator',
        description: 'On-site event coordination and management',
        price: 60.00,
        priceType: 'per_hour',
        image: '/lovable-uploads/81b4c572-b04a-41a4-863a-34998edf9f40.png',
        category: 'Management'
      }
    ]
  }
});

export const createMockVenueService = (baseService: any): ServiceItem => ({
  ...baseService,
  service_details: {
    capacity: {
      seated: 150,
      standing: 200
    },
    indoorOutdoor: 'both',
    amenities: ['Full Kitchen', 'Sound System', 'Parking', 'WiFi'],
    restrictions: ['No smoking indoors', 'Music ends at 11 PM'],
    venueOptions: [
      {
        id: 'venue-1',
        name: 'Main Ballroom',
        description: 'Elegant ballroom with crystal chandeliers',
        price: 2500,
        priceType: 'per_day',
        image: '/lovable-uploads/c340a352-e0b8-45de-8454-a1ed4919246f.png',
        category: 'Indoor Spaces'
      },
      {
        id: 'venue-2',
        name: 'Garden Terrace',
        description: 'Beautiful outdoor terrace with garden views',
        price: 1800,
        priceType: 'per_day',
        image: '/lovable-uploads/db2532af-1fbe-487c-bcef-70380b9b66d4.png',
        category: 'Outdoor Spaces'
      },
      {
        id: 'venue-3',
        name: 'Private Dining Room',
        description: 'Intimate dining space for smaller gatherings',
        price: 800,
        priceType: 'per_day',
        image: '/lovable-uploads/9da31949-b67d-473c-9690-f40b5c7cd7ba.png',
        category: 'Private Rooms'
      }
    ]
  }
});

export const enhanceServiceWithMockData = (service: any): ServiceItem => {
  const serviceType = service.serviceType || service.type;
  
  switch (serviceType) {
    case 'catering':
      return createMockCateringService(service);
    case 'party-rental':
    case 'party-rentals':
      return createMockPartyRentalService(service);
    case 'staff':
      return createMockStaffService(service);
    case 'venue':
    case 'venues':
      return createMockVenueService(service);
    default:
      return service;
  }
};
