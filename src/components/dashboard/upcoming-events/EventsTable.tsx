

import { Table, TableHeader, TableBody, TableRow, TableHead } from "@/components/ui/table";
import { Event } from "@/types/order";
import EventTableRow from "./EventTableRow";

interface EventsTableProps {
  events: Event[];
}

const EventsTable = ({ events }: EventsTableProps) => {
  if (events.length === 0) {
    return null;
  }
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Event</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Time</TableHead>
          <TableHead>Venue</TableHead>
          <TableHead>Guests</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {events.map((event) => (
          <EventTableRow key={event.id} event={event} />
        ))}
      </TableBody>
    </Table>
  );
};

export default EventsTable;
