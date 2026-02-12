import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";

interface EventTitleAndVenueProps {
  form: UseFormReturn<any>;
}

const EventTitleAndVenue = ({ form }: EventTitleAndVenueProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="title"
        rules={{
          required: "Event title is required",
          minLength: {
            value: 3,
            message: "Title must be at least 3 characters",
          },
        }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Event Title</FormLabel>
            <FormControl>
              <Input placeholder="Tech Conference 2025" {...field} />
            </FormControl>
            <FormDescription>
              Give your event a clear, descriptive name
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="venueName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Venue Name</FormLabel>
            <FormControl>
              <Input placeholder="Convention Center" {...field} />
            </FormControl>
            <FormDescription>Where will your event be held?</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default EventTitleAndVenue;
