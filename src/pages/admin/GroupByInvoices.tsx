import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Dashboard from "@/components/dashboard/Dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import OrderItemsBreakdown from "@/components/order-summary/OrderItemsBreakdown";
import invoiceService from "@/services/api/invoice.Service";
import { ServiceSelection } from "@/types/order";
import { CustomAdjustment } from "@/types/adjustments";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  User,
  Mail,
  Phone,
} from "lucide-react";

const GroupByInvoices = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedServices, setSelectedServices] = useState<ServiceSelection[]>(
    [],
  );
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>(
    {},
  );
  const [formData, setFormData] = useState<any>({});
  const [hostGuestOrders, setHostGuestOrders] = useState<
    Array<{ id: string; guestName: string; guestEmail: string }>
  >([]);

  const getSummaryPayload = (response: any) => {
    const candidates = [response, response?.data, response?.data?.data];
    return candidates.find((candidate: any) => candidate?.invoice) || null;
  };

  const buildServicesFromGuestOrders = useCallback(
    (guestOrders: any[] = []) => {
      const servicesById = new Map<string, any>();

      const ensureService = (serviceIdRaw: any) => {
        const serviceId =
          String(serviceIdRaw || "").trim() || "unknown-service";
        if (!servicesById.has(serviceId)) {
          servicesById.set(serviceId, {
            id: `guest-${serviceId}`,
            serviceId,
            serviceType: "catering",
            serviceName: "Catering Service",
            totalPrice: 0,
            priceType: "flat",
            price: 0,
            quantity: 1,
            image: "",
            vendorId: undefined,
            deliveryFee: "0",
            cateringItems: [],
            comboCategoryItems: [],
          });
        }
        return servicesById.get(serviceId);
      };

      for (const order of guestOrders || []) {
        const cateringItems = Array.isArray(order?.cateringItems)
          ? order.cateringItems
          : [];
        const comboItems = Array.isArray(order?.comboItems)
          ? order.comboItems
          : [];

        for (const item of cateringItems) {
          const service = ensureService(
            item?.serviceId || item?.service_id || item?.serviceID,
          );
          service.cateringItems.push({
            ...item,
            price: Number(item?.price || 0),
            quantity: Number(item?.quantity || 0),
            totalPrice: Number(item?.totalPrice || 0),
          });
          service.totalPrice += Number(item?.totalPrice || 0);
          if (!service.image && item?.image) service.image = item.image;
        }

        for (const item of comboItems) {
          const service = ensureService(
            item?.serviceId || item?.service_id || item?.serviceID,
          );
          const premiumCharge =
            item?.premiumCharge ?? item?.additionalCharge ?? 0;
          const quantity = Number(item?.quantity || 0);
          service.comboCategoryItems.push({
            ...item,
            price: Number(item?.price || 0),
            quantity: Number(item?.quantity || 0),
            totalPrice: Number(item?.totalPrice || 0),
            premiumCharge:
              item?.premiumCharge != null ? Number(item.premiumCharge) : 0,
          });
          if (premiumCharge) {
            service.totalPrice += Number(premiumCharge) * (quantity || 1);
          }
          if (!service.image && item?.image) service.image = item.image;
        }
      }

      return Array.from(servicesById.values()).map((service) => ({
        ...service,
        totalPrice: Number(service.totalPrice.toFixed(2)),
        serviceName: service.serviceName || "Catering Service",
      }));
    },
    [],
  );

  const { isTaxExempt, isServiceFeeWaived } = useMemo(() => {
    const hasValidFormData =
      formData &&
      typeof formData === "object" &&
      Object.keys(formData).length > 0;

    if (!hasValidFormData) {
      return {
        isTaxExempt: false,
        isServiceFeeWaived: false,
      };
    }

    const overrides = formData.adminOverrides || null;
    return {
      isTaxExempt: Boolean(overrides?.isTaxExempt ?? formData?.isTaxExempt),
      isServiceFeeWaived: Boolean(
        overrides?.isServiceFeeWaived ?? formData?.isServiceFeeWaived,
      ),
    };
  }, [formData]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "PPP");
    } catch {
      return dateString;
    }
  };

  useEffect(() => {
    const loadInvoiceSummary = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const response = await invoiceService.getGroupOrderHostSummary(id);
        const summaryData = getSummaryPayload(response);

        if (!summaryData?.invoice) {
          toast.error("Failed to load invoice");
          return;
        }

        const invoiceData = summaryData.invoice;
        const mappedGuestOrders = Array.isArray(
          (summaryData as any).guestOrders,
        )
          ? (summaryData as any).guestOrders.map((order: any) => ({
              id: order.id || "",
              guestName: order.guestName || "Guest",
              guestEmail: order.guestEmail || "-",
            }))
          : [];

        let apiServices: any[] =
          Array.isArray(invoiceData.services) && invoiceData.services.length > 0
            ? invoiceData.services
            : Array.isArray((summaryData as any).services)
              ? (summaryData as any).services
              : [];

        const guestOrders = Array.isArray((summaryData as any).guestOrders)
          ? (summaryData as any).guestOrders
          : [];
        const guestServices =
          guestOrders.length > 0
            ? buildServicesFromGuestOrders(guestOrders)
            : [];
        if (apiServices.length === 0 && guestServices.length > 0) {
          apiServices = guestServices;
        } else if (guestServices.length > 0) {
          const mergedByServiceId = new Map<string, any>();
          apiServices.forEach((service) => {
            const key = String(service.serviceId || service.id || "");
            mergedByServiceId.set(key, service);
          });
          guestServices.forEach((guestService) => {
            const key = String(guestService.serviceId || guestService.id || "");
            const existing = mergedByServiceId.get(key);
            if (!existing) {
              mergedByServiceId.set(key, guestService);
              return;
            }
            const existingCateringItems = Array.isArray(existing.cateringItems)
              ? existing.cateringItems
              : [];
            const existingComboItems = Array.isArray(
              existing.comboCategoryItems,
            )
              ? existing.comboCategoryItems
              : [];
            const extraCatering = Array.isArray(guestService.cateringItems)
              ? guestService.cateringItems
              : [];
            const extraCombo = Array.isArray(guestService.comboCategoryItems)
              ? guestService.comboCategoryItems
              : [];

            const mergedCateringItems = [
              ...existingCateringItems,
              ...extraCatering,
            ].filter((item) => item);
            const mergedComboItems = [
              ...existingComboItems,
              ...extraCombo,
            ].filter((item) => item);
            const cateringKeySet = new Set<string>();
            const comboKeySet = new Set<string>();

            const dedupedCateringItems = mergedCateringItems.filter((item) => {
              const itemId = String(item.cateringId || item.id || "");
              if (!itemId || cateringKeySet.has(itemId)) return false;
              cateringKeySet.add(itemId);
              return true;
            });
            const dedupedComboItems = mergedComboItems.filter((item) => {
              const comboKey = `${item.comboId || ""}-${
                item.cateringId || item.id || ""
              }`;
              if (comboKeySet.has(comboKey)) return false;
              comboKeySet.add(comboKey);
              return true;
            });

            mergedByServiceId.set(key, {
              ...existing,
              serviceType: existing.serviceType || guestService.serviceType,
              serviceName: existing.serviceName || guestService.serviceName,
              image: existing.image || guestService.image,
              cateringItems: dedupedCateringItems,
              comboCategoryItems: dedupedComboItems,
              totalPrice:
                Number(existing.totalPrice || 0) +
                Number(guestService.totalPrice || 0),
            });
          });
          apiServices = Array.from(mergedByServiceId.values());
        }

        const mappedSelectedItems: Record<string, number> = {};

        const mappedServices: ServiceSelection[] = apiServices.map(
          (service: any) => {
            const serviceId = service.id;
            const serviceType = service.serviceType || "";

            let serviceItems: any[] = [];
            let menuItems: any[] = [];
            let rentalItems: any[] = [];
            let staffItems: any[] = [];
            let venueItems: any[] = [];

            if (service.cateringItems && service.cateringItems.length > 0) {
              serviceItems = service.cateringItems;
              menuItems = service.cateringItems.map((item: any) => {
                const comboCategoryItems = apiServices.flatMap((s: any) =>
                  (s.comboCategoryItems || []).filter(
                    (comboItem: any) =>
                      comboItem.comboId === (item.cateringId || item.id),
                  ),
                );

                return {
                  id: item.cateringId || item.id,
                  name: item.menuItemName || item.name,
                  price: parseFloat(item.price || 0),
                  quantity: item.quantity || 1,
                  category: item.menuName || "Menu",
                  menuName: item.menuName,
                  menuItemName: item.menuItemName,
                  isCombo:
                    comboCategoryItems.length > 0 || item.isCombo || false,
                  comboCategories: item.comboCategories || [],
                  comboCategoryItems: comboCategoryItems,
                  priceType: item.priceType || "fixed",
                  image: item.image || item.imageUrl,
                  imageUrl: item.imageUrl || item.image,
                  description: item.description || "",
                };
              });

              service.cateringItems.forEach((item: any) => {
                const itemId = item.cateringId || item.id;
                if (itemId) {
                  mappedSelectedItems[itemId] =
                    (mappedSelectedItems[itemId] || 0) + (item.quantity || 1);
                }
              });
            }

            if (serviceType === "catering") {
              const allComboCategoryItems = service.comboCategoryItems || [];
              const comboGroups = new Map();

              allComboCategoryItems.forEach((item: any) => {
                if (!comboGroups.has(item.comboId)) {
                  comboGroups.set(item.comboId, []);
                }
                comboGroups.get(item.comboId).push(item);
              });

              comboGroups.forEach((comboCategoryItems, comboId) => {
                const existingCombo = menuItems.find(
                  (item) => item.id === comboId,
                );
                const matchingCateringItem = service.cateringItems?.find(
                  (item: any) => (item.cateringId || item.id) === comboId,
                );
                const comboImage =
                  comboCategoryItems[0]?.image ||
                  matchingCateringItem?.image ||
                  "";
                if (!existingCombo) {
                  const comboName =
                    matchingCateringItem?.menuItemName ||
                    matchingCateringItem?.menuName ||
                    matchingCateringItem?.name ||
                    "Combo";
                  menuItems.push({
                    id: comboId,
                    name: comboName,
                    price: matchingCateringItem
                      ? parseFloat(matchingCateringItem.price || 0)
                      : 0,
                    quantity: matchingCateringItem?.quantity || 1,
                    category: "Combo Packages",
                    menuName: "Combo Packages",
                    menuItemName: comboName,
                    isCombo: true,
                    comboCategories: [],
                    comboCategoryItems: comboCategoryItems.map((item: any) => ({
                      ...item,
                      image: item.image || item.imageUrl || "",
                    })),
                    priceType: "fixed",
                    image: comboImage,
                    imageUrl: comboImage,
                    description: "",
                  });
                  mappedSelectedItems[comboId] =
                    matchingCateringItem?.quantity || 0;
                } else {
                  existingCombo.comboCategoryItems = comboCategoryItems.map(
                    (item: any) => ({
                      ...item,
                      image: item.image || item.imageUrl || "",
                    }),
                  );
                  if (comboImage && !existingCombo.image) {
                    existingCombo.image = comboImage;
                    existingCombo.imageUrl = comboImage;
                  }
                }
              });
            }

            if (
              service.partyRentalItems &&
              service.partyRentalItems.length > 0
            ) {
              serviceItems = service.partyRentalItems;
              rentalItems = service.partyRentalItems.map((item: any) => ({
                id: item.rentalId || item.id,
                name: item.name,
                price: parseFloat(item.eachPrice || item.price || 0),
                priceType: "fixed",
              }));

              service.partyRentalItems.forEach((item: any) => {
                const itemId = item.rentalId || item.id;
                if (itemId) {
                  mappedSelectedItems[itemId] =
                    (mappedSelectedItems[itemId] || 0) + (item.quantity || 1);
                }
              });
            }

            if (service.staffItems && service.staffItems.length > 0) {
              serviceItems = service.staffItems;
              staffItems = service.staffItems.map((item: any) => ({
                id: item.staffId || item.id,
                name: item.name,
                price: parseFloat(item.perHourPrice || item.price || 0),
                pricingType: item.pricingType || "hourly",
                perHourPrice: parseFloat(item.perHourPrice || item.price || 0),
              }));

              service.staffItems.forEach((item: any) => {
                const itemId = item.staffId || item.id;
                if (itemId) {
                  mappedSelectedItems[itemId] =
                    (mappedSelectedItems[itemId] || 0) + 1;
                  if (item.hours) {
                    mappedSelectedItems[`${itemId}_duration`] = item.hours;
                  }
                }
              });
            }

            if (service.venueItems && service.venueItems.length > 0) {
              serviceItems = service.venueItems;
              venueItems = service.venueItems.map((item: any) => ({
                id: item.id,
                name: item.name,
                price: parseFloat(item.price || 0),
              }));
            }

            let serviceDetails: any = {};
            if (serviceType === "catering") {
              const mappedComboCategoryItems = (
                service.comboCategoryItems || []
              ).map((item: any) => ({
                id: item.id,
                name: item.menuItemName || item.name,
                menuName: item.menuName,
                price: parseFloat(item.price) || 0,
                quantity: item.quantity || 1,
                additionalCharge: item.premiumCharge
                  ? parseFloat(item.premiumCharge)
                  : 0,
                comboId: item.comboId,
                cateringId: item.cateringId,
                image: item.image || item.imageUrl || "",
              }));

              const menuItemsWithImages = menuItems.map((mi: any) => ({
                ...mi,
                image: mi.image || mi.imageUrl || "",
              }));

              const comboIds = [
                ...new Set(
                  mappedComboCategoryItems.map((item: any) => item.comboId),
                ),
              ];
              const combos = comboIds.map((comboId: any) => {
                const comboItems = mappedComboCategoryItems.filter(
                  (item: any) => item.comboId === comboId,
                );
                const categoryMap = new Map();
                comboItems.forEach((item: any) => {
                  if (!categoryMap.has(item.menuName)) {
                    categoryMap.set(item.menuName, {
                      id: item.menuName,
                      categoryId: item.menuName,
                      name: item.menuName,
                      items: [],
                    });
                  }
                  categoryMap.get(item.menuName).items.push({
                    id: item.cateringId || item.id,
                    itemId: item.cateringId || item.id,
                    name: item.name,
                    price: item.price,
                    additionalCharge: item.additionalCharge,
                    image: item.image || "",
                  });
                });

                const matchingCateringItem = service.cateringItems?.find(
                  (ci: any) => (ci.cateringId || ci.id) === comboId,
                );
                const comboName =
                  matchingCateringItem?.menuItemName ||
                  matchingCateringItem?.menuName ||
                  matchingCateringItem?.name ||
                  "Combo";

                return {
                  id: comboId,
                  name: comboName,
                  isCombo: true,
                  pricePerPerson: matchingCateringItem
                    ? parseFloat(matchingCateringItem.price || 0)
                    : 0,
                  comboCategories: Array.from(categoryMap.values()),
                };
              });

              serviceDetails = {
                catering: {
                  menuItems: menuItemsWithImages,
                  combos: combos,
                },
                menuItems: menuItemsWithImages,
                comboCategoryItems: mappedComboCategoryItems,
              };
            } else if (
              serviceType === "party_rentals" ||
              serviceType === "party-rentals" ||
              serviceType === "party-rental"
            ) {
              serviceDetails = {
                rentalItems: rentalItems,
                rental: {
                  items: rentalItems,
                },
              };
            } else if (
              serviceType === "events_staff" ||
              serviceType === "staff"
            ) {
              serviceDetails = {
                staffServices: staffItems,
                services: staffItems,
                staff: {
                  services: staffItems,
                },
              };
            } else if (serviceType === "venues" || serviceType === "venue") {
              serviceDetails = {
                venueOptions: venueItems,
                options: venueItems,
              };
            }

            return {
              id: serviceId,
              serviceId: serviceId,
              name: service.serviceName,
              serviceName: service.serviceName,
              vendorEarnings: service.vendorEarnings,
              price: parseFloat(service.price) || 0,
              servicePrice: service.price,
              totalPrice: parseFloat(service.totalPrice) || 0,
              quantity: service.quantity || 1,
              duration: service.staffItems?.[0]?.hours || 0,
              serviceType: serviceType,
              type: serviceType,
              description: "",
              vendor_id: service.vendorId || undefined,
              priceType: service.priceType || "flat",
              price_type: service.priceType || "flat",
              service_details: serviceDetails,
              selected_menu_items: serviceItems,
              image: service.image || service.imageUrl || "",
              imageUrl: service.imageUrl || service.image || "",
              serviceImage: service.image || service.imageUrl || "",
              deliveryFee: service.deliveryFee || "0",
            };
          },
        );

        const mappedAdjustments: CustomAdjustment[] = (
          invoiceData.customLineItems || []
        ).map((item: any) => ({
          id: item.id,
          label: item.label,
          type: item.type === "percentage" ? "percentage" : "fixed",
          mode: item.mode === "surcharge" ? "surcharge" : "discount",
          value: parseFloat(item.value) || 0,
          taxable: item.taxable !== false,
        }));

        const allComboCategoryItems = apiServices.flatMap(
          (s: any) => s.comboCategoryItems || [],
        );
        allComboCategoryItems.forEach((item: any) => {
          const itemKey = `${item.comboId}_${item.menuName}_${item.cateringId}`;
          mappedSelectedItems[itemKey] = item.quantity;
        });

        setSelectedServices(mappedServices);
        setSelectedItems(mappedSelectedItems);
        setHostGuestOrders(mappedGuestOrders);
        setFormData({
          ...(invoiceData || {}),
          location: invoiceData.eventLocation || invoiceData.location || "",
          customAdjustments: mappedAdjustments,
          adminOverrides: {
            isTaxExempt: invoiceData.taxExemptStatus || false,
            isServiceFeeWaived: invoiceData.waiveServiceFee || false,
          },
        });
      } catch (error) {
        toast.error("Failed to load invoice data");
      } finally {
        setIsLoading(false);
      }
    };

    loadInvoiceSummary();
  }, [id, buildServicesFromGuestOrders]);

  return (
    <Dashboard activeTab="invoices" userRole="admin">
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Group Invoice Detail
            </h1>
          </div>
          <Button variant="outline" onClick={() => navigate("/admin/invoices")}>
            Back to Invoices
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <div className="text-lg font-medium">
                Loading Group invoice details...
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Event Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Event Date
                        </p>
                        <p className="font-medium">
                          {formatDate(formData?.eventDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Service Time
                        </p>
                        <p className="font-medium">
                          {formData?.serviceTime || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Location
                        </p>
                        <p className="font-medium">
                          {formData?.eventLocation || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Guest Count
                        </p>
                        <p className="font-medium">
                          {formData?.guestCount || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Contact Name
                        </p>
                        <p className="font-medium">
                          {formData?.contactName || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">
                          {formData?.emailAddress || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">
                          {formData?.phoneNumber || "N/A"}
                        </p>
                      </div>
                    </div>
                    {formData?.companyName && (
                      <div className="flex items-start gap-3">
                        <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Company
                          </p>
                          <p className="font-medium">{formData?.companyName}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {formData?.additionalNotes && (
                  <div className="mt-6 pt-6 border-t">
                    <p className="text-sm text-muted-foreground mb-2">
                      Additional Notes
                    </p>
                    <p className="text-sm">{formData.additionalNotes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
            <CardTitle className="flex items-center gap-2">
              Guest Details
            </CardTitle>
            {hostGuestOrders.length > 0 && (
              <Card className="p-4 sm:p-5 border border-gray-200">
                <div className="space-y-3">
                  {hostGuestOrders.map((guest) => (
                    <div
                      key={guest.id || guest.guestEmail}
                      className="rounded-md border border-primary/20 bg-primary/5 p-3"
                    >
                      <div>
                        <p className="text-sm font-semibold text-primary">
                          {guest.guestName}
                        </p>
                        <p className="text-xs text-primary/80">
                          {guest.guestEmail}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <OrderItemsBreakdown
              services={selectedServices}
              selectedItems={selectedItems}
              formData={formData}
              billingAddress={null}
              taxOverride={null}
              isTaxExempt={isTaxExempt}
              isServiceFeeWaived={isServiceFeeWaived}
              pricingSnapshot={null}
              showVendorEarningsBadge={true}
            />
          </div>
        )}
      </div>
    </Dashboard>
  );
};

export default GroupByInvoices;
