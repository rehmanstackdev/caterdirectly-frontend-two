// Restored backup from git commit 86564b4
// Source: src/pages/super-admin/AdminBookingFlow.tsx

                <BookingActions
                  isGroupOrder={isGroupOrder}
                  onSubmit={async (e) => {
                    e.preventDefault();

                    // Validate minimum guests and minimum order amount for catering services
                    const guestCount = formData?.headcount || 1;
                    for (const service of selectedServices) {
                      const serviceType = (service.serviceType || service.type || "").toLowerCase();
                      if (serviceType === "catering") {
                        const details = service.service_details || {};
                        const cateringObj = details.catering || {};
                        const serviceName = service.serviceName || service.name || "Catering service";

                        // Get minimumGuests from service_details.catering.minimumGuests
                        const minimumGuests = Number(cateringObj.minimumGuests) || 0;

                        // Validate minimum guests
                        if (minimumGuests > 0 && guestCount < minimumGuests) {
                          toast.error(`Minimum guests not met`, {
                            description: `${serviceName} requires at least ${minimumGuests} guests. You entered ${guestCount} guests.`,
                            duration: 5000
                          });
                          return;
                        }

                        // Get minimumOrderAmount from service_details.catering.minimumOrderAmount
                        const minimumOrderAmount = Number(cateringObj.minimumOrderAmount) || 0;

                        // Calculate service total for validation
                        if (minimumOrderAmount > 0 && details) {
                          const { baseItems, additionalChargeItems, comboCategoryItems } = extractCateringItems(
                            selectedItems,
                            details
                          );

                          const basePricePerPerson = baseItems.reduce((sum, item) => {
                            return sum + (item.price * item.quantity);
                          }, 0);

                          const additionalCharges = additionalChargeItems.map(item => ({
                            name: item.name,
                            quantity: item.quantity,
                            unitPrice: item.price,
                            additionalCharge: item.additionalCharge,
                            isMenuItem: item.isMenuItem
                          }));

                          const cateringCalcResult = calculateCateringPrice(
                            basePricePerPerson,
                            additionalCharges,
                            guestCount,
                            comboCategoryItems
                          );

                          const serviceTotal = cateringCalcResult.finalTotal;

                          console.log('[AdminBookingFlow] Minimum order amount validation:', {
                            serviceName,
                            serviceTotal,
                            minimumOrderAmount,
                            guestCount,
                            minimumGuests
                          });

                          // Validate minimum order amount
                          if (serviceTotal < minimumOrderAmount) {
                            toast.error(`Minimum order amount not met`, {
                              description: `${serviceName} requires a minimum order of $${minimumOrderAmount.toFixed(2)}. Your current total is $${serviceTotal.toFixed(2)}.`,
                              duration: 5000
                            });
                            return;
                          }
                        }
                      }
                    }

                    setIsSubmitting(true);

                    try {
                      // Helper function to map services with their items
                      const mapServiceWithItems = (service: any, index: number) => {
                        const serviceId = service.id || service.serviceId || "";
                        const serviceType = (
                          service.serviceType ||
                          service.type ||
                          ""
                        ).toLowerCase();
                        const details = service.service_details || {};
                        
                        // Get delivery fee for this service
                        const deliveryFee = serviceDeliveryFees[serviceId] || null;

                        // Handle venues service type - simple structure with price, quantity, totalPrice, priceType
                        if (serviceType === "venues" || serviceType === "venue") {
                          // Get quantity - always ensure it's at least 1
                          const quantity = service.quantity || 
                                        service.serviceQuantity || 
                                        (service as any).qty || 
                                        1;
                          
                          // Get base price - try multiple sources
                          let price = parseFloat(String(service.servicePrice || service.price || "0"));
                          
                          // If price is 0 or not found, try to derive from totalPrice
                          if (price === 0 || isNaN(price)) {
                            const existingTotalPrice = parseFloat(String(service.totalPrice || service.serviceTotalPrice || "0"));
                            if (existingTotalPrice > 0 && quantity > 0) {
                              price = existingTotalPrice / quantity;
                            }
                          }
                          
                          // Extract image from venue service (try multiple possible fields)
                          const venueImage = service.image || 
                                            service.serviceImage || 
                                            service.vendorImage || 
                                            service.coverImage ||
                                            service.imageUrl ||
                                            service.image_url ||
                                            details?.image ||
                                            details?.serviceImage ||
                                            details?.venueImage ||
                                            "";
                          
                          // Always include price and quantity, even if quantity is 1
                          return {
                            serviceType: "venues",
                            serviceName: service.serviceName || service.name || "",
                            vendorId: service.vendor_id || service.vendorId || "",
                            price: price,
                            quantity: quantity,
                            totalPrice: price * quantity,
                            priceType: service.priceType || service.price_type || "flat",
                            image: venueImage,
                          };
                        }

                        // For non-catering services (venues, party_rentals, events_staff), skip item processing
                        // They should only send price, quantity, and totalPrice at service level
                        if (
                          serviceType === "party-rental" ||
                          serviceType === "party-rentals" ||
                          serviceType === "party_rentals" ||
                          serviceType === "staff" ||
                          serviceType === "events_staff"
                        ) {
                          // Normalize service type
                          let normalizedServiceType = serviceType;
                          if (serviceType === "party-rental" || serviceType === "party-rentals" || serviceType === "party_rentals") {
                            normalizedServiceType = "party_rentals";
                          } else if (serviceType === "staff" || serviceType === "events_staff") {
                            normalizedServiceType = "events_staff";
                          }

                          // Get quantity - always ensure it's at least 1
                          let quantity = service.quantity || 
                                       service.serviceQuantity || 
                                       (service as any).qty || 
                                       1;
                          
                          // Get base price - try multiple sources
                          let basePrice = parseFloat(String(service.servicePrice || service.price || "0"));
                          
                          // Get existing totalPrice if available
                          const existingTotalPrice = parseFloat(String(service.totalPrice || service.serviceTotalPrice || service.total || "0"));
                          
                          // If basePrice is 0 or not found, try to derive from totalPrice
                          if ((basePrice === 0 || isNaN(basePrice)) && existingTotalPrice > 0) {
                            // If we have totalPrice but no basePrice, derive basePrice from totalPrice / quantity
                            if (quantity > 0) {
                              basePrice = existingTotalPrice / quantity;
                            } else {
                              // If quantity is also missing, assume quantity is 1 and use totalPrice as basePrice
                              quantity = 1;
                              basePrice = existingTotalPrice;
                            }
                          }
                          
                          // If we still don't have a valid basePrice, ensure we have at least 0
                          if (isNaN(basePrice) || basePrice < 0) {
                            basePrice = 0;
                          }
                          
                          // Ensure quantity is at least 1
                          if (!quantity || quantity < 1) {
                            quantity = 1;
                          }
                          
                          // Calculate totalPrice (use existing if we derived price from it, otherwise calculate)
                          const totalPrice = existingTotalPrice > 0 && basePrice === existingTotalPrice 
                            ? existingTotalPrice 
                            : basePrice * quantity;

                          // Extract image from service
                          const serviceImage = service.image || 
                                            service.serviceImage || 
                                            service.vendorImage || 
                                            service.coverImage ||
                                            service.imageUrl ||
                                            service.image_url ||
                                            (service.service_details?.image) ||
                                            (service.service_details?.serviceImage) ||
                                            "";

                          // Always include price and quantity, even if quantity is 1
                          // Ensure price and quantity are always numbers (not undefined/null)
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
                        }

                        // Only catering services process items
                        // Get all available items for this service
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
                          // Add combo items if they exist
                          if (
                            details.catering?.combos &&
                            Array.isArray(details.catering.combos)
                          ) {
                            availableItems = [
                              ...availableItems,
                              ...details.catering.combos,
                            ];
                          }
                        } else if (
                          serviceType === "party-rental" ||
                          serviceType === "party-rentals"
                        ) {
                          availableItems =
                            details.rentalItems ||
                            details.rental?.items ||
                            details.rental_items ||
                            details.items ||
                            [];
                        } else if (
                          serviceType === "staff" ||
                          serviceType === "events_staff"
                        ) {
                          availableItems =
                            details.staffServices ||
                            details.services ||
                            details.staff?.services ||
                            [];
                        }

                        // Filter selectedItems that belong to this service
                        const serviceItems: any[] = [];
                        Object.entries(selectedItems).forEach(
                          ([itemId, quantity]) => {
                            // Ensure quantity is a valid number, default to 1 if missing
                            const validQuantity = quantity && typeof quantity === 'number' ? quantity : (quantity || 1);
                            // Skip items with zero or negative quantity (but allow 1 and above)
                            if (!validQuantity || validQuantity < 1) {
                              return;
                            }

                            // Check if this is a combo category item (format: comboId_categoryId_itemId)
                            if (itemId.includes('_') && itemId.split('_').length >= 3) {
                              const parts = itemId.split('_');
                              const comboId = parts[0];
                              const categoryId = parts[1];
                              const actualItemId = parts[2];
                              
                              // Find the combo and category to get the actual item details
                              let categoryItem = null;
                              let categoryName = "Category";
                              
                              // Look for the combo in available items
                              const combo = availableItems.find(item => 
                                (item.id === comboId || item.itemId === comboId) && 
                                (item.comboCategories || item.isCombo)
                              );
                              
                              if (combo && combo.comboCategories) {
                                const category = combo.comboCategories.find((cat: any) => 
                                  cat.id === categoryId || cat.categoryId === categoryId
                                );
                                
                                if (category) {
                                  categoryName = category.name || category.categoryName || "Category";
                                  
                                  if (category.items) {
                                    categoryItem = category.items.find((item: any) => 
                                      item.id === actualItemId || item.itemId === actualItemId
                                    );
                                  }
                                }
                              }
                              
                              // Get item details or use fallback
                              const itemName = categoryItem?.name || categoryItem?.itemName || actualItemId;
                              const itemPrice = parseFloat(String(categoryItem?.price || 0));
                              const upchargePrice = parseFloat(String(categoryItem?.additionalCharge || categoryItem?.upcharge || 0));
                              const isUuidLikeId = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(actualItemId);

                              // Skip dummy/placeholder combo category entries (UUID id, no matched item, zero price)
                              if (!categoryItem && isUuidLikeId && itemPrice <= 0) {
                                return;
                              }
                              
                              // Extract image from category item
                              const itemImage = categoryItem?.image || 
                                              categoryItem?.imageUrl || 
                                              categoryItem?.itemImage || 
                                              categoryItem?.image_url ||
                                              categoryItem?.photo ||
                                              categoryItem?.picture ||
                                              "";
                              
                              // Add combo category item with proper details
                              if (serviceType === "catering") {
                                serviceItems.push({
                                  menuName: categoryName,
                                  menuItemName: itemName,
                                  price: itemPrice,
                                  quantity: validQuantity,
                                  totalPrice: itemPrice * validQuantity,
                                  cateringId: actualItemId,
                                  serviceId: serviceId,
                                  isComboCategoryItem: true,
                                  comboId: comboId,
                                  image: itemImage,
                                  premiumCharge: upchargePrice
                                });
                              }
                              return;
                            }

                            // Check if this item belongs to this service
                            // Try multiple matching strategies similar to SelectedItemsBreakdown
                            let item = availableItems.find(
                              (item: any) =>
                                item.id === itemId ||
                                item.itemId === itemId ||
                                item.name === itemId ||
                                item.title === itemId ||
                                `${serviceId}_${item.id}` === itemId ||
                                `${serviceId}_${item.itemId}` === itemId
                            );

                            // If not found and serviceId prefix is used, try stripping the prefix
                            if (!item && serviceId && itemId.startsWith(serviceId + '_')) {
                              const actualId = itemId.slice((serviceId + '_').length);
                              item = availableItems.find((it: any) =>
                                it.id === actualId ||
                                it.itemId === actualId ||
                                it.name === actualId ||
                                it.title === actualId
                              );
                            }

                            // Only process if item is found OR if we have a valid quantity (fallback for unmatched items)
                            if (item || validQuantity >= 1) {
                              // If item not found but has valid quantity, create a minimal item entry
                              if (!item) {
                                // For party rentals, still include the item even if not found in availableItems
                                // This handles cases where items might be added dynamically
                                if (serviceType === "party-rental" || serviceType === "party-rentals") {
                                  serviceItems.push({
                                    name: itemId,
                                    quantity: validQuantity,
                                    eachPrice: 0,
                                    totalPrice: 0,
                                    rentalId: itemId,
                                  });
                                  return; // Skip further processing for unmatched items
                                }
                                // For other service types, skip if item not found
                                return;
                              }

                              // Check if this is a combo item - if so, skip it here as it will be processed in comboSelectionsList
                              const isComboItem = item.isCombo || item.comboCategories || item.pricePerPerson !== undefined;
                              if (isComboItem && service.comboSelectionsList && Array.isArray(service.comboSelectionsList)) {
                                const isInComboSelections = service.comboSelectionsList.some(
                                  (combo: any) => combo.comboItemId === item.id || combo.comboItemId === item.itemId
                                );
                                if (isInComboSelections) {
                                  // Skip this combo item as it will be processed in comboSelectionsList
                                  return;
                                }
                              }
                              
                              // Extract price properly - check multiple possible price fields
                              // For combo items, prioritize pricePerPerson
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

                              // Skip items with zero price (unless quantity is valid)
                              if (itemPrice === 0 && validQuantity > 0) {
                                // Still include if quantity > 0, as price might be 0 intentionally
                                // But ensure we're using the actual price from item data
                              }

                              if (serviceType === "catering") {
                                const resolvedItemName =
                                  item.name ||
                                  item.menuItemName ||
                                  item.itemName ||
                                  item.title ||
                                  "";
                                const isUuidLikeId = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(itemId);

                                // Skip dummy/placeholder selected items (UUID id, no display name, zero price)
                                if (!resolvedItemName && isUuidLikeId && itemPrice <= 0) {
                                  return;
                                }

                                // Extract image from item
                                const itemImage = item.image || 
                                                item.imageUrl || 
                                                item.itemImage || 
                                                item.image_url ||
                                                item.photo ||
                                                item.picture ||
                                                item.menuItemImage ||
                                                "";
                                
                                serviceItems.push({
                                  menuName:
                                    item.menuName ||
                                    item.category ||
                                    item.menu?.name ||
                                    service.serviceName ||
                                    service.name ||
                                    "Menu",
                                  menuItemName:
                                    resolvedItemName ||
                                    itemId,
                                  price: itemPrice,
                                  quantity: validQuantity,
                                  totalPrice: itemPrice * validQuantity,
                                  cateringId: item.id || item.cateringId || itemId,
                                  serviceId: serviceId,
                                  image: itemImage,
                                });
                              }
                              // Note: party-rental and events_staff are now handled earlier and return early
                            }
                          }
                        );

                        // Also include combo selections if they exist
                        if (serviceType === "catering" && service.comboSelectionsList && Array.isArray(service.comboSelectionsList)) {
                          // Get combo items from multiple possible locations
                          const comboItemsFromDetails = details.catering?.combos || [];
                          // availableItems already includes combos, so check there too
                          
                          service.comboSelectionsList.forEach((combo: any) => {
                            if (combo) {
                              const comboItemId = combo.comboItemId;
                              
                              // Find the original combo item from multiple sources
                              // First check availableItems (which already includes combos)
                              let originalComboItem = availableItems.find(
                                (item: any) =>
                                  (item.id === comboItemId ||
                                  item.itemId === comboItemId ||
                                  item.comboItemId === comboItemId) &&
                                  (item.isCombo || item.comboCategories || item.pricePerPerson !== undefined)
                              );
                              
                              // If not found, check comboItemsFromDetails
                              if (!originalComboItem) {
                                originalComboItem = comboItemsFromDetails.find(
                                  (item: any) =>
                                    item.id === comboItemId ||
                                    item.itemId === comboItemId ||
                                    item.comboItemId === comboItemId
                                );
                              }
                              
                              // Get base price per person from the original combo item
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

                              // Calculate protein quantity for base combo price (NOT guest count)
                              const finalComboItemId = comboItemId || originalComboItem?.id;

                              // PRIORITY: Protein quantity determines base combo price
                              // Guest count (headcount) only used for sides/toppings upcharges
                              let proteinQuantity = 0;

                              if (combo.selections && Array.isArray(combo.selections)) {
                                combo.selections.forEach((category: any) => {
                                  // Check if this is a protein category
                                  const isProtein = category.categoryName && (
                                    category.categoryName.toLowerCase().includes('protein') ||
                                    category.categoryName.toLowerCase().includes('meat') ||
                                    category.categoryName.toLowerCase().includes('main')
                                  );

                                  if (isProtein && category.selectedItems && Array.isArray(category.selectedItems)) {
                                    category.selectedItems.forEach((item: any) => {
                                      proteinQuantity += item.quantity || 0;
                                    });
                                  }
                                });
                              }

                              // Only include combo when there is actual user selection.
                              // Prevent auto-adding combos with implicit default quantity.
                              const directQuantity = selectedItems[finalComboItemId];
                              const prefixedQuantity = selectedItems[`${serviceId}_${finalComboItemId}`];
                              const hasSelectedCategoryItems =
                                Array.isArray(combo.selections) &&
                                combo.selections.some(
                                  (category: any) =>
                                    Array.isArray(category.selectedItems) &&
                                    category.selectedItems.some((item: any) => (item.quantity || 0) > 0)
                                );

                              if (proteinQuantity === 0) {
                                proteinQuantity = directQuantity || prefixedQuantity || 0;
                              }

                              // Skip combo entirely when nothing was explicitly selected
                              if (!hasSelectedCategoryItems && proteinQuantity <= 0) {
                                return;
                              }

                              // If selected but protein quantity is unavailable, keep safe minimum of 1
                              const effectiveProteinQuantity = proteinQuantity > 0 ? proteinQuantity : 1;

                              // Get guest count for sides/toppings upcharges
                              const guestCount = parseInt(String(formData?.headcount || '1')) || 1;

                              // CORRECT COMBO PRICING FORMULA:
                              // Base Combo Price = Base Price × Protein Quantity (NOT guest count)
                              // Sides/Toppings Upcharges = Upcharge × Guest Count

                              // Calculate base total: Base Price × Protein Quantity
                              const baseTotal = basePrice * effectiveProteinQuantity;

                              // Calculate premium upcharges from selected items (multiply by guest count)
                              let totalUpcharges = 0;

                              if (combo.selections && Array.isArray(combo.selections)) {
                                combo.selections.forEach((category: any) => {
                                  if (category.selectedItems && Array.isArray(category.selectedItems)) {
                                    category.selectedItems.forEach((categoryItem: any) => {
                                      // Get the upcharge price for this item (could be 0 for base options)
                                      const upchargePrice = parseFloat(String(categoryItem.upcharge || 0));

                                      // Add upcharge × guestCount (for sides/toppings)
                                      if (upchargePrice > 0) {
                                        totalUpcharges += upchargePrice * guestCount;
                                      }
                                    });
                                  }
                                });
                              }

                              // Final combo total = base total + total upcharges
                              const comboTotal = baseTotal + totalUpcharges;

                              // Quantity for display = protein quantity (what was actually ordered)
                              const comboQuantity = effectiveProteinQuantity;

                              // Debug logging (only in development)
                              if (import.meta.env.DEV) {
                                console.log('[AdminBookingFlow] Combo pricing calculation:', {
                                  comboName: combo.comboName,
                                  comboItemId: comboItemId,
                                  basePrice: basePrice,
                                  proteinQuantity: proteinQuantity,
                                  effectiveProteinQuantity: effectiveProteinQuantity,
                                  guestCount: guestCount,
                                  baseTotal: baseTotal,
                                  totalUpcharges: totalUpcharges,
                                  comboTotal: comboTotal,
                                  formula: `(${basePrice} × ${effectiveProteinQuantity} proteins) + (${totalUpcharges / guestCount} upcharge × ${guestCount} guests) = ${comboTotal}`
                                });
                              }

                              // Extract image from combo item
                              const comboImage = originalComboItem?.image ||
                                              originalComboItem?.imageUrl ||
                                              originalComboItem?.itemImage ||
                                              originalComboItem?.image_url ||
                                              originalComboItem?.photo ||
                                              originalComboItem?.picture ||
                                              combo?.image ||
                                              combo?.imageUrl ||
                                              "";

                              // Send the combo as a single item with calculated total
                              // Quantity = protein quantity (what was actually ordered)
                              // Price = base price per combo
                              const pricePerCombo = comboTotal / comboQuantity;

                              serviceItems.push({
                                menuName: combo.comboName || originalComboItem?.category || "Combo Items",
                                menuItemName: combo.comboName || originalComboItem?.name || "",
                                price: pricePerCombo,
                                quantity: comboQuantity,
                                totalPrice: comboTotal,
                                cateringId: finalComboItemId || combo.comboItemId || originalComboItem?.id || "",
                                serviceId: serviceId,
                                image: comboImage,
                              });

                              // Add combo category items with additional fields for itemized breakdown
                              if (combo.selections && Array.isArray(combo.selections)) {
                                combo.selections.forEach((category: any) => {
                                  if (category.selectedItems && Array.isArray(category.selectedItems)) {
                                    category.selectedItems.forEach((categoryItem: any) => {
                                      // Get upcharge (additional charge) and total price
                                      const upchargePrice = parseFloat(String(categoryItem.additionalCharge || categoryItem.upcharge || 0));
                                      const totalPrice = parseFloat(String(categoryItem.price || 0));

                                      // Extract image from category item
                                      const categoryItemImage = categoryItem?.image ||
                                                              categoryItem?.imageUrl ||
                                                              categoryItem?.itemImage ||
                                                              categoryItem?.image_url ||
                                                              categoryItem?.photo ||
                                                              categoryItem?.picture ||
                                                              "";

                                      // Use the selected quantity for all items (no guest count multiplication)
                                      const itemQuantity = categoryItem.quantity || 1;
                                      const itemTotalPrice = totalPrice * itemQuantity;

                                      serviceItems.push({
                                        menuName: category.categoryName || "Category",
                                        menuItemName: categoryItem.name || categoryItem.itemName || categoryItem.id || "",
                                        price: totalPrice,
                                        quantity: itemQuantity,
                                        totalPrice: itemTotalPrice,
                                        cateringId: categoryItem.id || categoryItem.itemId || "",
                                        serviceId: serviceId,
                                        isComboCategoryItem: true,
                                        comboId: finalComboItemId || combo.comboItemId || originalComboItem?.id || "",
                                        image: categoryItemImage,
                                        premiumCharge: upchargePrice
                                      });
                                    });
                                  }
                                });
                              }
                            }
                          });
                        }

                        // Calculate total price from all service items
                        const calculatedTotalPrice = serviceItems.reduce((sum, item) => {
                          const itemTotal = parseFloat(String(item.totalPrice || 0));
                          return sum + (isNaN(itemTotal) ? 0 : itemTotal);
                        }, 0);

                        // Normalize service type
                        let normalizedServiceType = serviceType;
                        if (serviceType === "party-rental" || serviceType === "party-rentals") {
                          normalizedServiceType = "party_rentals";
                        } else if (serviceType === "staff" || serviceType === "events_staff") {
                          normalizedServiceType = "events_staff";
                        } else if (serviceType === "venues" || serviceType === "venue") {
                          normalizedServiceType = "venues";
                        }

                        // Build service object
                        // Try to get quantity from multiple possible fields
                        const quantity = service.quantity || 
                                        service.serviceQuantity || 
                                        (service as any).qty || 
                                        1;
                        const basePrice = parseFloat(String(service.servicePrice || service.price || "0"));
                        
                        // For catering services, DO NOT include base service price - only use items total
                        // For other services, use items total if available, otherwise use base price
                        let calculatedTotal;
                        if (normalizedServiceType === "catering") {
                          // For catering services, only use items total (base price is excluded)
                          calculatedTotal = calculatedTotalPrice;
                        } else {
                          // Use items total if available, otherwise use base price
                          calculatedTotal = calculatedTotalPrice > 0 
                            ? calculatedTotalPrice 
                            : basePrice * quantity;
                        }

                        // Extract image from service (try multiple possible fields)
                        const serviceImage = service.image || 
                                            service.serviceImage || 
                                            service.vendorImage || 
                                            service.coverImage ||
                                            service.imageUrl ||
                                            service.image_url ||
                                            (service.service_details?.image) ||
                                            (service.service_details?.serviceImage) ||
                                            "";

                        const mappedService: any = {
                          serviceType: normalizedServiceType,
                          serviceName: service.serviceName || service.name || "",
                          vendorId: service.vendor_id || service.vendorId || "",
                          totalPrice: calculatedTotal,
                          priceType: service.priceType || service.price_type || "flat",
                          image: serviceImage,
                        };

                        // Add items based on service type
                        // Only catering services should include arrays
                        if (normalizedServiceType === "catering") {
                          mappedService.cateringItems = serviceItems;

                          // Add delivery fee only for catering services (as a number)
                          if (deliveryFee && deliveryFee.fee > 0) {
                            mappedService.deliveryFee = deliveryFee.fee;
                          }

                          // Add delivery ranges for catering services
                          const deliveryOptions = service.service_details?.deliveryOptions ||
                                                 service.service_details?.catering?.deliveryOptions;

                          // Try to get deliveryRanges from multiple possible locations
                          let deliveryRanges = deliveryOptions?.deliveryRanges ||
                                              service.service_details?.deliveryRanges ||
                                              service.service_details?.catering?.deliveryRanges ||
                                              service.deliveryRanges;

                          // Convert deliveryRanges array to Record<string, number> format for backend
                          if (deliveryRanges && Array.isArray(deliveryRanges) && deliveryRanges.length > 0) {
                            const deliveryRangesRecord: Record<string, number> = {};
                            deliveryRanges.forEach((range: any) => {
                              if (range.range && typeof range.fee === 'number') {
                                deliveryRangesRecord[range.range] = range.fee;
                              }
                            });
                            if (Object.keys(deliveryRangesRecord).length > 0) {
                              mappedService.deliveryRanges = deliveryRangesRecord;
                            }
                          } else if (deliveryRanges && typeof deliveryRanges === 'object' && !Array.isArray(deliveryRanges)) {
                            // If it's already in Record format, use it directly
                            mappedService.deliveryRanges = deliveryRanges;
                          }

                          if (import.meta.env.DEV) {
                            console.log('[AdminBookingFlow] Delivery ranges for service:', {
                              serviceName: service.serviceName || service.name,
                              deliveryOptions,
                              deliveryRangesSource: deliveryRanges,
                              mappedDeliveryRanges: mappedService.deliveryRanges,
                              isArray: Array.isArray(deliveryRanges),
                              isRecord: typeof deliveryRanges === 'object' && !Array.isArray(deliveryRanges)
                            });
                          }

                          // Calculate catering service total using the same logic as EnhancedOrderSummaryCard
                          // and update totalPrice to match the Service Total shown in the UI
                          if (service.service_details) {
                            const { baseItems, additionalChargeItems, comboCategoryItems } = extractCateringItems(
                              selectedItems,
                              service.service_details
                            );

                            // Calculate base price per person (sum of all base items)
                            const basePricePerPerson = baseItems.reduce((sum, item) => {
                              return sum + (item.price * item.quantity);
                            }, 0);

                            // Prepare additional charges for calculation
                            const additionalCharges = additionalChargeItems.map(item => ({
                              name: item.name,
                              quantity: item.quantity,
                              unitPrice: item.price,
                              additionalCharge: item.additionalCharge,
                              isMenuItem: item.isMenuItem
                            }));

                            const guestCount = parseInt(String(formData?.headcount || '1')) || 1;

                            const cateringCalcResult = calculateCateringPrice(
                              basePricePerPerson,
                              additionalCharges,
                              guestCount,
                              comboCategoryItems
                            );

                            // Update totalPrice to use the calculated catering service total
                            mappedService.totalPrice = cateringCalcResult.finalTotal;

                            if (import.meta.env.DEV) {
                              console.log('[AdminBookingFlow] Catering service total calculation:', {
                                serviceName: service.serviceName || service.name,
                                basePricePerPerson,
                                guestCount,
                                basePriceTotal: cateringCalcResult.basePriceTotal,
                                additionalChargesTotal: cateringCalcResult.additionalChargesTotal,
                                totalPrice: cateringCalcResult.finalTotal
                              });
                            }
                          }
                        }
                        // Note: Non-catering services (venues, party_rentals, events_staff)
                        // are handled earlier and return early with price, quantity, totalPrice only

                        return mappedService;
                      };

                      // Try multiple possible company name fields
                      // Check both 'company' (regular booking) and 'clientCompany' (invoice mode)
                      const companyName = (formData as any)?.company ||
                                         formData?.clientCompany ||
                                         (formData as any)?.companyName ||
                                         (formData as any)?.organizationName ||
                                         '';

                      // Debug logging
                      console.log('?? [AdminBookingFlow] Company name fields:', {
                        company: (formData as any)?.company,
                        clientCompany: formData?.clientCompany,
                        companyName: (formData as any)?.companyName,
                        organizationName: (formData as any)?.organizationName,
                        finalCompanyName: companyName
                      });
                      
                      // Build base invoice data
                      const baseInvoiceData: any = {
                        eventName: formData?.orderName || "Booking Event",
                        companyName: companyName,
                        eventLocation: formData?.location || "",
                        eventDate: formData?.date || "",
                        serviceTime: formData?.deliveryWindow || "",
                        guestCount: formData?.headcount || 1,
                        contactName: formData?.primaryContactName || "",
                        phoneNumber: formData?.primaryContactPhone || "",
                        emailAddress: formData?.primaryContactEmail || "",
                        additionalNotes: adminNotes || "",
                        services: selectedServices.map((service, index) => mapServiceWithItems(service, index)),
                      };

                      // Conditionally add fields based on isGroupOrder
                      let invoiceData: any;
                      if (isGroupOrder) {
                        // Group Order payload (second payload structure)
                        invoiceData = {
                          ...baseInvoiceData,
                          budgetPerPerson:
                            (formData as any)?.budgetPerPerson || 0,
                          budget: (formData as any)?.budget || 0,
                          selectItem:
                            (formData as any)?.selectItem ||
                            selectedServices[0]?.serviceName ||
                            selectedServices[0]?.name ||
                            "catering",
                          quantity:
                            (formData as any)?.quantity ||
                            formData?.headcount ||
                            1,
                          orderDeadline:
                            (formData as any)?.orderDeadline ||
                            formData?.date ||
                            "",
                          inviteFriends: (formData as any)?.inviteFriends || [],
                          paymentSettings:
                            (formData as any)?.paymentSettings ||
                            "host_pays_everything",
                        };
                      } else {
                        // Regular booking payload (first payload structure)
                        invoiceData = {
                          ...baseInvoiceData,
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
                      }

                     //  console.log(JSON.stringify(invoiceData))

                      const response = await invoiceService.createInvoice(invoiceData);
                      const invoiceId = response?.data?.invoice?.id || response?.data?.id;
                      clearCart(true);
                      setServiceDeliveryFees({}); // Clear delivery fees on successful submission
                      // Clear from localStorage
                      try {
                        localStorage.removeItem('serviceDeliveryFees');
                        localStorage.removeItem('eventLocationData');
                      } catch (error) {
                        console.warn('[AdminBookingFlow] Failed to clear localStorage:', error);
                      }
                      toast.success(
                        "Invoice created successfully"
                      );
                      if (invoiceId) {
                        navigate(`/admin/order-summary/${invoiceId}`);
                      }
                    } catch (error) {
                      console.error("Invoice creation failed:", error);
                      toast.error("Failed to create invoice");
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  isInvoiceMode={isInvoiceMode}
                  isLoading={isSubmitting}
                />
              </div>
