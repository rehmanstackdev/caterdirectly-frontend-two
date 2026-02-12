import React, { useState, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Loader } from "lucide-react";
import { groupOrderService } from "@/services/groupOrderService";
import BookingVendorCard from "@/components/booking/BookingVendorCard";
import EnhancedOrderSummaryCard from "@/components/booking/order-summary/EnhancedOrderSummaryCard";
import { ServiceSelection } from "@/types/order";

// Define the form schema
const formSchema = z.object({
  name: z.string().min(2, { message: "Name is required" }),
  email: z.string().email({ message: "Valid email is required" }),
  phone: z.string().optional(),
});

interface GuestOrderFormProps {
  token?: string;
  orderInfo?: InvitationOrderInfo;
  guestEmail?: string;
  showInlineSummary?: boolean;
  infoPortalTargetId?: string;
  onSubmitSuccess?: () => void;
  onSelectionChange?: (payload: {
    selectedServices: ServiceSelection[];
    selectedItems: Record<string, number>;
    subtotal: number;
  }) => void;
}

interface InvitationServiceSummaryItem {
  id: string;
  payloadItemId?: string;
  name: string;
  menuName?: string;
  price: number;
  quantity?: number;
  totalPrice?: number;
  image?: string;
  isComboCategoryItem?: boolean;
  premiumCharge?: number | null;
  maxQuantity?: number;
  cateringId?: string;
  comboId?: string;
  comboCategoryId?: string;
  selectionKey?: string;
}

interface InvitationServiceSummaryRaw {
  invoiceServiceId?: string;
  serviceId?: string;
  serviceName?: string;
  serviceType?: string;
  deliveryFee?: number;
  items?: Array<{
    id?: string;
    name?: string;
    menuItemName?: string;
    menuName?: string;
    price?: number;
    quantity?: number;
    totalPrice?: number;
    image?: string;
    isComboCategoryItem?: boolean;
    premiumCharge?: number | null;
    cateringId?: string;
    comboId?: string;
  }>;
}

interface InvitationMenuItemRaw {
  id?: string;
  name?: string;
  price?: number;
  description?: string;
  maxQuantity?: number;
  quantity?: number;
  image?: string;
  imageUrl?: string;
  imageUri?: string;
}

interface SelectedServiceRaw {
  id?: string;
  serviceId?: string;
  serviceName?: string;
  name?: string;
  serviceType?: string;
  type?: string;
  service_details?: {
    catering?: {
      menuItems?: InvitationMenuItemRaw[];
    };
    menuItems?: InvitationMenuItemRaw[];
  };
}

interface InvitationOrderInfo {
  serviceDetails?: Array<{
    id?: string;
    serviceName?: string;
    name?: string;
    serviceType?: string;
    type?: string;
    catering?: {
      menuPhoto?: string;
      menuItems?: Array<{
        id?: string;
        name?: string;
        description?: string;
        price?: string | number;
        imageUrl?: string;
        imageUri?: string;
        minimumOrderQuantity?: number;
      }>;
      combos?: Array<{
        id?: string;
        name?: string;
        description?: string;
        category?: string;
        pricePerPerson?: string | number;
        imageUrl?: string | null;
        imageUri?: string | null;
        comboCategories?: Array<{
          id?: string;
          name?: string;
          items?: Array<{
            id?: string;
            name?: string;
            price?: number;
            quantity?: number;
            isPremium?: boolean;
            additionalCharge?: number;
            imageUrl?: string;
            imageUri?: string;
            image?: string;
          }>;
        }>;
      }>;
    };
  }>;
  guestBudget?: number;
  budgetPerPerson?: number;
}

const GuestOrderForm = ({
  token,
  orderInfo,
  guestEmail,
  showInlineSummary = true,
  infoPortalTargetId,
  onSubmitSuccess,
  onSelectionChange,
}: GuestOrderFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [invitationServices, setInvitationServices] = useState<ServiceSelection[]>([]);
  const [itemCatalog, setItemCatalog] = useState<Record<string, InvitationServiceSummaryItem>>({});
  const [selectedItemQuantities, setSelectedItemQuantities] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [infoPortalElement, setInfoPortalElement] = useState<HTMLElement | null>(null);

  const getServiceMenuPhoto = (service: ServiceSelection): string => {
    const details = service as ServiceSelection & {
      service_details?: { catering?: { menuPhoto?: string } };
    };
    return details.service_details?.catering?.menuPhoto || "";
  };

  // Initialize the form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: guestEmail || "",
      phone: "",
    },
  });

  useEffect(() => {
    if (guestEmail) {
      form.setValue("email", guestEmail);
    }
  }, [guestEmail, form]);

  useEffect(() => {
    if (!infoPortalTargetId) {
      setInfoPortalElement(null);
      return;
    }

    let rafId = 0;
    const resolveTarget = () => {
      const element = document.getElementById(infoPortalTargetId);
      if (element) {
        setInfoPortalElement(element);
        return;
      }
      rafId = window.requestAnimationFrame(resolveTarget);
    };

    resolveTarget();

    return () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [infoPortalTargetId]);

  // Load menu items when component mounts
  useEffect(() => {
    const loadMenuItems = async () => {
      setLoading(true);
      try {
        if (orderInfo?.serviceDetails && Array.isArray(orderInfo.serviceDetails) && orderInfo.serviceDetails.length > 0) {
          const catalog: Record<string, InvitationServiceSummaryItem> = {};

          const mappedServices: ServiceSelection[] = orderInfo.serviceDetails
            .filter((detail) => (detail.serviceType || detail.type) === "catering")
            .map((detail, serviceIndex) => {
              const serviceId = String(detail.id || `service-detail-${serviceIndex}`);
              const catering = detail.catering || {};
              const menuItems = Array.isArray(catering.menuItems) ? catering.menuItems : [];
              const combos = Array.isArray(catering.combos) ? catering.combos : [];

              const normalizedMenuItems = menuItems.map((item, itemIndex) => {
                const itemId = String(item.id || `${serviceId}_menu_${itemIndex}`);
                const normalized: InvitationServiceSummaryItem = {
                  id: itemId,
                  payloadItemId: itemId,
                  name: item.name || "Menu Item",
                  menuName: item.description || "",
                  price: Number(item.price || 0),
                  maxQuantity: item.minimumOrderQuantity || undefined,
                  image: item.imageUrl || item.imageUri || item.image,
                };
                catalog[itemId] = normalized;
                return {
                  id: itemId,
                  name: normalized.name,
                  description: normalized.menuName,
                  price: normalized.price,
                  image: normalized.image,
                };
              });

              const normalizedCombos = combos.map((combo, comboIndex) => {
                const comboId = String(combo.id || `combo-${serviceId}-${comboIndex}`);
                // Use simple combo id in UI so invitation summary logic matches existing shared utilities.
                const comboPkgId = comboId;
                const comboPrice = Number(combo.pricePerPerson || 0);

                catalog[comboPkgId] = {
                  id: comboPkgId,
                  payloadItemId: comboId,
                  name: combo.name || "Combo Package",
                  menuName: "Combo Package",
                  price: comboPrice,
                  image: combo.imageUrl || combo.imageUri || undefined,
                  cateringId: comboId,
                  comboId,
                };

                const comboCategories = (combo.comboCategories || []).map((category, categoryIndex) => {
                  const categoryId = String(category.id || `category-${categoryIndex}`);
                  return {
                    id: categoryId,
                    name: category.name || "Category",
                    items: (category.items || []).map((categoryItem, itemIndex) => {
                      const categoryItemId = String(categoryItem.id || `item-${itemIndex}`);
                      // Use legacy/simple key format in UI: <comboId>_<categoryId>_<itemId>
                      const selectionKey = `${comboId}_${categoryId}_${categoryItemId}`;
                      const additionalCharge = Number(categoryItem.additionalCharge || 0);
                      catalog[selectionKey] = {
                        id: selectionKey,
                        payloadItemId: categoryItemId,
                        name: categoryItem.name || "Combo Item",
                        menuName: `${combo.name || "Combo"} - ${category.name || "Category"}`,
                        price: Number(categoryItem.price || 0) + additionalCharge,
                        maxQuantity: categoryItem.quantity || undefined,
                        premiumCharge: additionalCharge > 0 ? additionalCharge : null,
                        image: categoryItem.imageUrl || categoryItem.imageUri || categoryItem.image,
                        comboId,
                        comboCategoryId: categoryId,
                        selectionKey,
                      };

                      return {
                        id: categoryItemId,
                        name: categoryItem.name || "Combo Item",
                        price: Number(categoryItem.price || 0),
                        additionalCharge,
                        isPremium: !!categoryItem.isPremium || additionalCharge > 0,
                        image: categoryItem.imageUrl || categoryItem.imageUri || categoryItem.image,
                        selectionKey,
                      };
                    }),
                  };
                });

                return {
                  id: comboPkgId,
                  comboId,
                  name: combo.name || "Combo Package",
                  description: combo.description || "",
                  category: combo.category || "Combo",
                  pricePerPerson: comboPrice,
                  imageUrl: combo.imageUrl || combo.imageUri || "",
                  comboCategories,
                };
              });

              return {
                id: serviceId,
                serviceId,
                serviceName: detail.serviceName || detail.name || `Service ${serviceIndex + 1}`,
                name: detail.serviceName || detail.name || `Service ${serviceIndex + 1}`,
                serviceType: "catering",
                type: "catering",
                service_details: {
                  catering: {
                    menuPhoto: catering.menuPhoto || "",
                    menuItems: normalizedMenuItems,
                    combos: normalizedCombos,
                  },
                },
              } as ServiceSelection;
            });

          if (mappedServices.length > 0) {
            setItemCatalog(catalog);
            setInvitationServices(mappedServices);
            setLoading(false);
            return;
          }
        }

        setError("No service details available for this invitation.");
        setLoading(false);
      } catch (err) {
        setError("Failed to load menu items");
        setLoading(false);
      }
    };

    loadMenuItems();
  }, [orderInfo]);

  const guestBudget = orderInfo?.guestBudget || orderInfo?.budgetPerPerson;

  const resolveCatalogItem = useCallback((itemId: string): InvitationServiceSummaryItem | undefined => {
    if (itemCatalog[itemId]) return itemCatalog[itemId];

    const parts = itemId.split("_");
    if (parts.length >= 3) {
      const rawId = parts[parts.length - 1];
      return itemCatalog[`combo_${rawId}`] || itemCatalog[rawId];
    }

    return undefined;
  }, [itemCatalog]);

  // Handle quantity changes from booking-style item selector
  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    setSelectedItemQuantities((prev) => {
      const normalizedQuantity = Math.max(0, Math.floor(newQuantity || 0));
      const item = resolveCatalogItem(itemId);
      if (!item) return prev;

      if (
        item.maxQuantity !== undefined &&
        item.maxQuantity !== null &&
        normalizedQuantity > item.maxQuantity
      ) {
        toast.error("Selected item quantity exceeds available quantity.");
        return prev;
      }

      const currentSubtotalExcludingItem = Object.entries(prev).reduce((sum, [id, qty]) => {
        if (id === itemId || qty <= 0) return sum;
        const catalogItem = resolveCatalogItem(id);
        return sum + (catalogItem?.price || 0) * qty;
      }, 0);

      if (guestBudget && currentSubtotalExcludingItem + item.price * normalizedQuantity > guestBudget) {
        toast.error("Selected items exceed guest budget.");
        return prev;
      }

      const updated = { ...prev };
      if (normalizedQuantity === 0) {
        delete updated[itemId];
      } else {
        updated[itemId] = normalizedQuantity;
      }

      return updated;
    });
  };

  // Format price in dollars
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const selectedItems = useMemo(() => {
    return Object.entries(selectedItemQuantities)
      .filter(([, quantity]) => quantity > 0)
      .map(([id, quantity]) => {
        const item = resolveCatalogItem(id);
        return {
          id,
          name: item?.name || "Menu Item",
          price: Number(item?.price || 0),
          quantity,
        };
      });
  }, [selectedItemQuantities, resolveCatalogItem]);

  // Calculate subtotal
  const subtotal = selectedItems.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);

  const remainingBudget = guestBudget ? Math.max(guestBudget - subtotal, 0) : null;

  useEffect(() => {
    if (!onSelectionChange) return;
    onSelectionChange({
      selectedServices: invitationServices,
      selectedItems: selectedItemQuantities,
      subtotal,
    });
  }, [onSelectionChange, invitationServices, selectedItemQuantities, subtotal]);

  // Submit the order
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (selectedItems.length === 0) {
      toast.error("Please select at least one item");
      return;
    }

    setIsSubmitting(true);
    try {
      if (token) {
        // Submit real guest order
        const success = await groupOrderService.submitGuestOrder(
          token,
          {
            name: values.name,
            email: values.email,
            phone: values.phone,
          },
          selectedItems.map((item) => ({
            // Always send canonical/simple item ID in payload.
            id: resolveCatalogItem(item.id)?.payloadItemId || item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          }))
        );

        if (success) {
          setSubmitted(true);
          onSubmitSuccess?.();
          toast.success("Your order has been submitted successfully!");
        } else {
          toast.error("Failed to submit your order. Please try again.");
        }
      } else {
        console.log("Submitting regular order:", {
          guest: values,
          items: selectedItems,
        });

        // Simulate success for demo
        setSubmitted(true);
        onSubmitSuccess?.();
        toast.success("Your order has been submitted");
      }
    } catch (err: unknown) {
      console.error("Error submitting order:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to submit your order. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card className="max-w-4xl mx-auto border-black/10 shadow-sm">
        <CardHeader>
          <h2 className="text-2xl font-bold text-center">Thank You!</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center">Your order has been submitted successfully.</p>

          <div className="border rounded-lg p-4 space-y-2">
            <h3 className="font-semibold">Order Summary</h3>
            {selectedItems.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span>
                  {item.quantity} x {item.name}
                </span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
            <Separator className="my-2" />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader className="h-8 w-8 animate-spin text-[#F07712]" />
        <p className="mt-4 text-gray-500">Loading menu items...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="max-w-4xl mx-auto border-black/10 shadow-sm">
        <CardContent className="py-12 text-center">
          <p className="text-red-500">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="w-full border-black/10 shadow-sm">
        <CardHeader className="px-5 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold">Select Menu Items</h2>
              <p className="text-gray-500 text-sm">Choose what you want within your budget</p>
            </div>
            {guestBudget && (
              <div className="rounded-full bg-[#fff3e5] px-3 py-1 text-xs font-semibold text-[#b14c12]">
                Budget: {formatPrice(guestBudget)}
              </div>
            )}
          </div>
          {guestBudget && (
            <p className="text-sm text-gray-600 mt-2">
              Remaining: {remainingBudget !== null ? formatPrice(remainingBudget) : formatPrice(guestBudget)}
            </p>
          )}
        </CardHeader>

        <CardContent className="space-y-4 sm:space-y-6 px-5 sm:px-6">
          <div className="space-y-4">
            <div className="max-h-[58vh] overflow-y-auto pr-1 space-y-3">
              {invitationServices.map((service, serviceIndex) => (
                <BookingVendorCard
                  key={service.id || service.serviceId || serviceIndex}
                  vendorImage={getServiceMenuPhoto(service)}
                  vendorName={service.serviceName || service.name}
                  vendorType={String(service.serviceType || service.type || "catering").replace(/_/g, " ")}
                  serviceDetails={service}
                  selectedItems={selectedItemQuantities}
                  onItemQuantityChange={handleUpdateQuantity}
                  showChangeService={false}
                  canRemove={false}
                  serviceIndex={serviceIndex}
                />
              ))}
            </div>
          </div>

          {showInlineSummary && (
            <div className="space-y-3">
              <h3 className="font-semibold text-base sm:text-lg">Order Summary</h3>
              <EnhancedOrderSummaryCard
                selectedServices={invitationServices}
                selectedItems={selectedItemQuantities}
              />

              {selectedItems.length > 0 && (
                <div className="border border-black/10 rounded-xl p-3 sm:p-4 bg-[#fffaf5]">
                  {selectedItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-xs sm:text-sm py-1">
                      <span className="break-words flex-1 mr-2">
                        {item.quantity} x {item.name}
                      </span>
                      <span className="flex-shrink-0">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  <Separator className="my-2" />
                  <div className="flex justify-between font-semibold text-sm sm:text-base">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                </div>
              )}

              {Object.keys(itemCatalog).length === 0 && (
                <div className="rounded-lg border border-black/10 bg-white p-4 text-sm text-gray-600">
                  No menu items available for this invitation.
                </div>
              )}
            </div>
          )}

          {(() => {
            const infoSection = (
              <div className="border border-black/10 rounded-xl p-3 sm:p-4 bg-white">
                <h3 className="font-semibold mb-4 text-base sm:text-lg">Your Information</h3>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm sm:text-base">Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your full name" {...field} className="text-sm sm:text-base" />
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
                            <FormLabel className="text-sm sm:text-base">Email</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Your email"
                                {...field}
                                disabled={!!guestEmail}
                                className="text-sm sm:text-base"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel className="text-sm sm:text-base">Phone (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Your phone number"
                                {...field}
                                className="text-sm sm:text-base"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full mt-4 h-10 sm:h-12 text-sm sm:text-base"
                      disabled={isSubmitting || selectedItems.length === 0}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader className="mr-2 h-4 w-4 animate-spin" />
                          Check Out...
                        </>
                      ) : (
                        "Check Out"
                      )}
                    </Button>
                  </form>
                </Form>
              </div>
            );

            if (infoPortalTargetId) {
              if (!infoPortalElement) return null;
              return createPortal(infoSection, infoPortalElement);
            }

            return infoSection;
          })()}
        </CardContent>
      </Card>
    </div>
  );
};

export default GuestOrderForm;
