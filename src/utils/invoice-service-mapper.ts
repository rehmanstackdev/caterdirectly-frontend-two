/**
 * Invoice Service Mapper Utility
 * Professional service mapping for invoice creation
 */

export const mapVenueService = (service: any) => {
  const quantity = service.quantity || service.serviceQuantity || (service as any).qty || 1;
  let price = parseFloat(String(service.servicePrice || service.price || "0"));

  if (price === 0 || isNaN(price)) {
    const existingTotalPrice = parseFloat(
      String(service.totalPrice || service.serviceTotalPrice || "0")
    );
    if (existingTotalPrice > 0 && quantity > 0) {
      price = existingTotalPrice / quantity;
    }
  }

  const details = service.service_details || {};
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

  return {
    serviceType: "venues",
    serviceName: service.serviceName || service.name || "",
    vendorId: service.vendor_id || service.vendorId || "",
    price,
    quantity,
    totalPrice: price * quantity,
    priceType: service.priceType || service.price_type || "flat",
    image: venueImage,
  };
};

export const mapPartyRentalOrStaffService = (service: any, serviceType: string) => {
  let normalizedServiceType = serviceType;
  if (
    serviceType === "party-rental" ||
    serviceType === "party-rentals" ||
    serviceType === "party_rentals"
  ) {
    normalizedServiceType = "party_rentals";
  } else if (serviceType === "staff" || serviceType === "events_staff") {
    normalizedServiceType = "events_staff";
  }

  let quantity = service.quantity || service.serviceQuantity || (service as any).qty || 1;
  let basePrice = parseFloat(String(service.servicePrice || service.price || "0"));

  const existingTotalPrice = parseFloat(
    String(service.totalPrice || service.serviceTotalPrice || service.total || "0")
  );

  if ((basePrice === 0 || isNaN(basePrice)) && existingTotalPrice > 0) {
    if (quantity > 0) {
      basePrice = existingTotalPrice / quantity;
    } else {
      quantity = 1;
      basePrice = existingTotalPrice;
    }
  }

  if (isNaN(basePrice) || basePrice < 0) basePrice = 0;
  if (!quantity || quantity < 1) quantity = 1;

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
  const finalTotalPrice = isNaN(totalPrice) ? finalPrice * finalQuantity : totalPrice;

  return {
    serviceType: normalizedServiceType,
    serviceName: service.serviceName || service.name || "",
    vendorId: service.vendor_id || service.vendorId || "",
    price: finalPrice,
    quantity: finalQuantity,
    totalPrice: finalTotalPrice,
    priceType: service.priceType || service.price_type || "flat",
    image: serviceImage,
  };
};

export const getCompanyName = (formData: any): string => {
  return (
    (formData as any)?.company ||
    formData?.clientCompany ||
    (formData as any)?.companyName ||
    (formData as any)?.organizationName ||
    ""
  );
};

export const createBaseInvoiceData = (
  formData: any,
  adminNotes: string,
  mappedServices: any[]
) => {
  return {
    eventName: formData?.orderName || "Booking Event",
    companyName: getCompanyName(formData),
    eventLocation: formData?.location || "",
    eventDate: formData?.date || "",
    serviceTime: formData?.deliveryWindow || "",
    guestCount: formData?.headcount || 1,
    contactName: formData?.primaryContactName || "",
    phoneNumber: formData?.primaryContactPhone || "",
    emailAddress: formData?.primaryContactEmail || "",
    additionalNotes: adminNotes || "",
    services: mappedServices,
  };
};

export const createGroupOrderInvoiceData = (
  baseData: any,
  formData: any,
  selectedServices: any[]
) => {
  return {
    ...baseData,
    budgetPerPerson: (formData as any)?.budgetPerPerson || 0,
    budget: (formData as any)?.budget || 0,
    selectItem:
      (formData as any)?.selectItem ||
      selectedServices[0]?.serviceName ||
      selectedServices[0]?.name ||
      "catering",
    quantity: (formData as any)?.quantity || formData?.headcount || 1,
    orderDeadline: (formData as any)?.orderDeadline || formData?.date || "",
    inviteFriends: (formData as any)?.inviteFriends || [],
    paymentSettings: (formData as any)?.paymentSettings || "host_pays_everything",
  };
};

export const createStandardInvoiceData = (
  baseData: any,
  formData: any,
  isTaxExempt: boolean,
  isServiceFeeWaived: boolean,
  customAdjustments: any[]
) => {
  return {
    ...baseData,
    addBackupContact: formData?.hasBackupContact || false,
    taxExemptStatus: isTaxExempt,
    waiveServiceFee: isServiceFeeWaived,
    customLineItems: customAdjustments.map((adj) => ({
      label: adj.label || "",
      type: adj.type || "fixed",
      mode: adj.mode || "surcharge",
      value: adj.value || 0,
      taxable: adj.taxable || false,
      statusForDrafting: (adj as any).statusForDrafting || false,
    })),
  };
};
