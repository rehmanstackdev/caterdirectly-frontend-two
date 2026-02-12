import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TicketType } from "@/types/order";

interface AddTicketDialogProps {
  onAddTicket: (ticket: Omit<TicketType, "id" | "sold">) => void;
}

const AddTicketDialog = ({ onAddTicket }: AddTicketDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [ticketName, setTicketName] = useState("");
  const [ticketPrice, setTicketPrice] = useState("");
  const [ticketQuantity, setTicketQuantity] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");

  const handleAddTicket = () => {
    if (!ticketName || !ticketPrice) return;

    // Create a ticket object with required properties
    const newTicket: Omit<TicketType, "id" | "sold"> = {
      name: ticketName,
      price: parseFloat(ticketPrice) * 100, // Store in cents
    };

    // Only add optional properties if they have valid values
    if (ticketDescription.trim()) {
      newTicket.description = ticketDescription;
    }

    if (ticketQuantity && !isNaN(parseInt(ticketQuantity, 10))) {
      newTicket.quantity = parseInt(ticketQuantity, 10);
    }

    onAddTicket(newTicket);

    // Reset form
    setTicketName("");
    setTicketPrice("");
    setTicketQuantity("");
    setTicketDescription("");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Ticket Type
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Ticket Type</DialogTitle>
          <DialogDescription>
            Create a new type of ticket for your event.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="ticketName">Ticket Name</Label>
            <Input
              id="ticketName"
              placeholder="VIP, General Admission, etc."
              value={ticketName}
              onChange={(e) => setTicketName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={ticketPrice}
                onChange={(e) => setTicketPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ticketDescription">Description (optional)</Label>
            <Textarea
              id="ticketDescription"
              placeholder="Describe what's included with this ticket"
              value={ticketDescription}
              onChange={(e) => setTicketDescription(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddTicket}>Add Ticket</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddTicketDialog;
