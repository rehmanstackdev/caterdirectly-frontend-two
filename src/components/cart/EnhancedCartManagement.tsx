import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ServiceSelection } from "@/types/order";
import { useUserRole } from "@/hooks/use-user-role";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Save, Loader2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import invoiceService from "@/services/api/admin/invoice.service";
import invoicesService from "@/services/api/admin/invoices.Service";
import { toast } from "sonner";

interface EnhancedCartManagementProps {
  selectedServices: ServiceSelection[];
  selectedItems: Record<string, number>;
  formData: any;
  customAdjustments?: any[];
  onLoadDraft?: (draft: any) => void;
  className?: string;
  isGroupOrder?: boolean;
  invitedGuests?: string[];
  additionalNotes?: string;
  paymentMethod?: string;
  isTaxExempt?: boolean;
  isServiceFeeWaived?: boolean;
  adminNotes?: string;
}

export const EnhancedCartManagement = ({
  selectedServices,
  selectedItems,
  formData,
  customAdjustments = [],
  onLoadDraft,
  className,
  isGroupOrder = false,
  invitedGuests = [],
  additionalNotes = "",
  paymentMethod = "host_pays_everything",
  isTaxExempt = false,
  isServiceFeeWaived = false,
  adminNotes = "",
}: EnhancedCartManagementProps) => {
  const navigate = useNavigate();
  const [draftName, setDraftName] = useState("Draft Order");
  const [isSaving, setIsSaving] = useState(false);
  const { clearCart } = useCart();

  const { userRole } = useUserRole();

  const handleSaveToDrafts = async () => {
    setIsSaving(true);

    try {
      const companyName = formData?.clientCompany || formData?.company || "";

      // Use the same mapping logic as AdminBookingFlow
      const mapServiceWithItems = (service: any, index: number) => {
        const serviceId = service.id || service.serviceId || "";
        const serviceType = (
          service.serviceType ||
          service.type ||
          ""
        ).toLowerCase();
        const details = service.service_details || {};

        // Handle non-catering services first (staff, party rentals, venues)
        if (
          serviceType === "party-rental" ||
          serviceType === "party-rentals" ||
          serviceType === "party_rentals" ||
          serviceType === "staff" ||
          serviceType === "events_staff"
        ) {
          let normalizedServiceType = serviceType;
          if (
            serviceType === "party-rental" ||
            serviceType === "party-rentals" ||
            serviceType === "party_rentals"
          ) {
            normalizedServiceType = "party_rentals";
          } else if (
            serviceType === "staff" ||
            serviceType === "events_staff"
          ) {
            normalizedServiceType = "events_staff";
          }

          let quantity = service.quantity || service.serviceQuantity || 1;
          let basePrice = parseFloat(
            String(service.servicePrice || service.price || "0"),
          );

          const existingTotalPrice = parseFloat(
            String(
              service.totalPrice ||
                service.serviceTotalPrice ||
                service.total ||
                "0",
            ),
          );

          if ((basePrice === 0 || isNaN(basePrice)) && existingTotalPrice > 0) {
            if (quantity > 0) {
              basePrice = existingTotalPrice / quantity;
            } else {
              quantity = 1;
              basePrice = existingTotalPrice;
            }
          }

          if (isNaN(basePrice) || basePrice < 0) {
            basePrice = 0;
          }

          if (!quantity || quantity < 1) {
            quantity = 1;
          }

          const totalPrice =
            existingTotalPrice > 0 && basePrice === existingTotalPrice
              ? existingTotalPrice
              : basePrice * quantity;

          const serviceImage =
            service.image ||
            service.serviceImage ||
            service.vendorImage ||
            service.coverImage ||
            service.imageUrl ||
            service.image_url ||
            service.service_details?.image ||
            service.service_details?.serviceImage ||
            "";

          const finalPrice = isNaN(basePrice) ? 0 : basePrice;
          const finalQuantity = isNaN(quantity) || quantity < 1 ? 1 : quantity;
          const finalTotalPrice = isNaN(totalPrice)
            ? finalPrice * finalQuantity
            : totalPrice;

          const nonCateringService: any = {
            serviceType: normalizedServiceType,
            serviceName: service.serviceName || service.name || "",
            vendorId: service.vendor_id || service.vendorId || "",
            price: finalPrice,
            quantity: finalQuantity,
            totalPrice: finalTotalPrice,
            priceType: service.priceType || service.price_type || "flat",
            image: serviceImage,
          };

          // Add serviceId for group orders
          if (isGroupOrder) {
            nonCateringService.serviceId = serviceId;
          }

          return nonCateringService;
        }

        // Handle venues
        if (serviceType === "venues" || serviceType === "venue") {
          const quantity = service.quantity || service.serviceQuantity || 1;
          let price = parseFloat(
            String(service.servicePrice || service.price || "0"),
          );

          if (price === 0 || isNaN(price)) {
            const existingTotalPrice = parseFloat(
              String(
                service.totalPrice || service.serviceTotalPrice || "0",
              ),
            );
            if (existingTotalPrice > 0 && quantity > 0) {
              price = existingTotalPrice / quantity;
            }
          }

          const venueImage =
            service.image ||
            service.serviceImage ||
            service.vendorImage ||
            service.coverImage ||
            service.imageUrl ||
            service.image_url ||
            details?.image ||
            details?.serviceImage ||
            details?.venueImage ||
            "";

          const venueService: any = {
            serviceType: "venues",
            serviceName: service.serviceName || service.name || "",
            vendorId: service.vendor_id || service.vendorId || "",
            price: price,
            quantity: quantity,
            totalPrice: price * quantity,
            priceType: service.priceType || service.price_type || "flat",
            image: venueImage,
          };

          // Add serviceId for group orders
          if (isGroupOrder) {
            venueService.serviceId = serviceId;
          }

          return venueService;
        }

        // Handle catering services (existing logic)
        let availableItems: any[] = [];
        if (serviceType === "catering") {
          availableItems =
            details.menuItems ||
            details.catering?.menuItems ||
            details.menu?.items ||
            details.menu?.menu_items ||
            details.items ||
            details.menu_items ||
            details.menu ||
            [];
          if (
            details.catering?.combos &&
            Array.isArray(details.catering.combos)
          ) {
            availableItems = [...availableItems, ...details.catering.combos];
          }
        } else if (
          serviceType === "party-rental" ||
          serviceType === "party-rentals" ||
          serviceType === "party_rentals"
        ) {
          availableItems =
            details.rentalItems ||
            details.rental?.items ||
            details.rental_items ||
            details.items ||
            [];
        } else if (serviceType === "staff" || serviceType === "events_staff") {
          availableItems =
            details.staffServices ||
            details.services ||
            details.staff?.services ||
            details.eventStaff ||
            details.event_staff ||
            details.staffItems ||
            details.staff_items ||
            details.items ||
            [];
        } else if (serviceType === "venue" || serviceType === "venues") {
          availableItems =
            details.venueItems ||
            details.venue?.items ||
            details.venue_items ||
            details.items ||
            [];
        }

        // Ensure availableItems is always an array
        if (!Array.isArray(availableItems)) {
          console.warn(
            `[EnhancedCartManagement] availableItems is not an array for ${serviceType}:`,
            availableItems,
          );
          availableItems = [];
        }

        const serviceItems: any[] = [];
        Object.entries(selectedItems).forEach(([itemId, quantity]) => {
          if (
            itemId === "headcount" ||
            itemId === "guestCount" ||
            itemId === "quantity" ||
            itemId.startsWith("meta_")
          ) {
            return;
          }
          if (!quantity || quantity <= 0) {
            return;
          }

          const validQuantity = typeof quantity === "number" ? quantity : 1;

          let item = availableItems.find(
            (item: any) =>
              item.id === itemId ||
              item.itemId === itemId ||
              item.name === itemId ||
              item.title === itemId ||
              `${serviceId}_${item.id}` === itemId ||
              `${serviceId}_${item.itemId}` === itemId,
          );

          if (!item && serviceId && itemId.startsWith(serviceId + "_")) {
            const actualId = itemId.slice((serviceId + "_").length);
            item = availableItems.find(
              (it: any) =>
                it.id === actualId ||
                it.itemId === actualId ||
                it.name === actualId ||
                it.title === actualId,
            );
          }

          if (item || validQuantity >= 1) {
            if (!item) {
              const isUuidLike =
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
                  itemId,
                );
              if (!isUuidLike) return;

              // Handle fallback for different service types
              if (
                serviceType === "party-rental" ||
                serviceType === "party-rentals" ||
                serviceType === "party_rentals"
              ) {
                serviceItems.push({
                  name: itemId,
                  quantity: validQuantity,
                  eachPrice: 0,
                  totalPrice: 0,
                  rentalId: itemId,
                });
                return;
              } else if (
                serviceType === "staff" ||
                serviceType === "events_staff"
              ) {
                serviceItems.push({
                  name: itemId,
                  quantity: validQuantity,
                  price: 0,
                  totalPrice: 0,
                  staffId: itemId,
                });
                return;
              } else if (serviceType === "venue" || serviceType === "venues") {
                serviceItems.push({
                  name: itemId,
                  quantity: validQuantity,
                  price: 0,
                  totalPrice: 0,
                  venueId: itemId,
                });
                return;
              }
              return;
            }

            if (serviceType === "catering") {
              const itemPrice = parseFloat(
                String(
                  item?.pricePerPerson ||
                    item?.price ||
                    item?.itemPrice ||
                    item?.basePrice ||
                    item?.unitPrice ||
                    0,
                ),
              );
              const resolvedItemName =
                item?.name ||
                item?.menuItemName ||
                item?.itemName ||
                item?.title ||
                itemId;
              const itemImage =
                item?.image ||
                item?.imageUrl ||
                item?.itemImage ||
                item?.image_url ||
                item?.photo ||
                item?.picture ||
                item?.menuItemImage ||
                "";

              serviceItems.push({
                menuName:
                  item?.menuName ||
                  item?.category ||
                  item?.menu?.name ||
                  service.serviceName ||
                  service.name ||
                  "Menu",
                menuItemName: resolvedItemName,
                price: itemPrice,
                quantity: validQuantity,
                totalPrice: itemPrice * validQuantity,
                cateringId: item?.id || item?.cateringId || itemId,
                serviceId: serviceId,
                image: itemImage,
              });
            } else if (
              serviceType === "party-rental" ||
              serviceType === "party-rentals" ||
              serviceType === "party_rentals"
            ) {
              const itemPrice = parseFloat(
                String(
                  item?.price ||
                    item?.itemPrice ||
                    item?.basePrice ||
                    item?.unitPrice ||
                    0,
                ),
              );
              const resolvedItemName =
                item?.name || item?.itemName || item?.title || itemId;
              const itemImage =
                item?.image ||
                item?.imageUrl ||
                item?.itemImage ||
                item?.image_url ||
                item?.photo ||
                item?.picture ||
                "";

              serviceItems.push({
                name: resolvedItemName,
                quantity: validQuantity,
                eachPrice: itemPrice,
                totalPrice: itemPrice * validQuantity,
                rentalId: item?.id || item?.rentalId || itemId,
                image: itemImage,
              });
            } else if (
              serviceType === "staff" ||
              serviceType === "events_staff"
            ) {
              const itemPrice = parseFloat(
                String(
                  item?.price ||
                    item?.itemPrice ||
                    item?.basePrice ||
                    item?.unitPrice ||
                    0,
                ),
              );
              const resolvedItemName =
                item?.name || item?.itemName || item?.title || itemId;
              const itemImage =
                item?.image ||
                item?.imageUrl ||
                item?.itemImage ||
                item?.image_url ||
                item?.photo ||
                item?.picture ||
                "";

              serviceItems.push({
                name: resolvedItemName,
                quantity: validQuantity,
                price: itemPrice,
                totalPrice: itemPrice * validQuantity,
                staffId: item?.id || item?.staffId || itemId,
                image: itemImage,
              });
            } else if (serviceType === "venue" || serviceType === "venues") {
              const itemPrice = parseFloat(
                String(
                  item?.price ||
                    item?.itemPrice ||
                    item?.basePrice ||
                    item?.unitPrice ||
                    0,
                ),
              );
              const resolvedItemName =
                item?.name || item?.itemName || item?.title || itemId;
              const itemImage =
                item?.image ||
                item?.imageUrl ||
                item?.itemImage ||
                item?.image_url ||
                item?.photo ||
                item?.picture ||
                "";

              serviceItems.push({
                name: resolvedItemName,
                quantity: validQuantity,
                price: itemPrice,
                totalPrice: itemPrice * validQuantity,
                venueId: item?.id || item?.venueId || itemId,
                image: itemImage,
              });
            }
          }
        });

        // Handle combo selections - using exact AdminBookingFlow logic
        if (
          serviceType === "catering" &&
          service.comboSelectionsList &&
          Array.isArray(service.comboSelectionsList)
        ) {
          const comboItemsFromDetails = details.catering?.combos || [];

          service.comboSelectionsList.forEach((combo: any) => {
            if (combo) {
              const comboItemId = combo.comboItemId;
              let originalComboItem = availableItems.find(
                (item: any) =>
                  (item.id === comboItemId ||
                    item.itemId === comboItemId ||
                    item.comboItemId === comboItemId) &&
                  (item.isCombo ||
                    item.comboCategories ||
                    item.pricePerPerson !== undefined),
              );

              if (!originalComboItem) {
                originalComboItem = comboItemsFromDetails.find(
                  (item: any) =>
                    item.id === comboItemId ||
                    item.itemId === comboItemId ||
                    item.comboItemId === comboItemId,
                );
              }

              const basePrice = parseFloat(
                String(
                  originalComboItem?.pricePerPerson ||
                    originalComboItem?.price ||
                    combo.basePrice ||
                    combo.pricePerPerson ||
                    combo.price ||
                    0,
                ),
              );

              const finalComboItemId = comboItemId || originalComboItem?.id;

              // Calculate protein quantity from selections
              let proteinQuantity = 0;
              if (combo.selections && Array.isArray(combo.selections)) {
                combo.selections.forEach((category: any) => {
                  const isProtein =
                    category.categoryName &&
                    (category.categoryName.toLowerCase().includes("protein") ||
                      category.categoryName.toLowerCase().includes("meat") ||
                      category.categoryName.toLowerCase().includes("main"));

                  if (
                    isProtein &&
                    category.selectedItems &&
                    Array.isArray(category.selectedItems)
                  ) {
                    category.selectedItems.forEach((item: any) => {
                      proteinQuantity += item.quantity || 0;
                    });
                  }
                });
              }

              // Fallback to direct quantity if no protein quantity found
              const directQuantity = selectedItems[finalComboItemId];
              const prefixedQuantity = selectedItems[`${serviceId}_${finalComboItemId}`];
              const hasSelectedCategoryItems =
                Array.isArray(combo.selections) &&
                combo.selections.some((category: any) =>
                  Array.isArray(category.selectedItems) &&
                  category.selectedItems.some((item: any) => (item.quantity || 0) > 0),
                );

              if (proteinQuantity === 0) {
                proteinQuantity = directQuantity || prefixedQuantity || 0;
              }

              if (!hasSelectedCategoryItems && proteinQuantity <= 0) {
                return;
              }

              const effectiveProteinQuantity = proteinQuantity > 0 ? proteinQuantity : 1;
              const guestCount = parseInt(String(formData?.headcount || "1")) || 1;
              const baseTotal = basePrice * effectiveProteinQuantity;

              // Calculate upcharges
              let totalUpcharges = 0;
              if (combo.selections && Array.isArray(combo.selections)) {
                combo.selections.forEach((category: any) => {
                  if (
                    category.selectedItems &&
                    Array.isArray(category.selectedItems)
                  ) {
                    category.selectedItems.forEach((categoryItem: any) => {
                      const upchargePrice = parseFloat(
                        String(categoryItem.upcharge || 0),
                      );
                      if (upchargePrice > 0) {
                        totalUpcharges += upchargePrice * guestCount;
                      }
                    });
                  }
                });
              }

              const comboTotal = baseTotal + totalUpcharges;
              const comboQuantity = combo.headcount || effectiveProteinQuantity;

              const comboImage =
                originalComboItem?.image ||
                originalComboItem?.imageUrl ||
                originalComboItem?.itemImage ||
                originalComboItem?.image_url ||
                originalComboItem?.photo ||
                originalComboItem?.picture ||
                combo?.image ||
                combo?.imageUrl ||
                "";

              // Add main combo item
              serviceItems.push({
                menuName:
                  combo.comboName ||
                  originalComboItem?.category ||
                  "Combo Items",
                menuItemName: combo.comboName || originalComboItem?.name || "",
                price: basePrice,
                quantity: comboQuantity,
                totalPrice: comboTotal,
                cateringId:
                  finalComboItemId ||
                  combo.comboItemId ||
                  originalComboItem?.id ||
                  "",
                serviceId: serviceId,
                image: comboImage,
              });

              // Add individual combo category items
              if (combo.selections && Array.isArray(combo.selections)) {
                combo.selections.forEach((category: any) => {
                  if (
                    category.selectedItems &&
                    Array.isArray(category.selectedItems)
                  ) {
                    category.selectedItems.forEach((categoryItem: any) => {
                      const upchargePrice = parseFloat(
                        String(
                          categoryItem.additionalCharge ||
                            categoryItem.additionalPrice ||
                            categoryItem.upcharge ||
                            0,
                        ),
                      );
                      const totalPrice = parseFloat(
                        String(categoryItem.price || 0),
                      );

                      const categoryItemImage =
                        categoryItem?.image ||
                        categoryItem?.imageUrl ||
                        categoryItem?.itemImage ||
                        categoryItem?.image_url ||
                        categoryItem?.photo ||
                        categoryItem?.picture ||
                        "";

                      const itemQuantity = comboQuantity || categoryItem.quantity || 1;
                      const itemTotalPrice = totalPrice * itemQuantity;

                      serviceItems.push({
                        menuName: category.categoryName || "Category",
                        menuItemName:
                          categoryItem.name ||
                          categoryItem.itemName ||
                          categoryItem.id ||
                          "",
                        price: totalPrice,
                        quantity: itemQuantity,
                        totalPrice: itemTotalPrice,
                        cateringId:
                          categoryItem.id || categoryItem.itemId || "",
                        serviceId: serviceId,
                        isComboCategoryItem: true,
                        comboId:
                          finalComboItemId ||
                          combo.comboItemId ||
                          originalComboItem?.id ||
                          "",
                        image: categoryItemImage,
                        premiumCharge: upchargePrice,
                      });
                    });
                  }
                });
              }
            }
          });
        }

        const quantity = service.quantity || service.serviceQuantity || 1;
        const basePrice = parseFloat(
          String(service.servicePrice || service.price || "0"),
        );
        const calculatedTotalPrice = serviceItems.reduce((sum, item) => {
          const itemTotal = parseFloat(String(item.totalPrice || 0));
          return sum + (isNaN(itemTotal) ? 0 : itemTotal);
        }, 0);

        let calculatedTotal;
        if (serviceType === "catering") {
          calculatedTotal = calculatedTotalPrice;
        } else {
          calculatedTotal =
            calculatedTotalPrice > 0
              ? calculatedTotalPrice
              : basePrice * quantity;
        }

        // Get service image
        const serviceImage =
          service.image ||
          service.serviceImage ||
          service.vendorImage ||
          service.coverImage ||
          service.imageUrl ||
          service.image_url ||
          service.service_details?.image ||
          service.service_details?.serviceImage ||
          "";

        let normalizedServiceType = serviceType;
        if (serviceType === "party-rental" || serviceType === "party-rentals") {
          normalizedServiceType = "party_rentals";
        } else if (serviceType === "staff") {
          normalizedServiceType = "events_staff";
        } else if (serviceType === "venue") {
          normalizedServiceType = "venues";
        }

        const mappedService: any = {
          serviceType: isGroupOrder ? "catering" : normalizedServiceType, // Force catering for group orders
          serviceName: service.serviceName || service.name || "",
          vendorId: service.vendor_id || service.vendorId || "",
          totalPrice: calculatedTotal,
          priceType: service.priceType || service.price_type || "fixed",
          image: serviceImage,
        };

        // Add serviceId for group orders (required by API) - must be at the top level
        if (isGroupOrder) {
          mappedService.serviceId = serviceId;
        }

        // Add service-specific required fields
        if (normalizedServiceType === "events_staff") {
          mappedService.price = basePrice;
          mappedService.quantity = quantity;
          mappedService.pricingType =
            service.pricingType || service.pricing_type || "hourly";
        } else if (normalizedServiceType === "party_rentals") {
          mappedService.price = basePrice;
          mappedService.quantity = quantity;
        } else if (normalizedServiceType === "venues") {
          mappedService.price = basePrice;
          mappedService.quantity = quantity;
        }

        // Route items to correct arrays based on service type
        // For group orders, force all services to use catering arrays
        if (isGroupOrder || normalizedServiceType === "catering") {
          mappedService.cateringItems = serviceItems;
          mappedService.partyRentalItems = [];
          mappedService.staffItems = [];
          mappedService.venueItems = [];
          mappedService.deliveryFee = 0;
          mappedService.deliveryRanges = {};
        } else if (normalizedServiceType === "party_rentals") {
          mappedService.cateringItems = [];
          mappedService.partyRentalItems = serviceItems;
          mappedService.staffItems = [];
          mappedService.venueItems = [];
        } else if (normalizedServiceType === "events_staff") {
          mappedService.cateringItems = [];
          mappedService.partyRentalItems = [];
          mappedService.staffItems = serviceItems;
          mappedService.venueItems = [];
        } else if (normalizedServiceType === "venues") {
          mappedService.cateringItems = [];
          mappedService.partyRentalItems = [];
          mappedService.staffItems = [];
          mappedService.venueItems = serviceItems;
        } else {
          // Default case - initialize all arrays as empty
          mappedService.cateringItems = [];
          mappedService.partyRentalItems = [];
          mappedService.staffItems = [];
          mappedService.venueItems = [];
        }

        // Add serviceId for group orders
        if (isGroupOrder) {
          mappedService.serviceId = serviceId;
        }

        return mappedService;
      };

      // Create invoice data based on whether it's a group order or not
      let invoiceData: any;
      
      if (isGroupOrder) {
        // Group order structure - matches AdminGroupOrderSetup
        // Use budget from form data, fallback to 30.0 if not set
        const budgetPerPerson = Number(formData?.budgetPerPerson) || 30.0;
        const guestCount = formData?.headcount || invitedGuests.length + 1 || 1;
        
        invoiceData = {
          eventName: formData?.orderName || "Group Order Draft",
          companyName: companyName,
          eventLocation: formData?.location || "",
          eventDate: formData?.date || null,
          serviceTime: formData?.deliveryWindow || "",
          guestCount: guestCount,
          contactName: formData?.primaryContactName || "",
          phoneNumber: formData?.primaryContactPhone || "",
          emailAddress: formData?.primaryContactEmail || "",
          addBackupContact: formData?.hasBackupContact || false,
          additionalNotes: additionalNotes || formData?.additionalNotes || "",
          taxExemptStatus: false,
          waiveServiceFee: false,
          budgetPerPerson: budgetPerPerson,
          budget: guestCount * budgetPerPerson,
          selectItem: "catering", // Force catering for group orders
          quantity: guestCount,
          orderDeadline: formData?.date || null,
          inviteFriends: invitedGuests.map((email) => ({
            email,
            acceptanceStatus: "pending",
          })),
          paymentSettings: paymentMethod,
          services: selectedServices.map((service, index) =>
            mapServiceWithItems(service, index),
          ),
          customLineItems: customAdjustments.map((adj) => ({
            label: adj.label || "",
            type: adj.type || "fixed",
            mode: adj.mode || "add",
            value: adj.value || 0,
            taxable: adj.taxable || false,
            statusForDrafting: true,
          })),
        };
      } else {
        // Regular order structure - existing logic
        invoiceData = {
          eventName: formData?.orderName || "Draft Order",
          companyName: companyName,
          eventLocation: formData?.location || "",
          eventDate: formData?.date || null,
          serviceTime: formData?.deliveryWindow || "",
          guestCount: formData?.headcount || 1,
          contactName: formData?.primaryContactName || "",
          phoneNumber: formData?.primaryContactPhone || "",
          emailAddress: formData?.primaryContactEmail || "",
          addBackupContact: formData?.hasBackupContact || false,
          additionalNotes: adminNotes || formData?.additionalNotes || "",
          taxExemptStatus: isTaxExempt,
          waiveServiceFee: isServiceFeeWaived,
          adminOverrideNotes: adminNotes || "Draft Order",
          budgetPerPerson: null,
          budget: null,
          selectItem: null,
          quantity: null,
          orderDeadline: null,
          inviteFriends: null,
          paymentSettings: null,
          services: selectedServices.map((service, index) =>
            mapServiceWithItems(service, index),
          ),
          customLineItems: customAdjustments.map((adj) => ({
            label: adj.label || "",
            type: adj.type || "fixed",
            mode: adj.mode || "add",
            value: adj.value || 0,
            taxable: adj.taxable || false,
            statusForDrafting: true,
          })),
        };
      }

      console.log(
        "[EnhancedCartManagement] Invoice payload:",
        JSON.stringify(invoiceData, null, 2),
      );

      // Create the invoice using the appropriate method
      const response = isGroupOrder 
        ? await invoiceService.createGroupOrderInvoice(invoiceData)
        : await invoiceService.createInvoice(invoiceData);

      console.log("[EnhancedCartManagement] Invoice response:", response);

      if (response?.data) {
        const invoiceId = response.data.invoice?.id || response.data.id;

        if (invoiceId) {
          // Update the status to draft
          try {
            await invoicesService.updateInvoiceStatus(invoiceId, "draft");
            
            // Clear the cart after successful save
            clearCart(true);
            
            toast.success("Draft saved successfully");
            
            // Navigate based on user role
            if (userRole === "event-host") {
              navigate("/host/dashboard");
            } else if (userRole === "vendor") {
              navigate("/vendor/dashboard");
            } else {
              navigate("/admin/invoices?tab=drafted");
            }
          } catch (statusError) {
            console.error("Failed to update invoice status:", statusError);
            
            // Clear cart even if status update fails
            clearCart(true);
            
            toast.success("Invoice created but status update failed");
            
            // Navigate based on user role
            if (userRole === "event-host") {
              navigate("/host/dashboard");
            } else if (userRole === "vendor") {
              navigate("/vendor/dashboard");
            } else {
              navigate("/admin/invoices");
            }
          }
        } else {
          // Clear cart even if no invoice ID
          clearCart(true);
          
          toast.success("Invoice created successfully");
          
          // Navigate based on user role
          if (userRole === "event-host") {
            navigate("/host/dashboard");
          } else if (userRole === "vendor") {
            navigate("/vendor/dashboard");
          } else {
            navigate("/admin/invoices");
          }
        }
      }
    } catch (error) {
      console.error("[EnhancedCartManagement] Failed to save draft:", error);
      console.error("[EnhancedCartManagement] Error details:", {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
      });
      toast.error("Failed to save draft");
    } finally {
      setIsSaving(false);
    }
  };

  const getSaveStatusIcon = () => {
    return <Save className="h-4 w-4" />;
  };

  const hasContent =
    selectedServices.length > 0 || Object.keys(selectedItems).length > 0;

  if (!hasContent) {
    return null;
  }

  return (
    <div className={cn("bg-white border rounded-lg p-3 shadow-sm", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="default"
            className="w-full justify-between h-11"
          >
            <div className="flex items-center gap-2">
              {getSaveStatusIcon()}
              <span className="text-sm font-medium">Save Progress</span>
              {selectedServices.length > 0 && (
                <Badge variant="default" className="text-xs bg-orange-500">
                  {selectedServices.length}{" "}
                  {selectedServices.length === 1 ? "Service" : "Services"}
                </Badge>
              )}
            </div>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-80">
          <DropdownMenuLabel>Save Progress</DropdownMenuLabel>
          <div className="px-2 pb-2">
            <div className="flex items-center gap-2">
              <Input
                value={draftName}
                readOnly
                className="h-8 text-xs flex-1 bg-gray-50"
              />
              <Button
                size="sm"
                onClick={handleSaveToDrafts}
                disabled={isSaving}
                className="h-8 text-xs"
              >
                {isSaving ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
