import { useState, useEffect } from "react";
import { TicketType } from "@/types/order";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EditTicketDialogProps {
  ticket: TicketType;
  isOpen: boolean;
  onClose: () => void;
  onSave: (ticketData: Partial<TicketType>) => void;
}

const EditTicketDialog = ({
  ticket,
  isOpen,
  onClose,
  onSave,
}: EditTicketDialogProps) => {
  const [ticketName, setTicketName] = useState(ticket.name);
  const [ticketPrice, setTicketPrice] = useState(String(ticket.price));
  const [ticketQuantity, setTicketQuantity] = useState(
    ticket.quantity ? String(ticket.quantity) : "",
  );
  const [ticketDescription, setTicketDescription] = useState(
    ticket.description || "",
  );

  // Update form values when the ticket prop changes
  useEffect(() => {
    setTicketName(ticket.name);
    setTicketPrice(String(ticket.price));
    setTicketQuantity(ticket.quantity ? String(ticket.quantity) : "");
    setTicketDescription(ticket.description || "");
  }, [ticket]);

  const handleSaveTicket = () => {
    if (!ticketName || !ticketPrice) return;

    // Create the updated ticket object
    const updatedTicket: Partial<TicketType> = {
      name: ticketName,
      price: parseFloat(ticketPrice),
    };

    // Only add optional fields if they have values
    if (ticketDescription.trim()) {
      updatedTicket.description = ticketDescription;
    }

    if (ticketQuantity && !isNaN(parseInt(ticketQuantity, 10))) {
      updatedTicket.quantity = parseInt(ticketQuantity, 10);
    }

    onSave(updatedTicket);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Ticket</DialogTitle>
          <DialogDescription>
            Update the details for this ticket type.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="editTicketName">Ticket Name</Label>
              <Input
                id="editTicketName"
                value={ticketName}
                onChange={(e) => setTicketName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editPrice">Price ($)</Label>
              <Input
                id="editPrice"
                type="number"
                min="0"
                step="0.01"
                value={ticketPrice}
                onChange={(e) => setTicketPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="editDescription">
              Description
              <span className="text-gray-500 text-xs ml-1">(optional)</span>
            </Label>
            <Textarea
              id="editDescription"
              placeholder="Describe what's included with this ticket"
              value={ticketDescription}
              onChange={(e) => setTicketDescription(e.target.value)}
            />
          </div>

          {ticket.sold > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-sm text-amber-800">
                This ticket has already been sold to {ticket.sold}{" "}
                {ticket.sold === 1 ? "person" : "people"}. Some changes may
                affect existing orders.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSaveTicket}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditTicketDialog;
