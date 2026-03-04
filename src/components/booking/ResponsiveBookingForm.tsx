import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import ServiceStyleSelector from "./ServiceStyleSelector";
import { CateringServiceStyle } from "@/types/service-types";
import GoogleMapsAutocomplete from "@/components/shared/GoogleMapsAutocomplete";
import { LocationData } from "@/components/shared/address/types";
import { FormFieldError } from "@/components/ui/form-field-error";
import { useFormValidation } from "@/hooks/use-form-validation";
import { useFormAutoSave } from "@/hooks/use-form-auto-save";
import { useState, useEffect, useMemo } from "react";
import { useVendorAvailabilityCheck } from "@/hooks/vendor/use-vendor-availability-check";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth";
import { createEventDetailFormSchema } from "@/validations/eventDetailFormValidation";

interface ResponsiveBookingFormProps {
  formData: {
    location: string;
    orderName: string;
    date: string;
    deliveryWindow: string;
    headcount: number;
    primaryContactName: string;
    primaryContactPhone: string;
    primaryContactEmail: string;
    hasBackupContact: boolean;
    backupContactName: string;
    backupContactPhone: string;
    backupContactEmail: string;
    additionalNotes: string;

    serviceStyleSelections?: Record<string, string>;

    clientName?: string;
    clientEmail?: string;
    clientPhone?: string;
    clientCompany?: string;
    invoiceMessage?: string;
    invoiceExpiryDate?: string;
  };
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
  onQuantityChange?: (value: number) => void;
  onDurationChange?: (value: number) => void;
  onServiceStyleChange?: (serviceId: string, style: string) => void;
  onLocationSelected?: (address: string, locationData?: LocationData) => void;
  eventLocationData?: LocationData | null; // Structured location data with coordinates
  serviceType?: string;
  quantity?: number;
  duration?: number;
  isInvoiceMode?: boolean;
  selectedServices?: any[];
  showValidationErrors?: boolean;
}

function ResponsiveBookingForm({
  formData,
  onChange,
  onServiceStyleChange,
  onLocationSelected,
  eventLocationData = null,
  selectedServices = [],
  isInvoiceMode = false,
  showValidationErrors = false,
}: ResponsiveBookingFormProps) {
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>(
    {},
  );
  const [unavailableDates, setUnavailableDates] = useState<Set<string>>(
    new Set(),
  );
  const [closedDays, setClosedDays] = useState<Set<number>>(new Set());

  const { userRole } = useAuth();
  const { checkMultipleVendorsAvailability, getBlockedDates, getClosedDays } =
    useVendorAvailabilityCheck();

  const isAdmin = userRole === "admin" || userRole === "super-admin";

  const eventDetailSchema = useMemo(
    () => createEventDetailFormSchema(isInvoiceMode),
    [isInvoiceMode],
  );

  const getSchemaFieldError = (field: string, value: unknown): string | null => {
    const fieldSchema = (eventDetailSchema.shape as any)[field];
    if (!fieldSchema) return null;
    const result = fieldSchema.safeParse(value);
    return result.success ? null : (result.error.issues[0]?.message ?? null);
  };

  const validationRulesConfig = [
    { field: "orderName", validate: (value: unknown) => getSchemaFieldError("orderName", value) },
    { field: "location", validate: (value: unknown) => getSchemaFieldError("location", value) },
    { field: "date", validate: (value: unknown) => getSchemaFieldError("date", value) },
    { field: "deliveryWindow", validate: (value: unknown) => getSchemaFieldError("deliveryWindow", value) },
    { field: "headcount", validate: (value: unknown) => getSchemaFieldError("headcount", value) },
    ...(isInvoiceMode
      ? [
          { field: "clientName", validate: (value: unknown) => getSchemaFieldError("clientName", value) },
          { field: "clientEmail", validate: (value: unknown) => getSchemaFieldError("clientEmail", value) },
          { field: "clientPhone", validate: (value: unknown) => getSchemaFieldError("clientPhone", value) },
        ]
      : [
          {
            field: "primaryContactName",
            validate: (value: unknown) => getSchemaFieldError("primaryContactName", value),
          },
          {
            field: "primaryContactEmail",
            validate: (value: unknown) => getSchemaFieldError("primaryContactEmail", value),
          },
          {
            field: "primaryContactPhone",
            validate: (value: unknown) => getSchemaFieldError("primaryContactPhone", value),
          },
        ]),
  ];

  const { errors, touchField, getFieldError } = useFormValidation({
    formData,
    validationRules: validationRulesConfig,
  });

  const { isSaving } = useFormAutoSave({
    formData,
    onSave: async (data) => {
      console.log("[ResponsiveBookingForm] Auto-saving form data:", data);
    },
    storageKey: "booking-form-backup",
    debounceMs: 3000,
  });

  const handleFieldFocus = (fieldName: string) => {
    setTouchedFields((prev) => ({ ...prev, [fieldName]: true }));
    touchField(fieldName);
  };

  useEffect(() => {
    if (!selectedServices || selectedServices.length === 0) return;

    const loadAvailabilityRestrictions = async () => {
      const vendorIds = [
        ...new Set(
          selectedServices.map((s: any) => s.vendor_id).filter(Boolean),
        ),
      ];

      if (vendorIds.length === 0) return;

      const blockedDates = await getBlockedDates(vendorIds);
      setUnavailableDates(blockedDates);

      const closed = await getClosedDays(vendorIds);
      setClosedDays(closed);
    };

    loadAvailabilityRestrictions();
  }, [selectedServices]);

  const cateringServices = selectedServices.filter(
    (service) =>
      service.serviceType === "catering" || service.type === "catering",
  );

  const getCateringServiceStyles = (service: any): CateringServiceStyle[] => {
    if (service.service_details?.catering?.serviceStyles) {
      return service.service_details.catering.serviceStyles;
    }
    if (service.serviceDetails?.catering?.serviceStyles) {
      return service.serviceDetails.catering.serviceStyles;
    }
    if (service.service_details?.serviceStyles) {
      return service.service_details.serviceStyles;
    }
    if (service.serviceDetails?.serviceStyles) {
      return service.serviceDetails.serviceStyles;
    }
    return [];
  };
  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <Card className="bg-card shadow-sm border">
        <CardHeader className="pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-lg font-semibold text-foreground">
            {isInvoiceMode ? "Invoice Information" : "Event Details"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-3 sm:px-6 pb-3 sm:pb-6">
          {isInvoiceMode && (
            <>
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-foreground border-b pb-1">
                  Client Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label
                      htmlFor="clientName"
                      className="text-sm font-medium text-gray-700"
                    >
                      Client Name *
                    </Label>
                    <Input
                      id="clientName"
                      name="clientName"
                      type="text"
                      value={formData.clientName || ""}
                      onChange={onChange}
                      onFocus={() => handleFieldFocus("clientName")}
                      className="mt-1"
                      placeholder="Enter client's full name"
                      required
                    />
                    <FormFieldError error={showValidationErrors ? errors["clientName"] : getFieldError("clientName")} />
                  </div>

                  <div>
                    <Label
                      htmlFor="clientCompany"
                      className="text-sm font-medium text-gray-700"
                    >
                      Company (Optional)
                    </Label>
                    <Input
                      id="clientCompany"
                      name="clientCompany"
                      type="text"
                      value={formData.clientCompany || ""}
                      onChange={onChange}
                      className="mt-1"
                      placeholder="Client's company name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label
                      htmlFor="clientEmail"
                      className="text-sm font-medium text-gray-700"
                    >
                      Client Email *
                    </Label>
                    <Input
                      id="clientEmail"
                      name="clientEmail"
                      type="email"
                      value={formData.clientEmail || ""}
                      onChange={onChange}
                      onFocus={() => handleFieldFocus("clientEmail")}
                      className="mt-1"
                      placeholder="client@example.com"
                      required
                    />
                    <FormFieldError error={showValidationErrors ? errors["clientEmail"] : getFieldError("clientEmail")} />
                  </div>

                  <div>
                    <Label
                      htmlFor="clientPhone"
                      className="text-sm font-medium text-gray-700"
                    >
                      Client Phone *
                    </Label>
                    <Input
                      id="clientPhone"
                      name="clientPhone"
                      type="tel"
                      value={formData.clientPhone || ""}
                      onChange={onChange}
                      onFocus={() => handleFieldFocus("clientPhone")}
                      className="mt-1"
                      placeholder="(555) 123-4567"
                      required
                    />
                    <FormFieldError error={showValidationErrors ? errors["clientPhone"] : getFieldError("clientPhone")} />
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="invoiceExpiryDate"
                    className="text-sm font-medium text-gray-700"
                  >
                    Invoice Expiry Date
                  </Label>
                  <Input
                    id="invoiceExpiryDate"
                    name="invoiceExpiryDate"
                    type="date"
                    value={formData.invoiceExpiryDate || ""}
                    onChange={onChange}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="invoiceMessage"
                    className="text-sm font-medium text-gray-700"
                  >
                    Invoice Message
                  </Label>
                  <Textarea
                    id="invoiceMessage"
                    name="invoiceMessage"
                    value={formData.invoiceMessage || ""}
                    onChange={onChange}
                    className="mt-1"
                    rows={3}
                    placeholder="Add a personal message for your client..."
                  />
                </div>
              </div>

              <Separator />
            </>
          )}

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground border-b pb-1">
              {isInvoiceMode ? "Event Information" : "Event Details"}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 ">
              <div>
                <Label
                  htmlFor="orderName"
                  className="text-sm font-medium text-gray-700 "
                >
                  Event Name *
                </Label>
                <Input
                  id="orderName"
                  name="orderName"
                  type="text"
                  value={formData.orderName}
                  onChange={onChange}
                  onFocus={() => handleFieldFocus("orderName")}
                  className="mt-1"
                  placeholder="Annual Company Retreat"
                  required
                />
                <FormFieldError error={showValidationErrors ? errors["orderName"] : getFieldError("orderName")} />
              </div>

              {!isInvoiceMode && (
                <div>
                  <Label
                    htmlFor="company"
                    className="text-sm font-medium text-gray-700"
                  >
                    Company Name (Optional)
                  </Label>
                  <Input
                    id="company"
                    name="company"
                    type="text"
                    value={(formData as any).company || ""}
                    onChange={onChange}
                    className="mt-1"
                    placeholder="Acme Corporation"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Required for business invoices and tax compliance
                  </p>
                </div>
              )}
            </div>

            <div>
              <Label
                htmlFor="location"
                className="text-sm font-medium text-gray-700"
              >
                Event Location *
              </Label>
              <div className="mt-1">
                <GoogleMapsAutocomplete
                  id="location"
                  name="location"
                  value={formData.location}
                  placeholder="Start typing your address..."
                  required
                  onAddressSelected={(address, locationData) => {
                    onChange({
                      target: { name: "location", value: address },
                    } as React.ChangeEvent<HTMLInputElement>);

                    onLocationSelected?.(address, locationData);
                    handleFieldFocus("location");
                  }}
                />
              </div>
              <FormFieldError error={showValidationErrors ? errors["location"] : getFieldError("location")} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Event Date *
                </Label>
                <div className="mt-1">
                  <DatePicker
                    date={
                      formData.date
                        ? new Date(formData.date + "T00:00:00")
                        : undefined
                    }
                    onSelect={async (selectedDate) => {
                      if (selectedDate) {
                        const year = selectedDate.getFullYear();
                        const month = String(
                          selectedDate.getMonth() + 1,
                        ).padStart(2, "0");
                        const day = String(selectedDate.getDate()).padStart(
                          2,
                          "0",
                        );
                        const dateValue = `${year}-${month}-${day}`;
                        const vendorIds = [
                          ...new Set(
                            selectedServices
                              .map((s: any) => s.vendor_id)
                              .filter(Boolean),
                          ),
                        ];

                        if (vendorIds.length > 0) {
                          const { allAvailable, unavailableVendors } =
                            await checkMultipleVendorsAvailability(
                              vendorIds,
                              dateValue,
                              formData.deliveryWindow,
                            );

                          if (!allAvailable) {
                            const vendorMessages = unavailableVendors
                              .map((v) => `• ${v.vendorName}: ${v.reason}`)
                              .join("\n");

                            toast.error("Cannot book this date", {
                              description: `The following vendors are unavailable:\n\n${vendorMessages}`,
                              duration: 6000,
                            });

                            return;
                          }
                        }

                        onChange({
                          target: { name: "date", value: dateValue },
                        } as React.ChangeEvent<HTMLInputElement>);
                        handleFieldFocus("date");
                      }
                    }}
                    disabled={(date) => {
                      if (!isAdmin) {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        if (date < today) return true;
                      }

                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(
                        2,
                        "0",
                      );
                      const day = String(date.getDate()).padStart(2, "0");
                      const dateStr = `${year}-${month}-${day}`;

                      if (unavailableDates.has(dateStr)) return true;

                      const dayOfWeek = date.getDay();
                      if (closedDays.has(dayOfWeek)) return true;

                      return false;
                    }}
                  />
                </div>
                <FormFieldError error={showValidationErrors ? errors["date"] : getFieldError("date")} />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Service Time *
                </Label>
                <div className="mt-1">
                  <TimePicker
                    time={formData.deliveryWindow}
                    onSelect={(selectedTime) => {
                      onChange({
                        target: {
                          name: "deliveryWindow",
                          value: selectedTime || "",
                        },
                      } as React.ChangeEvent<HTMLInputElement>);
                      handleFieldFocus("deliveryWindow");
                    }}
                    placeholder="Select time"
                  />
                </div>
                <FormFieldError error={showValidationErrors ? errors["deliveryWindow"] : getFieldError("deliveryWindow")} />
              </div>

              <div className="lg:col-span-1 sm:col-span-2">
                <Label
                  htmlFor="headcount"
                  className="text-sm font-medium text-gray-700"
                >
                  Guest Count *
                </Label>
                <Input
                  id="headcount"
                  name="headcount"
                  type="number"
                  min="1"
                  value={formData.headcount || ""}
                  onChange={onChange}
                  onFocus={() => handleFieldFocus("headcount")}
                  className="mt-1"
                  placeholder="50"
                  required
                />
                <FormFieldError error={showValidationErrors ? errors["headcount"] : getFieldError("headcount")} />
              </div>
            </div>
          </div>

          {!isInvoiceMode && (
            <>
              <Separator />

              <div className="space-y-3">
                <h3 className="text-sm font-medium text-foreground border-b pb-1">
                  Primary Contact Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label
                      htmlFor="primaryContactName"
                      className="text-sm font-medium text-gray-700"
                    >
                      Contact Name *
                    </Label>
                    <Input
                      id="primaryContactName"
                      name="primaryContactName"
                      type="text"
                      value={formData.primaryContactName}
                      onChange={onChange}
                      onFocus={() => handleFieldFocus("primaryContactName")}
                      className="mt-1"
                      placeholder="John Doe"
                      required
                    />
                    <FormFieldError error={showValidationErrors ? errors["primaryContactName"] : getFieldError("primaryContactName")} />
                  </div>

                  <div>
                    <Label
                      htmlFor="primaryContactPhone"
                      className="text-sm font-medium text-gray-700"
                    >
                      Phone Number *
                    </Label>
                    <Input
                      id="primaryContactPhone"
                      name="primaryContactPhone"
                      type="tel"
                      value={formData.primaryContactPhone}
                      onChange={onChange}
                      onFocus={() => handleFieldFocus("primaryContactPhone")}
                      className="mt-1"
                      placeholder="(555) 123-4567"
                      required
                    />
                    <FormFieldError error={showValidationErrors ? errors["primaryContactPhone"] : getFieldError("primaryContactPhone")} />
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="primaryContactEmail"
                    className="text-sm font-medium text-gray-700"
                  >
                    Email Address *
                  </Label>
                  <Input
                    id="primaryContactEmail"
                    name="primaryContactEmail"
                    type="email"
                    value={formData.primaryContactEmail}
                    onChange={onChange}
                    onFocus={() => handleFieldFocus("primaryContactEmail")}
                    className="mt-1"
                    placeholder="john@example.com"
                    required
                  />
                  <FormFieldError error={showValidationErrors ? errors["primaryContactEmail"] : getFieldError("primaryContactEmail")} />
                </div>

                {/* Backup Contact Section */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="hasBackupContact"
                      name="hasBackupContact"
                      checked={formData.hasBackupContact}
                      onCheckedChange={(checked) =>
                        onChange({
                          target: {
                            name: "hasBackupContact",
                            value: checked,
                            type: "checkbox",
                          },
                        } as any)
                      }
                    />
                    <Label
                      htmlFor="hasBackupContact"
                      className="text-sm font-medium"
                    >
                      Add backup contact
                    </Label>
                  </div>

                  {formData.hasBackupContact && (
                    <div className="space-y-3 pl-4 border-l-2 border-border">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <Label
                            htmlFor="backupContactName"
                            className="text-sm font-medium text-gray-700"
                          >
                            Backup Contact Name
                          </Label>
                          <Input
                            id="backupContactName"
                            name="backupContactName"
                            type="text"
                            value={formData.backupContactName}
                            onChange={onChange}
                            className="mt-1"
                            placeholder="Jane Smith"
                          />
                        </div>

                        <div>
                          <Label
                            htmlFor="backupContactPhone"
                            className="text-sm font-medium text-gray-700"
                          >
                            Backup Phone
                          </Label>
                          <Input
                            id="backupContactPhone"
                            name="backupContactPhone"
                            type="tel"
                            value={formData.backupContactPhone}
                            onChange={onChange}
                            className="mt-1"
                            placeholder="(555) 987-6543"
                          />
                        </div>
                      </div>

                      <div>
                        <Label
                          htmlFor="backupContactEmail"
                          className="text-sm font-medium text-gray-700"
                        >
                          Backup Email
                        </Label>
                        <Input
                          id="backupContactEmail"
                          name="backupContactEmail"
                          type="email"
                          value={formData.backupContactEmail}
                          onChange={onChange}
                          className="mt-1"
                          placeholder="jane@example.com"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          <Separator />

          <div>
            <Label
              htmlFor="additionalNotes"
              className="text-sm font-medium text-gray-700"
            >
              Additional Notes
            </Label>
            <Textarea
              id="additionalNotes"
              name="additionalNotes"
              value={formData.additionalNotes}
              onChange={onChange}
              className="mt-1"
              rows={3}
              placeholder={
                isInvoiceMode
                  ? "Any special requirements or notes for the invoice..."
                  : "Any special dietary restrictions, setup requirements, or other notes..."
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ResponsiveBookingForm;


