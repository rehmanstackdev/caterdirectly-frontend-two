/**
 * Catering Service Mapper Utility
 * Handles complex catering service mapping for invoices
 */

import { extractCateringItems, calculateCateringPrice } from "./catering-price-calculation";

export const mapCateringService = (
  service: any,
  selectedItems: Record<string, number>,
  serviceDeliveryFees: Record<string, { range: string; fee: number }>,
  formData: any
) => {
  const serviceId = service.id || service.serviceId || "";
  const details = service.service_details || {};
  const deliveryFee = serviceDeliveryFees[serviceId] || null;

  const serviceItems = extractServiceItems(service, selectedItems, details);
  const calculatedTotalPrice = calculateTotalPrice(serviceItems);

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

  const mappedService: any = {
    serviceType: "catering",
    serviceName: service.serviceName || service.name || "",
    vendorId: service.vendor_id || service.vendorId || "",
    totalPrice: calculatedTotalPrice,
    priceType: service.priceType || service.price_type || "flat",
    image: serviceImage,
    cateringItems: serviceItems,
  };

  if (deliveryFee && deliveryFee.fee > 0) {
    mappedService.deliveryFee = deliveryFee.fee;
  }

  addDeliveryRanges(mappedService, service);
  calculateFinalCateringPrice(mappedService, service, selectedItems, formData);

  return mappedService;
};

const extractServiceItems = (
  service: any,
  selectedItems: Record<string, number>,
  details: any
): any[] => {
  const serviceId = service.id || service.serviceId || "";
  const availableItems = getAvailableItems(details);
  const serviceItems: any[] = [];

  Object.entries(selectedItems).forEach(([itemId, quantity]) => {
    const validQuantity = quantity && typeof quantity === "number" ? quantity : quantity || 1;
    if (!validQuantity || validQuantity < 1) return;

    // Handle combo category items
    if (itemId.includes("_") && itemId.split("_").length >= 3) {
      const comboCategoryItem = processComboCategoryItem(
        itemId,
        validQuantity,
        availableItems,
        serviceId
      );
      if (comboCategoryItem) serviceItems.push(comboCategoryItem);
      return;
    }

    // Handle regular items
    const regularItem = processRegularItem(
      itemId,
      validQuantity,
      availableItems,
      serviceId,
      service
    );
    if (regularItem) serviceItems.push(regularItem);
  });

  // Handle combo selections
  if (service.comboSelectionsList && Array.isArray(service.comboSelectionsList)) {
    const comboItems = processComboSelections(
      service.comboSelectionsList,
      availableItems,
      details,
      selectedItems,
      serviceId
    );
    serviceItems.push(...comboItems);
  }

  return serviceItems;
};

const getAvailableItems = (details: any): any[] => {
  let items =
    details.menuItems ||
    details.catering?.menuItems ||
    details.menu?.items ||
    details.menu?.menu_items ||
    details.items ||
    details.menu_items ||
    details.menu ||
    [];

  if (details.catering?.combos && Array.isArray(details.catering.combos)) {
    items = [...items, ...details.catering.combos];
  }

  return items;
};

const processComboCategoryItem = (
  itemId: string,
  quantity: number,
  availableItems: any[],
  serviceId: string
): any | null => {
  const parts = itemId.split("_");
  const comboId = parts[0];
  const categoryId = parts[1];
  const actualItemId = parts[2];

  let categoryItem = null;
  let categoryName = "Category";

  const combo = availableItems.find(
    (item) =>
      (item.id === comboId || item.itemId === comboId) &&
      (item.comboCategories || item.isCombo)
  );

  if (combo && combo.comboCategories) {
    const category = combo.comboCategories.find(
      (cat: any) => cat.id === categoryId || cat.categoryId === categoryId
    );

    if (category) {
      categoryName = category.name || category.categoryName || "Category";
      if (category.items) {
        categoryItem = category.items.find(
          (item: any) => item.id === actualItemId || item.itemId === actualItemId
        );
      }
    }
  }

  const itemName = categoryItem?.name || categoryItem?.itemName || actualItemId;
  const itemPrice = parseFloat(String(categoryItem?.price || 0));
  const upchargePrice = parseFloat(
    String(categoryItem?.additionalCharge || categoryItem?.upcharge || 0)
  );
  const isUuidLikeId =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      actualItemId
    );

  if (!categoryItem && isUuidLikeId && itemPrice <= 0) {
    return null;
  }

  const itemImage =
    categoryItem?.image ||
    categoryItem?.imageUrl ||
    categoryItem?.itemImage ||
    categoryItem?.image_url ||
    categoryItem?.photo ||
    categoryItem?.picture ||
    "";

  return {
    menuName: categoryName,
    menuItemName: itemName,
    price: itemPrice,
    quantity,
    totalPrice: itemPrice * quantity,
    cateringId: actualItemId,
    serviceId,
    isComboCategoryItem: true,
    comboId,
    image: itemImage,
    premiumCharge: upchargePrice,
  };
};

const processRegularItem = (
  itemId: string,
  quantity: number,
  availableItems: any[],
  serviceId: string,
  service: any
): any | null => {
  let item = availableItems.find(
    (item: any) =>
      item.id === itemId ||
      item.itemId === itemId ||
      item.name === itemId ||
      item.title === itemId ||
      `${serviceId}_${item.id}` === itemId ||
      `${serviceId}_${item.itemId}` === itemId
  );

  if (!item && serviceId && itemId.startsWith(serviceId + "_")) {
    const actualId = itemId.slice((serviceId + "_").length);
    item = availableItems.find(
      (it: any) =>
        it.id === actualId ||
        it.itemId === actualId ||
        it.name === actualId ||
        it.title === actualId
    );
  }

  if (!item) return null;

  const isComboItem =
    item.isCombo || item.comboCategories || item.pricePerPerson !== undefined;
  if (
    isComboItem &&
    service.comboSelectionsList &&
    Array.isArray(service.comboSelectionsList)
  ) {
    const isInComboSelections = service.comboSelectionsList.some(
      (combo: any) => combo.comboItemId === item.id || combo.comboItemId === item.itemId
    );
    if (isInComboSelections) return null;
  }

  const itemPrice = parseFloat(
    String(
      item.pricePerPerson ||
        item.price ||
        item.itemPrice ||
        item.basePrice ||
        item.unitPrice ||
        0
    )
  );

  const resolvedItemName =
    item.name || item.menuItemName || item.itemName || item.title || "";
  const isUuidLikeId =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      itemId
    );

  if (!resolvedItemName && isUuidLikeId && itemPrice <= 0) {
    return null;
  }

  const itemImage =
    item.image ||
    item.imageUrl ||
    item.itemImage ||
    item.image_url ||
    item.photo ||
    item.picture ||
    item.menuItemImage ||
    "";

  return {
    menuName:
      item.menuName ||
      item.category ||
      item.menu?.name ||
      service.serviceName ||
      service.name ||
      "Menu",
    menuItemName: resolvedItemName || itemId,
    price: itemPrice,
    quantity,
    totalPrice: itemPrice * quantity,
    cateringId: item.id || item.cateringId || itemId,
    serviceId,
    image: itemImage,
  };
};

const processComboSelections = (
  comboSelectionsList: any[],
  availableItems: any[],
  details: any,
  selectedItems: Record<string, number>,
  serviceId: string
): any[] => {
  const comboItems: any[] = [];
  const comboItemsFromDetails = details.catering?.combos || [];

  comboSelectionsList.forEach((combo: any) => {
    if (!combo) return;

    const comboItemId = combo.comboItemId;
    let originalComboItem = availableItems.find(
      (item: any) =>
        (item.id === comboItemId ||
          item.itemId === comboItemId ||
          item.comboItemId === comboItemId) &&
        (item.isCombo || item.comboCategories || item.pricePerPerson !== undefined)
    );

    if (!originalComboItem) {
      originalComboItem = comboItemsFromDetails.find(
        (item: any) =>
          item.id === comboItemId ||
          item.itemId === comboItemId ||
          item.comboItemId === comboItemId
      );
    }

    const basePrice = parseFloat(
      String(
        originalComboItem?.pricePerPerson ||
          originalComboItem?.price ||
          combo.basePrice ||
          combo.pricePerPerson ||
          combo.price ||
          0
      )
    );

    const finalComboItemId = comboItemId || originalComboItem?.id;
    const proteinQuantity = calculateProteinQuantity(combo, selectedItems, serviceId, finalComboItemId);
    
    if (!hasValidSelections(combo, proteinQuantity)) return;

    const effectiveProteinQuantity = proteinQuantity > 0 ? proteinQuantity : 1;
    const { comboTotal, comboQuantity } = calculateComboTotal(
      basePrice,
      effectiveProteinQuantity,
      combo
    );

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

    const pricePerCombo = comboTotal / comboQuantity;

    comboItems.push({
      menuName: combo.comboName || originalComboItem?.category || "Combo Items",
      menuItemName: combo.comboName || originalComboItem?.name || "",
      price: pricePerCombo,
      quantity: comboQuantity,
      totalPrice: comboTotal,
      cateringId: finalComboItemId || combo.comboItemId || originalComboItem?.id || "",
      serviceId,
      image: comboImage,
    });

    // Add category items
    if (combo.selections && Array.isArray(combo.selections)) {
      combo.selections.forEach((category: any) => {
        if (category.selectedItems && Array.isArray(category.selectedItems)) {
          category.selectedItems.forEach((categoryItem: any) => {
            const upchargePrice = parseFloat(
              String(categoryItem.additionalCharge || categoryItem.upcharge || 0)
            );
            const totalPrice = parseFloat(String(categoryItem.price || 0));
            const categoryItemImage =
              categoryItem?.image ||
              categoryItem?.imageUrl ||
              categoryItem?.itemImage ||
              categoryItem?.image_url ||
              categoryItem?.photo ||
              categoryItem?.picture ||
              "";

            const itemQuantity = categoryItem.quantity || 1;
            const itemTotalPrice = totalPrice * itemQuantity;

            comboItems.push({
              menuName: category.categoryName || "Category",
              menuItemName:
                categoryItem.name || categoryItem.itemName || categoryItem.id || "",
              price: totalPrice,
              quantity: itemQuantity,
              totalPrice: itemTotalPrice,
              cateringId: categoryItem.id || categoryItem.itemId || "",
              serviceId,
              isComboCategoryItem: true,
              comboId: finalComboItemId || combo.comboItemId || originalComboItem?.id || "",
              image: categoryItemImage,
              premiumCharge: upchargePrice,
            });
          });
        }
      });
    }
  });

  return comboItems;
};

const calculateProteinQuantity = (
  combo: any,
  selectedItems: Record<string, number>,
  serviceId: string,
  finalComboItemId: string
): number => {
  let proteinQuantity = 0;

  if (combo.selections && Array.isArray(combo.selections)) {
    combo.selections.forEach((category: any) => {
      const isProtein =
        category.categoryName &&
        (category.categoryName.toLowerCase().includes("protein") ||
          category.categoryName.toLowerCase().includes("meat") ||
          category.categoryName.toLowerCase().includes("main"));

      if (isProtein && category.selectedItems && Array.isArray(category.selectedItems)) {
        category.selectedItems.forEach((item: any) => {
          proteinQuantity += item.quantity || 0;
        });
      }
    });
  }

  if (proteinQuantity === 0) {
    const directQuantity = selectedItems[finalComboItemId];
    const prefixedQuantity = selectedItems[`${serviceId}_${finalComboItemId}`];
    proteinQuantity = directQuantity || prefixedQuantity || 0;
  }

  return proteinQuantity;
};

const hasValidSelections = (combo: any, proteinQuantity: number): boolean => {
  const hasSelectedCategoryItems =
    Array.isArray(combo.selections) &&
    combo.selections.some(
      (category: any) =>
        Array.isArray(category.selectedItems) &&
        category.selectedItems.some((item: any) => (item.quantity || 0) > 0)
    );

  return hasSelectedCategoryItems || proteinQuantity > 0;
};

const calculateComboTotal = (
  basePrice: number,
  effectiveProteinQuantity: number,
  combo: any
): { comboTotal: number; comboQuantity: number } => {
  const baseTotal = basePrice * effectiveProteinQuantity;
  let totalUpcharges = 0;

  if (combo.selections && Array.isArray(combo.selections)) {
    combo.selections.forEach((category: any) => {
      if (category.selectedItems && Array.isArray(category.selectedItems)) {
        category.selectedItems.forEach((categoryItem: any) => {
          const upchargePrice = parseFloat(String(categoryItem.upcharge || 0));
          if (upchargePrice > 0) {
            totalUpcharges += upchargePrice;
          }
        });
      }
    });
  }

  return {
    comboTotal: baseTotal + totalUpcharges,
    comboQuantity: effectiveProteinQuantity,
  };
};

const calculateTotalPrice = (serviceItems: any[]): number => {
  return serviceItems.reduce((sum, item) => {
    const itemTotal = parseFloat(String(item.totalPrice || 0));
    return sum + (isNaN(itemTotal) ? 0 : itemTotal);
  }, 0);
};

const addDeliveryRanges = (mappedService: any, service: any) => {
  const deliveryOptions =
    service.service_details?.deliveryOptions ||
    service.service_details?.catering?.deliveryOptions;

  let deliveryRanges =
    deliveryOptions?.deliveryRanges ||
    service.service_details?.deliveryRanges ||
    service.service_details?.catering?.deliveryRanges ||
    service.deliveryRanges;

  if (deliveryRanges && Array.isArray(deliveryRanges) && deliveryRanges.length > 0) {
    const deliveryRangesRecord: Record<string, number> = {};
    deliveryRanges.forEach((range: any) => {
      if (range.range && typeof range.fee === "number") {
        deliveryRangesRecord[range.range] = range.fee;
      }
    });
    if (Object.keys(deliveryRangesRecord).length > 0) {
      mappedService.deliveryRanges = deliveryRangesRecord;
    }
  } else if (
    deliveryRanges &&
    typeof deliveryRanges === "object" &&
    !Array.isArray(deliveryRanges)
  ) {
    mappedService.deliveryRanges = deliveryRanges;
  }
};

const calculateFinalCateringPrice = (
  mappedService: any,
  service: any,
  selectedItems: Record<string, number>,
  formData: any
) => {
  if (!service.service_details) return;

  const { baseItems, additionalChargeItems, comboCategoryItems } = extractCateringItems(
    selectedItems,
    service.service_details
  );

  const basePricePerPerson = baseItems.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);

  const additionalCharges = additionalChargeItems.map((item) => ({
    name: item.name,
    quantity: item.quantity,
    unitPrice: item.price,
    additionalCharge: item.additionalCharge,
    isMenuItem: item.isMenuItem,
  }));

  const guestCount = parseInt(String(formData?.headcount || "1")) || 1;

  const cateringCalcResult = calculateCateringPrice(
    basePricePerPerson,
    additionalCharges,
    guestCount,
    comboCategoryItems
  );

  mappedService.totalPrice = cateringCalcResult.finalTotal;
};
