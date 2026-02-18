import { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Event } from "@/types/order";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Link } from "react-router-dom";
import { format } from "date-fns";

interface EventTableRowProps {
  event: Event;
  guestCount?: number;
  onCancelEvent?: (eventId: string) => Promise<void> | void;
}

const EventTableRow = ({
  event,
  guestCount = 0,
  onCancelEvent,
}: EventTableRowProps) => {
  const [isCancelling, setIsCancelling] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  const formatDateTime = (date: string | Date) => {
    try {
      const dateObj = typeof date === "string" ? new Date(date) : date;
      return format(dateObj, "MMM d, yyyy h:mm a");
    } catch (error) {
      return "Invalid date";
    }
  };

  const handleConfirmCancelEvent = async () => {
    if (!onCancelEvent || isCancelling) return;

    try {
      setIsCancelling(true);
      await onCancelEvent(event.id);
      setIsCancelDialogOpen(false);
    } finally {
      setIsCancelling(false);
    }
  };

  let statusBadge;
  const now = new Date();
  const eventDate = new Date(event.startDate);

  if (eventDate < now) {
    statusBadge = <Badge className="bg-green-500">Completed</Badge>;
  } else if (eventDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
    statusBadge = <Badge className="bg-orange-500">Tomorrow</Badge>;
  } else {
    statusBadge = <Badge variant="outline">Upcoming</Badge>;
  }

  return (
    <>
      <TableRow>
        <TableCell>
          <div className="font-medium">{event.title}</div>
        </TableCell>
        <TableCell>{formatDateTime(event.startDate)}</TableCell>
        <TableCell>{formatDateTime(event.endDate)}</TableCell>
        <TableCell>{event.location || "No venue"}</TableCell>
        <TableCell>{guestCount}</TableCell>
        <TableCell>{statusBadge}</TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to="/host/guests">Manage Guests</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/events/${event.id}/edit`}>Edit Event</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                disabled={isCancelling}
                onClick={() => setIsCancelDialogOpen(true)}
              >
                {isCancelling ? "Cancelling..." : "Cancel Event"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this event? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>Keep Event</AlertDialogCancel>
            <AlertDialogAction
              disabled={isCancelling}
              onClick={(e) => {
                e.preventDefault();
                void handleConfirmCancelEvent();
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              {isCancelling ? "Cancelling..." : "Yes, Cancel Event"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EventTableRow;
