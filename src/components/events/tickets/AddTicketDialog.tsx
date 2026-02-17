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
  const [nameError, setNameError] = useState("");
  const [priceError, setPriceError] = useState("");

  const handleAddTicket = () => {
    setNameError("");
    setPriceError("");
    let hasError = false;
    if (!ticketName.trim()) {
      setNameError("Ticket name is required");
      hasError = true;
    }
    if (!ticketPrice || isNaN(parseFloat(ticketPrice)) || parseFloat(ticketPrice) < 0) {
      setPriceError("Valid price is required");
      hasError = true;
    }
    if (hasError) return;

    // Create a ticket object with required properties
    const newTicket: Omit<TicketType, "id" | "sold"> = {
      name: ticketName,
      price: parseFloat(ticketPrice),
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
    setNameError("");
    setPriceError("");
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setNameError("");
      setPriceError("");
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ticketName">
                Ticket Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="ticketName"
                placeholder="VIP, General Admission, etc."
                value={ticketName}
                onChange={(e) => { setTicketName(e.target.value); if (nameError) setNameError(""); }}
                className={nameError ? "border-red-500" : ""}
              />
              {nameError && <p className="text-xs text-red-500">{nameError}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">
                Price ($) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={ticketPrice}
                onChange={(e) => { setTicketPrice(e.target.value); if (priceError) setPriceError(""); }}
                className={priceError ? "border-red-500" : ""}
              />
              {priceError && <p className="text-xs text-red-500">{priceError}</p>}
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
