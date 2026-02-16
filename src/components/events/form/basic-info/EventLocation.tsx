import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import GoogleMapsAutocomplete from "@/components/shared/GoogleMapsAutocomplete";
import { LocationData } from "@/components/shared/address/types";
import { UseFormReturn } from "react-hook-form";

interface EventLocationProps {
  form: UseFormReturn<any>;
}

const EventLocation = ({ form }: EventLocationProps) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="venueName"
        render={({ field }) => (
          <FormItem>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="addressFull"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Event Address</FormLabel>
            <FormControl>
              <div className="space-y-2">
                <GoogleMapsAutocomplete
                  placeholder="Start typing an address..."
                  onAddressSelected={(address, locationData) => {
                    console.log("EventLocation: Address selected", {
                      address,
                      locationData,
                    });

                    // Update the full address field
                    field.onChange(address);
                    form.setValue("addressFull", address, {
                      shouldValidate: true,
                    });

                    // Update structured address fields
                    if (locationData) {
                      form.setValue(
                        "addressStreet",
                        locationData.street || "",
                        { shouldValidate: true },
                      );
                      form.setValue("addressCity", locationData.city || "", {
                        shouldValidate: true,
                      });
                      form.setValue("addressState", locationData.state || "", {
                        shouldValidate: true,
                      });
                      form.setValue("addressZip", locationData.zipCode || "", {
                        shouldValidate: true,
                      });

                      // Update coordinates if available
                      if (locationData.lat && locationData.lng) {
                        form.setValue("coordinatesLat", locationData.lat);
                        form.setValue("coordinatesLng", locationData.lng);
                      } else if (locationData.coordinates) {
                        form.setValue(
                          "coordinatesLat",
                          locationData.coordinates.lat,
                        );
                        form.setValue(
                          "coordinatesLng",
                          locationData.coordinates.lng,
                        );
                      }
                    }

                    // Force form validation to re-run
                    form.trigger([
                      "addressFull",
                      "addressStreet",
                      "addressCity",
                      "addressState",
                      "addressZip",
                    ]);
                  }}
                  required
                  value={field.value}
                />
              </div>
            </FormControl>
            <FormDescription>
              📍 Using Google Maps for accurate address and coordinates
            </FormDescription>

            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default EventLocation;
