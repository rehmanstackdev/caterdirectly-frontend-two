import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import Dashboard from "@/components/dashboard/Dashboard";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Plus } from "lucide-react";
import invoiceService from "@/services/api/invoice.Service";
import BookingVendorCard from "@/components/booking/BookingVendorCard";
import EnhancedOrderSummaryCard from "@/components/booking/order-summary/EnhancedOrderSummaryCard";
import AdminTaxAndFeeControls from "@/components/booking/admin/AdminTaxAndFeeControls";
import AdminCustomAdjustments from "@/components/booking/admin/AdminCustomAdjustments";
import { ServiceSelection } from "@/types/order";
import { CustomAdjustment } from "@/types/adjustments";
import { processService } from "@/utils/service-item-processor";
import { getServiceTypeLabel } from "@/utils/service-utils";
import servicesService from "@/services/api/services.Service";

function AdminEditInvoicePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [selectedServices, setSelectedServices] = useState<ServiceSelection[]>(
    [],
  );
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>(
    {},
  );
  const [formInputs, setFormInputs] = useState<any>({});
  const [customAdjustments, setCustomAdjustments] = useState<
    CustomAdjustment[]
  >([]);
  const [isTaxExempt, setIsTaxExempt] = useState(false);
  const [isServiceFeeWaived, setIsServiceFeeWaived] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [hasServiceChanges, setHasServiceChanges] = useState(false);
  const hasProcessedSessionRef = useRef(false);

  useEffect(() => {
    const loadOrderData = async () => {
      if (!id) {
        toast.error("No invoice ID provided");
        navigate("/admin/invoices");
        return;
      }

      // Check if we have edit order state from marketplace return
      const editOrderState = sessionStorage.getItem("editOrderState");
      const cartData = sessionStorage.getItem("cartServices");
      const newSelectedItems = sessionStorage.getItem("newSelectedItems");

      if (editOrderState && cartData && !hasProcessedSessionRef.current) {
        try {
          const parsedEditState = JSON.parse(editOrderState);
          const parsedCartData = JSON.parse(cartData);
          const parsedNewSelectedItems = newSelectedItems
            ? JSON.parse(newSelectedItems)
            : {};

          if (parsedEditState.editOrderId === id) {
            // Simply add new services to existing ones
            const combinedServices = [
              ...parsedEditState.services,
              ...parsedCartData,
            ];
            const combinedSelectedItems = {
              ...parsedEditState.selectedItems,
              ...parsedNewSelectedItems,
            };

            setSelectedServices(combinedServices);
            setSelectedItems(combinedSelectedItems);
            setOrderData(parsedEditState.orderData || {});
            setFormInputs(parsedEditState.formInputs || {});
            setCustomAdjustments(parsedEditState.customAdjustments || []);
            setIsTaxExempt(parsedEditState.isTaxExempt ?? false);
            setIsServiceFeeWaived(parsedEditState.isServiceFeeWaived ?? false);
            setAdminNotes(parsedEditState.adminNotes || "");
            hasProcessedSessionRef.current = true;

            sessionStorage.removeItem("editOrderState");
            sessionStorage.removeItem("cartServices");
            sessionStorage.removeItem("newSelectedItems");
            setHasServiceChanges(true);
            setIsLoading(false);
            return;
          }
        } catch (e) {
          sessionStorage.removeItem("editOrderState");
          sessionStorage.removeItem("cartServices");
          sessionStorage.removeItem("newSelectedItems");
        }
      }

      // Skip API call if we already processed session data
      if (hasProcessedSessionRef.current) {
        setIsLoading(false);
        return;
      }

      try {
        let invoiceData: any = null;
        try {
          const byIdResponse = await invoiceService.getInvoiceById(id);
          invoiceData = byIdResponse?.data || null;
        } catch {
          invoiceData = null;
        }

        if (!invoiceData) {
          const summaryResponse =
            await invoiceService.getInvoiceOrderSummary(id);
          invoiceData = summaryResponse?.data?.invoice || null;
        }

        if (invoiceData) {
          setOrderData(invoiceData);

          const invoiceServices =
            invoiceData.services && invoiceData.services.length > 0
              ? invoiceData.services
              : invoiceData.selectedServices || [];

          const cateringVendorIds = Array.from(
            new Set(
              invoiceServices
                .filter(
                  (s: any) =>
                    (s.serviceType || "").toLowerCase() === "catering",
                )
                .map((s: any) => s.vendorId)
                .filter(Boolean),
            ),
          );

          const vendorCateringCatalog = new Map<string, any[]>();
          await Promise.all(
            cateringVendorIds.map(async (vendorId) => {
              try {
                const services = await servicesService.getServicesByVendorId(
                  String(vendorId),
                  { serviceType: "catering" },
                );
                vendorCateringCatalog.set(String(vendorId), services || []);
              } catch {
                vendorCateringCatalog.set(String(vendorId), []);
              }
            }),
          );

          // Map services from API to ServiceSelection format
          const mappedServices: ServiceSelection[] = (
            invoiceServices || []
          ).map((service: any) => {
            const serviceId = service.id;
            const serviceType = service.serviceType || "";
            const vendorCatalogServices =
              vendorCateringCatalog.get(String(service.vendorId || "")) || [];

            const getCatalogCombos = (svc: any): any[] => {
              if (!svc) return [];
              return [
                ...(Array.isArray(svc?.catering?.combos) ? svc.catering.combos : []),
                ...(Array.isArray(svc?.service_details?.catering?.combos)
                  ? svc.service_details.catering.combos
                  : []),
                ...(Array.isArray(svc?.combos) ? svc.combos : []),
              ];
            };

            const referencedComboIds = new Set<string>([
              ...(service.comboCategoryItems || []).map((item: any) =>
                String(item?.comboId || ""),
              ),
              ...((service.cateringItems || [])
                .filter((item: any) => item?.comboId)
                .map((item: any) => String(item.comboId || ""))),
            ].filter(Boolean));

            const normalizedServiceName = String(
              service?.serviceName || service?.name || "",
            )
              .trim()
              .toLowerCase();

            let matchedVendorCatalogService: any = null;
            let bestMatchScore = -1;

            vendorCatalogServices.forEach((svc: any) => {
              const svcCatering = svc?.catering || svc?.service_details?.catering;
              if (!svcCatering) return;

              let score = 0;
              const svcId = String(svc?.id || svc?.serviceId || "");
              const invoiceServiceRefId = String(service?.serviceId || "");
              if (invoiceServiceRefId && svcId && svcId === invoiceServiceRefId) {
                score += 1000;
              }

              const svcName = String(svc?.name || "")
                .trim()
                .toLowerCase();
              if (normalizedServiceName && svcName && svcName === normalizedServiceName) {
                score += 200;
              }

              if (referencedComboIds.size > 0) {
                const svcComboIds = new Set(
                  getCatalogCombos(svc)
                    .map((combo: any) => String(combo?.id || combo?.itemId || ""))
                    .filter(Boolean),
                );
                let overlap = 0;
                referencedComboIds.forEach((comboId) => {
                  if (svcComboIds.has(comboId)) overlap += 1;
                });
                score += overlap * 50;
              }

              if (score > bestMatchScore) {
                bestMatchScore = score;
                matchedVendorCatalogService = svc;
              }
            });

            if (!matchedVendorCatalogService) {
              matchedVendorCatalogService = vendorCatalogServices.find(
                (svc: any) => svc?.catering || svc?.service_details?.catering,
              );
            }

            const catalogCatering =
              matchedVendorCatalogService?.catering ||
              matchedVendorCatalogService?.service_details?.catering ||
              {};

            const serviceCatalogCombos = getCatalogCombos(matchedVendorCatalogService);

            const comboCatalogById = new Map<string, any>();
            serviceCatalogCombos.forEach((combo: any) => {
              const comboId = String(combo?.id || combo?.itemId || "");
              if (comboId) comboCatalogById.set(comboId, combo);
            });
            const resolvedMinimumGuests =
              Number(
                service.minimumGuests ??
                  service.minGuests ??
                  service?.service_details?.catering?.minimumGuests ??
                  service?.catering?.minimumGuests ??
                  catalogCatering?.minimumGuests ??
                  1,
              ) || 1;
            const resolvedMaximumGuests =
              Number(
                service.maximumGuests ??
                  service.maxGuests ??
                  service?.service_details?.catering?.maximumGuests ??
                  service?.catering?.maximumGuests ??
                  catalogCatering?.maximumGuests ??
                  resolvedMinimumGuests,
              ) || resolvedMinimumGuests;

            // Extract items based on service type and build selectedItems
            let serviceItems: any[] = [];
            let menuItems: any[] = [];
            let rentalItems: any[] = [];
            let staffItems: any[] = [];
            let venueItems: any[] = [];
            const comboCategoryItemsFromCatering = (service.cateringItems || [])
              .filter((item: any) => item?.comboId && (item?.isComboCategoryItem || item?.cateringId || item?.id))
              .map((item: any) => ({
                ...item,
                comboId: item.comboId,
                cateringId: item.cateringId || item.id,
                menuItemName: item.menuItemName || item.name,
                menuName: item.menuName || "Combo Items",
                premiumCharge: item.premiumCharge || item.additionalCharge || item.additionalPrice || 0,
              }));

            const serviceComboCategoryItems = [
              ...(service.comboCategoryItems || []),
              ...comboCategoryItemsFromCatering,
            ]
              .filter(
                (item: any) => item?.comboId && (item?.cateringId || item?.id),
              )
              .filter(
                (item: any, index: number, arr: any[]) =>
                  arr.findIndex(
                    (x: any) =>
                      String(x.comboId) === String(item.comboId) &&
                      String(x.menuName || "Combo Items") ===
                        String(item.menuName || "Combo Items") &&
                      String(x.cateringId || x.id) ===
                        String(item.cateringId || item.id),
                  ) === index,
              );
            const buildComboCategories = (items: any[] = []) => {
              const categoryMap = new Map<string, any>();
              items.forEach((comboItem: any) => {
                const categoryName = comboItem.menuName || "Combo Items";
                if (!categoryMap.has(categoryName)) {
                  categoryMap.set(categoryName, {
                    id: categoryName,
                    categoryId: categoryName,
                    name: categoryName,
                    items: [],
                  });
                }
                categoryMap.get(categoryName).items.push({
                  id: comboItem.cateringId,
                  itemId: comboItem.cateringId,
                  name: comboItem.menuItemName,
                  price: parseFloat(comboItem.price || 0),
                  additionalCharge: comboItem.premiumCharge
                    ? parseFloat(comboItem.premiumCharge)
                    : 0,
                  additionalPrice: comboItem.premiumCharge
                    ? parseFloat(comboItem.premiumCharge)
                    : 0,
                  isPremium:
                    (comboItem.premiumCharge
                      ? parseFloat(comboItem.premiumCharge)
                      : 0) > 0,
                  image: comboItem.image || comboItem.imageUrl || "",
                  quantity: comboItem.quantity || 0,
                });
              });
              return Array.from(categoryMap.values());
            };

            const mergeComboCategories = (
              allCategories: any[] = [],
              selectedCategories: any[] = [],
            ) => {
              const categoryMap = new Map<string, any>();

              const getCategoryKey = (category: any) =>
                String(
                  category?.name ||
                    category?.categoryId ||
                    category?.id ||
                    "combo-category",
                );

              const normalizeItem = (item: any) => {
                const additionalCharge = Number(
                  item?.additionalCharge ?? item?.additionalPrice ?? 0,
                );
                return {
                  ...item,
                  id: item?.id || item?.itemId || item?.cateringId,
                  itemId: item?.itemId || item?.id || item?.cateringId,
                  additionalCharge,
                  additionalPrice: additionalCharge,
                  isPremium: item?.isPremium === true || additionalCharge > 0,
                  image: item?.image || item?.imageUrl || "",
                };
              };

              allCategories.forEach((category: any) => {
                const key = getCategoryKey(category);
                if (!categoryMap.has(key)) {
                  categoryMap.set(key, {
                    id: key,
                    categoryId: key,
                    name: category?.name || key,
                    maxSelections: category?.maxSelections,
                    items: new Map<string, any>(),
                  });
                }
                const target = categoryMap.get(key);
                (category?.items || []).forEach((item: any) => {
                  const normalized = normalizeItem(item);
                  target.items.set(String(normalized.itemId), normalized);
                });
              });

              selectedCategories.forEach((category: any) => {
                const key = getCategoryKey(category);
                if (!categoryMap.has(key)) {
                  categoryMap.set(key, {
                    id: key,
                    categoryId: key,
                    name: category?.name || key,
                    maxSelections: category?.maxSelections,
                    items: new Map<string, any>(),
                  });
                }
                const target = categoryMap.get(key);
                (category?.items || []).forEach((item: any) => {
                  const normalized = normalizeItem(item);
                  const itemKey = String(normalized.itemId);
                  const existing = target.items.get(itemKey) || {};
                  target.items.set(itemKey, {
                    ...existing,
                    ...normalized,
                    additionalCharge:
                      normalized.additionalCharge ||
                      existing.additionalCharge ||
                      0,
                    additionalPrice:
                      normalized.additionalCharge ||
                      existing.additionalPrice ||
                      0,
                    isPremium:
                      Boolean(normalized.isPremium) ||
                      Boolean(existing.isPremium),
                    image: normalized.image || existing.image || "",
                  });
                });
              });

              return Array.from(categoryMap.values()).map((category: any) => ({
                ...category,
                items: Array.from(category.items.values()),
              }));
            };

            if (service.cateringItems && service.cateringItems.length > 0) {
              const nonComboCategoryCateringItems = service.cateringItems.filter((item: any) => !item?.comboId && !item?.isComboCategoryItem);
              serviceItems = nonComboCategoryCateringItems;
              menuItems = nonComboCategoryCateringItems.map((item: any) => {
                const comboCategoryItems = (
                  serviceComboCategoryItems || []
                ).filter(
                  (comboItem: any) =>
                    String(comboItem.comboId) ===
                    String(item.cateringId || item.id),
                );
                const catalogCombo = comboCatalogById.get(
                  String(item.cateringId || item.id),
                );

                const selectedComboCategories =
                  comboCategoryItems.length > 0
                    ? buildComboCategories(comboCategoryItems)
                    : [];
                const combinedComboCategories = mergeComboCategories(
                  item.comboCategories || catalogCombo?.comboCategories || [],
                  selectedComboCategories,
                );

                return {
                  id: item.cateringId || item.id,
                  name: item.menuItemName || item.name,
                  price: parseFloat(item.price || 0),
                  category: item.menuName || "Menu",
                  menuName: item.menuName,
                  menuItemName: item.menuItemName,
                  isCombo:
                    combinedComboCategories.length > 0 || item.isCombo || false,
                  comboCategories: combinedComboCategories,
                  comboCategoryItems: comboCategoryItems,
                  priceType: item.priceType || "fixed",
                  image: item.image || item.imageUrl,
                  imageUrl: item.imageUrl || item.image,
                  description: item.description || "",
                };
              });
            }

            // Add combo base items for all combos from comboCategoryItems
            if (serviceType === "catering") {
              const comboGroups = new Map();

              (serviceComboCategoryItems || []).forEach((item: any) => {
                const comboId = item.comboId;
                if (!comboId) return;
                if (!comboGroups.has(comboId)) {
                  comboGroups.set(comboId, []);
                }
                comboGroups.get(comboId).push(item);
              });

              comboGroups.forEach((comboCategoryItems, comboId) => {
                const existingCombo = menuItems.find(
                  (item: any) => String(item.id) === String(comboId),
                );
                const comboImage =
                  comboCategoryItems[0]?.image ||
                  service.cateringItems?.find(
                    (item: any) =>
                      String(item.cateringId || item.id) === String(comboId),
                  )?.image ||
                  "";
                if (!existingCombo) {
                  const matchingCateringItem = service.cateringItems?.find(
                    (item: any) =>
                      String(item.cateringId || item.id) === String(comboId),
                  );
                  const comboName =
                    comboCatalogById.get(String(comboId))?.name ||
                    matchingCateringItem?.menuItemName ||
                    matchingCateringItem?.menuName ||
                    matchingCateringItem?.name ||
                    "Combo";
                  const comboPrice =
                    parseFloat(
                      String(
                        comboCatalogById.get(String(comboId))?.pricePerPerson ||
                          matchingCateringItem?.price ||
                          0,
                      ),
                    ) || 0;
                  menuItems.push({
                    id: comboId,
                    name: comboName,
                    price: comboPrice,
                    category: "Combo Packages",
                    menuName: "Combo Packages",
                    menuItemName: comboName,
                    isCombo: true,
                    comboCategories: mergeComboCategories(
                      comboCatalogById.get(String(comboId))?.comboCategories ||
                        matchingCateringItem?.comboCategories ||
                        [],
                      buildComboCategories(comboCategoryItems),
                    ),
                    comboCategoryItems: comboCategoryItems.map((item: any) => ({
                      ...item,
                      image: item.image || item.imageUrl || "",
                    })),
                    priceType: "fixed",
                    image: comboImage,
                    imageUrl: comboImage,
                    description: "",
                  });
                } else {
                  existingCombo.comboCategories = mergeComboCategories(
                    existingCombo.comboCategories || [],
                    buildComboCategories(comboCategoryItems),
                  );
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
              const catalogMenuItemsRaw =
                catalogCatering?.menuItems ||
                catalogCatering?.menus ||
                catalogCatering?.items ||
                [];

              catalogMenuItemsRaw.forEach((catalogItem: any) => {
                const catalogItemId = String(
                  catalogItem?.id || catalogItem?.cateringId || "",
                );
                if (!catalogItemId) return;

                const selectedComboCategories = buildComboCategories(
                  (serviceComboCategoryItems || []).filter(
                    (comboItem: any) =>
                      String(comboItem.comboId) === catalogItemId,
                  ),
                );

                const mergedComboCategories = mergeComboCategories(
                  catalogItem?.comboCategories ||
                    comboCatalogById.get(catalogItemId)?.comboCategories ||
                    [],
                  selectedComboCategories,
                );

                const existingItem = menuItems.find(
                  (item: any) => String(item.id) === catalogItemId,
                );

                const mappedCatalogItem = {
                  id: catalogItemId,
                  name:
                    catalogItem?.name ||
                    catalogItem?.menuItemName ||
                    catalogItem?.title ||
                    "Menu Item",
                  price: parseFloat(
                    String(catalogItem?.pricePerPerson || catalogItem?.price || 0),
                  ) || 0,
                  category: catalogItem?.menuName || "Menu",
                  menuName: catalogItem?.menuName,
                  menuItemName:
                    catalogItem?.menuItemName ||
                    catalogItem?.name ||
                    catalogItem?.title,
                  isCombo:
                    Boolean(catalogItem?.isCombo) || mergedComboCategories.length > 0,
                  comboCategories: mergedComboCategories,
                  comboCategoryItems: (serviceComboCategoryItems || []).filter(
                    (comboItem: any) =>
                      String(comboItem.comboId) === catalogItemId,
                  ),
                  priceType: catalogItem?.priceType || "fixed",
                  image: catalogItem?.image || catalogItem?.imageUrl || "",
                  imageUrl: catalogItem?.imageUrl || catalogItem?.image || "",
                  description: catalogItem?.description || "",
                };

                if (!existingItem) {
                  menuItems.push(mappedCatalogItem);
                  return;
                }

                existingItem.name = existingItem.name || mappedCatalogItem.name;
                existingItem.price =
                  existingItem.price && existingItem.price > 0
                    ? existingItem.price
                    : mappedCatalogItem.price;
                existingItem.category = existingItem.category || mappedCatalogItem.category;
                existingItem.menuName = existingItem.menuName || mappedCatalogItem.menuName;
                existingItem.menuItemName =
                  existingItem.menuItemName || mappedCatalogItem.menuItemName;
                existingItem.isCombo =
                  Boolean(existingItem.isCombo) || Boolean(mappedCatalogItem.isCombo);
                existingItem.comboCategories = mergeComboCategories(
                  existingItem.comboCategories || [],
                  mappedCatalogItem.comboCategories || [],
                );
                existingItem.comboCategoryItems = [
                  ...(existingItem.comboCategoryItems || []),
                  ...(mappedCatalogItem.comboCategoryItems || []),
                ].filter(
                  (item: any, index: number, arr: any[]) =>
                    arr.findIndex(
                      (x: any) =>
                        String(x.comboId || "") === String(item.comboId || "") &&
                        String(x.cateringId || x.id || "") ===
                          String(item.cateringId || item.id || "") &&
                        String(x.menuName || "Combo Items") ===
                          String(item.menuName || "Combo Items"),
                    ) === index,
                );
                existingItem.image = existingItem.image || mappedCatalogItem.image;
                existingItem.imageUrl = existingItem.imageUrl || mappedCatalogItem.imageUrl;
                existingItem.description =
                  existingItem.description || mappedCatalogItem.description;
              });

              (serviceCatalogCombos || []).forEach((combo: any) => {
                const comboId = String(combo?.id || combo?.itemId || "");
                if (!comboId) return;
                if (menuItems.some((item: any) => String(item.id) === comboId)) return;

                const selectedComboCategories = buildComboCategories(
                  (serviceComboCategoryItems || []).filter(
                    (comboItem: any) => String(comboItem.comboId) === comboId,
                  ),
                );

                menuItems.push({
                  id: comboId,
                  name: combo?.name || combo?.menuItemName || "Combo",
                  price:
                    parseFloat(String(combo?.pricePerPerson || combo?.price || 0)) || 0,
                  category: "Combo Packages",
                  menuName: "Combo Packages",
                  menuItemName: combo?.name || combo?.menuItemName || "Combo",
                  isCombo: true,
                  comboCategories: mergeComboCategories(
                    combo?.comboCategories || [],
                    selectedComboCategories,
                  ),
                  comboCategoryItems: (serviceComboCategoryItems || []).filter(
                    (comboItem: any) => String(comboItem.comboId) === comboId,
                  ),
                  priceType: combo?.priceType || "fixed",
                  image: combo?.image || combo?.imageUrl || "",
                  imageUrl: combo?.imageUrl || combo?.image || "",
                  description: combo?.description || "",
                });
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
            }

            if (service.venueItems && service.venueItems.length > 0) {
              serviceItems = service.venueItems;
              venueItems = service.venueItems.map((item: any) => ({
                id: item.id,
                name: item.name,
                price: parseFloat(item.price || 0),
              }));
            }

            // Build service_details structure based on service type
            let serviceDetails: any = {};
            if (serviceType === "catering") {
              // Map comboCategoryItems from API to the format expected by calculation
              const mappedComboCategoryItems = (
                serviceComboCategoryItems || []
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

              // Add image field to menuItems for display
              const menuItemsWithImages = menuItems.map((mi: any) => ({
                ...mi,
                image: mi.image || mi.imageUrl || "",
              }));

              const combos = menuItemsWithImages
                .filter((mi: any) => mi.isCombo)
                .map((mi: any) => ({
                  id: mi.id,
                  name: mi.name,
                  isCombo: true,
                  pricePerPerson: parseFloat(String(mi.price || 0)) || 0,
                  comboCategories: mi.comboCategories || [],
                }));

              serviceDetails = {
                catering: {
                  menuItems: menuItemsWithImages,
                  combos,
                  minimumGuests: resolvedMinimumGuests,
                  maximumGuests: resolvedMaximumGuests,
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
                rental: { items: rentalItems },
              };
            } else if (
              serviceType === "events_staff" ||
              serviceType === "staff"
            ) {
              serviceDetails = {
                staffServices: staffItems,
                services: staffItems,
                staff: { services: staffItems },
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
              price: parseFloat(service.price) || 0,
              servicePrice: service.price,
              totalPrice: (parseFloat(service.totalPrice) || 0) > 0
                ? parseFloat(service.totalPrice)
                : ["catering", "party_rentals", "party-rentals", "party-rental", "staff", "events_staff"].includes(serviceType)
                  ? 0
                  : parseFloat(service.price) || 0,
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
              minimumGuests: resolvedMinimumGuests,
              maximumGuests: resolvedMaximumGuests,
            };
          });

          // Build selectedItems from service items
          const mappedSelectedItems: Record<string, number> = {};
          (invoiceServices || []).forEach((service: any) => {
            if (service.cateringItems) {
              const comboIdSet = new Set(
                [
                  ...(service.comboCategoryItems || []),
                  ...((service.cateringItems || []).filter(
                    (item: any) =>
                      item?.comboId &&
                      (item?.isComboCategoryItem || item?.cateringId || item?.id),
                  )),
                ].map((item: any) => String(item.comboId || "")),
              );

              service.cateringItems.forEach((item: any) => {
                if (item?.comboId || item?.isComboCategoryItem) return;
                const itemId = item.cateringId || item.id;
                if (itemId) {
                  const isComboBase = comboIdSet.has(String(itemId));
                  const quantityToMap = isComboBase ? 1 : item.quantity || 1;
                  mappedSelectedItems[itemId] =
                    (mappedSelectedItems[itemId] || 0) + quantityToMap;
                }
              });
            }

            if (service.partyRentalItems) {
              service.partyRentalItems.forEach((item: any) => {
                const itemId = item.rentalId || item.id;
                if (itemId) {
                  mappedSelectedItems[itemId] =
                    (mappedSelectedItems[itemId] || 0) + (item.quantity || 1);
                }
              });
            }

            if (service.staffItems) {
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

            if (service.venueItems) {
              service.venueItems.forEach((item: any) => {
                const itemId = item.id;
                if (itemId) {
                  mappedSelectedItems[itemId] =
                    (mappedSelectedItems[itemId] || 0) + (item.quantity || 1);
                }
              });
            }
          });

          // Add combo category items to selectedItems
          const allComboCategoryItems = (invoiceServices || []).flatMap((s: any) => {
            const direct = s.comboCategoryItems || [];
            const fromCatering = (s.cateringItems || [])
              .filter((item: any) => item?.comboId && (item?.isComboCategoryItem || item?.cateringId || item?.id))
              .map((item: any) => ({
                ...item,
                comboId: item.comboId,
                cateringId: item.cateringId || item.id,
                menuName: item.menuName || "combo-category",
              }));
            return [...direct, ...fromCatering];
          });
          allComboCategoryItems.forEach((item: any) => {
            const categoryKey = item.menuName || "combo-category";
            const itemKey =
              item.comboId + "_" + categoryKey + "_" + (item.cateringId || item.id);
            mappedSelectedItems[itemKey] = Number(item.quantity || 0) > 0 ? 1 : 0;
          });

          (invoiceServices || []).forEach((service: any) => {
            const comboIdSet = new Set(
              [...(service.comboCategoryItems || []), ...((service.cateringItems || []).filter((item: any) => item?.comboId && (item?.isComboCategoryItem || item?.cateringId || item?.id)))].map((item: any) =>
                String(item.comboId || ""),
              ),
            );
            (service.cateringItems || []).forEach((item: any) => {
              const comboId = String(item.cateringId || item.id || "");
              if (!comboIdSet.has(comboId)) return;
              const headcount = Number(item.quantity || 0);
              const basePrice = Number(item.price || 0);
              if (headcount > 0) {
                mappedSelectedItems[`meta_${comboId}_headcount`] = headcount;
              }
              if (basePrice > 0) {
                mappedSelectedItems[`meta_${comboId}_basePrice`] = Math.round(
                  basePrice * 100,
                );
              }
            });
          });

          setSelectedServices(mappedServices);
          setSelectedItems(mappedSelectedItems);
          setFormInputs({
            eventName: invoiceData.eventName || "",
            companyName: invoiceData.companyName || "",
            eventDate: invoiceData.eventDate || "",
            serviceTime: invoiceData.serviceTime || "",
            guestCount: invoiceData.guestCount || "",
            eventLocation: invoiceData.eventLocation || "",
            contactName: invoiceData.contactName || "",
            emailAddress: invoiceData.emailAddress || "",
            phoneNumber: invoiceData.phoneNumber || "",
            additionalNotes: invoiceData.additionalNotes || "",
            hasBackupContact: invoiceData.addBackupContact || false,
            backupContactName: invoiceData.backupContactName || "",
            backupContactPhone: invoiceData.backupContactPhone || "",
            backupContactEmail: invoiceData.backupContactEmail || "",
          });

          // Set admin-specific fields
          setIsTaxExempt(invoiceData.taxExemptStatus || false);
          setIsServiceFeeWaived(invoiceData.waiveServiceFee || false);
          setAdminNotes(invoiceData.adminOverrideNotes || "");
          setCustomAdjustments(invoiceData.customLineItems || []);
          setHasServiceChanges(false);
        } else {
          toast.error("Invoice not found");
          navigate("/admin/invoices");
        }
      } catch (error) {
        toast.error("Failed to load invoice data");
        navigate("/admin/invoices");
      } finally {
        setIsLoading(false);
      }
    };

    loadOrderData();
  }, [id, navigate]);

  const handleSave = async () => {
    console.log("[AdminEditInvoicePage] Save clicked", {
      id,
      selectedServicesCount: selectedServices.length,
    });
    if (!id) {
      toast.error("Cannot save: missing invoice ID");
      return;
    }
    setIsSaving(true);
    try {
      let existingInvoice: any = {};
      try {
        const byIdResponse = await invoiceService.getInvoiceById(id!);
        existingInvoice = byIdResponse?.data || {};
      } catch {
        const invoiceResponse = await invoiceService.getInvoiceOrderSummary(
          id!,
        );
        existingInvoice = invoiceResponse?.data?.invoice || {};
      }

      const serviceImageMap = new Map();
      const itemImageMap = new Map();

      (existingInvoice.services || []).forEach((svc: any) => {
        if (svc.image || svc.imageUrl) {
          serviceImageMap.set(svc.id, svc.image || svc.imageUrl);
        }
        (svc.cateringItems || []).forEach((item: any) => {
          if (item.image || item.imageUrl) {
            itemImageMap.set(
              item.cateringId || item.id,
              item.image || item.imageUrl,
            );
          }
        });
        (svc.comboCategoryItems || []).forEach((item: any) => {
          if (item.image || item.imageUrl) {
            itemImageMap.set(
              item.cateringId || item.id,
              item.image || item.imageUrl,
            );
          }
        });
        (svc.partyRentalItems || []).forEach((item: any) => {
          if (item.image || item.imageUrl) {
            itemImageMap.set(
              item.rentalId || item.id,
              item.image || item.imageUrl,
            );
          }
        });
      });

      const updatedOrderData = {
        eventName: formInputs.eventName ?? orderData.eventName ?? "",
        companyName: formInputs.companyName ?? orderData.companyName ?? "",
        eventLocation:
          formInputs.eventLocation ?? orderData.eventLocation ?? "",
        eventDate: formInputs.eventDate ?? orderData.eventDate ?? "",
        serviceTime: formInputs.serviceTime ?? orderData.serviceTime ?? "",
        guestCount: formInputs.guestCount ?? orderData.guestCount ?? 1,
        contactName: formInputs.contactName ?? orderData.contactName ?? "",
        phoneNumber: formInputs.phoneNumber ?? orderData.phoneNumber ?? "",
        emailAddress: formInputs.emailAddress ?? orderData.emailAddress ?? "",
        additionalNotes:
          formInputs.additionalNotes ?? orderData.additionalNotes ?? "",
        addBackupContact:
          formInputs.hasBackupContact ?? orderData.addBackupContact ?? false,
        taxExemptStatus: isTaxExempt,
        waiveServiceFee: isServiceFeeWaived,
        adminOverrideNotes: adminNotes,
        services: selectedServices.map((service) => {
          const serviceType = (service.serviceType || service.type || "")
            .toLowerCase()
            .replace(/-/g, "_");

          const parsePrice = (priceStr: any): number => {
            if (!priceStr) return 0;
            const cleanPrice = priceStr.toString().replace(/[^0-9.]/g, "");
            return parseFloat(cleanPrice) || 0;
          };

          const basePrice =
            parsePrice(service.price) ||
            parsePrice((service as any).servicePrice) ||
            0;
          const baseQuantity = service.quantity || 1;
          const serviceId = service.id || (service as any).serviceId;
          const serviceImage =
            service.image ||
            (service as any).imageUrl ||
            (service as any).serviceImage ||
            serviceImageMap.get(serviceId) ||
            "";

          const baseService: any = {
            serviceType,
            serviceName: service.serviceName || service.name || "",
            image: serviceImage,
            totalPrice: [
              "catering",
              "party_rentals",
              "party_rental",
              "staff",
              "events_staff",
            ].includes(serviceType)
              ? 0
              : basePrice * baseQuantity,
            priceType:
              serviceType === "staff" || serviceType === "events_staff"
                ? "hourly"
                : "flat",
            price: basePrice,
            quantity: baseQuantity,
            vendorId: service.vendor_id || service.vendorId || "",
          };

          if (serviceType === "catering") {
            const cateringItems: any[] = [];

            if (service.service_details?.catering?.menuItems) {
              service.service_details.catering.menuItems.forEach(
                (item: any) => {
                  const comboIdForMeta = item.id || item.cateringId;
                  const comboHeadcount =
                    comboIdForMeta != null
                      ? selectedItems[`meta_${comboIdForMeta}_headcount`]
                      : undefined;
                  const quantity =
                    item.isCombo && typeof comboHeadcount === "number"
                      ? comboHeadcount
                      : selectedItems[item.id] ??
                        selectedItems[item.cateringId] ??
                        item.quantity ??
                        0;
                  if (quantity > 0) {
                    const itemImage =
                      item.image ||
                      item.imageUrl ||
                      itemImageMap.get(item.id) ||
                      "";
                    cateringItems.push({
                      menuName: item.menuName || item.category || "Menu",
                      menuItemName: item.menuItemName || item.name,
                      image: itemImage,
                      price: parseFloat(item.price || 0),
                      quantity,
                      totalPrice: parseFloat(item.price || 0) * quantity,
                      cateringId: item.id,
                      isComboCategoryItem: false,
                    });
                  }
                },
              );
            }

            if (service.service_details?.catering?.menuItems) {
              service.service_details.catering.menuItems.forEach(
                (item: any) => {
                  if (item.comboCategories) {
                    item.comboCategories.forEach((category: any) => {
                      category.items?.forEach((comboItem: any) => {
                        const categoryKey =
                          category.id ||
                          category.categoryId ||
                          category.name ||
                          "combo-category";
                        const comboKey = `${item.id}_${categoryKey}_${comboItem.id}`;
                        const quantity =
                          selectedItems[comboKey] ||
                          selectedItems[
                            `${item.id}_combo-category_${comboItem.id}`
                          ] ||
                          0;
                        if (quantity > 0) {
                          const comboItemImage =
                            comboItem.image ||
                            comboItem.imageUrl ||
                            itemImageMap.get(comboItem.id) ||
                            "";
                          const premiumCharge =
                            parseFloat(
                              String(
                                comboItem.premiumCharge ??
                                  comboItem.additionalCharge ??
                                  comboItem.additionalPrice ??
                                  0,
                              ),
                            ) || 0;
                          const comboHeadcount =
                            Number(
                              selectedItems[`meta_${item.id}_headcount`] ||
                                selectedItems[`meta_${item.cateringId}_headcount`] ||
                                0,
                            ) ||
                            Number(baseQuantity || 0) ||
                            Number(formInputs?.guestCount || 0) ||
                            1;

                          // Combo category rows should contribute premium delta only.
                          const effectiveQuantity =
                            premiumCharge > 0 ? comboHeadcount : quantity;

                          cateringItems.push({
                            menuName: category.name || "Combo Deal",
                            menuItemName:
                              comboItem.name ||
                              comboItem.itemName ||
                              "Combo Item",
                            image: comboItemImage,
                            price:
                              parseFloat(String(comboItem.price || 0)) || 0,
                            premiumCharge,
                            quantity: effectiveQuantity,
                            totalPrice: premiumCharge * effectiveQuantity,
                            serviceId: service.id,
                            cateringId: comboItem.id || comboItem.itemId,
                            comboId: item.id,
                            isComboCategoryItem: true,
                          });
                        }
                      });
                    });
                  }
                },
              );
            }

            baseService.cateringItems = cateringItems;
            const itemsTotal = cateringItems.reduce(
              (sum: number, item: any) => sum + (Number(item.totalPrice) || 0),
              0,
            );
            baseService.totalPrice = itemsTotal;
          } else if (
            serviceType === "party_rentals" ||
            serviceType === "party_rental"
          ) {
            const rentalItems: any[] = [];
            let hasItems = false;

            if (
              service.service_details?.rentalItems ||
              service.service_details?.rental?.items
            ) {
              const items =
                service.service_details.rentalItems ||
                service.service_details.rental.items;
              items.forEach((item: any) => {
                const quantity = selectedItems[item.id] ?? item.quantity ?? 0;
                if (quantity > 0) {
                  hasItems = true;
                  rentalItems.push({
                    name: item.name,
                    quantity,
                    eachPrice: parseFloat(item.price || 0),
                    totalPrice: parseFloat(item.price || 0) * quantity,
                    rentalId: item.id,
                  });
                }
              });
            }

            if (!hasItems) {
              const quantity = service.quantity || 1;
              return {
                serviceType: "party_rentals",
                serviceName: service.serviceName || service.name || "",
                image: serviceImage,
                vendorId: service.vendor_id || service.vendorId,
                price: basePrice,
                quantity: quantity,
                totalPrice: basePrice * quantity,
                priceType: "flat",
              };
            }

            baseService.partyRentalItems = rentalItems;
            baseService.totalPrice = rentalItems.reduce(
              (sum: number, item: any) => sum + (Number(item.totalPrice) || 0),
              0,
            );
          } else if (
            serviceType === "staff" ||
            serviceType === "events_staff"
          ) {
            const staffItems: any[] = [];
            let hasItems = false;

            if (
              service.service_details?.staffServices ||
              service.service_details?.staff?.services
            ) {
              const items =
                service.service_details.staffServices ||
                service.service_details.staff.services;
              items.forEach((item: any) => {
                const quantity = selectedItems[item.id] ?? item.quantity ?? 0;
                const duration =
                  selectedItems[`${item.id}_duration`] || service.duration || 1;
                if (quantity > 0) {
                  hasItems = true;
                  staffItems.push({
                    name: item.name,
                    pricingType: item.pricingType || "hourly",
                    perHourPrice: parseFloat(
                      item.perHourPrice || item.price || 0,
                    ),
                    hours: duration,
                    totalPrice:
                      item.pricingType === "flat"
                        ? parseFloat(item.price || 0)
                        : parseFloat(item.perHourPrice || item.price || 0) *
                          duration,
                    staffId: item.id,
                  });
                }
              });
            }

            if (!hasItems) {
              const quantity = service.quantity || 1;
              return {
                serviceType: "events_staff",
                serviceName: service.serviceName || service.name || "",
                image: serviceImage,
                vendorId: service.vendor_id || service.vendorId,
                price: basePrice,
                quantity: quantity,
                totalPrice: basePrice * quantity,
                priceType: "hourly",
              };
            }

            baseService.staffItems = staffItems;
            baseService.totalPrice = staffItems.reduce(
              (sum: number, item: any) => sum + (Number(item.totalPrice) || 0),
              0,
            );
          } else if (serviceType === "venue" || serviceType === "venues") {
            const quantity = service.quantity || 1;
            let actualServicePrice = basePrice;

            if (actualServicePrice === 0) {
              if (service.service_details?.venueOptions?.[0]?.price) {
                actualServicePrice = parsePrice(
                  service.service_details.venueOptions[0].price,
                );
              } else if (service.service_details?.options?.[0]?.price) {
                actualServicePrice = parsePrice(
                  service.service_details.options[0].price,
                );
              }
            }

            return {
              serviceType: "venues",
              serviceName: service.serviceName || service.name || "",
              image: serviceImage,
              vendorId: service.vendor_id || service.vendorId,
              price: actualServicePrice,
              quantity: quantity,
              totalPrice: actualServicePrice * quantity,
              priceType: "flat",
            };
          }

          return baseService;
        }),
        customLineItems: customAdjustments.map((adj) => {
          const parsedValue = Number(adj.value);
          const safeValue = Number.isFinite(parsedValue) ? parsedValue : 0;
          return {
            label: adj.label || "",
            type: adj.type || "fixed",
            mode: adj.mode || "surcharge",
            value: safeValue,
            taxable: Boolean(adj.taxable),
            statusForDrafting: false,
          };
        }),
      };

      console.log("[AdminEditInvoicePage] Updating invoice", {
        invoiceId: id,
        servicesCount: updatedOrderData.services?.length || 0,
      });
      const updateResponse = await invoiceService.updateInvoice(
        id!,
        updatedOrderData,
      );
      console.log("[AdminEditInvoicePage] Update response:", updateResponse);
      const verifyResponse = await invoiceService.getInvoiceOrderSummary(id!);
      const persistedServices = verifyResponse?.data?.invoice?.services || [];
      const expectedSignature = (updatedOrderData.services || [])
        .map(
          (s: any) =>
            `${s.serviceType}:${s.serviceName}:${Number(s.totalPrice) || 0}`,
        )
        .sort()
        .join("|");
      const persistedSignature = persistedServices
        .map(
          (s: any) =>
            `${s.serviceType}:${s.serviceName}:${Number(s.totalPrice) || 0}`,
        )
        .sort()
        .join("|");

      console.log("[AdminEditInvoicePage] Persist verification", {
        expectedCount: updatedOrderData.services?.length || 0,
        persistedCount: persistedServices.length,
        expectedSignature,
        persistedSignature,
      });

      if (expectedSignature !== persistedSignature) {
        toast.error("Save completed but services were not persisted", {
          description:
            "Backend returned old service data. Check update endpoint service payload support.",
        });
        return;
      }

      setHasServiceChanges(false);
      toast.success("Invoice updated successfully");
      navigate(`/admin/invoices/${id}`);
    } catch (error: any) {
      console.error("[AdminEditInvoicePage] Save failed:", error);
      toast.error("Failed to update invoice", {
        description:
          error?.response?.data?.message || error?.message || "Unknown error",
      });
    } finally {
      setIsSaving(false);
    }
  };
  const handleCancel = () => {
    navigate(`/admin/invoices/${id}`);
  };

  const handleAddService = () => {
    sessionStorage.setItem(
      "editOrderState",
      JSON.stringify({
        editOrderId: id,
        services: selectedServices,
        selectedItems: selectedItems,
        orderData: orderData,
        formInputs: formInputs,
        customAdjustments: customAdjustments,
        isTaxExempt: isTaxExempt,
        isServiceFeeWaived: isServiceFeeWaived,
        adminNotes: adminNotes,
      }),
    );

    navigate("/admin/marketplace", {
      state: {
        fromEditOrder: true,
        editOrderId: id,
        currentEditOrderServices: selectedServices,
        returnToEditOrder: `/admin/invoices/edit/${id}`,
      },
    });
  };

  const handleRemoveService = (index: number) => {
    setHasServiceChanges(true);
    setSelectedServices((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemQuantityChange = useCallback(
    (itemId: string, quantity: number) => {
      setHasServiceChanges(true);
      setSelectedItems((prev) => ({
        ...prev,
        [itemId]: quantity,
      }));

      setSelectedServices((prev) =>
        prev.map((service) => {
          const { totalPrice, ...serviceWithoutTotal } = service as any;
          return serviceWithoutTotal as typeof service;
        }),
      );
    },
    [],
  );

  const handleComboSelection = useCallback((payload: any) => {
    if (payload && "serviceId" in payload && "selections" in payload) {
      setHasServiceChanges(true);
      const { serviceId, selections } = payload;
      setSelectedServices((prevServices) =>
        prevServices.map((service) => {
          const svcId = service.id || service.serviceId;
          if (svcId === serviceId) {
            const existing = Array.isArray(service.comboSelectionsList)
              ? service.comboSelectionsList
              : [];
            const withoutCurrentCombo = existing.filter(
              (entry: any) =>
                String(entry?.comboItemId ?? entry?.comboId) !== String(selections?.comboItemId ?? selections?.comboId),
            );
            return {
              ...service,
              comboSelectionsList: [...withoutCurrentCombo, selections],
            };
          }
          return service;
        }),
      );
    }
  }, []);

  const getProcessedService = useCallback((rawService: any) => {
    return processService(rawService);
  }, []);

  if (isLoading) {
    return (
      <Dashboard activeTab="invoices" userRole="admin">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <div className="text-lg font-medium">
              Loading invoice details...
            </div>
          </div>
        </div>
      </Dashboard>
    );
  }

  return (
    <Dashboard activeTab="invoices" userRole="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleCancel}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold">Edit Invoice</h1>
          </div>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        {orderData && (
          <div className="grid grid-cols-1 xl:grid-cols-10 gap-6">
            <div className="xl:col-span-6 space-y-6 xl:h-[calc(100vh-2rem)] xl:overflow-y-auto no-scrollbar xl:pr-2">
              {/* Services Section */}
              <div className="bg-white border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Services</h2>
                  <Button
                    onClick={handleAddService}
                    className="flex items-center gap-2"
                    variant="outline"
                  >
                    <Plus className="h-4 w-4" />
                    Add Service
                  </Button>
                </div>

                <div className="space-y-4">
                  {selectedServices.map((service, index) => {
                    const processedService = getProcessedService(service);

                    if (!processedService || !processedService.rawData) {
                      return null;
                    }

                    return (
                      <div
                        key={
                          service.id || service.serviceId || `service-${index}`
                        }
                        className="w-full"
                      >
                        <BookingVendorCard
                          vendorImage={processedService.image}
                          vendorName={processedService.name}
                          vendorType={getServiceTypeLabel(
                            processedService.serviceType,
                          )}
                          vendorPrice={processedService.priceDisplay}
                          serviceDetails={processedService.rawData}
                          selectedItems={selectedItems}
                          onItemQuantityChange={handleItemQuantityChange}
                          onComboSelection={handleComboSelection}
                          onRemoveService={() => handleRemoveService(index)}
                          canRemove={true}
                          serviceIndex={index}
                          quantity={service?.quantity || 1}
                          onQuantityChange={(quantity) => {
                            setHasServiceChanges(true);
                            setSelectedServices((prev) =>
                              prev.map((s, i) => {
                                if (i === index) {
                                  const hasItems =
                                    s.service_details?.catering?.menuItems
                                      ?.length > 0 ||
                                    s.service_details?.rentalItems?.length >
                                      0 ||
                                    s.service_details?.staffServices?.length >
                                      0;
                                  if (hasItems) {
                                    const {
                                      totalPrice,
                                      ...serviceWithoutTotal
                                    } = s as any;
                                    return {
                                      ...serviceWithoutTotal,
                                      quantity,
                                    } as typeof s;
                                  }
                                  const basePrice = parseFloat(
                                    String(
                                      s.price || (s as any).servicePrice || "0",
                                    ),
                                  );
                                  return {
                                    ...s,
                                    quantity,
                                    totalPrice: basePrice * quantity,
                                  } as any;
                                }
                                return s;
                              }),
                            );
                          }}
                          showChangeService={false}
                          guestCount={Number(formInputs?.guestCount || 1) || 1}
                        />
                      </div>
                    );
                  })}

                  {selectedServices.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>
                        No services selected. Click "Add Service" to get
                        started.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Event Details Section */}
              <div className="bg-white border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Event Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Event Name
                    </label>
                    <input
                      type="text"
                      value={formInputs.eventName || ""}
                      onChange={(e) =>
                        setFormInputs((prev) => ({
                          ...prev,
                          eventName: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Company Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={formInputs.companyName || ""}
                      onChange={(e) =>
                        setFormInputs((prev) => ({
                          ...prev,
                          companyName: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Acme Corporation"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Event Date
                    </label>
                    <input
                      type="date"
                      value={formInputs.eventDate || ""}
                      onChange={(e) =>
                        setFormInputs((prev) => ({
                          ...prev,
                          eventDate: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Service Time
                    </label>
                    <input
                      type="time"
                      value={formInputs.serviceTime || ""}
                      onChange={(e) =>
                        setFormInputs((prev) => ({
                          ...prev,
                          serviceTime: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Guest Count
                    </label>
                    <input
                      type="number"
                      value={formInputs.guestCount || ""}
                      onChange={(e) =>
                        setFormInputs((prev) => ({
                          ...prev,
                          guestCount: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Event Location
                    </label>
                    <input
                      type="text"
                      value={formInputs.eventLocation || ""}
                      onChange={(e) =>
                        setFormInputs((prev) => ({
                          ...prev,
                          eventLocation: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="bg-white border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Contact Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      value={formInputs.contactName || ""}
                      onChange={(e) =>
                        setFormInputs((prev) => ({
                          ...prev,
                          contactName: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formInputs.emailAddress || ""}
                      onChange={(e) =>
                        setFormInputs((prev) => ({
                          ...prev,
                          emailAddress: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formInputs.phoneNumber || ""}
                      onChange={(e) =>
                        setFormInputs((prev) => ({
                          ...prev,
                          phoneNumber: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                {/* Backup Contact Section */}
                <div className="mt-4 space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="hasBackupContact"
                      checked={formInputs.hasBackupContact || false}
                      onCheckedChange={(checked) =>
                        setFormInputs((prev) => ({
                          ...prev,
                          hasBackupContact: checked,
                        }))
                      }
                    />
                    <Label
                      htmlFor="hasBackupContact"
                      className="text-sm font-medium"
                    >
                      Add backup contact
                    </Label>
                  </div>

                  {formInputs.hasBackupContact && (
                    <div className="space-y-3 pl-4 border-l-2 border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Backup Contact Name
                          </label>
                          <input
                            type="text"
                            value={formInputs.backupContactName || ""}
                            onChange={(e) =>
                              setFormInputs((prev) => ({
                                ...prev,
                                backupContactName: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Jane Smith"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Backup Phone
                          </label>
                          <input
                            type="tel"
                            value={formInputs.backupContactPhone || ""}
                            onChange={(e) =>
                              setFormInputs((prev) => ({
                                ...prev,
                                backupContactPhone: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="(555) 987-6543"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Backup Email
                        </label>
                        <input
                          type="email"
                          value={formInputs.backupContactEmail || ""}
                          onChange={(e) =>
                            setFormInputs((prev) => ({
                              ...prev,
                              backupContactEmail: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="jane@example.com"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Notes Section */}
              <div className="bg-white border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Additional Notes</h2>
                <textarea
                  value={formInputs.additionalNotes || ""}
                  onChange={(e) =>
                    setFormInputs((prev) => ({
                      ...prev,
                      additionalNotes: e.target.value,
                    }))
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Any special dietary restrictions, setup requirements, or other notes..."
                />
              </div>

              {/* Admin Tax & Fee Controls */}
              <div className="bg-white border rounded-lg p-6">
                <AdminTaxAndFeeControls
                  isTaxExempt={isTaxExempt}
                  isServiceFeeWaived={isServiceFeeWaived}
                  adminNotes={adminNotes}
                  onTaxExemptChange={setIsTaxExempt}
                  onServiceFeeWaivedChange={setIsServiceFeeWaived}
                  onAdminNotesChange={setAdminNotes}
                />
              </div>

              {/* Admin Custom Line Items */}
              <div className="bg-white border rounded-lg p-6">
                <AdminCustomAdjustments
                  selectedServices={selectedServices}
                  selectedItems={selectedItems}
                  formData={formInputs}
                  adjustments={customAdjustments}
                  onChange={setCustomAdjustments}
                />
              </div>
            </div>

            <div className="xl:col-span-4">
              <div className="xl:sticky xl:top-4 xl:h-[calc(100vh-2rem)] xl:overflow-y-auto no-scrollbar">
                <div className="bg-white border rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">
                    Invoice Summary
                  </h2>
                  {selectedServices.length > 0 ? (
                    <EnhancedOrderSummaryCard
                      selectedServices={selectedServices}
                      selectedItems={selectedItems}
                      customAdjustments={customAdjustments}
                      isTaxExempt={isTaxExempt}
                      isServiceFeeWaived={isServiceFeeWaived}
                      guestCount={Number(formInputs?.guestCount || 1) || 1}
                      showDetailedBreakdown={false}
                    />
                  ) : (
                    <div className="text-sm text-gray-500">
                      No services selected yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Dashboard>
  );
}

export default AdminEditInvoicePage;






















