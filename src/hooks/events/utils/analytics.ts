
import { Event } from "@/types/order";

export const getEventStats = (events: Event[], eventId: string) => {
  const event = events.find(e => e.id === eventId);
  
  if (!event) {
    return {
      totalGuests: 0,
      confirmed: 0,
      pending: 0,
      declined: 0,
      responseRate: 0,
      revenue: 0
    };
  }
  
  const totalGuests = event.guests.length;
  const confirmed = event.guests.filter(g => g.rsvpStatus === 'confirmed').length;
  const pending = event.guests.filter(g => g.rsvpStatus === 'pending').length;
  const declined = event.guests.filter(g => g.rsvpStatus === 'declined').length;
  
  // Calculate response rate
  const responseRate = totalGuests > 0 
    ? ((confirmed + declined) / totalGuests) * 100
    : 0;
    
  // Calculate revenue if event is ticketed
  const revenue = event.isTicketed && event.guests.length > 0
    ? event.guests.reduce((total, guest) => {
        return total + (guest.ticketPrice || 0);
      }, 0)
    : 0;
    
  return {
    totalGuests,
    confirmed,
    pending,
    declined,
    responseRate,
    revenue
  };
};

export const calculateEventRevenue = (event: Event): number => {
  // Make sure to check if event is ticketed and if ticketTypes exist
  if (!event.isTicketed || !event.ticketTypes) {
    return 0;
  }

  // Calculate revenue based on ticket sales
  return event.guests
    .filter(guest => guest.rsvpStatus === 'confirmed')
    .reduce((total, guest) => {
      // Use ticketPrice if available, otherwise estimate from ticketTypes
      const price = guest.ticketPrice || 
        (guest.ticketTypeId && event.ticketTypes?.find(t => t.id === guest.ticketTypeId)?.price) || 0;
      return total + price;
    }, 0);
};
