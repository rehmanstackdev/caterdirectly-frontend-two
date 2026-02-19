import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGuests } from "@/hooks/use-guests";
import EventsService from "@/services/api/host/events.Service";
import { toast } from "sonner";
import { Loader2, ChevronsUpDown, Check } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface EventTicket {
  id: string;
  ticketName: string;
  price: string;
}

interface HostEvent {
  id: string;
  title: string;
  tickets?: EventTicket[];
}

const guestSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  eventId: z.string().optional(),
  ticketId: z.string().optional(),
  ticketPrice: z.string().optional(),
});

type GuestFormData = z.infer<typeof guestSchema>;

interface GuestEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingGuest?: any;
}

const GuestEntryDialog = ({
  open,
  onOpenChange,
  existingGuest,
}: GuestEntryDialogProps) => {
  const { addGuest, updateGuest, loading } = useGuests();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!existingGuest;
  const [hostEvents, setHostEvents] = useState<HostEvent[]>([]);
  const [tickets, setTickets] = useState<EventTicket[]>([]);

  const form = useForm<GuestFormData>({
    resolver: zodResolver(guestSchema),
    defaultValues: existingGuest || {
      name: "",
      email: "",
      phone: "",
      company: "",
      jobTitle: "",
      eventId: "",
      ticketId: "",
      ticketPrice: "",
    },
  });

  const selectedEventId = form.watch("eventId");

  useEffect(() => {
    if (!open) return;

    const loadEvents = async () => {
      try {
        const response = await EventsService.getHostEvents();
        const events = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
            ? response
            : [];
        setHostEvents(events);
      } catch (error) {
        console.error("Failed to load host events:", error);
        toast.error("Failed to load events");
      }
    };

    loadEvents();
  }, [open]);

  useEffect(() => {
    if (open) {
      form.reset(
        existingGuest
          ? {
              name: existingGuest.name || "",
              email: existingGuest.email || "",
              phone: existingGuest.phone || "",
              company: existingGuest.company || "",
              jobTitle: existingGuest.jobTitle || "",
              eventId: existingGuest.eventId || "",
              ticketId: existingGuest.ticketId || "",
              ticketPrice: "",
            }
          : {
              name: "",
              email: "",
              phone: "",
              company: "",
              jobTitle: "",
              eventId: "",
              ticketId: "",
              ticketPrice: "",
            },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, existingGuest?.id]);

  useEffect(() => {
    if (!selectedEventId) {
      setTickets([]);
      return;
    }

    const selectedEvent = hostEvents.find(
      (event) => event.id === selectedEventId,
    );
    setTickets(selectedEvent?.tickets || []);
  }, [hostEvents, selectedEventId]);

  const getApiErrorMessage = (error: any) => {
    const message = error?.response?.data?.message;
    if (Array.isArray(message)) return message.join(", ");
    if (typeof message === "string" && message.trim()) return message;
    if (typeof error?.message === "string" && error.message.trim())
      return error.message;
    return "";
  };

  const onSubmit = async (data: GuestFormData) => {
    setIsSubmitting(true);

    try {
      if (!isEditing && (!data.eventId || !data.ticketId)) {
        throw new Error("Please select both event and ticket");
      }

      const processedData = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        jobTitle: data.jobTitle,
        eventId: data.eventId,
        ticketId: data.ticketId,
      };

      if (isEditing) {
        const result = await updateGuest(existingGuest.id, processedData);
        toast.success(result?.message || "Guest detail updated successfully");
      } else {
        const result = await addGuest(processedData);
        toast.success(result?.message || "New guest added successfully");
      }

      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      console.error("Error saving guest:", error);
      toast.error(
        getApiErrorMessage(error) ||
          (isEditing ? "Failed to update contact" : "Failed to add contact"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Guest" : "Add New Guest"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the contact information below"
              : "Fill in the details to add a new contact to your database"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Jane Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email*</FormLabel>
                    <FormControl>
                      <Input placeholder="jane@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input placeholder="Company Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="(123) 456-7890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="jobTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Marketing Manager" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="eventId"
                render={({ field }) => {
                  const selectedEvent = hostEvents.find(
                    (e) => e.id === field.value,
                  );
                  return (
                    <FormItem className="flex flex-col">
                      <FormLabel>Event</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              <span className="truncate">
                                {selectedEvent
                                  ? selectedEvent.title
                                  : "Select event"}
                              </span>
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-[--radix-popover-trigger-width] p-0"
                          align="start"
                        >
                          <Command>
                            <CommandInput placeholder="Search events..." />
                            <CommandList className="max-h-[176px]">
                              <CommandEmpty>No events found.</CommandEmpty>
                              <CommandGroup>
                                {hostEvents.map((event) => (
                                  <CommandItem
                                    key={event.id}
                                    value={event.title}
                                    onSelect={() => {
                                      field.onChange(event.id);
                                      form.setValue("ticketId", "", {
                                        shouldValidate: true,
                                      });
                                      form.setValue("ticketPrice", "", {
                                        shouldValidate: true,
                                      });
                                      setTickets(event.tickets || []);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        field.value === event.id
                                          ? "opacity-100"
                                          : "opacity-0",
                                      )}
                                    />
                                    {event.title}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="ticketId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ticket</FormLabel>
                    <Select
                      key={`ticket-${selectedEventId}-${field.value}`}
                      value={field.value || undefined}
                      onValueChange={(value) => {
                        field.onChange(value);
                        const selected = tickets.find(
                          (ticket) => ticket.id === value,
                        );
                        form.setValue(
                          "ticketPrice",
                          selected?.price || "",
                          {
                            shouldValidate: true,
                          },
                        );
                      }}
                      disabled={!selectedEventId || tickets.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select ticket" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {tickets.map((ticket) => (
                          <SelectItem key={ticket.id} value={ticket.id}>
                            {ticket.ticketName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ticketPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input
                        value={field.value ? `$${field.value}` : ""}
                        readOnly
                        placeholder="Ticket price"
                        className="border"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isSubmitting
                  ? isEditing
                    ? "Updating..."
                    : "Adding..."
                  : `${isEditing ? "Update" : "Add"} Guest`}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default GuestEntryDialog;
