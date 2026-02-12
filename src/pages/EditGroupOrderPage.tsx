import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import Header from '@/components/cater-directly/Header';
import Footer from '@/components/cater-directly/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DatePicker } from '@/components/ui/date-picker';
import { TimePicker } from '@/components/ui/time-picker';
import { ArrowLeft, Save, Plus, User, X } from 'lucide-react';
import invoiceService from '@/services/api/invoice.Service';
import BookingVendorCard from '@/components/booking/BookingVendorCard';
import EnhancedOrderSummaryCard from '@/components/booking/order-summary/EnhancedOrderSummaryCard';
import { ServiceSelection } from '@/types/order';
import { processService } from '@/utils/service-item-processor';
import { getServiceTypeLabel } from '@/utils/service-utils';
import { useServiceDistances } from '@/hooks/use-service-distances';
import { getServiceAddress, calculateDeliveryFee } from '@/utils/delivery-calculations';
import { LocationData } from '@/components/shared/address/types';

function EditGroupOrderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [selectedServices, setSelectedServices] = useState<ServiceSelection[]>([]);
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});
  const [formInputs, setFormInputs] = useState<any>({});
  const [invitedGuests, setInvitedGuests] = useState<string[]>([]);
  const [newGuestEmail, setNewGuestEmail] = useState('');
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
          console.log('📋 [EditGroupOrderPage] Invoice data from API:', invoiceData);
          console.log('👥 [EditGroupOrderPage] inviteFriends:', invoiceData.inviteFriends);
          console.log('💳 [EditGroupOrderPage] paymentSettings:', invoiceData.paymentSettings);
          console.log('📅 [EditGroupOrderPage] orderDeadline:', invoiceData.orderDeadline);
          setOrderData(invoiceData);
          
          // Map services from API to ServiceSelection format (same as EditOrderPage)
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
                
                return {
                  id: item.cateringId || item.id,
                  name: item.menuItemName || item.name,
                  price: parseFloat(item.price || 0),
                  category: item.menuName || 'Menu',
                  menuName: item.menuName,
                  menuItemName: item.menuItemName,
                  isCombo: comboCategoryItems.length > 0 || item.isCombo || false,
                  comboCategories: comboCategoryItems.length > 0 ? [{
                    id: 'combo-category',
                    name: 'Combo Items',
                    items: comboCategoryItems.map((comboItem: any) => ({
                      id: comboItem.cateringId,
                      name: comboItem.menuItemName,
                      price: parseFloat(comboItem.price || 0),
                      image: comboItem.image || comboItem.imageUrl || '',
                      quantity: comboItem.quantity || 0
                    }))
                  }] : item.comboCategories || [],
                  comboCategoryItems: comboCategoryItems,
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
                  menuItems: menuItemsWithImages
                },
                menuItems: menuItemsWithImages,
                comboCategoryItems: mappedComboCategoryItems
              };
            } else if (serviceType === 'party_rentals' || serviceType === 'party-rentals' || serviceType === 'party-rental') {
              serviceDetails = {
                rentalItems: rentalItems,
                rental: {
                  items: rentalItems
                }
              };
            } else if (serviceType === 'events_staff' || serviceType === 'staff') {
              serviceDetails = {
                staffServices: staffItems,
                services: staffItems,
                staff: {
                  services: staffItems
                }
              };
            } else if (serviceType === 'venues' || serviceType === 'venue') {
              serviceDetails = {
                venueOptions: venueItems,
                options: venueItems
              };
            }
            
            return {
              id: serviceId,
              serviceId: serviceId,
              name: service.serviceName,
              serviceName: service.serviceName,
              price: parseFloat(service.price) || 0,
              servicePrice: service.price,
              totalPrice: parseFloat(service.totalPrice) || parseFloat(service.price) || 0,
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
              serviceImage: service.image || service.imageUrl || ''
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
          
          // Parse orderDeadline if it exists (format: "YYYY-MM-DD" or "YYYY-MM-DDTHH:MM:SS")
          let orderDeadlineDate = '';
          let orderDeadlineTime = '';
          if (invoiceData.orderDeadline) {
            const deadlineParts = invoiceData.orderDeadline.split('T');
            orderDeadlineDate = deadlineParts[0] || '';
            if (deadlineParts[1]) {
              orderDeadlineTime = deadlineParts[1].substring(0, 5); // Get HH:MM
            }
          }
          
          // Normalize payment settings (API returns "host-pays", UI expects "host_pays_everything")
          let normalizedPaymentSettings = invoiceData.paymentSettings || 'host_pays_everything';
          if (normalizedPaymentSettings === 'host-pays') {
            normalizedPaymentSettings = 'host_pays_everything';
          }
          
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
            // Group order specific fields
            budgetPerPerson: invoiceData.budgetPerPerson || 30,
            budget: invoiceData.budget || 0,
            selectItem: invoiceData.selectItem || 'catering',
            quantity: invoiceData.quantity || 1,
            orderDeadline: invoiceData.orderDeadline || '',
            orderDeadlineDate: orderDeadlineDate,
            orderDeadlineTime: orderDeadlineTime,
            paymentSettings: normalizedPaymentSettings,
            hasBackupContact: invoiceData.hasBackupContact || false,
            backupContactName: invoiceData.backupContactName || '',
            backupContactPhone: invoiceData.backupContactPhone || '',
            backupContactEmail: invoiceData.backupContactEmail || ''
          });
          
          // Set invited guests - API returns 'invites' array
          if (invoiceData.invites && Array.isArray(invoiceData.invites)) {
            const guestEmails = invoiceData.invites.map((invite: any) => invite.email).filter(Boolean);
            console.log('✉️ [EditGroupOrderPage] Setting invited guests:', guestEmails);
            setInvitedGuests(guestEmails);
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
      
      // Prepare the updated order data for group order using the exact backend format
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
        budgetPerPerson: parseFloat(formInputs.budgetPerPerson) || orderData?.budgetPerPerson || 0,
        budget: parseFloat(formInputs.budget) || orderData?.budget || 0,
        selectItem: formInputs.selectItem || orderData?.selectItem || 'catering',
        quantity: parseInt(formInputs.quantity) || orderData?.quantity || 0,
        orderDeadline: formInputs.orderDeadlineDate ? `${formInputs.orderDeadlineDate}T${formInputs.orderDeadlineTime || '00:00'}:00` : orderData?.orderDeadline || '',
        inviteFriends: invitedGuests.map(email => ({ email, acceptanceStatus: 'pending' })),
        additionalNotes: formInputs.additionalNotes || orderData?.additionalNotes || '',
        paymentSettings: formInputs.paymentSettings || 'split_equally_between_all_guests',
        services: selectedServices.map(service => {
          const serviceType = (service.serviceType || service.type || '').toLowerCase().replace(/-/g, '_');
          
          // Helper function to parse price strings like "$10.00" or "10.00"
          const parsePrice = (priceStr: any): number => {
            if (!priceStr) return 0;
            const cleanPrice = priceStr.toString().replace(/[^0-9.]/g, '');
            return parseFloat(cleanPrice) || 0;
          };
          
          const basePrice = parsePrice(service.price) || parsePrice(service.servicePrice) || 0;
          
          const serviceId = service.id || service.serviceId;
          const serviceImage = service.image || service.imageUrl || service.serviceImage || serviceImageMap.get(serviceId) || '';
          
          const baseService: any = {
            serviceType,
            serviceName: service.serviceName || service.name || '',
            totalPrice: 0,
            priceType: serviceType === 'staff' || serviceType === 'events_staff' ? 'hourly' : 'flat',
            price: basePrice,
            quantity: service.quantity || 1,
            vendorId: service.vendor_id || service.vendorId || '',
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
                          menuName: category.name || 'Combo Menu',
                          menuItemName: comboItem.name,
                          image: comboItemImage,
                          price: parseFloat(comboItem.price || 0),
                          quantity,
                          totalPrice: parseFloat(comboItem.price || 0) * quantity,
                          serviceId: service.id,
                          cateringId: comboItem.id,
                          comboId: item.id,
                          isComboCategoryItem: true
                        });
                      }
                    });
                  });
                }
              });
            }
            
            baseService.cateringItems = cateringItems;

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
            
            if (!hasItems) {
              const quantity = service.quantity || 1;
              return {
                serviceType: 'party_rentals',
                serviceName: service.serviceName || service.name || '',
                totalPrice: basePrice * quantity,
                priceType: 'flat',
                price: basePrice,
                quantity: quantity,
                vendorId: service.vendor_id || service.vendorId || '',
                image: serviceImage
              };
            }
            
            baseService.partyRentalItems = rentalItems;
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
            
            if (!hasItems) {
              const quantity = service.quantity || 1;
              return {
                serviceType: 'events_staff',
                serviceName: service.serviceName || service.name || '',
                totalPrice: basePrice * quantity,
                priceType: 'hourly',
                price: basePrice,
                quantity: quantity,
                vendorId: service.vendor_id || service.vendorId || '',
                image: serviceImage
              };
            }
            
            baseService.staffItems = staffItems;
            const staffTotal = staffItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
            baseService.totalPrice = staffTotal;
          } else if (serviceType === 'venue' || serviceType === 'venues') {
            const quantity = service.quantity || 1;
            return {
              serviceType: 'venues',
              serviceName: service.serviceName || service.name || '',
              totalPrice: basePrice * quantity,
              priceType: 'flat',
              price: basePrice,
              quantity: quantity,
              vendorId: service.vendor_id || service.vendorId || '',
              image: serviceImage
            };
          }
          
          return baseService;
        }),
        customLineItems: []
      };
      
      // Call API to update the order
      console.log('🚀 [EditGroupOrderPage] Sending PATCH request to update group invoice:', id);
      console.log('📦 [EditGroupOrderPage] Request body:', JSON.stringify(updatedOrderData, null, 2));
      await invoiceService.updateInvoice(id!, updatedOrderData);
      
      toast.success('Group order updated successfully');
      navigate(`/order-summary/${id}`);
    } catch (error: any) {
      console.error('Failed to update group order:', error);
      
      if (error?.response?.status === 401) {
        toast.error('Session expired', {
          description: 'Please log in again to continue.'
        });
        navigate('/login');
      } else {
        toast.error('Failed to update group order', {
          description: error?.response?.data?.message || error?.message || 'Please try again.'
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/order-summary/${id}`);
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
        returnToEditOrder: `/edit-group-order/${id}`
      }
    });
  };

  const handleRemoveService = (index: number) => {
    const serviceToRemove = selectedServices[index];
    const serviceId = serviceToRemove?.id || serviceToRemove?.serviceId;
    
    setSelectedServices(prev => prev.filter((_, i) => i !== index));
    
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
        const { totalPrice, ...serviceWithoutTotal } = service;
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
            <div className="text-lg font-medium">Loading group order details...</div>
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
              <h1 className="text-2xl sm:text-3xl font-bold">Edit Group Order</h1>
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
                                    const { totalPrice, ...serviceWithoutTotal } = s;
                                    return { ...serviceWithoutTotal, quantity } as typeof s;
                                  }
                                  // For services without items, calculate totalPrice from base price
                                  const basePrice = parseFloat(s.price || s.servicePrice || '0');
                                  return { ...s, quantity, totalPrice: basePrice * quantity };
                                }
                                return s;
                              })
                            );
                          }}
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

              {/* Order Setup Section */}
              <div className="bg-white border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Order Setup</h2>
                
                {/* Budget Section */}
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Budget per Person</Label>
                      <div className="relative mt-1">
                        <span className="absolute left-3 top-3 text-gray-500">$</span>
                        <Input
                          type="number"
                          value={formInputs.budgetPerPerson || ''}
                          onChange={(e) => setFormInputs(prev => ({ ...prev, budgetPerPerson: parseFloat(e.target.value) || 0 }))}
                          className="pl-8"
                          placeholder="Enter Amount"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Budget (group orders will always be individual)</Label>
                      <Input
                        type="number"
                        value={formInputs.budget || ''}
                        onChange={(e) => setFormInputs(prev => ({ ...prev, budget: parseFloat(e.target.value) || 0 }))}
                        className="mt-1"
                        placeholder="Enter Amount"
                      />
                    </div>
                  </div>
                </div>

                {/* Order Deadline Section */}
                <div className="space-y-4 mb-6">
                  <div>
                    <Label className="text-sm font-medium">Order Deadline</Label>
                    <p className="text-xs text-gray-500 mb-2">Set the deadline for guests to place their orders</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <DatePicker
                          date={formInputs.orderDeadlineDate ? new Date(formInputs.orderDeadlineDate + 'T00:00:00') : undefined}
                          onSelect={(selectedDate) => {
                            if (selectedDate) {
                              const year = selectedDate.getFullYear();
                              const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                              const day = String(selectedDate.getDate()).padStart(2, '0');
                              const dateValue = `${year}-${month}-${day}`;
                              setFormInputs(prev => ({ ...prev, orderDeadlineDate: dateValue }));
                            } else {
                              setFormInputs(prev => ({ ...prev, orderDeadlineDate: '' }));
                            }
                          }}
                          disabled={(date) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            return date < today;
                          }}
                        />
                      </div>
                      <div>
                        <TimePicker
                          time={formInputs.orderDeadlineTime || ''}
                          onSelect={(selectedTime) => {
                            setFormInputs(prev => ({ ...prev, orderDeadlineTime: selectedTime || '' }));
                          }}
                          placeholder="Select time"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Invite Friends Section */}
                <div className="space-y-4 mb-6">
                  <div>
                    <Label className="text-sm font-medium">Invite Friends</Label>
                    <div className="flex gap-3 mt-2">
                      <Input
                        type="email"
                        value={newGuestEmail}
                        onChange={(e) => setNewGuestEmail(e.target.value)}
                        placeholder="Enter Email Address"
                        className="flex-1"
                      />
                      <Button 
                        type="button"
                        onClick={() => {
                          if (!newGuestEmail) return;
                          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newGuestEmail)) {
                            toast.error('Please enter a valid email address');
                            return;
                          }
                          if (!invitedGuests.includes(newGuestEmail)) {
                            setInvitedGuests(prev => [...prev, newGuestEmail]);
                            setNewGuestEmail('');
                          } else {
                            toast.error('Guest already invited');
                          }
                        }}
                        className="bg-[#469A7E] hover:bg-[#469A7E]/90"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Invited Guests List */}
                    <div className="space-y-2 mt-4">
                      {invitedGuests.map((email) => (
                        <div key={email} className="flex items-center justify-between p-4 border rounded-lg bg-white">
                          <div className="flex items-center gap-4">
                            <User className="h-10 w-10 p-2 bg-gray-100 rounded-full text-gray-500" />
                            <span className="text-sm font-medium">{email}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setInvitedGuests(prev => prev.filter(g => g !== email))}
                          >
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Payment Settings Section */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Payment Settings</Label>
                  <RadioGroup 
                    value={formInputs.paymentSettings || 'host_pays_everything'} 
                    onValueChange={(value) => setFormInputs(prev => ({ ...prev, paymentSettings: value }))}
                    className="space-y-3"
                  >
                    <div className="flex items-start space-x-2 border p-3 rounded-md">
                      <RadioGroupItem value="host_pays_everything" id="host-pays" />
                      <div className="grid gap-1.5">
                        <Label htmlFor="host-pays" className="font-medium">Host pays for everything</Label>
                        <p className="text-sm text-gray-500">
                          You will be charged for all guest orders upon approval
                        </p>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              {/* Event Details Section */}
              <div className="bg-white border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Event Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Event Name</label>
                    <input
                      type="text"
                      value={formInputs.eventName || ''}
                      onChange={(e) => setFormInputs(prev => ({ ...prev, eventName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Company</label>
                    <input
                      type="text"
                      value={formInputs.companyName || ''}
                      onChange={(e) => setFormInputs(prev => ({ ...prev, companyName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Event Date</label>
                    <input
                      type="date"
                      value={formInputs.eventDate || ''}
                      onChange={(e) => setFormInputs(prev => ({ ...prev, eventDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Service Time</label>
                    <input
                      type="time"
                      value={formInputs.serviceTime || ''}
                      onChange={(e) => setFormInputs(prev => ({ ...prev, serviceTime: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Guest Count</label>
                    <input
                      type="number"
                      value={formInputs.guestCount || ''}
                      onChange={(e) => setFormInputs(prev => ({ ...prev, guestCount: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Event Location</label>
                    <input
                      type="text"
                      value={formInputs.eventLocation || ''}
                      onChange={(e) => setFormInputs(prev => ({ ...prev, eventLocation: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="bg-white border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Contact Name</label>
                    <input
                      type="text"
                      value={formInputs.contactName || ''}
                      onChange={(e) => setFormInputs(prev => ({ ...prev, contactName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address</label>
                    <input
                      type="email"
                      value={formInputs.emailAddress || ''}
                      onChange={(e) => setFormInputs(prev => ({ ...prev, emailAddress: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={formInputs.phoneNumber || ''}
                      onChange={(e) => setFormInputs(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
                
                {/* Backup Contact Section */}
                <div className="space-y-3">
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
                    <div className="space-y-3 pl-4 border-l-2 border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Backup Contact Name</label>
                          <input
                            type="text"
                            value={formInputs.backupContactName || ''}
                            onChange={(e) => setFormInputs(prev => ({ ...prev, backupContactName: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Jane Smith"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">Backup Phone</label>
                          <input
                            type="tel"
                            value={formInputs.backupContactPhone || ''}
                            onChange={(e) => setFormInputs(prev => ({ ...prev, backupContactPhone: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="(555) 987-6543"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Backup Email</label>
                        <input
                          type="email"
                          value={formInputs.backupContactEmail || ''}
                          onChange={(e) => setFormInputs(prev => ({ ...prev, backupContactEmail: e.target.value }))}
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
                  value={formInputs.additionalNotes || ''}
                  onChange={(e) => setFormInputs(prev => ({ ...prev, additionalNotes: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Any special dietary restrictions, setup requirements, or other notes..."
                />
              </div>

              {/* Order Summary Section */}
              {selectedServices.length > 0 && (
                <div className="bg-white border rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                  <EnhancedOrderSummaryCard
                    selectedServices={selectedServices}
                    selectedItems={selectedItems}
                    showDetailedBreakdown={false}
                    serviceDeliveryFees={serviceDeliveryFees}
                    serviceDistances={distancesByService}
                    guestCount={parseInt(formInputs.guestCount) || 1}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default EditGroupOrderPage;