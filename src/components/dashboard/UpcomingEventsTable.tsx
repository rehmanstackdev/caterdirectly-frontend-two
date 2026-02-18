import { useEffect, useState } from "react";
import { useEvents } from "@/hooks/use-events";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEventsPagination, EVENTS_PER_PAGE } from "./upcoming-events/useEventsPagination";
import TableHeaderActions from "./upcoming-events/TableHeaderActions";
import EventsTable from "./upcoming-events/EventsTable";
import EmptyEventState from "./upcoming-events/EmptyEventState";
import EventsPagination from "./upcoming-events/EventsPagination";
import AddGuestService from "@/services/api/host/guest/addguest.service";

const UpcomingEventsTable = () => {
  const { events, deleteEvent } = useEvents();
  const [guestCountsByEventId, setGuestCountsByEventId] = useState<Record<string, number>>({});

  const {
    upcomingEvents,
    currentEvents,
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    handlePreviousPage,
    handleNextPage,
    handlePageChange,
  } = useEventsPagination(events);

  useEffect(() => {
    let isMounted = true;

    const loadGuestCounts = async () => {
      try {
        const counts: Record<string, number> = {};
        const limit = 200;
        let page = 1;
        let totalPagesToFetch = 1;

        while (page <= totalPagesToFetch) {
          const response = await AddGuestService.getHostGuests(undefined, false, page, limit);
          const payload = response?.data ?? response;
          const rows = Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload)
              ? payload
              : [];

          rows.forEach((guest: any) => {
            const eventId = guest?.eventId || guest?.event?.id;
            const hasAssignedTicket = Boolean(
              guest?.ticketId ||
                guest?.ticket?.id ||
                guest?.ticketName ||
                guest?.ticket?.ticketName,
            );

            if (eventId && hasAssignedTicket) {
              counts[eventId] = (counts[eventId] || 0) + 1;
            }
          });

          const total =
            typeof payload?.total === "number"
              ? payload.total
              : typeof payload?.meta?.total === "number"
                ? payload.meta.total
                : rows.length;

          totalPagesToFetch = Math.max(1, Math.ceil(total / limit));
          page += 1;
        }

        if (isMounted) {
          setGuestCountsByEventId(counts);
        }
      } catch (error) {
        console.error("Failed to load guest counts:", error);
      }
    };

    loadGuestCounts();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCancelEvent = async (eventId: string) => {
    await deleteEvent(eventId);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Upcoming Events</CardTitle>
        <TableHeaderActions
          onPrevious={handlePreviousPage}
          onNext={handleNextPage}
          currentPage={currentPage}
          totalPages={totalPages}
        />
      </CardHeader>
      <CardContent>
        <div className="text-sm text-gray-500 mb-4">
          {upcomingEvents.length > 0
            ? `Showing ${startIndex + 1}-${endIndex} of ${upcomingEvents.length} events`
            : "No upcoming events found"}
        </div>

        {upcomingEvents.length === 0 ? (
          <EmptyEventState />
        ) : (
          <EventsTable
            events={currentEvents}
            guestCountsByEventId={guestCountsByEventId}
            onCancelEvent={handleCancelEvent}
          />
        )}

        {upcomingEvents.length > EVENTS_PER_PAGE && (
          <EventsPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingEventsTable;
