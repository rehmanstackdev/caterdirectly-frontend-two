import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Event, EventGuest } from "@/types/order";
import { EventsAPI } from "@/api/events";
import { toast } from "sonner";

const getApiMessage = (value: any, fallback: string) => {
  if (Array.isArray(value)) {
    return value.join(", ");
  }

  if (typeof value === "string" && value.trim()) {
    return value;
  }

  return fallback;
};

export const useEventMutations = () => {
  const queryClient = useQueryClient();

  // Add Event Mutation
  const addEventMutation = useMutation({
    mutationFn: (event: Omit<Event, "id" | "createdAt" | "updatedAt">) =>
      EventsAPI.createEvent(event),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event created successfully!");
    },
    onError: (err) => {
      console.error("Error creating event:", err);
      toast.error("Failed to create event");
    },
  });

  // Update Event Mutation
  const updateEventMutation = useMutation({
    mutationFn: ({ eventId, updates }: { eventId: string; updates: Partial<Event> }) =>
      EventsAPI.updateEvent(eventId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event updated successfully!");
    },
    onError: (err) => {
      console.error("Error updating event:", err);
      toast.error("Failed to update event");
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: (eventId: string) => EventsAPI.deleteEvent(eventId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success(getApiMessage(response?.message, "Event cancelled successfully"));
    },
    onError: (err: any) => {
      console.error("Error deleting event:", err);
      const message = err?.response?.data?.message || err?.message;
      toast.error(getApiMessage(message, "Failed to cancel event"));
    },
  });

  // Add Guest Mutation
  const addGuestMutation = useMutation({
    mutationFn: ({
      eventId,
      guest,
    }: {
      eventId: string;
      guest: Pick<EventGuest, "id" | "name" | "email" | "rsvpStatus">;
    }) => EventsAPI.addGuest(eventId, guest),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Guest added successfully!");
    },
    onError: (err) => {
      console.error("Error adding guest:", err);
      toast.error("Failed to add guest");
    },
  });

  // Update Guest RSVP Mutation
  const updateGuestRsvpMutation = useMutation({
    mutationFn: ({
      eventId,
      guestId,
      rsvpStatus,
    }: {
      eventId: string;
      guestId: string;
      rsvpStatus: "pending" | "confirmed" | "declined";
    }) => EventsAPI.updateGuestRsvp(eventId, guestId, rsvpStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("RSVP status updated!");
    },
    onError: (err) => {
      console.error("Error updating RSVP status:", err);
      toast.error("Failed to update RSVP status");
    },
  });

  // Send Reminders Mutation
  const sendRemindersMutation = useMutation({
    mutationFn: (eventId: string) => EventsAPI.sendReminders(eventId),
    onSuccess: () => {
      toast.success("Reminders sent successfully!");
    },
    onError: (err) => {
      console.error("Error sending reminders:", err);
      toast.error("Failed to send reminders");
    },
  });

  return {
    addEventMutation,
    updateEventMutation,
    deleteEventMutation,
    addGuestMutation,
    updateGuestRsvpMutation,
    sendRemindersMutation,
    isCreatingEvent: addEventMutation.isPending,
    isUpdatingEvent: updateEventMutation.isPending,
    isDeletingEvent: deleteEventMutation.isPending,
    isAddingGuest: addGuestMutation.isPending,
    isUpdatingRsvp: updateGuestRsvpMutation.isPending,
    isSendingReminders: sendRemindersMutation.isPending,
  };
};
