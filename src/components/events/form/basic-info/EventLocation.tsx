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

            {form.watch("addressFull") && (
              <div className="text-xs text-muted-foreground bg-green-50 dark:bg-green-950 p-3 rounded space-y-1 border border-green-200 dark:border-green-800">
                <p className="font-medium text-green-700 dark:text-green-300">
                  ✓ Location verified with coordinates
                </p>

                <div className="grid grid-cols-1 gap-1 mt-2">
                  {form.watch("addressStreet") && (
                    <div className="flex items-start gap-2">
                      <span className="font-semibold text-green-800 dark:text-green-200 min-w-[80px]">
                        Address:
                      </span>
                      <span className="text-green-600 dark:text-green-400">
                        {form.watch("addressStreet")}
                      </span>
                    </div>
                  )}

                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-green-800 dark:text-green-200 min-w-[80px]">
                      City:
                    </span>
                    <span className="text-green-600 dark:text-green-400">
                      {form.watch("addressCity")}
                    </span>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-green-800 dark:text-green-200 min-w-[80px]">
                      State:
                    </span>
                    <span className="text-green-600 dark:text-green-400">
                      {form.watch("addressState")}
                    </span>
                  </div>

                  {form.watch("addressZip") && (
                    <div className="flex items-start gap-2">
                      <span className="font-semibold text-green-800 dark:text-green-200 min-w-[80px]">
                        Zip Code:
                      </span>
                      <span className="text-green-600 dark:text-green-400">
                        {form.watch("addressZip")}
                      </span>
                    </div>
                  )}

                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-green-800 dark:text-green-200 min-w-[80px]">
                      Full Address:
                    </span>
                    <span className="text-green-600 dark:text-green-400">
                      {form.watch("addressFull")}
                    </span>
                  </div>

                  {form.watch("coordinatesLat") &&
                    form.watch("coordinatesLng") && (
                      <div className="flex items-start gap-2 mt-2 pt-2 border-t border-green-200 dark:border-green-700">
                        <span className="font-semibold text-green-800 dark:text-green-200 min-w-[80px]">
                          Coordinates:
                        </span>
                        <span className="text-green-600 dark:text-green-400 font-mono text-[10px]">
                          {form.watch("coordinatesLat")?.toFixed(6)},{" "}
                          {form.watch("coordinatesLng")?.toFixed(6)}
                        </span>
                      </div>
                    )}
                </div>
              </div>
            )}

            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default EventLocation;
