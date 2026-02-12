
import { useCallback } from "react";
import { Event } from "@/types/order";

export const useEventStats = (events: Event[]) => {
  // Calculate event stats
  const getEventStats = useCallback((eventId: string) => {
    const event = events.find(e => e.id === eventId);
    
    if (!event) {
      return {
        totalGuests: 0,
        confirmedGuests: 0,
        pendingGuests: 0,
        declinedGuests: 0,
        responseRate: 0
      };
    }
    
    const totalGuests = event.guests.length;
    const confirmedGuests = event.guests.filter(g => g.rsvpStatus === 'confirmed').length;
    const pendingGuests = event.guests.filter(g => g.rsvpStatus === 'pending').length;
    const declinedGuests = event.guests.filter(g => g.rsvpStatus === 'declined').length;
    const responseRate = totalGuests > 0 
      ? Math.round(((confirmedGuests + declinedGuests) / totalGuests) * 100) 
      : 0;
    
    // Add ticket sales stats if the event is ticketed
    if (event.isTicketed && event.ticketTypes) {
      const totalTickets = event.ticketTypes.reduce((acc, ticket) => acc + (ticket.quantity || 0), 0);
      const soldTickets = event.ticketTypes.reduce((acc, ticket) => acc + (ticket.sold || 0), 0);
      const totalRevenue = event.ticketTypes.reduce(
        (acc, ticket) => acc + ((ticket.sold || 0) * ticket.price), 
        0
      );
      
      return {
        totalGuests,
        confirmedGuests,
        pendingGuests,
        declinedGuests,
        responseRate,
        totalTickets,
        soldTickets,
        ticketSalesRate: totalTickets > 0 ? Math.round((soldTickets / totalTickets) * 100) : 0,
        totalRevenue
      };
    }
    
    return {
      totalGuests,
      confirmedGuests,
      pendingGuests,
      declinedGuests,
      responseRate
    };
  }, [events]);

  return { getEventStats };
};
