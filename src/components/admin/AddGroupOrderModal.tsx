import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import GoogleMapsAutocomplete from "@/components/shared/GoogleMapsAutocomplete";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { groupOrderSchema, GroupOrderData } from "@/validations/groupOrderValidation";
import { useEffect, useRef } from "react";

interface AddGroupOrderModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: GroupOrderData) => void;
}

export default function AddGroupOrderModal({ open, onClose, onSubmit }: AddGroupOrderModalProps) {
  const ignoreNextCloseRef = useRef(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<GroupOrderData>({
    resolver: zodResolver(groupOrderSchema),
    defaultValues: {
      eventName: "",
      address: "",
      date: "",
      time: "",
      budgetPerPerson: "",
      contactName: "",
      phone: "",
      email: "",
    },
  });

  const onSubmitForm = (data: GroupOrderData) => {
    onSubmit(data);
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      if (ignoreNextCloseRef.current) {
        return;
      }
      handleClose();
    }
  };

  useEffect(() => {
    const markGooglePlacesInteraction = (event: Event) => {
      const target = event.target as Element | null;
      if (target?.closest(".pac-container, .pac-item, .pac-item-query, .pac-icon")) {
        ignoreNextCloseRef.current = true;
        window.setTimeout(() => {
          ignoreNextCloseRef.current = false;
        }, 200);
      }
    };

    document.addEventListener("pointerdown", markGooglePlacesInteraction, true);
    document.addEventListener("touchstart", markGooglePlacesInteraction, true);

    return () => {
      document.removeEventListener("pointerdown", markGooglePlacesInteraction, true);
      document.removeEventListener("touchstart", markGooglePlacesInteraction, true);
    };
  }, []);

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent
        className="w-[calc(100vw-1.5rem)] sm:w-full max-w-4xl max-h-[90vh] overflow-y-auto px-5 sm:px-6 [&_label]:text-sm sm:[&_label]:text-base [&_input]:text-sm sm:[&_input]:text-base"
      >
        <DialogHeader>
          <DialogTitle className="text-left text-lg sm:text-xl">Add Group Order</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          <div>
            <Label htmlFor="eventName" className="mb-1.5 block">Event Name *</Label>
            <Input
              id="eventName"
              {...register("eventName")}
              className={errors.eventName ? "border-red-500" : ""}
            />
            {errors.eventName && <p className="text-red-500 text-sm mt-1">{errors.eventName.message}</p>}
          </div>

          <div>
            <Label htmlFor="location" className="mb-1.5 block">Event Location *</Label>
            <GoogleMapsAutocomplete
              id="location"
              name="address"
              value={watch("address")}
              placeholder="Start typing your address..."
              required
              onAddressChange={(address) => {
                setValue("address", address, {
                  shouldValidate: true,
                  shouldDirty: true,
                  shouldTouch: true,
                });
              }}
              onAddressSelected={(address) => {
                setValue("address", address, {
                  shouldValidate: true,
                  shouldDirty: true,
                  shouldTouch: true,
                });
              }}
            />
            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5 block">Event Date *</Label>
              <DatePicker
                date={watch("date") ? new Date(watch("date") + 'T00:00:00') : undefined}
                onSelect={(selectedDate) => {
                  if (selectedDate) {
                    const year = selectedDate.getFullYear();
                    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                    const day = String(selectedDate.getDate()).padStart(2, '0');
                    setValue("date", `${year}-${month}-${day}`, {
                      shouldValidate: true,
                      shouldDirty: true,
                      shouldTouch: true,
                    });
                  }
                }}
                disabled={(date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return date < today;
                }}
              />
              {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>}
            </div>
            <div>
              <Label className="mb-1.5 block">Time *</Label>
              <TimePicker
                time={watch("time")}
                onSelect={(selectedTime) => {
                  setValue("time", selectedTime || '', {
                    shouldValidate: true,
                    shouldDirty: true,
                    shouldTouch: true,
                  });
                }}
                placeholder="Select time"
              />
              {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="budgetPerPerson" className="mb-1.5 block">Budget Per Person (Optional)</Label>
            <Input
              id="budgetPerPerson"
              type="number"
              step="0.01"
              {...register("budgetPerPerson")}
            />
          </div>

          <div>
            <Label htmlFor="contactName" className="mb-1.5 block">Host Name *</Label>
            <Input
              id="contactName"
              {...register("contactName")}
              className={errors.contactName ? "border-red-500" : ""}
            />
            {errors.contactName && <p className="text-red-500 text-sm mt-1">{errors.contactName.message}</p>}
          </div>

          <div>
            <Label htmlFor="phone" className="mb-1.5 block">Host Phone No. *</Label>
            <Input
              id="phone"
              type="tel"
              {...register("phone", {
                onChange: (e) => {
                  e.target.value = e.target.value.replace(/[^0-9]/g, '');
                }
              })}
              onKeyPress={(e) => {
                if (!/[0-9]/.test(e.key)) {
                  e.preventDefault();
                }
              }}
              className={errors.phone ? "border-red-500" : ""}
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
          </div>

          <div>
            <Label htmlFor="email" className="mb-1.5 block">Host Email *</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#F07712] hover:bg-[#F07712]/90 text-white">
              Create Group Order
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
