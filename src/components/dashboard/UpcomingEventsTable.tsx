

import { useEvents } from "@/hooks/use-events";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEventsPagination, EVENTS_PER_PAGE } from "./upcoming-events/useEventsPagination";
import TableHeaderActions from "./upcoming-events/TableHeaderActions";
import EventsTable from "./upcoming-events/EventsTable";
import EmptyEventState from "./upcoming-events/EmptyEventState";
import EventsPagination from "./upcoming-events/EventsPagination";

const UpcomingEventsTable = () => {
  const { events } = useEvents();
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
            : 'No upcoming events found'}
        </div>
        
        {upcomingEvents.length === 0 ? (
          <EmptyEventState />
        ) : (
          <EventsTable events={currentEvents} />
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
