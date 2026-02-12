

import { TableCell, TableRow } from "@/components/ui/table";
import { Event } from "@/types/order";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Mail, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { format } from "date-fns";

interface EventTableRowProps {
  event: Event;
}

const EventTableRow = ({ event }: EventTableRowProps) => {
  const totalGuests = event.guests?.length || 0;
  const confirmedGuests = event.guests?.filter(g => g.rsvpStatus === 'confirmed').length || 0;
  
  const formatDate = (date: string | Date) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return format(dateObj, 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  const formatTime = (date: string | Date) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return format(dateObj, 'h:mm a');
    } catch (error) {
      return 'Invalid time';
    }
  };
  
  let statusBadge;
  const now = new Date();
  const eventDate = new Date(event.startDate);
  
  if (eventDate < now) {
    statusBadge = <Badge className="bg-green-500">Completed</Badge>;
  } else if (eventDate.getTime() - now.getTime() < (24 * 60 * 60 * 1000)) { // Less than 24 hours
    statusBadge = <Badge className="bg-orange-500">Tomorrow</Badge>;
  } else {
    statusBadge = <Badge variant="outline">Upcoming</Badge>;
  }
  
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            <Calendar className="h-5 w-5 text-gray-600" />
          </div>
          <div className="font-medium">{event.title}</div>
        </div>
      </TableCell>
      <TableCell>{formatDate(event.startDate)}</TableCell>
      <TableCell>{formatTime(event.startDate)}</TableCell>
      <TableCell>{event.location || 'No location'}</TableCell>
      <TableCell>
        {confirmedGuests} / {totalGuests}
      </TableCell>
      <TableCell>{statusBadge}</TableCell>
      <TableCell>
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/events/${event.id}/guests`}>
            <Mail className="h-4 w-4" />
          </Link>
        </Button>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={`/events/${event.id}`}>View Event</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to={`/events/${event.id}/guests`}>Manage Guests</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to={`/events/${event.id}/edit`}>Edit Event</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Send Reminders</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Cancel Event</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

export default EventTableRow;
