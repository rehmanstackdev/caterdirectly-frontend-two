import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth";
import Dashboard from "@/components/dashboard/Dashboard";
import { Separator } from "@/components/ui/separator";
import EventForm from "@/components/events/EventForm";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import HostService from "@/services/api/host/host.Service";

const CreateEventPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isCreatingEvent, setIsCreatingEvent] = React.useState(false);

  const handleCreateEvent = async (eventData: any) => {
    console.log("CreateEventPage: handleCreateEvent called", {
      user: user ? { id: user.id, email: user.email } : null,
      eventData: {
        title: eventData.title,
        startDate: eventData.startDate,
        endDate: eventData.endDate,
        hasImage: !!eventData.image,
      },
    });

    try {
      // Check authentication first
      if (!user || !user.id) {
        console.error("CreateEventPage: User not authenticated", { user });
        toast.error("You must be logged in to create an event");
        return;
      }

      // Validate required fields
      if (!eventData.title || !eventData.startDate || !eventData.endDate) {
        console.error("CreateEventPage: Missing required fields", {
          title: eventData.title,
          startDate: eventData.startDate,
          endDate: eventData.endDate,
          startTime: eventData.startTime,
          endTime: eventData.endTime,
        });
        toast.error("Please fill in all required fields");
        return;
      }

      // Validate date/time format
      if (!eventData.startTime && !eventData.startDate.includes("T")) {
        console.error("CreateEventPage: Missing start time", {
          startDate: eventData.startDate,
          startTime: eventData.startTime,
        });
        toast.error("Please provide a start time for your event");
        return;
      }

      if (!eventData.endTime && !eventData.endDate.includes("T")) {
        console.error("CreateEventPage: Missing end time", {
          endDate: eventData.endDate,
          endTime: eventData.endTime,
        });
        toast.error("Please provide an end time for your event");
        return;
      }

      // Log the image URL for debugging
      console.log("CreateEventPage: Processing event data", {
        title: eventData.title,
        hasImage: !!eventData.image,
        imageUrl: eventData.image,
      });

      // Validate address data before processing
      validateAddressData(eventData);

      setIsCreatingEvent(true);

      // Build full address string
      const venueAddress = [
        eventData.addressStreet,
        eventData.addressCity,
        eventData.addressState,
        eventData.addressZip,
      ]
        .filter(Boolean)
        .join(", ");

      // Format dates to ISO string
      // Check if startDate already contains time (from EventForm formatting)
      let startDateTime: string;
      let endDateTime: string;

      if (eventData.startDate && eventData.startDate.includes("T")) {
        // Already combined format from EventForm
        const startDateObj = new Date(eventData.startDate);
        if (isNaN(startDateObj.getTime())) {
          throw new Error("Invalid start date/time format");
        }
        startDateTime = startDateObj.toISOString();
      } else {
        // Need to combine date and time
        const startTimeStr = eventData.startTime || "00:00";
        const startDateStr = `${eventData.startDate}T${startTimeStr}`;
        const startDateObj = new Date(startDateStr);
        if (isNaN(startDateObj.getTime())) {
          throw new Error(`Invalid start date/time: ${startDateStr}`);
        }
        startDateTime = startDateObj.toISOString();
      }

      if (eventData.endDate && eventData.endDate.includes("T")) {
        // Already combined format from EventForm
        const endDateObj = new Date(eventData.endDate);
        if (isNaN(endDateObj.getTime())) {
          throw new Error("Invalid end date/time format");
        }
        endDateTime = endDateObj.toISOString();
      } else {
        // Need to combine date and time
        const endTimeStr = eventData.endTime || "23:59";
        const endDateStr = `${eventData.endDate}T${endTimeStr}`;
        const endDateObj = new Date(endDateStr);
        if (isNaN(endDateObj.getTime())) {
          throw new Error(`Invalid end date/time: ${endDateStr}`);
        }
        endDateTime = endDateObj.toISOString();
      }

      // Process the form data according to the new API structure
      const formattedData = {
        title: eventData.title,
        description: eventData.description || "Event description",
        startDateTime: startDateTime,
        endDateTime: endDateTime,
        eventType: "host_event",
        venueName: eventData.venueName || "",
        venueNameOptional: eventData.venueNameOptional || "",
        venueAddress: venueAddress || eventData.addressFull || "",
        latitude: eventData.coordinatesLat || 0,
        longitude: eventData.coordinatesLng || 0,
        eventImage: eventData.image || "",
        capacity: eventData.capacity || 0,
        website:
          eventData.eventUrl && eventData.eventUrl.trim()
            ? eventData.eventUrl.trim()
            : undefined,
        isPublic: eventData.isPublic ?? true,
        isPaid: eventData.isTicketed ?? false,
        parkingInfo: eventData.parking || "",
        specialInstructions: eventData.specialInstructions || "",
        facebookUrl:
          eventData.socialMedia?.facebook &&
          eventData.socialMedia.facebook.trim()
            ? eventData.socialMedia.facebook.trim()
            : undefined,
        twitterUrl:
          eventData.socialMedia?.twitter && eventData.socialMedia.twitter.trim()
            ? eventData.socialMedia.twitter.trim()
            : undefined,
        instagramUrl:
          eventData.socialMedia?.instagram &&
          eventData.socialMedia.instagram.trim()
            ? eventData.socialMedia.instagram.trim()
            : undefined,
        linkedInUrl:
          eventData.socialMedia?.linkedin &&
          eventData.socialMedia.linkedin.trim()
            ? eventData.socialMedia.linkedin.trim()
            : undefined,
        ...(eventData.isTicketed === true &&
          eventData.ticketTypes?.length > 0 && {
            tickets: eventData.ticketTypes.map((ticket: any) => ({
              ticketName: ticket.name,
              price: ticket.price,
              quantityAvailable: ticket.quantity || 0,
              description: ticket.description || "",
            })),
          }),
      };

      console.log(
        "Creating event with final data:",
        JSON.stringify(formattedData, null, 2),
      );

      const response = await HostService.createEvent(formattedData);

      console.log("Event created successfully:", response);

      toast.success("Event created successfully", {
        description:
          "Your event has been created and is ready to share with guests.",
      });

      // Navigate to the event details
      navigate("/host/dashboard");
      setIsCreatingEvent(false);
    } catch (error) {
      setIsCreatingEvent(false);
      console.error("CreateEventPage: Event creation error:", {
        error,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        errorStack: error instanceof Error ? error.stack : undefined,
        user: user ? { id: user.id, email: user.email } : null,
        eventData: {
          title: eventData.title,
          startDate: eventData.startDate,
          startTime: eventData.startTime,
          endDate: eventData.endDate,
          endTime: eventData.endTime,
          addressFull: eventData.addressFull,
          hasImage: !!eventData.image,
        },
      });

      // Parse API error response
      let errorMessages: string[] = [];
      let errorTitle = "Error creating event";

      if (error && typeof error === "object" && "response" in error) {
        const apiError = error as any;
        const errorData = apiError.response?.data || apiError.data;

        // Handle array of validation messages
        if (errorData?.message) {
          if (Array.isArray(errorData.message)) {
            errorMessages = errorData.message;
            errorTitle = "Validation Error";
          } else if (typeof errorData.message === "string") {
            errorMessages = [errorData.message];
          }
        } else if (errorData?.error) {
          errorMessages = [errorData.error];
        }

        // If status code is 400, it's a validation error
        if (apiError.response?.status === 400 && errorMessages.length === 0) {
          errorMessages = ["Invalid event data. Please check all fields."];
          errorTitle = "Validation Error";
        }
      } else if (error instanceof Error) {
        if (
          error.message.includes("Invalid") &&
          error.message.includes("date/time")
        ) {
          errorMessages = [
            "Invalid date or time format. Please check your event dates and times.",
          ];
        } else if (error.message.includes("authentication")) {
          errorMessages = [
            "Authentication error. Please log in and try again.",
          ];
        } else if (
          error.message.includes("permission") ||
          error.message.includes("policy")
        ) {
          errorMessages = [
            "Permission denied. Please check your account permissions.",
          ];
        } else if (error.message.includes("validation")) {
          errorMessages = ["Invalid event data. Please check all fields."];
        } else {
          errorMessages = [error.message];
        }
      }

      // If no error messages found, use default
      if (errorMessages.length === 0) {
        errorMessages = ["Something went wrong. Please try again."];
      }

      // Show toast with error messages
      if (errorMessages.length === 1) {
        toast.error(errorTitle, {
          description: errorMessages[0],
        });
      } else {
        // Show first error as main toast, then show others
        toast.error(errorTitle, {
          description: errorMessages[0],
        });

        // Show additional errors after a short delay
        errorMessages.slice(1).forEach((msg, index) => {
          setTimeout(
            () => {
              toast.error("Additional validation error", {
                description: msg,
              });
            },
            (index + 1) * 300,
          );
        });
      }
    }
  };

  // Helper function to ensure all required address fields are present
  const validateAddressData = (eventData: any) => {
    const requiredFields = [
      "addressStreet",
      "addressCity",
      "addressState",
      "addressZip",
    ];
    const missingFields = requiredFields.filter((field) => {
      if (field === "addressZip") {
        return false;
      }
      return !eventData[field];
    });

    if (missingFields.length > 0) {
      throw new Error(
        `Missing required address fields: ${missingFields.join(", ")}`,
      );
    }

    return eventData;
  };

  return (
    <Dashboard activeTab="analytics" userRole="event-host">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Create New Event</h1>
          <p className="text-gray-500 mt-1">
            Set up your event details and invite your guests
          </p>
        </div>

        <Separator />

        {isCreatingEvent && (
          <div className="flex justify-center py-4">
            <Button disabled variant="outline" className="gap-2">
              <Loader className="h-4 w-4 animate-spin" />
              Creating Event...
            </Button>
          </div>
        )}

        <EventForm onSubmit={handleCreateEvent} isEditing={false} />
      </div>
    </Dashboard>
  );
};

export default CreateEventPage;
