import jsPDF from 'jspdf';
import { Invoice } from '@/types/invoice-types';
import { APP_LOGO } from '@/constants/app-assets';
import { getTaxRateByLocation } from './tax-calculation';

// Brand Colors
const BRAND_ORANGE = [240, 119, 18] as [number, number, number]; // #F07712
const PRIMARY_DARK = [15, 23, 42] as [number, number, number];   // Slate 900
const TEXT_GRAY = [100, 116, 139] as [number, number, number];   // Slate 500
const BORDER_GRAY = [226, 232, 240] as [number, number, number]; // Slate 200
const SIMPLE_GREEN = [22, 163, 74] as [number, number, number]; // Green 600
const PREMIUM_PURPLE = [126, 34, 206] as [number, number, number]; // Purple 700

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

    if (serviceType === 'catering') {
        const apiCateringItems = service.cateringItems ||
            service.service_details?.menuItems ||
            service.service_details?.catering?.menuItems ||
            [];

        const apiComboCategoryItems = service.comboCategoryItems ||
            service.service_details?.comboCategoryItems ||
            [];

        const comboIds = new Set(
            (Array.isArray(apiComboCategoryItems) ? apiComboCategoryItems : [])
                .map((item: any) => item.comboId)
                .filter(Boolean),
        );
        const comboBaseById: Record<string, { name: string; price: number; quantity: number }> = {};

        if (Array.isArray(apiCateringItems)) {
            apiCateringItems.forEach((item: any) => {
                const itemId = item.id || item.cateringId;
                const cateringId = item.cateringId || item.id;
                const isComboBase = Boolean(item.isCombo) || comboIds.has(itemId) || comboIds.has(cateringId);
                const price = Number(item.price || item.pricePerPerson) || 0;
                const quantity = Number(item.quantity) || 1;

                if (isComboBase && itemId) {
                    const baseData = {
                        name: item.menuItemName || item.name || 'Combo',
                        price,
                        quantity: quantity > 0 ? quantity : guestCount,
                    };
                    comboBaseById[itemId] = baseData;
                    if (cateringId && cateringId !== itemId) {
                        comboBaseById[cateringId] = baseData;
                    }
                    return;
                }

                items.push({
                    name: item.menuItemName || item.name || 'Menu Item',
                    description: item.menuName || 'Menu Item',
                    quantity,
                    price,
                    total: price * quantity,
                    isCatering: true,
                    isMenuItem: true,
                });
            });
        }

        if (Array.isArray(apiComboCategoryItems) && apiComboCategoryItems.length > 0) {
            const groupedByCombo: Record<string, any[]> = {};
            apiComboCategoryItems.forEach((comboItem: any) => {
                const itemName = comboItem.menuItemName || comboItem.name || '';
                const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(itemName);
                if (isUUID || !itemName.trim()) return;

                const comboId = comboItem.comboId || '_default';
                if (!groupedByCombo[comboId]) groupedByCombo[comboId] = [];
                groupedByCombo[comboId].push(comboItem);
            });

            if (Object.keys(groupedByCombo).length > 0) {
                items.push({ rowType: 'comboSection', name: 'COMBOS SELECTED ITEMS', quantity: 0, price: 0, total: 0 });
            }

            Object.entries(groupedByCombo).forEach(([comboId, comboItems]) => {
                const comboBase = comboBaseById[comboId];
                const comboName = comboBase?.name || comboItems[0]?.menuName || 'Combo';
                const comboQty = comboBase?.quantity || guestCount;
                const comboBasePrice = comboBase?.price || 0;

                items.push({ rowType: 'comboHeader', name: comboName, quantity: comboQty, price: comboBasePrice, total: comboBasePrice * comboQty });

                const simpleItems = comboItems.filter((item: any) => (Number(item.premiumCharge || item.additionalCharge) || 0) <= 0);
                const premiumItems = comboItems.filter((item: any) => (Number(item.premiumCharge || item.additionalCharge) || 0) > 0);

                if (simpleItems.length > 0) {
                    items.push({ rowType: 'comboSubHeader', name: 'Simple Items', quantity: 0, price: 0, total: 0 });
                }

                simpleItems.forEach((item: any) => {
                    const quantity = Number(item.quantity) || 1;
                    const price = Number(item.price) || 0;
                    items.push({ rowType: 'comboSimpleItem', name: '  - ' + (item.menuItemName || item.name || 'Item'), quantity, price, total: price * quantity });
                });

                if (premiumItems.length > 0) {
                    items.push({ rowType: 'comboSubHeader', name: 'Premium Items', quantity: 0, price: 0, total: 0 });
                }

                premiumItems.forEach((item: any) => {
                    const quantity = Number(item.quantity) || 1;
                    const premiumCharge = Number(item.premiumCharge || item.additionalCharge) || 0;
                    items.push({ rowType: 'comboPremiumItem', name: '  - ' + (item.menuItemName || item.name || 'Item'), quantity, price: premiumCharge, total: premiumCharge * quantity });
                });
            });
        }

        if (items.length === 0 && Number(service.totalPrice) > 0) {
            items.push({ name: service.serviceName || service.name || 'Catering Service', description: 'Catering', quantity: guestCount, price: Number(service.totalPrice) / guestCount, total: Number(service.totalPrice), isCatering: true });
        }

        return items;
    }

    if (Array.isArray(service.partyRentalItems)) {
        service.partyRentalItems.forEach((item: any) => {
            items.push({ name: item.name || 'Rental Item', description: 'Party Rentals', quantity: Number(item.quantity) || 0, price: Number(item.eachPrice) || 0, total: Number(item.totalPrice) || 0 });
        });
    }

    if (Array.isArray(service.staffItems)) {
        service.staffItems.forEach((item: any) => {
            const hours = Number(item.hours) || 0;
            const perHourPrice = Number(item.perHourPrice) || 0;
            const quantity = Number(item.quantity) || hours || 1;
            items.push({ name: item.name || 'Staff', description: item.pricingType === 'hourly' ? `Event Staff (${hours} hrs)` : 'Event Staff', quantity, price: perHourPrice || (Number(item.totalPrice) || 0) / quantity, total: Number(item.totalPrice) || 0 });
        });
    }

    if (Array.isArray(service.venueItems)) {
        service.venueItems.forEach((item: any) => {
            items.push({ name: item.venueType || 'Venue', description: `Venue (${item.minimumGuests}-${item.maximumGuests} guests)`, quantity: 1, price: Number(item.price) || 0, total: Number(item.totalPrice) || 0 });
        });
    }

    if (items.length === 0 && Number(service.totalPrice) > 0) {
        const quantity = Number(service.quantity) || 1;
        const totalPrice = Number(service.totalPrice) || 0;
        const unitPrice = Number(service.price) || (totalPrice / quantity);
        items.push({ name: service.serviceName || 'Service', description: service.serviceType || 'Flat Fee', quantity, price: unitPrice, total: totalPrice });
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

    // Elevated info cards for better visual hierarchy
    const infoGap = 8;
    const infoCardX = 14;
    const infoCardW = (pageWidth - 28 - infoGap) / 2;
    const billCardY = startY;
    const eventCardY = startY;
    const infoPad = 5;

    // Left card: Bill To
    doc.setDrawColor(BORDER_GRAY[0], BORDER_GRAY[1], BORDER_GRAY[2]);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(infoCardX, billCardY, infoCardW, 40, 2, 2, 'FD');
    doc.setFillColor(255, 247, 237);
    doc.roundedRect(infoCardX, billCardY, infoCardW, 9, 2, 2, 'F');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(BRAND_ORANGE[0], BRAND_ORANGE[1], BRAND_ORANGE[2]);
    doc.text('BILL TO', infoCardX + infoPad, billCardY + 6);

    doc.setTextColor(PRIMARY_DARK[0], PRIMARY_DARK[1], PRIMARY_DARK[2]);
    doc.setFontSize(11);
    doc.text(invoice.contactName || 'Valued Client', infoCardX + infoPad, billCardY + 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(TEXT_GRAY[0], TEXT_GRAY[1], TEXT_GRAY[2]);
    doc.text(invoice.emailAddress || '', infoCardX + infoPad, billCardY + 22);
    doc.text(invoice.phoneNumber || '', infoCardX + infoPad, billCardY + 28);
    if (invoice.companyName) {
        doc.text(invoice.companyName, infoCardX + infoPad, billCardY + 34);
    }

    // Right card: Event Details
    const eventCardX = infoCardX + infoCardW + infoGap;
    doc.setDrawColor(BORDER_GRAY[0], BORDER_GRAY[1], BORDER_GRAY[2]);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(eventCardX, eventCardY, infoCardW, 40, 2, 2, 'FD');
    doc.setFillColor(255, 247, 237);
    doc.roundedRect(eventCardX, eventCardY, infoCardW, 9, 2, 2, 'F');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(BRAND_ORANGE[0], BRAND_ORANGE[1], BRAND_ORANGE[2]);
    doc.text('EVENT DETAILS', eventCardX + infoPad, eventCardY + 6);

    doc.setTextColor(PRIMARY_DARK[0], PRIMARY_DARK[1], PRIMARY_DARK[2]);
    doc.setFontSize(11);
    doc.text(invoice.eventName || 'Untitled Event', eventCardX + infoPad, eventCardY + 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(TEXT_GRAY[0], TEXT_GRAY[1], TEXT_GRAY[2]);
    doc.text(`Date: ${invoice.eventDate ? new Date(invoice.eventDate).toLocaleDateString() : 'TBD'}`, eventCardX + infoPad, eventCardY + 22);
    doc.text(`Time: ${invoice.serviceTime || 'TBD'}`, eventCardX + infoPad, eventCardY + 28);
    doc.text(`Guests: ${invoice.guestCount || 0}`, eventCardX + infoPad, eventCardY + 34);

    // Location below both cards
    let infoBottomY = startY + 40;
    if (invoice.eventLocation) {
        const locationText = `Location: ${invoice.eventLocation}`;
        const locationLines = doc.splitTextToSize(locationText, pageWidth - 32);
        const locationY = infoBottomY + 9;

        doc.setFillColor(248, 250, 252);
        const locationBoxHeight = Math.max(10, locationLines.length * 5 + 4);
        doc.roundedRect(14, infoBottomY + 3, pageWidth - 28, locationBoxHeight, 2, 2, 'F');

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(TEXT_GRAY[0], TEXT_GRAY[1], TEXT_GRAY[2]);
        doc.text(locationLines, 18, locationY);

        infoBottomY += locationBoxHeight + 5;
    }
// ============================================
    // ITEMS CARDS (OrderItemsBreakdown style)
    // ============================================

    const tableGuestCount = Number(invoice.guestCount) || 1;
    const contentLeft = 14;
    const contentRight = pageWidth - 14;
    const contentWidth = contentRight - contentLeft;
    const cardPadding = 4;

    const formatMoney = (value: number) => '$' + Number(value || 0).toFixed(2);
    const truncateText = (value: string, max = 42) => (value.length > max ? value.slice(0, max - 3) + '...' : value);

    let cursorY = infoBottomY + 8;

    const ensurePageSpace = (requiredHeight: number) => {
        if (cursorY + requiredHeight > pageHeight - 35) {
            doc.addPage();
            cursorY = 20;
        }
    };

    (invoice.services || []).forEach((service: any) => {
        const serviceType = service.serviceType || 'service';
        const serviceTypeLabel = {
            'catering': 'CATERING SERVICE',
            'party_rentals': 'PARTY RENTALS',
            'party-rentals': 'PARTY RENTALS',
            'events_staff': 'EVENT STAFF',
            'staff': 'EVENT STAFF',
            'venues': 'VENUE SERVICE',
            'venue': 'VENUE SERVICE',
        }[serviceType] || 'SERVICE';
        const itemColumnLabel = serviceType === 'catering' ? 'MENU ITEM' : 'ITEM';
        const qtyColumnLabel = (serviceType === 'venue' || serviceType === 'venues') ? 'Hr' : 'QTY';

        const items = getServiceItems(service, tableGuestCount);
        const serviceTotal = Number(service.totalPrice) || items.reduce((sum: number, item: any) => sum + (Number(item.total) || 0), 0);

        const rowHeight = 6;
        const itemRowsCount = Math.max(items.length, 1);
        const cardHeight = 30 + (itemRowsCount * rowHeight);
        ensurePageSpace(cardHeight + 4);

        doc.setDrawColor(BORDER_GRAY[0], BORDER_GRAY[1], BORDER_GRAY[2]);
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(contentLeft, cursorY, contentWidth, cardHeight, 2, 2, 'FD');

        doc.setFillColor(BRAND_ORANGE[0], BRAND_ORANGE[1], BRAND_ORANGE[2]);
        doc.roundedRect(contentLeft, cursorY, contentWidth, 10, 2, 2, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(255, 255, 255);
        doc.text(`${serviceTypeLabel} - ${(service.serviceName || service.name || 'Service').toUpperCase()}`, contentLeft + cardPadding, cursorY + 7);

        const itemX = contentLeft + cardPadding;
        const unitX = contentRight - 52;
        const qtyX = contentRight - 30;
        const totalX = contentRight - cardPadding;

        let rowY = cursorY + 16;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(TEXT_GRAY[0], TEXT_GRAY[1], TEXT_GRAY[2]);
        doc.text(itemColumnLabel, itemX, rowY);
        doc.text('PRICE', unitX, rowY, { align: 'right' });
        doc.text(qtyColumnLabel, qtyX, rowY, { align: 'center' });
        doc.text('TOTAL', totalX, rowY, { align: 'right' });
        rowY += 5;

        items.forEach((item: any) => {
            if (item.rowType === 'comboSection' || item.rowType === 'comboSubHeader') {
                const isPremiumSubHeader = item.rowType === 'comboSubHeader' && String(item.name || '').toLowerCase().includes('premium');
                const isSimpleSubHeader = item.rowType === 'comboSubHeader' && String(item.name || '').toLowerCase().includes('simple');

                const fill = item.rowType === 'comboSection'
                    ? [255, 247, 237]
                    : isPremiumSubHeader
                        ? [245, 243, 255]
                        : isSimpleSubHeader
                            ? [240, 253, 244]
                            : [248, 250, 252];

                doc.setFillColor(fill[0], fill[1], fill[2]);
                doc.rect(contentLeft + 1, rowY - 4, contentWidth - 2, 6, 'F');
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(8);

                if (item.rowType === 'comboSection') {
                    doc.setTextColor(BRAND_ORANGE[0], BRAND_ORANGE[1], BRAND_ORANGE[2]);
                } else if (isPremiumSubHeader) {
                    doc.setTextColor(PREMIUM_PURPLE[0], PREMIUM_PURPLE[1], PREMIUM_PURPLE[2]);
                } else if (isSimpleSubHeader) {
                    doc.setTextColor(SIMPLE_GREEN[0], SIMPLE_GREEN[1], SIMPLE_GREEN[2]);
                } else {
                    doc.setTextColor(PRIMARY_DARK[0], PRIMARY_DARK[1], PRIMARY_DARK[2]);
                }

                doc.text(item.name, itemX, rowY);
                rowY += rowHeight;
                return;
            }

            if (item.rowType === 'comboHeader') {
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(8);
                doc.setTextColor(PRIMARY_DARK[0], PRIMARY_DARK[1], PRIMARY_DARK[2]);
                doc.text(truncateText(item.name || 'Combo'), itemX, rowY);

                const comboBasePrice = Number(item.price || 0);
                const comboPeople = Number(item.quantity || 0);
                if (comboBasePrice > 0 && comboPeople > 0) {
                    doc.text(
                        '$' + comboBasePrice.toFixed(2) + ' x ' + comboPeople + ' peoples',
                        unitX,
                        rowY,
                        { align: 'right' },
                    );
                }

                if (Number(item.total || 0) > 0) {
                    doc.text('$' + Number(item.total || 0).toFixed(2), totalX, rowY, { align: 'right' });
                }
                rowY += rowHeight;
                return;
            }

            const isPremium = item.rowType === 'comboPremiumItem';
            const isSimple = item.rowType === 'comboSimpleItem';
            const itemName = truncateText(item.name || 'Item');

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            if (isPremium) {
                doc.setTextColor(PREMIUM_PURPLE[0], PREMIUM_PURPLE[1], PREMIUM_PURPLE[2]);
            } else if (isSimple) {
                doc.setTextColor(SIMPLE_GREEN[0], SIMPLE_GREEN[1], SIMPLE_GREEN[2]);
            } else {
                doc.setTextColor(PRIMARY_DARK[0], PRIMARY_DARK[1], PRIMARY_DARK[2]);
            }
            doc.text(itemName, itemX, rowY);

            const unitText = (isPremium ? '+$' : '$') + Number(item.price || 0).toFixed(2);
            const totalText = (isPremium ? '+$' : '$') + Number(item.total || 0).toFixed(2);

            doc.text(unitText, unitX, rowY, { align: 'right' });
            if (isSimple) {
                // For simple combo items, only show the price.
                doc.text('', qtyX, rowY, { align: 'center' });
                doc.text('', totalX, rowY, { align: 'right' });
            } else {
                doc.text(String(item.quantity || 0), qtyX, rowY, { align: 'center' });
                doc.text(totalText, totalX, rowY, { align: 'right' });
            }
            rowY += rowHeight;
        });

        doc.setDrawColor(BORDER_GRAY[0], BORDER_GRAY[1], BORDER_GRAY[2]);
        doc.line(contentLeft + cardPadding, rowY, contentRight - cardPadding, rowY);
        rowY += 6;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(PRIMARY_DARK[0], PRIMARY_DARK[1], PRIMARY_DARK[2]);
        doc.text('Service Total', itemX, rowY);
        doc.text(formatMoney(serviceTotal), totalX, rowY, { align: 'right' });

        cursorY += cardHeight + 4;
    });

    let finalY = cursorY + 6;
    if (finalY + 28 > pageHeight - 20) {
        doc.addPage();
        finalY = 20;
    }
    // ? USE API-CALCULATED TOTALS (same as order summary page)
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

    const lineHeight = 7;
    const subtotalForDisplay = subtotal + deliveryFee + adjustmentsTotal;
    const serviceFeeRate = waiveServiceFee ? 0 : 0.05;
    const serviceFeeForDisplay = Number((subtotalForDisplay * serviceFeeRate).toFixed(2));
    const taxForDisplay = (!isTaxExempt && taxRate > 0)
        ? Number((subtotalForDisplay * taxRate).toFixed(2))
        : 0;
    const totalForDisplay = Number((subtotalForDisplay + serviceFeeForDisplay + taxForDisplay).toFixed(2));

    const summaryRows: Array<{ label: string; value: number; mode?: 'discount' | 'normal' | 'subtotal' | 'total' }> = [];

    if (adjustmentsBreakdown.length > 0) {
        adjustmentsBreakdown.forEach((adj: any) => {
            if (adj.mode === 'discount') {
                summaryRows.push({ label: `${adj.label}:`, value: Number(adj.amount) || 0, mode: 'discount' });
            } else if (adj.mode === 'surcharge') {
                summaryRows.push({ label: `${adj.label}:`, value: Number(adj.amount) || 0, mode: 'normal' });
            }
        });
    } else {
        if (totalDiscounts > 0) summaryRows.push({ label: 'Discount:', value: totalDiscounts, mode: 'discount' });
        if (totalSurcharges > 0) summaryRows.push({ label: 'Surcharge:', value: totalSurcharges, mode: 'normal' });
    }

    summaryRows.push({ label: 'Delivery Fee:', value: deliveryFee, mode: 'normal' });
    summaryRows.push({ label: 'Subtotal:', value: subtotalForDisplay, mode: 'subtotal' });
    summaryRows.push({ label: `Service Fee (${(serviceFeeRate * 100).toFixed(0)}%):`, value: serviceFeeForDisplay, mode: 'normal' });

    if (!isTaxExempt && taxForDisplay > 0) {
        const taxPercentageValue = taxRate * 100;
        const taxPercentage = taxPercentageValue % 1 === 0
            ? taxPercentageValue.toFixed(0)
            : taxPercentageValue.toFixed(3).replace(/\.?0+$/, '');
        summaryRows.push({ label: `Tax Fee (${taxPercentage}%):`, value: taxForDisplay, mode: 'normal' });
    }

    summaryRows.push({ label: 'Total:', value: totalForDisplay, mode: 'total' });

    const totalsHeaderH = 10;
    const totalRowsExtra = summaryRows.some((row) => row.mode === 'total') ? 1 : 0;
    const totalsBoxHeight = Math.max(
        46,
        totalsHeaderH + 6 + (summaryRows.length * lineHeight) + totalRowsExtra + 2,
    );

    // Summary panel container
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(BORDER_GRAY[0], BORDER_GRAY[1], BORDER_GRAY[2]);
    doc.roundedRect(totalsX - 5, finalY - 5, totalsWidth + 5, totalsBoxHeight, 2, 2, 'FD');

    // Panel header
    doc.setFillColor(255, 247, 237);
    doc.roundedRect(totalsX - 5, finalY - 5, totalsWidth + 5, totalsHeaderH, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(BRAND_ORANGE[0], BRAND_ORANGE[1], BRAND_ORANGE[2]);
    doc.text('PAYMENT SUMMARY', totalsX, finalY + 1.5);

    const totalsValueX = pageWidth - 18;
    let currentTotalY = finalY + totalsHeaderH + 6;

    summaryRows.forEach((row) => {
        const isDiscount = row.mode === 'discount';
        const isSubtotal = row.mode === 'subtotal';
        const isTotal = row.mode === 'total';

        if (isSubtotal) {
            doc.setFillColor(239, 246, 255);
            doc.roundedRect(totalsX - 2, currentTotalY - 4.5, totalsWidth - 2, 6, 1.5, 1.5, 'F');
        }

        doc.setFont('helvetica', isTotal || isSubtotal ? 'bold' : 'normal');
        doc.setFontSize(isTotal ? 12 : 10);

        if (isTotal) {
            doc.setTextColor(BRAND_ORANGE[0], BRAND_ORANGE[1], BRAND_ORANGE[2]);
        } else if (isSubtotal) {
            doc.setTextColor(37, 99, 235);
        } else if (isDiscount) {
            doc.setTextColor(34, 197, 94);
        } else {
            doc.setTextColor(PRIMARY_DARK[0], PRIMARY_DARK[1], PRIMARY_DARK[2]);
        }

        doc.text(row.label, totalsX, currentTotalY);
        const prefix = isDiscount ? '-$' : '$';
        doc.text(`${prefix}${row.value.toFixed(2)}`, totalsValueX, currentTotalY, { align: 'right' });
        currentTotalY += lineHeight;

        if (isTotal) {
            currentTotalY += 1;
        }
    });

    if (isTaxExempt) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(34, 197, 94);
        doc.text('TAX EXEMPT', totalsValueX, finalY + totalsBoxHeight - 6, { align: 'right' });
    }
// ============================================
    // FOOTER
    // ============================================

    // Position footer at fixed page-end position
    const footerY = pageHeight - 25;

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















