import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Header from '@/components/cater-directly/Header';
import Footer from '@/components/cater-directly/Footer';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { DatePicker } from '@/components/ui/date-picker';
import { TimePicker } from '@/components/ui/time-picker';
import GoogleMapsAutocomplete from '@/components/shared/GoogleMapsAutocomplete';
import { Save, Plus } from 'lucide-react';
import invoiceService from '@/services/api/invoice.Service';
import BookingVendorCard from '@/components/booking/BookingVendorCard';
import EnhancedOrderSummaryCard from '@/components/booking/order-summary/EnhancedOrderSummaryCard';
import AdminTaxAndFeeControls from '@/components/booking/admin/AdminTaxAndFeeControls';
import AdminCustomAdjustments from '@/components/booking/admin/AdminCustomAdjustments';
import { ServiceSelection } from '@/types/order';
import { CustomAdjustment } from '@/types/adjustments';
import { processService } from '@/utils/service-item-processor';
import { getServiceTypeLabel } from '@/utils/service-utils';
import { useAuth } from '@/contexts/auth';
import { useServiceDistances } from '@/hooks/use-service-distances';
import { getServiceAddress, calculateDeliveryFee } from '@/utils/delivery-calculations';
import { LocationData } from '@/components/shared/address/types';

function EditOrderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [selectedServices, setSelectedServices] = useState<ServiceSelection[]>([]);
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});
  const [formInputs, setFormInputs] = useState<any>({});
  const [customAdjustments, setCustomAdjustments] = useState<CustomAdjustment[]>([]);
  const [isTaxExempt, setIsTaxExempt] = useState(false);
  const [isServiceFeeWaived, setIsServiceFeeWaived] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const hasProcessedSessionRef = useRef(false);
  const hasLoadedDataRef = useRef(false);

  // Delivery fee state
  const [serviceDeliveryFees, setServiceDeliveryFees] = useState<Record<string, { range: string; fee: number }>>({});
  const [eventLocationData, setEventLocationData] = useState<LocationData | null>(null);



  useEffect(() => {
    // Prevent multiple loads
    if (hasLoadedDataRef.current) return;
    
    const loadOrderData = async () => {
      if (!id) {
        toast.error('No order ID provided');
        navigate('/order-summary');
        return;
      }

      // Check if we have edit order state from marketplace return
      const editOrderState = sessionStorage.getItem('editOrderState');
      const cartData = sessionStorage.getItem('cartServices');
      const newSelectedItems = sessionStorage.getItem('newSelectedItems');
      
      if (editOrderState && cartData && !hasProcessedSessionRef.current) {
        try {
          const parsedEditState = JSON.parse(editOrderState);
          const parsedCartData = JSON.parse(cartData);
          const parsedNewSelectedItems = newSelectedItems ? JSON.parse(newSelectedItems) : {};
          
          if (parsedEditState.editOrderId === id) {
            // Simply add new services to existing ones
            const combinedServices = [...parsedEditState.services, ...parsedCartData];
            const combinedSelectedItems = { ...parsedEditState.selectedItems, ...parsedNewSelectedItems };
            console.log('[EditOrderPage] Setting combined services:', combinedServices);
            console.log('[EditOrderPage] Setting combined selectedItems:', combinedSelectedItems);
            
            setSelectedServices(combinedServices);
            setSelectedItems(combinedSelectedItems);
            setOrderData(parsedEditState.orderData || {});
            setFormInputs(parsedEditState.formInputs || {});
            hasProcessedSessionRef.current = true;
            hasLoadedDataRef.current = true;
            
            sessionStorage.removeItem('editOrderState');
            sessionStorage.removeItem('cartServices');
            sessionStorage.removeItem('newSelectedItems');
            setIsLoading(false);
            return;
          }
        } catch (e) {
          sessionStorage.removeItem('editOrderState');
          sessionStorage.removeItem('cartServices');
          sessionStorage.removeItem('newSelectedItems');
        }
      }
      


      try {
        const response = await invoiceService.getInvoiceOrderSummary(id);
        if (response?.data?.invoice) {
          const invoiceData = response.data.invoice;
          setOrderData(invoiceData);
          
          // Map services from API to ServiceSelection format
          const mappedServices: ServiceSelection[] = (invoiceData.services || []).map((service: any) => {
            const serviceId = service.id;
            const serviceType = service.serviceType || '';
            
            // Extract items based on service type and build selectedItems
            let serviceItems: any[] = [];
            let menuItems: any[] = [];
            let rentalItems: any[] = [];
            let staffItems: any[] = [];
            let venueItems: any[] = [];
            
            if (service.cateringItems && service.cateringItems.length > 0) {
              serviceItems = service.cateringItems;
              menuItems = service.cateringItems.map((item: any) => {
                // Find combo category items for this combo
                const comboCategoryItems = (invoiceData.services || []).flatMap((s: any) =>
                  (s.comboCategoryItems || []).filter((comboItem: any) =>
                    comboItem.comboId === (item.cateringId || item.id)
                  )
                );

                // Only mark as combo if there are actual combo category items or explicitly marked as combo
                const hasComboCategories = comboCategoryItems.length > 0;
                const isActualCombo = hasComboCategories || item.isCombo === true;

                // Only include comboCategories if it's actually a combo
                const comboCategories = hasComboCategories ? [{
                  id: 'combo-category',
                  name: 'Combo Items',
                  items: comboCategoryItems.map((comboItem: any) => ({
                    id: comboItem.cateringId,
                    name: comboItem.menuItemName,
                    price: parseFloat(comboItem.price || 0),
                    image: comboItem.image || comboItem.imageUrl || '',
                    quantity: comboItem.quantity || 0
                  }))
                }] : (item.comboCategories && item.comboCategories.length > 0 ? item.comboCategories : undefined);

                return {
                  id: item.cateringId || item.id,
                  name: item.menuItemName || item.name,
                  price: parseFloat(item.price || 0),
                  category: item.menuName || 'Menu',
                  menuName: item.menuName,
                  menuItemName: item.menuItemName,
                  isCombo: isActualCombo,
                  ...(comboCategories && { comboCategories }),
                  ...(hasComboCategories && { comboCategoryItems }),
                  priceType: item.priceType || 'fixed',
                  image: item.image || item.imageUrl,
                  imageUrl: item.imageUrl || item.image,
                  description: item.description || ''
                };
              });
            }
            
            // Add combo base items for all combos from comboCategoryItems
            if (serviceType === 'catering') {
              const allComboCategoryItems = (invoiceData.services || []).flatMap((s: any) => s.comboCategoryItems || []);
              const comboGroups = new Map();
              
              allComboCategoryItems.forEach((item: any) => {
                if (!comboGroups.has(item.comboId)) {
                  comboGroups.set(item.comboId, []);
                }
                comboGroups.get(item.comboId).push(item);
              });
              
              comboGroups.forEach((comboCategoryItems, comboId) => {
                const existingCombo = menuItems.find(item => item.id === comboId);
                const comboImage = comboCategoryItems[0]?.image || 
                  service.cateringItems?.find((item: any) => (item.cateringId || item.id) === comboId)?.image || '';
                if (!existingCombo) {
                  const comboName = comboId === 'd322b22b-c67a-42c2-b757-5deb9949ccaf' ? 'Desserts' : 'Combo';
                  menuItems.push({
                    id: comboId,
                    name: comboName,
                    price: 12,
                    category: 'Combo Packages',
                    menuName: 'Combo Packages',
                    menuItemName: comboName,
                    isCombo: true,
                    comboCategories: [{
                      id: 'combo-category',
                      name: 'Combo Items',
                      items: comboCategoryItems.map((comboItem: any) => ({
                        id: comboItem.cateringId,
                        name: comboItem.menuItemName,
                        price: parseFloat(comboItem.price || 0),
                        image: comboItem.image || comboItem.imageUrl || '',
                        quantity: comboItem.quantity || 0
                      }))
                    }],
                    comboCategoryItems: comboCategoryItems.map((item: any) => ({
                      ...item,
                      image: item.image || item.imageUrl || ''
                    })),
                    priceType: 'fixed',
                    image: comboImage,
                    imageUrl: comboImage,
                    description: ''
                  });
                } else {
                  existingCombo.comboCategories = [{
                    id: 'combo-category',
                    name: 'Combo Items',
                    items: comboCategoryItems.map((comboItem: any) => ({
                      id: comboItem.cateringId,
                      name: comboItem.menuItemName,
                      price: parseFloat(comboItem.price || 0),
                      image: comboItem.image || comboItem.imageUrl || '',
                      quantity: comboItem.quantity || 0
                    }))
                  }];
                  existingCombo.comboCategoryItems = comboCategoryItems.map((item: any) => ({
                    ...item,
                    image: item.image || item.imageUrl || ''
                  }));
                  if (comboImage && !existingCombo.image) {
                    existingCombo.image = comboImage;
                    existingCombo.imageUrl = comboImage;
                  }
                }
              });
            }
            
            if (service.partyRentalItems && service.partyRentalItems.length > 0) {
              serviceItems = service.partyRentalItems;
              rentalItems = service.partyRentalItems.map((item: any) => ({
                id: item.rentalId || item.id,
                name: item.name,
                price: parseFloat(item.eachPrice || item.price || 0),
                priceType: 'fixed'
              }));
            }
            
            if (service.staffItems && service.staffItems.length > 0) {
              serviceItems = service.staffItems;
              staffItems = service.staffItems.map((item: any) => ({
                id: item.staffId || item.id,
                name: item.name,
                price: parseFloat(item.perHourPrice || item.price || 0),
                pricingType: item.pricingType || 'hourly',
                perHourPrice: parseFloat(item.perHourPrice || item.price || 0)
              }));
            }
            
            if (service.venueItems && service.venueItems.length > 0) {
              serviceItems = service.venueItems;
              venueItems = service.venueItems.map((item: any) => ({
                id: item.id,
                name: item.name,
                price: parseFloat(item.price || 0)
              }));
            }
            
            // Build service_details structure based on service type
            let serviceDetails: any = {};
            if (serviceType === 'catering') {
              // Map comboCategoryItems from API to the format expected by calculation
              const mappedComboCategoryItems = (service.comboCategoryItems || []).map((item: any) => ({
                id: item.id,
                name: item.menuItemName || item.name,
                menuName: item.menuName,
                price: parseFloat(item.price) || 0,
                quantity: item.quantity || 1,
                additionalCharge: item.premiumCharge ? parseFloat(item.premiumCharge) : 0,
                comboId: item.comboId,
                cateringId: item.cateringId,
                image: item.image || item.imageUrl || ''
              }));

              // Add image field to menuItems for display
              const menuItemsWithImages = menuItems.map((mi: any) => ({
                ...mi,
                image: mi.image || mi.imageUrl || ''
              }));

              serviceDetails = {
                catering: {
                  menuItems: menuItemsWithImages,
                  deliveryRanges: service.deliveryRanges || []
                },
                menuItems: menuItemsWithImages,
                comboCategoryItems: mappedComboCategoryItems,
                deliveryRanges: service.deliveryRanges || []
              };
            } else if (serviceType === 'party_rentals' || serviceType === 'party-rentals' || serviceType === 'party-rental') {
              serviceDetails = {
                rentalItems: rentalItems,
                rental: {
                  items: rentalItems
                }
              };
            } else if (serviceType === 'events_staff' || serviceType === 'staff') {
              // For events_staff, build service_details that includes price for display
              serviceDetails = {
                staffServices: staffItems.length > 0 ? staffItems : [],
                services: staffItems.length > 0 ? staffItems : [],
                staff: {
                  services: staffItems.length > 0 ? staffItems : []
                },
                // Include service-level pricing info for display when no sub-items exist
                price: service.price,
                servicePrice: service.price,
                quantity: service.quantity || 1
              };
            } else if (serviceType === 'venues' || serviceType === 'venue') {
              serviceDetails = {
                venueOptions: venueItems.length > 0 ? venueItems : [],
                options: venueItems.length > 0 ? venueItems : [],
                // Include service-level pricing info for display when no sub-items exist
                price: service.price,
                servicePrice: service.price,
                quantity: service.quantity || 1
              };
            }
            
            // Don't include totalPrice for catering services with items - let it recalculate
            const shouldIncludeTotalPrice = serviceType !== 'catering' || serviceItems.length === 0;
            
            return {
              id: serviceId,
              serviceId: serviceId,
              name: service.serviceName,
              serviceName: service.serviceName,
              price: parseFloat(service.price) || 0,
              servicePrice: service.price,
              ...(shouldIncludeTotalPrice && { totalPrice: parseFloat(service.totalPrice) || parseFloat(service.price) || 0 }),
              quantity: service.quantity || 1,
              duration: service.staffItems?.[0]?.hours || 0,
              serviceType: serviceType,
              type: serviceType,
              description: '',
              vendor_id: service.vendorId || undefined,
              priceType: service.priceType || 'flat',
              price_type: service.priceType || 'flat',
              service_details: serviceDetails,
              selected_menu_items: serviceItems,
              image: service.image || service.imageUrl || '',
              imageUrl: service.imageUrl || service.image || '',
              serviceImage: service.image || service.imageUrl || '',
              // Include coordinates for delivery fee calculations
              coordinates: service.coordinates || undefined
            };
          });
          
          // Build selectedItems from service items
          const mappedSelectedItems: Record<string, number> = {};
          (invoiceData.services || []).forEach((service: any) => {
            if (service.cateringItems) {
              service.cateringItems.forEach((item: any) => {
                const itemId = item.cateringId || item.id;
                if (itemId) {
                  mappedSelectedItems[itemId] = (mappedSelectedItems[itemId] || 0) + (item.quantity || 1);
                }
              });
            }
            
            if (service.partyRentalItems) {
              service.partyRentalItems.forEach((item: any) => {
                const itemId = item.rentalId || item.id;
                if (itemId) {
                  mappedSelectedItems[itemId] = (mappedSelectedItems[itemId] || 0) + (item.quantity || 1);
                }
              });
            }
            
            if (service.staffItems) {
              service.staffItems.forEach((item: any) => {
                const itemId = item.staffId || item.id;
                if (itemId) {
                  mappedSelectedItems[itemId] = (mappedSelectedItems[itemId] || 0) + 1;
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
                  mappedSelectedItems[itemId] = (mappedSelectedItems[itemId] || 0) + (item.quantity || 1);
                }
              });
            }
          });
          
          // Add combo category items to selectedItems
          const allComboCategoryItems = (invoiceData.services || []).flatMap((s: any) => s.comboCategoryItems || []);
          allComboCategoryItems.forEach((item: any) => {
            const itemKey = `${item.comboId}_combo-category_${item.cateringId}`;
            mappedSelectedItems[itemKey] = item.quantity;
          });
          
          setSelectedServices(mappedServices);
          setSelectedItems(mappedSelectedItems);
          setFormInputs({
            eventName: invoiceData.eventName || '',
            companyName: invoiceData.companyName || '',
            eventDate: invoiceData.eventDate || '',
            serviceTime: invoiceData.serviceTime || '',
            guestCount: invoiceData.guestCount || '',
            eventLocation: invoiceData.eventLocation || '',
            contactName: invoiceData.contactName || '',
            emailAddress: invoiceData.emailAddress || '',
            phoneNumber: invoiceData.phoneNumber || '',
            additionalNotes: invoiceData.additionalNotes || '',
            hasBackupContact: invoiceData.addBackupContact || false,
            backupContactName: invoiceData.backupContactName || '',
            backupContactPhone: invoiceData.backupContactPhone || '',
            backupContactEmail: invoiceData.backupContactEmail || ''
          });
          
          // Set admin-specific fields
          setIsTaxExempt(invoiceData.taxExemptStatus || false);
          setIsServiceFeeWaived(invoiceData.waiveServiceFee || false);
          setAdminNotes(invoiceData.adminOverrideNotes || '');
          setCustomAdjustments(invoiceData.customLineItems || []);

          // Load delivery fees from services
          const loadedDeliveryFees: Record<string, { range: string; fee: number }> = {};
          (invoiceData.services || []).forEach((service: any) => {
            if (service.deliveryFee && parseFloat(service.deliveryFee) > 0) {
              const fee = parseFloat(service.deliveryFee);
              // Find matching range from deliveryRanges
              let matchedRange = `Delivery`;
              if (service.deliveryRanges && Array.isArray(service.deliveryRanges)) {
                const foundRange = service.deliveryRanges.find((r: any) => r.fee === fee);
                if (foundRange) {
                  matchedRange = foundRange.range;
                }
              }
              loadedDeliveryFees[service.id] = { range: matchedRange, fee };
            }
          });
          if (Object.keys(loadedDeliveryFees).length > 0) {
            setServiceDeliveryFees(loadedDeliveryFees);
          }

          hasLoadedDataRef.current = true;
        } else {
          toast.error('Order not found');
          navigate('/order-summary');
        }
      } catch (error) {
        toast.error('Failed to load order data');
        navigate('/order-summary');
      } finally {
        setIsLoading(false);
      }
    };

    loadOrderData();
  }, [id, navigate]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Check if user is authenticated
      const token = localStorage.getItem("auth_token") || 
                    localStorage.getItem("access_token") ||
                    sessionStorage.getItem("auth_token") ||
                    sessionStorage.getItem("access_token");
      
      if (!token) {
        toast.error('Session expired', {
          description: 'Please log in again to continue.'
        });
        navigate('/login');
        return;
      }
      
      // Fetch current invoice to get existing images
      const invoiceResponse = await invoiceService.getInvoiceOrderSummary(id!);
      const existingInvoice = invoiceResponse?.data?.invoice || {};
      
      // Build image lookup maps
      const serviceImageMap = new Map();
      const itemImageMap = new Map();
      
      (existingInvoice.services || []).forEach((svc: any) => {
        if (svc.image || svc.imageUrl) {
          serviceImageMap.set(svc.id, svc.image || svc.imageUrl);
        }
        
        (svc.cateringItems || []).forEach((item: any) => {
          if (item.image || item.imageUrl) {
            itemImageMap.set(item.cateringId || item.id, item.image || item.imageUrl);
          }
        });
        
        (svc.comboCategoryItems || []).forEach((item: any) => {
          if (item.image || item.imageUrl) {
            itemImageMap.set(item.cateringId || item.id, item.image || item.imageUrl);
          }
        });
        
        (svc.partyRentalItems || []).forEach((item: any) => {
          if (item.image || item.imageUrl) {
            itemImageMap.set(item.rentalId || item.id, item.image || item.imageUrl);
          }
        });
      });
      
      // Prepare the updated order data using the exact backend format
      const updatedOrderData = {
        eventName: formInputs.eventName || orderData?.eventName || '',
        companyName: formInputs.companyName || orderData?.companyName || '',
        eventLocation: formInputs.eventLocation || orderData?.eventLocation || '',
        eventDate: formInputs.eventDate || orderData?.eventDate || '',
        serviceTime: formInputs.serviceTime || orderData?.serviceTime || '',
        guestCount: parseInt(formInputs.guestCount) || orderData?.guestCount || 1,
        contactName: formInputs.contactName || orderData?.contactName || '',
        phoneNumber: formInputs.phoneNumber || orderData?.phoneNumber || '',
        emailAddress: formInputs.emailAddress || orderData?.emailAddress || '',
        addBackupContact: formInputs.hasBackupContact || false,
        additionalNotes: formInputs.additionalNotes || orderData?.additionalNotes || '',
        taxExemptStatus: isTaxExempt,
        waiveServiceFee: isServiceFeeWaived,
        adminOverrideNotes: adminNotes,
        services: selectedServices.map(service => {
          const serviceType = (service.serviceType || service.type || '').toLowerCase().replace(/-/g, '_');
          
          // Helper function to parse price strings like "$10.00" or "10.00"
          const parsePrice = (priceStr: any): number => {
            if (!priceStr) return 0;
            const cleanPrice = priceStr.toString().replace(/[^0-9.]/g, '');
            return parseFloat(cleanPrice) || 0;
          };
          
          const basePrice = parsePrice(service.price) || parsePrice((service as any).servicePrice) || 0;

          const serviceId = service.id || service.serviceId;
          const svc = service as any;
          const serviceImage = service.image || svc.imageUrl || svc.serviceImage || serviceImageMap.get(serviceId) || '';

          const baseService: any = {
            serviceType,
            serviceName: service.serviceName || service.name || '',
            totalPrice: 0, // Will be calculated below
            priceType: serviceType === 'staff' || serviceType === 'events_staff' ? 'hourly' : 'flat',
            price: basePrice,
            quantity: service.quantity || 1,
            vendorId: service.vendor_id || svc.vendorId || '',
            image: serviceImage
          };

          // Add service-specific items based on service type
          if (serviceType === 'catering') {
            const cateringItems = [];
            
            // Add regular catering items
            if (service.service_details?.catering?.menuItems) {
              service.service_details.catering.menuItems.forEach((item: any) => {
                const quantity = selectedItems[item.id] || 1;
                if (quantity > 0) {
                  const itemImage = item.image || item.imageUrl || itemImageMap.get(item.id) || '';
                  cateringItems.push({
                    menuName: item.menuName || item.category || 'Menu',
                    menuItemName: item.menuItemName || item.name,
                    price: parseFloat(item.price || 0),
                    quantity,
                    totalPrice: parseFloat(item.price || 0) * quantity,
                    cateringId: item.id,
                    isComboCategoryItem: false,
                    image: itemImage
                  });
                }
              });
            }
            
            // Add combo category items
            if (service.service_details?.catering?.menuItems) {
              service.service_details.catering.menuItems.forEach((item: any) => {
                if (item.comboCategories) {
                  item.comboCategories.forEach((category: any) => {
                    category.items?.forEach((comboItem: any) => {
                      const comboKey = `${item.id}_combo-category_${comboItem.id}`;
                      const quantity = selectedItems[comboKey] || 0;
                      if (quantity > 0) {
                        const comboItemImage = comboItem.image || comboItem.imageUrl || itemImageMap.get(comboItem.id) || '';
                        cateringItems.push({
                          menuName: category.name || 'Combo Deal',
                          menuItemName: comboItem.name,
                          price: parseFloat(comboItem.price || 0),
                          quantity,
                          totalPrice: parseFloat(comboItem.price || 0) * quantity,
                          serviceId: service.id || service.serviceId || '',
                          cateringId: comboItem.id,
                          isComboCategoryItem: true,
                          comboId: item.id,
                          image: comboItemImage
                        });
                      }
                    });
                  });
                }
              });
            }
            
            baseService.cateringItems = cateringItems;

            // Add delivery fee for catering services (matching BookingFlow format)
            const svcId = service.id || service.serviceId;
            const deliveryFeeData = serviceDeliveryFees[svcId];
            if (deliveryFeeData && deliveryFeeData.fee > 0) {
              baseService.deliveryFee = deliveryFeeData.fee;
            }

            // Calculate total: base price + sum of all catering items
            const itemsTotal = cateringItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
            baseService.totalPrice = (basePrice * (service.quantity || 1)) + itemsTotal;
          } else if (serviceType === 'party_rentals') {
            // For party rentals, check if we have items or use service-level pricing
            const rentalItems = [];
            let hasItems = false;
            
            if (service.service_details?.rentalItems || service.service_details?.rental?.items) {
              const items = service.service_details.rentalItems || service.service_details.rental.items;
              items.forEach((item: any) => {
                const quantity = selectedItems[item.id] || 1;
                if (quantity > 0) {
                  hasItems = true;
                  const itemImage = item.image || item.imageUrl || itemImageMap.get(item.id) || '';
                  rentalItems.push({
                    name: item.name,
                    quantity,
                    eachPrice: parseFloat(item.price || 0),
                    totalPrice: parseFloat(item.price || 0) * quantity,
                    rentalId: item.id,
                    image: itemImage
                  });
                }
              });
            }
            
            // If no items found, use service-level pricing (like AdminBookingFlow)
            if (!hasItems) {
              const quantity = service.quantity || 1;
              return {
                serviceType: 'party_rentals',
                serviceName: service.serviceName || service.name || '',
                totalPrice: basePrice * quantity,
                priceType: 'flat',
                price: basePrice,
                quantity: quantity,
                vendorId: service.vendor_id || '',
                image: serviceImage
              };
            }
            
            baseService.partyRentalItems = rentalItems;
            
            // Calculate total from rental items
            const rentalTotal = rentalItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
            baseService.totalPrice = rentalTotal;
          } else if (serviceType === 'staff' || serviceType === 'events_staff') {
            // For staff, check if we have items or use service-level pricing
            const staffItems = [];
            let hasItems = false;
            
            if (service.service_details?.staffServices || service.service_details?.staff?.services) {
              const items = service.service_details.staffServices || service.service_details.staff.services;
              items.forEach((item: any) => {
                const quantity = selectedItems[item.id] || 1;
                const duration = selectedItems[`${item.id}_duration`] || service.duration || 1;
                if (quantity > 0) {
                  hasItems = true;
                  const itemImage = item.image || item.imageUrl || itemImageMap.get(item.id) || '';
                  staffItems.push({
                    name: item.name,
                    pricingType: item.pricingType || 'hourly',
                    perHourPrice: parseFloat(item.perHourPrice || item.price || 0),
                    hours: duration,
                    totalPrice: item.pricingType === 'flat' ? parseFloat(item.price || 0) : parseFloat(item.perHourPrice || item.price || 0) * duration,
                    staffId: item.id,
                    image: itemImage
                  });
                }
              });
            }
            
            // If no items found, use service-level pricing (like AdminBookingFlow)
            if (!hasItems) {
              const quantity = service.quantity || 1;
              return {
                serviceType: 'events_staff',
                serviceName: service.serviceName || service.name || '',
                totalPrice: basePrice * quantity,
                priceType: 'hourly',
                price: basePrice,
                quantity: quantity,
                vendorId: service.vendor_id || '',
                image: serviceImage
              };
            }
            
            baseService.staffItems = staffItems;
            
            // Calculate total from staff items
            const staffTotal = staffItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
            baseService.totalPrice = staffTotal;
          } else if (serviceType === 'venue' || serviceType === 'venues') {
            // For venues, always use service-level pricing
            const quantity = service.quantity || 1;
            return {
              serviceType: 'venues',
              serviceName: service.serviceName || service.name || '',
              totalPrice: basePrice * quantity,
              priceType: 'flat',
              price: basePrice,
              quantity: quantity,
              vendorId: service.vendor_id || '',
              image: serviceImage
            };
          }
          
          return baseService;
        }),
        customLineItems: customAdjustments.map((adj) => ({
          label: adj.label || '',
          type: adj.type || 'fixed',
          mode: adj.mode || 'surcharge',
          value: parseFloat(adj.value) || 0,
          taxable: adj.taxable || false,
          statusForDrafting: false
        }))
      };

      // =====================================================
      // UPDATE INVOICE API CALL
      // Endpoint: PATCH /invoices/{invoiceId}
      // This payload format matches the BookingFlow createInvoice payload
      // =====================================================
      console.log('========================================');
      console.log('🚀 [EditOrderPage] UPDATE INVOICE');
      console.log('========================================');
      console.log('📍 Invoice ID:', id);
      console.log('📦 Full Payload:', JSON.stringify(updatedOrderData, null, 2));
      console.log('🍽️ Services Count:', updatedOrderData.services?.length);
      updatedOrderData.services?.forEach((svc: any, idx: number) => {
        console.log(`   Service ${idx + 1}: ${svc.serviceName} (${svc.serviceType})`);
        console.log(`      - Total Price: $${svc.totalPrice}`);
        console.log(`      - Delivery Fee: $${svc.deliveryFee || 0}`);
        if (svc.cateringItems) console.log(`      - Catering Items: ${svc.cateringItems.length}`);
        if (svc.partyRentalItems) console.log(`      - Rental Items: ${svc.partyRentalItems.length}`);
        if (svc.staffItems) console.log(`      - Staff Items: ${svc.staffItems.length}`);
      });
      console.log('💰 Custom Line Items:', updatedOrderData.customLineItems?.length || 0);
      console.log('========================================');
      console.log('Submitting update to invoice service...', JSON.stringify(updatedOrderData));

      //await invoiceService.updateInvoice(id!, updatedOrderData);
      
      toast.success('Order updated successfully');
      //navigate(`/order-summary/${id}`);
    } catch (error: any) {
      console.error('Failed to update order:', error);
      
      if (error?.response?.status === 401) {
        toast.error('Session expired', {
          description: 'Please log in again to continue.'
        });
        navigate('/login');
      } else {
        toast.error('Failed to update order', {
          description: error?.response?.data?.message || error?.message || 'Please try again.'
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddService = () => {
    // Store current edit order state in sessionStorage
    sessionStorage.setItem('editOrderState', JSON.stringify({
      editOrderId: id,
      services: selectedServices,
      selectedItems: selectedItems,
      orderData: orderData,
      formInputs: formInputs
    }));
    
    navigate('/marketplace', {
      state: {
        fromEditOrder: true,
        editOrderId: id,
        currentEditOrderServices: selectedServices,
        returnToEditOrder: `/edit-order/${id}`
      }
    });
  };

  const handleRemoveService = (index: number) => {
    const serviceToRemove = selectedServices[index];
    const serviceId = serviceToRemove?.id || serviceToRemove?.serviceId;
    
    // Remove service from selectedServices
    setSelectedServices(prev => prev.filter((_, i) => i !== index));
    
    // Remove all items associated with this service from selectedItems
    if (serviceId) {
      setSelectedItems(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          if (key.startsWith(`${serviceId}_`) || key === serviceId) {
            delete updated[key];
          }
        });
        return updated;
      });
    }
    
    // Preserve formInputs and orderData - don't reset them
  };

  const handleItemQuantityChange = useCallback((itemId: string, quantity: number) => {
    setSelectedItems(prev => {
      const updated = { ...prev };
      if (quantity === 0) {
        delete updated[itemId];
      } else {
        updated[itemId] = quantity;
      }
      return updated;
    });
    
    // Clear totalPrice from services to force recalculation based on items
    setSelectedServices(prev =>
      prev.map(service => {
        // Remove totalPrice so calculateServiceTotal recalculates from items
        const { totalPrice, ...serviceWithoutTotal } = service as any;
        return serviceWithoutTotal as typeof service;
      })
    );
  }, []);

  const handleComboSelection = useCallback((payload: any) => {
    if (payload && 'serviceId' in payload && 'selections' in payload) {
      const { serviceId, selections } = payload;
      setSelectedServices(prevServices =>
        prevServices.map(service => {
          const svcId = service.id || service.serviceId;
          if (svcId === serviceId) {
            return {
              ...service,
              comboSelectionsList: [
                ...(service.comboSelectionsList || []),
                selections,
              ],
            };
          }
          return service;
        })
      );
    }
  }, []);

  const getProcessedService = useCallback((rawService: any) => {
    return processService(rawService);
  }, []);

  // Enhance services with vendor addresses for distance calculation
  const servicesWithAddresses = useMemo(() => {
    return selectedServices.map(service => {
      const vendorAddress = getServiceAddress(service);
      const serviceAny = service as any;

      let vendorCoordinates = null;
      if (serviceAny.vendorCoordinates) {
        vendorCoordinates = serviceAny.vendorCoordinates;
      } else if (service.vendor && typeof service.vendor === 'object') {
        const vendor = service.vendor as any;
        if (vendor.coordinates && typeof vendor.coordinates.lat === 'number' && typeof vendor.coordinates.lng === 'number') {
          vendorCoordinates = vendor.coordinates;
        } else if (typeof vendor.lat === 'number' && typeof vendor.lng === 'number') {
          vendorCoordinates = { lat: vendor.lat, lng: vendor.lng };
        }
      } else if (service.service_details?.vendor?.coordinates) {
        const coords = service.service_details.vendor.coordinates;
        if (typeof coords.lat === 'number' && typeof coords.lng === 'number') {
          vendorCoordinates = coords;
        }
      }

      return {
        ...service,
        vendorFullAddress: vendorAddress,
        vendorAddress: vendorAddress,
        ...(vendorCoordinates ? { vendorCoordinates } : {})
      };
    });
  }, [selectedServices]);

  // Calculate distances for all services
  const destinationCoordinates = eventLocationData?.coordinates
    ? { lat: eventLocationData.coordinates.lat, lng: eventLocationData.coordinates.lng }
    : null;

  const { distancesByService } = useServiceDistances(
    servicesWithAddresses,
    formInputs.eventLocation || null,
    destinationCoordinates
  );

  // Auto-calculate delivery fees when distances are available
  const serviceDeliveryFeesRef = useRef(serviceDeliveryFees);
  serviceDeliveryFeesRef.current = serviceDeliveryFees;

  useEffect(() => {
    if (Object.keys(distancesByService).length === 0 || !formInputs.eventLocation) {
      return;
    }

    const newFees: Record<string, { range: string; fee: number }> = {};

    selectedServices.forEach((service) => {
      const serviceId = service.id || service.serviceId;
      if (!serviceId) return;

      const distance = distancesByService[serviceId];
      if (!distance || distance <= 0) return;

      // Skip if delivery fee already set for this service
      if (serviceDeliveryFeesRef.current[serviceId]) return;

      const deliveryOptions = service.service_details?.deliveryOptions ||
                             service.service_details?.catering?.deliveryOptions;

      if (deliveryOptions?.delivery && deliveryOptions.deliveryRanges) {
        const deliveryResult = calculateDeliveryFee(
          formInputs.eventLocation,
          deliveryOptions,
          distance
        );

        if (deliveryResult.eligible && deliveryResult.fee >= 0) {
          const matchingRange = deliveryOptions.deliveryRanges.find((range: any) =>
            range.range === deliveryResult.range
          );

          if (matchingRange) {
            newFees[serviceId] = matchingRange;
          }
        }
      }
    });

    // Apply all new fees at once
    if (Object.keys(newFees).length > 0) {
      setServiceDeliveryFees((prev) => {
        const filteredNewFees: Record<string, { range: string; fee: number }> = {};
        Object.keys(newFees).forEach((serviceId) => {
          if (!prev[serviceId]) {
            filteredNewFees[serviceId] = newFees[serviceId];
          }
        });
        if (Object.keys(filteredNewFees).length === 0) {
          return prev;
        }
        return { ...prev, ...filteredNewFees };
      });
    }
  }, [distancesByService, formInputs.eventLocation, selectedServices]);

  // Handler for delivery range selection
  const handleDeliveryRangeSelect = useCallback(
    (serviceIndex: number, range: { range: string; fee: number }) => {
      const service = selectedServices[serviceIndex];
      const serviceId = service?.id || service?.serviceId || `service-${serviceIndex}`;

      setServiceDeliveryFees((prev) => {
        if (prev[serviceId]?.range === range.range && prev[serviceId]?.fee === range.fee) {
          return prev;
        }
        return { ...prev, [serviceId]: range };
      });

      toast.success(`Delivery fee of $${range.fee} applied for ${range.range}`);
    },
    [selectedServices]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <div className="relative bg-gradient-to-br from-slate-900 to-slate-800">
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10">
            <Header />
          </div>
        </div>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <div className="text-lg font-medium">Loading order details...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="relative bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10">
          <Header />
        </div>
      </div>

      <main className="flex-1 py-8 px-4">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl sm:text-3xl font-bold">Edit Order</h1>
            </div>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>

          {orderData && (
            <div className="space-y-6">
              {/* Order Info Card */}
              <Card className="bg-card shadow-sm border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-foreground">Order Information</CardTitle>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        orderData.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        orderData.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        orderData.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        orderData.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {orderData.status?.charAt(0).toUpperCase() + orderData.status?.slice(1) || 'Unknown'}
                      </span>
                      {orderData.invoiceStatus && orderData.invoiceStatus !== orderData.status && (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          orderData.invoiceStatus === 'pending' ? 'bg-orange-100 text-orange-800' :
                          orderData.invoiceStatus === 'paid' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          Invoice: {orderData.invoiceStatus?.charAt(0).toUpperCase() + orderData.invoiceStatus?.slice(1)}
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground block">Invoice ID</span>
                      <p className="font-medium font-mono text-xs mt-1">{orderData.id?.slice(0, 8) || 'N/A'}...</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Created</span>
                      <p className="font-medium mt-1">
                        {orderData.createdAt ? new Date(orderData.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        }) : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Last Updated</span>
                      <p className="font-medium mt-1">
                        {orderData.updatedAt ? new Date(orderData.updatedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        }) : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Created By</span>
                      <p className="font-medium mt-1">
                        {orderData.createdBy?.firstName && orderData.createdBy?.lastName
                          ? `${orderData.createdBy.firstName} ${orderData.createdBy.lastName}`
                          : orderData.createdBy?.email || 'N/A'}
                      </p>
                    </div>
                    {orderData.paymentIntentId && (
                      <div className="col-span-2">
                        <span className="text-muted-foreground block">Payment ID</span>
                        <p className="font-medium font-mono text-xs mt-1">{orderData.paymentIntentId}</p>
                      </div>
                    )}
                    {orderData.totalAmount && (
                      <div>
                        <span className="text-muted-foreground block">Total Amount</span>
                        <p className="font-semibold text-lg text-primary mt-1">${parseFloat(orderData.totalAmount).toFixed(2)}</p>
                      </div>
                    )}
                  </div>

                  {/* Tax & Fee Status */}
                  {(orderData.taxExemptStatus || orderData.waiveServiceFee) && (
                    <>
                      <Separator className="my-4" />
                      <div className="flex flex-wrap gap-2">
                        {orderData.taxExemptStatus && (
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                            Tax Exempt
                          </span>
                        )}
                        {orderData.waiveServiceFee && (
                          <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-medium">
                            Service Fee Waived
                          </span>
                        )}
                      </div>
                    </>
                  )}

                  {/* Custom Line Items Summary */}
                  {orderData.customLineItems && orderData.customLineItems.length > 0 && (
                    <>
                      <Separator className="my-4" />
                      <div>
                        <span className="text-muted-foreground text-sm block mb-2">Custom Adjustments</span>
                        <div className="space-y-1">
                          {orderData.customLineItems.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center text-sm">
                              <span className={item.mode === 'discount' ? 'text-green-600' : 'text-orange-600'}>
                                {item.label}
                              </span>
                              <span className={`font-medium ${item.mode === 'discount' ? 'text-green-600' : 'text-orange-600'}`}>
                                {item.mode === 'discount' ? '-' : '+'}
                                {item.type === 'percentage' ? `${item.value}%` : `$${parseFloat(item.value).toFixed(2)}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

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
                    console.log(`[EditOrderPage] Processing service ${index}:`, service);
                    const processedService = getProcessedService(service);
                    console.log(`[EditOrderPage] Processed service ${index}:`, processedService);
                    
                    if (!processedService || !processedService.rawData) {
                      console.log(`[EditOrderPage] Service ${index} filtered out - no processedService or rawData`);
                      return null;
                    }
                    
                    return (
                      <div key={service.id || service.serviceId || `service-${index}`} className="w-full">
                        <BookingVendorCard
                          vendorImage={processedService.image}
                          vendorName={processedService.name}
                          vendorType={getServiceTypeLabel(processedService.serviceType)}
                          vendorPrice={processedService.priceDisplay}
                          serviceDetails={processedService.rawData}
                          selectedItems={selectedItems}
                          onItemQuantityChange={handleItemQuantityChange}
                          onComboSelection={handleComboSelection}
                          onRemoveService={() => {
                            handleRemoveService(index);
                            // Clean up delivery fee when service is removed
                            const serviceId = service.id || service.serviceId || `service-${index}`;
                            setServiceDeliveryFees((prev) => {
                              const updated = { ...prev };
                              delete updated[serviceId];
                              return updated;
                            });
                          }}
                          canRemove={true}
                          serviceIndex={index}
                          quantity={service?.quantity || 1}
                          onQuantityChange={(quantity) => {
                            setSelectedServices(prev =>
                              prev.map((s, i) => {
                                if (i === index) {
                                  // For services with items, remove totalPrice to force recalculation
                                  const hasItems = s.service_details?.catering?.menuItems?.length > 0 ||
                                                   s.service_details?.rentalItems?.length > 0 ||
                                                   s.service_details?.staffServices?.length > 0;
                                  if (hasItems) {
                                    const { totalPrice, ...serviceWithoutTotal } = s as any;
                                    return { ...serviceWithoutTotal, quantity } as typeof s;
                                  }
                                  // For services without items, calculate totalPrice from base price
                                  const sAny = s as any;
                                  const basePrice = parseFloat(String(s.price || sAny.servicePrice || '0'));
                                  return { ...s, quantity, totalPrice: basePrice * quantity } as any;
                                }
                                return s;
                              })
                            );
                          }}
                          showChangeService={false}
                          onDeliveryRangeSelect={handleDeliveryRangeSelect}
                          calculatedDistance={distancesByService[service.id || service.serviceId || ''] || undefined}
                          preselectedDeliveryFee={serviceDeliveryFees[service.id || service.serviceId || ''] || undefined}
                          guestCount={parseInt(formInputs.guestCount) || 1}
                        />
                      </div>
                    );
                  })}
                  
                  {selectedServices.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>No services selected. Click "Add Service" to get started.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Event Details Section */}
              <Card className="bg-card shadow-sm border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-foreground">Event Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="eventName" className="text-sm font-medium text-gray-700">
                        Event Name *
                      </Label>
                      <Input
                        id="eventName"
                        type="text"
                        value={formInputs.eventName || ''}
                        onChange={(e) => setFormInputs(prev => ({ ...prev, eventName: e.target.value }))}
                        className="mt-1"
                        placeholder="Annual Company Retreat"
                      />
                    </div>
                    <div>
                      <Label htmlFor="companyName" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        Company Name (Optional)
                        <span className="text-xs font-normal text-muted-foreground">For business events</span>
                      </Label>
                      <Input
                        id="companyName"
                        type="text"
                        value={formInputs.companyName || ''}
                        onChange={(e) => setFormInputs(prev => ({ ...prev, companyName: e.target.value }))}
                        className="mt-1"
                        placeholder="Acme Corporation"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Required for business invoices and tax compliance
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Event Date *
                      </Label>
                      <div className="mt-1">
                        <DatePicker
                          date={formInputs.eventDate ? new Date(formInputs.eventDate + 'T00:00:00') : undefined}
                          onSelect={(selectedDate) => {
                            if (selectedDate) {
                              const year = selectedDate.getFullYear();
                              const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                              const day = String(selectedDate.getDate()).padStart(2, '0');
                              const dateValue = `${year}-${month}-${day}`;
                              setFormInputs(prev => ({ ...prev, eventDate: dateValue }));
                            }
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Service Time *
                      </Label>
                      <div className="mt-1">
                        <TimePicker
                          time={formInputs.serviceTime || ''}
                          onSelect={(selectedTime) => {
                            setFormInputs(prev => ({ ...prev, serviceTime: selectedTime || '' }));
                          }}
                          placeholder="Select time"
                        />
                      </div>
                    </div>

                    <div className="lg:col-span-1 sm:col-span-2">
                      <Label htmlFor="guestCount" className="text-sm font-medium text-gray-700">
                        Guest Count *
                      </Label>
                      <Input
                        id="guestCount"
                        type="number"
                        min="1"
                        value={formInputs.guestCount || ''}
                        onChange={(e) => setFormInputs(prev => ({ ...prev, guestCount: e.target.value }))}
                        className="mt-1"
                        placeholder="50"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="eventLocation" className="text-sm font-medium text-gray-700">
                      Event Location *
                    </Label>
                    <div className="mt-1">
                      <GoogleMapsAutocomplete
                        id="eventLocation"
                        name="eventLocation"
                        value={formInputs.eventLocation || ''}
                        placeholder="Start typing your address..."
                        onAddressSelected={(address, locationData) => {
                          setFormInputs(prev => ({ ...prev, eventLocation: address }));
                          if (locationData) {
                            setEventLocationData(locationData);
                          }
                        }}
                      />
                    </div>

                    {formInputs.eventLocation && eventLocationData && (
                      <div className="text-xs text-muted-foreground bg-green-50 dark:bg-green-950 p-3 rounded space-y-1 border border-green-200 dark:border-green-800 mt-2">
                        <p className="font-medium text-green-700 dark:text-green-300">✓ Location verified with coordinates</p>

                        <div className="grid grid-cols-1 gap-1 mt-2">
                          {eventLocationData.street && eventLocationData.street !== 'N/A' && (
                            <div className="flex items-start gap-2">
                              <span className="font-semibold text-green-800 dark:text-green-200 min-w-[80px]">Address:</span>
                              <span className="text-green-600 dark:text-green-400">{eventLocationData.street}</span>
                            </div>
                          )}

                          {eventLocationData.city && eventLocationData.city !== 'N/A' && (
                            <div className="flex items-start gap-2">
                              <span className="font-semibold text-green-800 dark:text-green-200 min-w-[80px]">City:</span>
                              <span className="text-green-600 dark:text-green-400">{eventLocationData.city}</span>
                            </div>
                          )}

                          {eventLocationData.state && eventLocationData.state !== 'N/A' && (
                            <div className="flex items-start gap-2">
                              <span className="font-semibold text-green-800 dark:text-green-200 min-w-[80px]">State:</span>
                              <span className="text-green-600 dark:text-green-400">{eventLocationData.state}</span>
                            </div>
                          )}

                          {eventLocationData.zipCode && (
                            <div className="flex items-start gap-2">
                              <span className="font-semibold text-green-800 dark:text-green-200 min-w-[80px]">Zip Code:</span>
                              <span className="text-green-600 dark:text-green-400">{eventLocationData.zipCode}</span>
                            </div>
                          )}

                          {eventLocationData.coordinates && (
                            <div className="flex items-start gap-2 mt-2 pt-2 border-t border-green-200 dark:border-green-700">
                              <span className="font-semibold text-green-800 dark:text-green-200 min-w-[80px]">Coordinates:</span>
                              <span className="text-green-600 dark:text-green-400 font-mono text-[10px]">
                                {eventLocationData.coordinates.lat.toFixed(6)}, {eventLocationData.coordinates.lng.toFixed(6)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information Section */}
              <Card className="bg-card shadow-sm border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-foreground">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contactName" className="text-sm font-medium text-gray-700">
                        Contact Name *
                      </Label>
                      <Input
                        id="contactName"
                        type="text"
                        value={formInputs.contactName || ''}
                        onChange={(e) => setFormInputs(prev => ({ ...prev, contactName: e.target.value }))}
                        className="mt-1"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">
                        Phone Number *
                      </Label>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        value={formInputs.phoneNumber || ''}
                        onChange={(e) => setFormInputs(prev => ({ ...prev, phoneNumber: e.target.value }))}
                        className="mt-1"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="emailAddress" className="text-sm font-medium text-gray-700">
                      Email Address *
                    </Label>
                    <Input
                      id="emailAddress"
                      type="email"
                      value={formInputs.emailAddress || ''}
                      onChange={(e) => setFormInputs(prev => ({ ...prev, emailAddress: e.target.value }))}
                      className="mt-1"
                      placeholder="john@example.com"
                    />
                  </div>

                  {/* Backup Contact Section */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="hasBackupContact"
                        checked={formInputs.hasBackupContact || false}
                        onCheckedChange={(checked) => setFormInputs(prev => ({ ...prev, hasBackupContact: checked }))}
                      />
                      <Label htmlFor="hasBackupContact" className="text-sm font-medium">
                        Add backup contact
                      </Label>
                    </div>

                    {formInputs.hasBackupContact && (
                      <div className="space-y-3 pl-4 border-l-2 border-border">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="backupContactName" className="text-sm font-medium text-gray-700">
                              Backup Contact Name
                            </Label>
                            <Input
                              id="backupContactName"
                              type="text"
                              value={formInputs.backupContactName || ''}
                              onChange={(e) => setFormInputs(prev => ({ ...prev, backupContactName: e.target.value }))}
                              className="mt-1"
                              placeholder="Jane Smith"
                            />
                          </div>

                          <div>
                            <Label htmlFor="backupContactPhone" className="text-sm font-medium text-gray-700">
                              Backup Phone
                            </Label>
                            <Input
                              id="backupContactPhone"
                              type="tel"
                              value={formInputs.backupContactPhone || ''}
                              onChange={(e) => setFormInputs(prev => ({ ...prev, backupContactPhone: e.target.value }))}
                              className="mt-1"
                              placeholder="(555) 987-6543"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="backupContactEmail" className="text-sm font-medium text-gray-700">
                            Backup Email
                          </Label>
                          <Input
                            id="backupContactEmail"
                            type="email"
                            value={formInputs.backupContactEmail || ''}
                            onChange={(e) => setFormInputs(prev => ({ ...prev, backupContactEmail: e.target.value }))}
                            className="mt-1"
                            placeholder="jane@example.com"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Additional Notes */}
                  <div>
                    <Label htmlFor="additionalNotes" className="text-sm font-medium text-gray-700">
                      Additional Notes
                    </Label>
                    <Textarea
                      id="additionalNotes"
                      value={formInputs.additionalNotes || ''}
                      onChange={(e) => setFormInputs(prev => ({ ...prev, additionalNotes: e.target.value }))}
                      className="mt-1"
                      rows={3}
                      placeholder="Any special dietary restrictions, setup requirements, or other notes..."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Admin Controls - Tax & Fee Settings (Admin Only) */}
              {(userRole === 'admin' || userRole === 'super-admin' || userRole === 'super_admin') && (
                <>
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
                </>
              )}

              {/* Order Summary Section */}
              {selectedServices.length > 0 && (
                <EnhancedOrderSummaryCard
                  selectedServices={selectedServices}
                  selectedItems={selectedItems}
                  showDetailedBreakdown={false}
                  customAdjustments={customAdjustments}
                  isTaxExempt={isTaxExempt}
                  isServiceFeeWaived={isServiceFeeWaived}
                  serviceDeliveryFees={serviceDeliveryFees}
                  serviceDistances={distancesByService}
                  guestCount={parseInt(formInputs.guestCount) || 1}
                />
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default EditOrderPage;