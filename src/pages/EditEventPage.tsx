import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEvents } from "@/hooks/use-events";
import { toast } from "sonner";
import Dashboard from "@/components/dashboard/Dashboard";
import { Separator } from "@/components/ui/separator";
import EventForm from "@/components/events/EventForm";
import { Event } from "@/types/order";
import HostService from "@/services/api/host/host.Service";

const EditEventPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { events } = useEvents();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (id) {
      const foundEvent = events.find((e) => e.id === id);

      if (foundEvent) {
        setEvent(foundEvent);
      } else {
        toast.error("Event not found", {
          description: "We couldn't find the event you're looking for.",
        });
        navigate("/host/dashboard");
      }

      setLoading(false);
    }
  }, [id, events, navigate]);

  const getDateAndTime = (value: Date | string | undefined) => {
    if (!value) {
      return { date: "", time: "" };
    }

    if (value instanceof Date) {
      const yyyy = value.getFullYear();
      const mm = String(value.getMonth() + 1).padStart(2, "0");
      const dd = String(value.getDate()).padStart(2, "0");
      const hh = String(value.getHours()).padStart(2, "0");
      const mi = String(value.getMinutes()).padStart(2, "0");
      return { date: `${yyyy}-${mm}-${dd}`, time: `${hh}:${mi}` };
    }

    const raw = String(value).trim();
    const directMatch = raw.match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})/);
    if (directMatch) {
      return { date: directMatch[1], time: directMatch[2] };
    }

    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) {
      const yyyy = parsed.getFullYear();
      const mm = String(parsed.getMonth() + 1).padStart(2, "0");
      const dd = String(parsed.getDate()).padStart(2, "0");
      const hh = String(parsed.getHours()).padStart(2, "0");
      const mi = String(parsed.getMinutes()).padStart(2, "0");
      return { date: `${yyyy}-${mm}-${dd}`, time: `${hh}:${mi}` };
    }

    return { date: "", time: "" };
  };

  const formatApiDateTime = (dateValue?: string, timeValue?: string) => {
    const datePart = (dateValue || "").split("T")[0];
    if (!datePart) return undefined;

    let timePart = timeValue;
    if (!timePart && dateValue?.includes("T")) {
      timePart = dateValue.split("T")[1]?.slice(0, 5);
    }

    if (!timePart || !/^\d{2}:\d{2}$/.test(timePart)) {
      timePart = "00:00";
    }

    return `${datePart}T${timePart}:00`;
  };

  const handleUpdateEvent = async (eventData: any) => {
    try {
      if (!id) return;

      setIsUpdating(true);

      const venueAddress = [
        eventData.addressStreet,
        eventData.addressCity,
        eventData.addressState,
        eventData.addressZip,
      ]
        .filter(Boolean)
        .join(", ");

      const startDateTime = formatApiDateTime(eventData.startDate, eventData.startTime);
      const endDateTime = formatApiDateTime(eventData.endDate, eventData.endTime);

      const payload = {
        title: eventData.title,
        description: eventData.description || "",
        startDateTime,
        endDateTime,
        eventType: eventData.eventType || "host_event",
        themeColor: eventData.themeColor ?? null,
        visibility: eventData.visibility ?? null,
        venueName: eventData.venueName || "",
        venueNameOptional: eventData.venueNameOptional || "",
        venueAddress:
          venueAddress || eventData.addressFull || eventData.location || "",
        latitude: eventData.coordinatesLat ?? eventData.latitude ?? 0,
        longitude: eventData.coordinatesLng ?? eventData.longitude ?? 0,
        eventImage: eventData.image || eventData.eventImage || "",
        capacity: eventData.capacity || 0,
        website: eventData.eventUrl || eventData.website || "",
        isPublic: eventData.isPublic ?? true,
        isPaid: eventData.isTicketed ?? eventData.isPaid ?? false,
        parkingInfo: eventData.parking || eventData.parkingInfo || "",
        specialInstructions: eventData.specialInstructions || "",
        facebookUrl:
          eventData.socialMedia?.facebook || eventData.facebookUrl || "",
        twitterUrl:
          eventData.socialMedia?.twitter || eventData.twitterUrl || "",
        instagramUrl:
          eventData.socialMedia?.instagram || eventData.instagramUrl || "",
        linkedInUrl:
          eventData.socialMedia?.linkedin || eventData.linkedInUrl || "",
        tickets:
          eventData.isTicketed && Array.isArray(eventData.ticketTypes)
            ? eventData.ticketTypes.map((ticket: any) => ({
                ticketName: ticket.name,
                price: Number(ticket.price || 0),
                quantityAvailable: Number(ticket.quantity || 0),
                description: ticket.description || "",
              }))
            : [],
      };

      const response = await HostService.updateEvent(id, payload);
      const successMessage =
        response?.message || response?.data?.message || "Event updated successfully";

      toast.success(
        Array.isArray(successMessage) ? successMessage.join(", ") : successMessage,
      );

      setTimeout(() => {
        navigate("/host/dashboard");
      }, 800);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update event";

      toast.error(Array.isArray(message) ? message.join(", ") : message);
      console.error("Event update error:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <Dashboard activeTab="analytics" userRole="event-host">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF7F50]"></div>
        </div>
      </Dashboard>
    );
  }

  if (!event) {
    return (
      <Dashboard activeTab="analytics" userRole="event-host">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold">Event not found</h2>
          <p className="mt-2 text-gray-600">
            We couldn't find the event you're looking for.
          </p>
        </div>
      </Dashboard>
    );
  }

  const fullAddress =
    (event as any).venueAddress ||
    (event as any).addressFull ||
    event.location ||
    "";
  const addressParts = fullAddress
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  const stateZipPart = addressParts[3] || addressParts[2] || "";
  const zipMatch = stateZipPart.match(/\b\d{4,6}(?:-\d{4})?\b/);
  const startParts = getDateAndTime(event.startDate as any);
  const endParts = getDateAndTime(event.endDate as any);

  const initialData = {
    ...event,
    addressFull: fullAddress,
    addressStreet: (event as any).addressStreet || addressParts[0] || "",
    addressCity: (event as any).addressCity || addressParts[1] || "",
    addressState:
      (event as any).addressState ||
      stateZipPart.replace(/\b\d{4,6}(?:-\d{4})?\b/, "").trim() ||
      "",
    addressZip: (event as any).addressZip || (zipMatch ? zipMatch[0] : ""),
    capacity:
      typeof event.capacity === "number"
        ? event.capacity
        : Number((event as any).capacity || 0) || undefined,
    eventUrl: (event as any).website || event.eventUrl || "",
    parking: (event as any).parkingInfo || event.parking || "",
    socialMedia: {
      facebook: (event as any).facebookUrl || event.socialMedia?.facebook || "",
      twitter: (event as any).twitterUrl || event.socialMedia?.twitter || "",
      instagram:
        (event as any).instagramUrl || event.socialMedia?.instagram || "",
      linkedin: (event as any).linkedInUrl || event.socialMedia?.linkedin || "",
    },
    startDate: startParts.date,
    startTime: startParts.time,
    endDate: endParts.date,
    endTime: endParts.time,
  };

  return (
    <Dashboard activeTab="analytics" userRole="event-host">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Edit Event</h1>
          <p className="text-gray-500 mt-1">Update your event details</p>
        </div>

        <Separator />

        <EventForm
          initialData={initialData}
          onSubmit={handleUpdateEvent}
          isEditing={true}
          isSubmitting={isUpdating}
        />
      </div>
    </Dashboard>
  );
};

export default EditEventPage;
