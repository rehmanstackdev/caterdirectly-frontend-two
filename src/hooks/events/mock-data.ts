
import { Event, EventGuest } from "@/types/order";

// Mock data for events
// Pruned mock data to reduce storage quota usage
export const mockEvents: Event[] = [
  {
    id: "event-1",
    title: "Tech Conference",
    description: "Annual tech conference",
    date: new Date().toISOString(),
    startDate: new Date().toISOString(),
    endDate: new Date(new Date().getTime() + 3 * 60 * 60 * 1000).toISOString(),
    location: "Convention Center",
    venueName: "Main Hall",
    type: "Conference",
    capacity: 200,
    guests: [
      {
        id: "guest-1",
        name: "Jane Smith",
        email: "jane@example.com",
        rsvpStatus: "confirmed",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ticketType: "VIP",
        ticketTypeId: "ticket-2"
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: "published",
    isPublic: true,
    isTicketed: true,
    ticketTypes: [
      {
        id: "ticket-1",
        name: "General Admission",
        price: 5000,
        sold: 25,
      },
    ],
  },
  {
    id: "event-2",
    title: "Marketing Seminar",
    description: "Marketing strategies",
    date: new Date().toISOString(),
    startDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(new Date().getTime() + 25 * 60 * 60 * 1000).toISOString(),
    location: "Business Center",
    venueName: "Room A",
    type: "Seminar",
    capacity: 100,
    guests: [
      {
        id: "guest-3",
        name: "Alice Johnson",
        email: "alice@example.com",
        rsvpStatus: "confirmed",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ticketType: "Standard",
        ticketTypeId: "ticket-3"
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: "published",
    isPublic: true,
    isTicketed: false,
    ticketTypes: [],
  },
];
