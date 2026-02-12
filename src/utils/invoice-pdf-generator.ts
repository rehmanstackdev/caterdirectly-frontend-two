import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Invoice } from '@/types/invoice-types';
import { APP_LOGO } from '@/constants/app-assets';
import { getTaxRateByLocation } from './tax-calculation';

declare module 'jspdf' {
    interface jsPDF {
        autoTable: (options: any) => jsPDF;
    }
}

// Brand Colors
const BRAND_ORANGE = [240, 119, 18] as [number, number, number]; // #F07712
const PRIMARY_DARK = [15, 23, 42] as [number, number, number];   // Slate 900
const TEXT_GRAY = [100, 116, 139] as [number, number, number];   // Slate 500
const BORDER_GRAY = [226, 232, 240] as [number, number, number]; // Slate 200

const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = url;
        img.onload = () => resolve(img);
        img.onerror = reject;
    });
};

// Helper to normalize items from different service arrays
// Using same calculation logic as OrderItemsBreakdown.tsx and catering-price-calculation.ts
const getServiceItems = (service: any, guestCount: number = 1) => {
    const items: any[] = [];
    const serviceType = service.serviceType || '';

    // For catering services, use the same calculation as OrderItemsBreakdown
    if (serviceType === 'catering') {
        // Get menu items from multiple possible locations (like OrderItemsBreakdown does)
        const apiCateringItems = service.cateringItems ||
                                 service.service_details?.menuItems ||
                                 service.service_details?.catering?.menuItems ||
                                 [];

        // Get combo category items from multiple possible locations
        const apiComboCategoryItems = service.comboCategoryItems ||
                                      service.service_details?.comboCategoryItems ||
                                      [];

        // 1. Menu items (cateringItems) - price × quantity ONLY (NO guest count)
        if (Array.isArray(apiCateringItems)) {
            apiCateringItems.forEach((item: any) => {
                const price = Number(item.price || item.pricePerPerson) || 0;
                const quantity = Number(item.quantity) || 1;
                // Menu items: price × quantity (guest count NOT involved)
                const total = price * quantity;

                items.push({
                    name: item.menuItemName || item.name || 'Menu Item',
                    description: item.menuName || 'Menu Item',
                    quantity: quantity,
                    price: price,
                    total: total,
                    isCatering: true,
                    isMenuItem: true
                });
            });
        }

        // 2. Combo Category Items - simple items and premium items
        if (Array.isArray(apiComboCategoryItems)) {
            apiComboCategoryItems.forEach((comboItem: any) => {
                const itemName = comboItem.menuItemName || comboItem.name || '';
                const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(itemName);

                if (!isUUID && itemName.trim() !== '') {
                    const quantity = Number(comboItem.quantity) || 1;
                    const price = Number(comboItem.price) || 0;
                    // Check both premiumCharge and additionalCharge
                    const premiumCharge = Number(comboItem.premiumCharge || comboItem.additionalCharge) || 0;

                    // Calculate totals matching OrderItemsBreakdown.tsx logic
                    let total = 0;
                    let displayQuantity = quantity;
                    let displayPrice = 0;

                    if (premiumCharge > 0) {
                        // Premium item: unit price = price + premiumCharge
                        displayPrice = price + premiumCharge;
                        total = displayPrice * quantity;
                        displayQuantity = quantity;
                    } else if (price > 0) {
                        // Simple item: price × quantity (quantity already has correct value from BookingFlow)
                        total = price * quantity;
                        displayQuantity = quantity;
                        displayPrice = price;
                    }

                    items.push({
                        name: `    • ${itemName}`,
                        description: `${comboItem.menuName || comboItem.categoryName || 'Combo Category'}${premiumCharge > 0 ? ` (+$${premiumCharge.toFixed(2)} premium)` : ''}`,
                        quantity: displayQuantity,
                        price: displayPrice,
                        total: total,
                        isComboItem: true,
                        premiumCharge: premiumCharge,
                        isSimpleItem: premiumCharge === 0 && price > 0,
                        isPremiumItem: premiumCharge > 0
                    });
                }
            });
        }

        // If no items found but service has totalPrice, use that (already calculated by backend)
        if (items.length === 0 && Number(service.totalPrice) > 0) {
            items.push({
                name: service.serviceName || service.name || 'Catering Service',
                description: 'Catering',
                quantity: guestCount,
                price: Number(service.totalPrice) / guestCount,
                total: Number(service.totalPrice),
                isCatering: true
            });
        }

        return items;
    }

    // Party Rental Items
    if (Array.isArray(service.partyRentalItems)) {
        service.partyRentalItems.forEach((item: any) => {
            items.push({
                name: item.name || 'Rental Item',
                description: 'Party Rentals',
                quantity: Number(item.quantity) || 0,
                price: Number(item.eachPrice) || 0,
                total: Number(item.totalPrice) || 0
            });
        });
    }

    // Staff Items
    if (Array.isArray(service.staffItems)) {
        service.staffItems.forEach((item: any) => {
            const hours = Number(item.hours) || 0;
            const perHourPrice = Number(item.perHourPrice) || 0;
            const quantity = Number(item.quantity) || hours || 1;
            items.push({
                name: item.name || 'Staff',
                description: item.pricingType === 'hourly' ? `Event Staff (${hours} hrs)` : 'Event Staff',
                quantity: quantity,
                price: perHourPrice || (Number(item.totalPrice) || 0) / quantity,
                total: Number(item.totalPrice) || 0
            });
        });
    }

    // Venue Items
    if (Array.isArray(service.venueItems)) {
        service.venueItems.forEach((item: any) => {
            items.push({
                name: item.venueType || 'Venue',
                description: `Venue (${item.minimumGuests}-${item.maximumGuests} guests)`,
                quantity: 1,
                price: Number(item.price) || 0,
                total: Number(item.totalPrice) || 0
            });
        });
    }

    // If no items but service has a price (e.g. flat fee venue), treat service as item
    if (items.length === 0 && Number(service.totalPrice) > 0) {
        const quantity = Number(service.quantity) || 1;
        const totalPrice = Number(service.totalPrice) || 0;
        const unitPrice = Number(service.price) || (totalPrice / quantity);
        
        items.push({
            name: service.serviceName || 'Service',
            description: service.serviceType || 'Flat Fee',
            quantity: quantity,
            price: unitPrice,
            total: totalPrice
        });
    }

    return items;
};

export const generateInvoicePDF = async (invoice: Invoice) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Load Logo
    let logoImg: HTMLImageElement | null = null;
    try {
        logoImg = await loadImage(APP_LOGO.url);
    } catch (error) {
        console.warn('Failed to load logo image for PDF', error);
    }

    // ============================================
    // PREMIUM HEADER SECTION
    // ============================================

    // Header Background (Brand Orange Gradient-ish)
    doc.setFillColor(PRIMARY_DARK[0], PRIMARY_DARK[1], PRIMARY_DARK[2]);
    doc.rect(0, 0, pageWidth, 60, 'F');

    // Add Logo if loaded
    if (logoImg) {
        const logoWidth = 40;
        const logoHeight = (logoImg.height / logoImg.width) * logoWidth;
        doc.addImage(logoImg, 'PNG', 14, 10, logoWidth, logoHeight);
    } else {
        // Fallback text if logo fails
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('CATER DIRECTLY', 14, 25);
    }

    // Invoice Title & Status
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(32);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', pageWidth - 14, 25, { align: 'right' });

    // Status Badge - Show PAID if paid, otherwise UNPAID
    const isPaid = invoice.status === 'paid' ||
                   (invoice as any).orders?.some((order: any) => order.paymentStatus === 'paid' || order.paymentStatus === 'succeeded');
    const status = isPaid ? 'PAID' : 'UNPAID';
    doc.setFontSize(10);
    doc.setTextColor(BRAND_ORANGE[0], BRAND_ORANGE[1], BRAND_ORANGE[2]); // Brand Orange Text
    doc.setFillColor(255, 255, 255); // White Background

    const statusWidth = doc.getTextWidth(status) + 10;
    doc.roundedRect(pageWidth - 14 - statusWidth, 32, statusWidth, 7, 2, 2, 'F');
    doc.text(status, pageWidth - 14 - (statusWidth / 2), 36.5, { align: 'center' });

    // Invoice Details (Right aligned, below title)
    doc.setFontSize(10);
    doc.setTextColor(200, 200, 200);
    doc.setFont('helvetica', 'normal');

    doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - 14, 53, { align: 'right' });

    // ============================================
    // CLIENT & EVENT INFO
    // ============================================

    const startY = 75;

    // Left Column: Bill To
    doc.setFontSize(10);
    doc.setTextColor(BRAND_ORANGE[0], BRAND_ORANGE[1], BRAND_ORANGE[2]); // Brand Orange
    doc.setFont('helvetica', 'bold');
    doc.text('BILL TO', 14, startY);

    doc.setTextColor(PRIMARY_DARK[0], PRIMARY_DARK[1], PRIMARY_DARK[2]); // Dark Slate
    doc.setFontSize(11);
    doc.text(invoice.contactName || 'Valued Client', 14, startY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(TEXT_GRAY[0], TEXT_GRAY[1], TEXT_GRAY[2]); // Slate 500
    doc.text(invoice.emailAddress || '', 14, startY + 11);
    doc.text(invoice.phoneNumber || '', 14, startY + 16);
    if (invoice.companyName) {
        doc.text(invoice.companyName, 14, startY + 21);
    }

    // Right Column: Event Details
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(BRAND_ORANGE[0], BRAND_ORANGE[1], BRAND_ORANGE[2]); // Brand Orange
    doc.text('EVENT DETAILS', pageWidth / 2, startY);

    doc.setTextColor(PRIMARY_DARK[0], PRIMARY_DARK[1], PRIMARY_DARK[2]); // Dark Slate
    doc.setFontSize(11);
    doc.text(invoice.eventName || 'Untitled Event', pageWidth / 2, startY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(TEXT_GRAY[0], TEXT_GRAY[1], TEXT_GRAY[2]); // Slate 500

    // Using text labels instead of icons for reliability
    doc.text(`Date: ${invoice.eventDate ? new Date(invoice.eventDate).toLocaleDateString() : 'TBD'}`, pageWidth / 2, startY + 11);
    doc.text(`Time: ${invoice.serviceTime || 'TBD'}`, pageWidth / 2, startY + 16);
    doc.text(`Guests: ${invoice.guestCount || 0}`, pageWidth / 2, startY + 21);

    // Location with wrapping
    if (invoice.eventLocation) {
        const locationLines = doc.splitTextToSize(`Location: ${invoice.eventLocation}`, (pageWidth / 2) - 14);
        doc.text(locationLines, pageWidth / 2, startY + 26);
    }

    // ============================================
    // ITEMS TABLE
    // ============================================

    // Get guest count for table calculations
    const tableGuestCount = Number(invoice.guestCount) || 1;

    const tableData = (invoice.services || []).flatMap(service => {
        const serviceType = service.serviceType || 'service';
        const serviceTypeLabel = {
            'catering': 'CATERING SERVICE',
            'party_rentals': 'PARTY RENTALS',
            'party-rentals': 'PARTY RENTALS',
            'events_staff': 'EVENT STAFF',
            'staff': 'EVENT STAFF',
            'venues': 'VENUE SERVICE',
            'venue': 'VENUE SERVICE'
        }[serviceType] || 'SERVICE';

        // Service Header Row with type
        const serviceRow = [
            {
                content: `${serviceTypeLabel} - ${(service.serviceName || service.name || 'Service').toUpperCase()}`,
                colSpan: 4,
                styles: { fillColor: [248, 250, 252], fontStyle: 'bold', textColor: PRIMARY_DARK }
            }
        ];

        // Get normalized items for this service (pass guest count for catering)
        const items = getServiceItems(service, tableGuestCount);

        // Item Rows - simplified to match OrderItemsBreakdown
        // Column order: ITEM, UNIT PRICE, QTY, TOTAL
        const itemRows = items.map(item => {
            return [
                item.name,
                `$${item.price.toFixed(2)}`,
                item.quantity.toString(),
                `$${item.total.toFixed(2)}`
            ];
        });

        return [serviceRow, ...itemRows];
    });

    // Calculate where the table starts based on content above
    const tableStartY = invoice.eventLocation ? startY + 40 : startY + 35;

    autoTable(doc, {
        startY: tableStartY,
        head: [['ITEM', 'UNIT PRICE', 'QTY', 'TOTAL']],
        body: tableData,
        theme: 'grid',
        headStyles: {
            fillColor: BRAND_ORANGE, // Brand Orange Header
            textColor: [255, 255, 255],
            fontSize: 11,
            fontStyle: 'bold',
            halign: 'left',
            cellPadding: 8
        },
        styles: {
            fontSize: 9,
            cellPadding: 6,
            lineColor: BORDER_GRAY,
            lineWidth: 0.1,
            textColor: PRIMARY_DARK
        },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 'auto' }, // ITEM - auto width for name
            1: { halign: 'right', cellWidth: 40 }, // UNIT PRICE - right aligned
            2: { halign: 'center', cellWidth: 30 }, // QTY - centered
            3: { halign: 'right', fontStyle: 'bold', cellWidth: 40 } // TOTAL - right aligned, bold
        },
        alternateRowStyles: {
            fillColor: [255, 255, 255]
        },
        margin: { top: 20, right: 14, bottom: 40, left: 14 }
    });

    // ============================================
    // TOTALS SECTION
    // ============================================

    const finalY = (doc as any).lastAutoTable.finalY + 15;

    // ✅ USE API-CALCULATED TOTALS (same as order summary page)
    // Priority: 1. pricing_snapshot (if available), 2. Sum of service.totalPrice, 3. Manual calculation
    let subtotal = 0;
    let serviceFee = 0;
    let deliveryFee = 0;
    let adjustmentsTotal = 0;
    let tax = 0;
    let taxRate = 0;
    let taxJurisdiction = 'Unknown';
    let total = 0;
    let adjustmentsBreakdown: any[] = [];
    let totalDiscounts = 0;
    let totalSurcharges = 0;

    const pricingSnapshot = (invoice as any).pricing_snapshot;
    const waiveServiceFee = (invoice as any).waiveServiceFee === true;
    const isTaxExempt = (invoice as any).taxExemptStatus === true || (invoice as any).is_tax_exempt === true;

    if (pricingSnapshot) {
        // Use pricing snapshot if available (matches order summary exactly)
        subtotal = Number(pricingSnapshot.subtotal) || 0;
        serviceFee = Number(pricingSnapshot.serviceFee) || 0;
        deliveryFee = Number(pricingSnapshot.deliveryFee) || 0;
        adjustmentsTotal = Number(pricingSnapshot.adjustmentsTotal) || 0;
        tax = Number(pricingSnapshot.tax) || 0;
        taxRate = Number(pricingSnapshot.taxRate) || 0;
        total = Number(pricingSnapshot.total) || 0;
        adjustmentsBreakdown = pricingSnapshot.adjustmentsBreakdown || [];

        // Calculate separate discounts and surcharges for display
        adjustmentsBreakdown.forEach((adj: any) => {
            if (adj.mode === 'discount') {
                totalDiscounts += adj.amount || 0;
            } else if (adj.mode === 'surcharge') {
                totalSurcharges += adj.amount || 0;
            }
        });
    } else {
        // Fallback: Calculate from service totalPrice (already calculated by backend)
        subtotal = (invoice.services || []).reduce((sum, service) => {
            return sum + (Number(service.totalPrice) || 0);
        }, 0);

        // Calculate Discounts/Surcharges from customLineItems
        (invoice.customLineItems || []).forEach(item => {
            const val = Number(item.value) || 0;
            if (item.mode === 'discount') {
                let amount = 0;
                if (item.type === 'percentage') {
                    amount = subtotal * (val / 100);
                } else {
                    amount = val;
                }
                totalDiscounts += amount;
                adjustmentsBreakdown.push({
                    label: item.label || 'Discount',
                    amount: amount,
                    mode: 'discount',
                    type: item.type
                });
            } else if (item.mode === 'surcharge') {
                let amount = 0;
                if (item.type === 'percentage') {
                    amount = subtotal * (val / 100);
                } else {
                    amount = val;
                }
                totalSurcharges += amount;
                adjustmentsBreakdown.push({
                    label: item.label || 'Surcharge',
                    amount: amount,
                    mode: 'surcharge',
                    type: item.type
                });
            }
        });

        adjustmentsTotal = totalSurcharges - totalDiscounts;

        // Service Fee - match order summary calculation (5%)
        const serviceFeeRate = waiveServiceFee ? 0 : 0.05;
        serviceFee = subtotal * serviceFeeRate;

        // Get delivery fee from invoice data (already calculated)
        deliveryFee = (invoice.services || []).reduce((sum, service) => {
            return sum + (Number(service.deliveryFee) || 0);
        }, 0);

        // Calculate tax based on event location
        if (!isTaxExempt && invoice.eventLocation) {
            const taxData = getTaxRateByLocation(invoice.eventLocation);
            taxRate = taxData.rate;
            taxJurisdiction = taxData.jurisdiction;

            // Calculate tax on taxable base (subtotal + serviceFee + deliveryFee + taxable adjustments)
            const taxableAdjustments = adjustmentsBreakdown
                .filter(adj => adj.mode === 'surcharge')
                .reduce((sum, adj) => sum + adj.amount, 0);
            const taxableBase = subtotal + serviceFee + deliveryFee + taxableAdjustments;
            tax = taxableBase * taxRate;
        }

        // Calculate final total including tax
        total = subtotal + serviceFee + deliveryFee + adjustmentsTotal + tax;
    }

    // ============================================
    // NOTES SECTION (LEFT SIDE)
    // ============================================

    const notesWidth = pageWidth * 0.55; // 55% of page width for notes
    const totalsWidth = 85;
    const notesX = 14;
    const totalsX = pageWidth - 14 - totalsWidth;

    if (invoice.additionalNotes) {
        // Notes background
        doc.setFillColor(252, 248, 245); // Light warm background
        doc.roundedRect(notesX, finalY - 5, notesWidth - 10, 58, 2, 2, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(BRAND_ORANGE[0], BRAND_ORANGE[1], BRAND_ORANGE[2]);
        doc.text('NOTES', notesX + 5, finalY);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(TEXT_GRAY[0], TEXT_GRAY[1], TEXT_GRAY[2]);

        const splitNotes = doc.splitTextToSize(invoice.additionalNotes, notesWidth - 25);
        doc.text(splitNotes, notesX + 5, finalY + 7);
    }

    // ============================================
    // TOTALS BREAKDOWN (RIGHT SIDE)
    // ============================================

    // Background for totals
    doc.setFillColor(248, 250, 252); // Slate 50
    doc.roundedRect(totalsX - 5, finalY - 5, totalsWidth + 5, 58, 2, 2, 'F');

    let currentTotalY = finalY;
    const lineHeight = 7;

    // Helper for total lines
    const addTotalLine = (label: string, value: number, isBold = false, isTotal = false, isDiscount = false) => {
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        doc.setFontSize(isTotal ? 12 : 10);
        doc.setTextColor(
            isTotal ? BRAND_ORANGE[0] : isDiscount ? 34 : PRIMARY_DARK[0],
            isTotal ? BRAND_ORANGE[1] : isDiscount ? 197 : PRIMARY_DARK[1],
            isTotal ? BRAND_ORANGE[2] : isDiscount ? 94 : PRIMARY_DARK[2]
        );

        doc.text(label, totalsX, currentTotalY);
        const prefix = isDiscount ? '-$' : '$';
        doc.text(`${prefix}${value.toFixed(2)}`, pageWidth - 14, currentTotalY, { align: 'right' });
        currentTotalY += lineHeight;
    };

    addTotalLine('Subtotal:', subtotal);
    
    // Show adjustments breakdown
    if (adjustmentsBreakdown.length > 0) {
        adjustmentsBreakdown.forEach((adj: any) => {
            if (adj.mode === 'discount') {
                addTotalLine(`${adj.label}:`, adj.amount, false, false, true);
            } else if (adj.mode === 'surcharge') {
                addTotalLine(`${adj.label}:`, adj.amount);
            }
        });
    } else if (adjustmentsTotal !== 0) {
        // Fallback: Show net adjustments if breakdown not available
        if (totalDiscounts > 0) {
            addTotalLine('Discounts:', totalDiscounts, false, false, true);
        }
        if (totalSurcharges > 0) {
            addTotalLine('Surcharges:', totalSurcharges);
        }
    }

    const serviceFeeRate = waiveServiceFee ? 0 : 0.05;
    addTotalLine(`Service Fee (${(serviceFeeRate * 100).toFixed(0)}%):`, serviceFee);
    addTotalLine('Delivery Fee:', deliveryFee);

    // Tax Fee - show if tax is calculated
    if (isTaxExempt) {
        // Show tax exempt badge
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(34, 197, 94); // Green color
        doc.text('Tax:', totalsX, currentTotalY);
        doc.setFontSize(8);
        doc.text('TAX EXEMPT', pageWidth - 14, currentTotalY, { align: 'right' });
        currentTotalY += lineHeight;
    } else if (tax > 0) {
        // Format tax percentage - remove unnecessary decimal zeros
        const taxPercentageValue = taxRate * 100;
        const taxPercentage = taxPercentageValue % 1 === 0
            ? taxPercentageValue.toFixed(0)
            : taxPercentageValue.toFixed(3).replace(/\.?0+$/, '');

        addTotalLine(`Tax Fee (${taxPercentage}%):`, tax);
    }

    // Divider line above total
    currentTotalY += 2;
    doc.setDrawColor(BRAND_ORANGE[0], BRAND_ORANGE[1], BRAND_ORANGE[2]);
    doc.setLineWidth(0.5);
    doc.line(totalsX, currentTotalY - 2, pageWidth - 14, currentTotalY - 2);
    currentTotalY += 2;

    addTotalLine('Total:', total, true, true);

    // ============================================
    // FOOTER
    // ============================================

    // Position footer with proper spacing from content
    const contentEndY = Math.max(currentTotalY, finalY + 60);
    const footerY = Math.max(contentEndY + 15, pageHeight - 25);

    doc.setDrawColor(BRAND_ORANGE[0], BRAND_ORANGE[1], BRAND_ORANGE[2]);
    doc.setLineWidth(0.5);
    doc.line(14, footerY, pageWidth - 14, footerY);

    doc.setFontSize(9);
    doc.setTextColor(TEXT_GRAY[0], TEXT_GRAY[1], TEXT_GRAY[2]);
    doc.setFont('helvetica', 'normal');
    doc.text('Thank you for your business!', 14, footerY + 7);
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(PRIMARY_DARK[0], PRIMARY_DARK[1], PRIMARY_DARK[2]);
    doc.text('Cater Directly - Premium Catering Services', pageWidth - 14, footerY + 7, { align: 'right' });

    // Save PDF
    doc.save(`Invoice-${invoice.id.slice(0, 8)}.pdf`);
};
