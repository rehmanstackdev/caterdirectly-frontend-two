import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
} from "@/components/ui/table";
import { Event } from "@/types/order";
import EventTableRow from "./EventTableRow";

interface EventsTableProps {
  events: Event[];
  guestCountsByEventId?: Record<string, number>;
  onCancelEvent?: (eventId: string) => Promise<void> | void;
}

const EventsTable = ({
  events,
  guestCountsByEventId = {},
  onCancelEvent,
}: EventsTableProps) => {
  if (events.length === 0) {
    return null;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Event Title</TableHead>
          <TableHead>Start Date</TableHead>
          <TableHead>End Date</TableHead>
          <TableHead>Venue</TableHead>
          <TableHead>Guests</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {events.map((event) => (
          <EventTableRow
            key={event.id}
            event={event}
            guestCount={guestCountsByEventId[event.id] ?? 0}
            onCancelEvent={onCancelEvent}
          />
        ))}
      </TableBody>
    </Table>
  );
};

export default EventsTable;
