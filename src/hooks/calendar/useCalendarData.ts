import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth } from "date-fns";
import dashboardService from "@/services/api/admin/dashboard.Service";

export interface EventIndicator {
  type: "order" | "event" | "proposal";
  color: string;
  count: number;
  events?: any[];
}

interface BackendEvent {
  id: string;
  title: string;
  startDateTime: string;
  endDateTime: string;
  eventType: string;
  description?: string;
  themeColor?: string;
  visibility?: string;
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export const useCalendarData = (year: number, month: number) => {
  const startDate = startOfMonth(new Date(year, month, 1));
  const endDate = endOfMonth(new Date(year, month, 1));

  const { data: backendEvents, isLoading } = useQuery({
    queryKey: ["calendar-events", year, month],
    queryFn: async (): Promise<BackendEvent[]> => {
      try {
        const response = await dashboardService.getEventsByDate({
          startDate: format(startDate, "yyyy-MM-dd"),
          endDate: format(endDate, "yyyy-MM-dd"),
        });

        // Handle different response structures
        const events = response?.data?.data || response?.data || response || [];
        return Array.isArray(events) ? events : [];
      } catch (error) {
        console.error("Error fetching events:", error);
        return [];
      }
    },
    refetchInterval: 60000, // Refresh every minute
    retry: 3,
    retryDelay: 1000,
  });

  const [dates, setDates] = useState<Map<string, EventIndicator[]>>(new Map());

  useEffect(() => {
    if (!backendEvents || backendEvents.length === 0) {
      setDates(new Map());
      return;
    }

    const dateMap = new Map<string, EventIndicator[]>();

    // Process backend events
    backendEvents.forEach((event) => {
      const dateKey = format(new Date(event.startDateTime), "yyyy-MM-dd");
      const indicators = dateMap.get(dateKey) || [];

      const existingEvent = indicators.find((i) => i.type === "event");
      if (existingEvent) {
        existingEvent.count++;
        existingEvent.events?.push({
          id: event.id,
          title: event.title,
          description: event.description,
          start_time: event.startDateTime,
          end_time: event.endDateTime,
          event_type: event.eventType?.toLowerCase() || "other",
          color: event.themeColor,
        });
      } else {
        indicators.push({
          type: "event",
          color: event.themeColor || "#10B981",
          count: 1,
          events: [
            {
              id: event.id,
              title: event.title,
              description: event.description,
              start_time: event.startDateTime,
              end_time: event.endDateTime,
              event_type: event.eventType?.toLowerCase() || "other",
              color: event.themeColor,
            },
          ],
        });
      }

      dateMap.set(dateKey, indicators);
    });

    setDates(dateMap);
  }, [backendEvents]);

  return { dates, loading: isLoading };
};
