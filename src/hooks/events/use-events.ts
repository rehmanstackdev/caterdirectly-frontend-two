import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Event, EventGuest } from "@/types/order";
import { EventsAPI } from "@/api/events";
import { useAuth } from "@/contexts/auth";
import { useEventMutations } from "./use-event-mutations";

export type EventTabType = "upcoming" | "past" | "draft";

export const useEvents = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<EventTabType>("upcoming");
  const {
    updateEventMutation,
    deleteEventMutation,
    addGuestMutation,
    sendRemindersMutation,
    isUpdatingEvent,
    isDeletingEvent,
    isAddingGuest,
    isSendingReminders,
  } = useEventMutations();

  const {
    data: events = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["events", user?.id],
    queryFn: () => EventsAPI.getEvents(user?.id),
    enabled: !!user?.id,
  });

  const filteredEvents = useMemo(() => {
    if (!Array.isArray(events)) return [];

    switch (activeTab) {
      case "upcoming":
        return events.filter((event) => (event as any).category === "upcoming");
      case "past":
        return events.filter((event) => (event as any).category === "past");
      case "draft":
        return events.filter((event) => event.status === "draft");
      default:
        return events;
    }
  }, [events, activeTab]);

  const updateEvent = async (eventId: string, updates: Partial<Event>) => {
    return updateEventMutation.mutateAsync({ eventId, updates });
  };

  const deleteEvent = async (eventId: string) => {
    return deleteEventMutation.mutateAsync(eventId);
  };

  const addGuest = async (
    eventId: string,
    guest: Pick<EventGuest, "id" | "name" | "email" | "rsvpStatus">,
  ) => {
    return addGuestMutation.mutateAsync({ eventId, guest });
  };

  const sendReminders = async (eventId: string) => {
    return sendRemindersMutation.mutateAsync(eventId);
  };

  return {
    events: events || [],
    filteredEvents,
    activeTab,
    setActiveTab,
    isLoading,
    error,
    updateEvent,
    deleteEvent,
    addGuest,
    sendReminders,
    isUpdatingEvent,
    isDeletingEvent,
    isAddingGuest,
    isSendingReminders,
  };
};
