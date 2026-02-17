import { useEffect, useState } from "react";
import { useForm, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";
import { Tabs } from "@/components/ui/tabs";
import { eventFormSchema, EventFormValues } from "./form/EventFormSchema";
import EventTabNavigation from "./form/EventTabNavigation";
import EventTabContent from "./form/EventTabContent";
import EventFormActions from "./form/EventFormActions";
import { useTicketTypeHandler } from "./form/useTicketTypeHandler";

interface EventFormProps {
  initialData?: Partial<EventFormValues>;
  onSubmit: (data: any) => Promise<void> | void;
  isEditing?: boolean;
  isSubmitting?: boolean;
}

const EventForm = ({
  initialData,
  onSubmit,
  isEditing = false,
  isSubmitting = false,
}: EventFormProps) => {
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      venueName: initialData?.venueName || "",
      addressStreet: initialData?.addressStreet || "",
      addressCity: initialData?.addressCity || "",
      addressState: initialData?.addressState || "",
      addressZip: initialData?.addressZip || "",
      addressFull: initialData?.addressFull || "",
      coordinatesLat: initialData?.coordinatesLat,
      coordinatesLng: initialData?.coordinatesLng,
      startDate: initialData?.startDate || "",
      startTime: initialData?.startTime || "",
      endDate: initialData?.endDate || "",
      endTime: initialData?.endTime || "",
      image: initialData?.image || "",
      isPublic: initialData?.isPublic ?? true,
      isTicketed: initialData?.isTicketed ?? false,
      eventUrl: initialData?.eventUrl || "",
      parking: initialData?.parking || "",
      specialInstructions: initialData?.specialInstructions || "",
      socialMedia: initialData?.socialMedia || {
        facebook: "",
        twitter: "",
        instagram: "",
        linkedin: "",
      },
      ticketTypes: Array.isArray(initialData?.ticketTypes)
        ? initialData.ticketTypes.map((ticket) => ({
            // Ensure each ticket has all required properties from TicketType interface
            id:
              ticket.id ||
              `ticket-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            name: ticket.name || "",
            price: ticket.price || 0,
            sold: ticket.sold || 0,
            description: ticket.description,
            quantity: ticket.quantity,
          }))
        : [],
    },
  });

  const isTicketed = form.watch("isTicketed");
  const imageValue = form.watch("image");
  const [isSubmittingLocal, setIsSubmittingLocal] = useState(false);
  const [showTicketError, setShowTicketError] = useState(false);

  useEffect(() => {
    if (imageValue) {
      console.log("EventForm: Image value updated", { imageValue });
    }
  }, [imageValue]);

  const {
    ticketTypes,
    handleAddTicketType,
    handleEditTicketType,
    handleRemoveTicketType,
  } = useTicketTypeHandler(form);

  useEffect(() => {
    if (ticketTypes && ticketTypes.length > 0) {
      setShowTicketError(false);
    }
  }, [ticketTypes]);

  // Submit handler that passes data in the format expected by the parent component
  const handleFormSubmit = async (values: EventFormValues) => {
    console.log("EventForm: Form submission started", values);
    console.log("EventForm: Form errors:", form.formState.errors);

    try {
      // Validate form data
      if (!values.title?.trim()) {
        console.error("EventForm: Missing title");
        throw new Error("Event title is required");
      }

      if (!values.startDate || !values.startTime) {
        console.error("EventForm: Missing start date/time", {
          startDate: values.startDate,
          startTime: values.startTime,
        });
        throw new Error("Start date and time are required");
      }

      if (!values.endDate || !values.endTime) {
        console.error("EventForm: Missing end date/time", {
          endDate: values.endDate,
          endTime: values.endTime,
        });
        throw new Error("End date and time are required");
      }

      if (values.isTicketed && (!values.ticketTypes || values.ticketTypes.length === 0)) {
        setShowTicketError(true);
        toast.error("Please add at least one ticket type");
        return;
      }

      // Combine date and time for start and end dates
      const formattedData = {
        ...values,
        startDate: `${values.startDate}T${values.startTime}`,
        endDate: `${values.endDate}T${values.endTime}`,
      };

      console.log("EventForm: Form data formatted successfully", {
        formattedStartDate: formattedData.startDate,
        formattedEndDate: formattedData.endDate,
      });

      // Pass the form values to parent component
      setIsSubmittingLocal(true);
      await onSubmit(formattedData);
    } catch (error) {
      console.error("EventForm: Form submission error:", error);
      toast.error("Fill All Required Fields");
    } finally {
      setIsSubmittingLocal(false);
    }
  };

  const handleFormInvalid = (_errors: FieldErrors<EventFormValues>) => {
    toast.error("Fill All Required Fields");
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit, handleFormInvalid)}
        className="space-y-8"
      >
        <Tabs defaultValue="basic">
          <EventTabNavigation isTicketed={isTicketed} />
          <EventTabContent
            form={form}
            isTicketed={isTicketed}
            ticketTypes={ticketTypes}
            onAddTicket={handleAddTicketType}
            onEditTicket={handleEditTicketType}
            onRemoveTicket={handleRemoveTicketType}
            showTicketError={showTicketError && isTicketed}
          />
        </Tabs>

        <EventFormActions
          isEditing={isEditing}
          isSubmitting={isSubmitting || isSubmittingLocal}
        />
      </form>
    </Form>
  );
};

export default EventForm;



