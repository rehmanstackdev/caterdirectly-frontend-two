import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import Dashboard from '@/components/dashboard/Dashboard';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, Plus } from 'lucide-react';
import invoiceService from '@/services/api/invoice.Service';
import BookingVendorCard from '@/components/booking/BookingVendorCard';
import EnhancedOrderSummaryCard from '@/components/booking/order-summary/EnhancedOrderSummaryCard';
import AdminTaxAndFeeControls from '@/components/booking/admin/AdminTaxAndFeeControls';
import AdminCustomAdjustments from '@/components/booking/admin/AdminCustomAdjustments';
import { ServiceSelection } from '@/types/order';
import { CustomAdjustment } from '@/types/adjustments';
import { processService } from '@/utils/service-item-processor';
import { getServiceTypeLabel } from '@/utils/service-utils';

function AdminEditInvoicePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
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

  useEffect(() => {
    const loadOrderData = async () => {
      if (!id) {
        toast.error('No invoice ID provided');
        navigate('/admin/invoices');
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
      
      // Skip API call if we already processed session data
      if (hasProcessedSessionRef.current) {
        setIsLoading(false);
        return;
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
                catering: { menuItems: menuItemsWithImages },
                menuItems: menuItemsWithImages,
                comboCategoryItems: mappedComboCategoryItems
              };
            } else if (serviceType === 'party_rentals' || serviceType === 'party-rentals' || serviceType === 'party-rental') {
              serviceDetails = {
                rentalItems: rentalItems,
                rental: { items: rentalItems }
              };
            } else if (serviceType === 'events_staff' || serviceType === 'staff') {
              serviceDetails = {
                staffServices: staffItems,
                services: staffItems,
                staff: { services: staffItems }
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
        } else {
          toast.error('Invoice not found');
          navigate('/admin/invoices');
        }
      } catch (error) {
        toast.error('Failed to load invoice data');
        navigate('/admin/invoices');
      } finally {
        setIsLoading(false);
      }
    };

    loadOrderData();
  }, [id, navigate]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const invoiceResponse = await invoiceService.getInvoiceOrderSummary(id!);
      const existingInvoice = invoiceResponse?.data?.invoice || {};
      
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
      
      const updatedOrderData = {
        eventName: formInputs.eventName || orderData.eventName || '',
        companyName: formInputs.companyName || orderData.companyName || '',
        eventLocation: formInputs.eventLocation || orderData.eventLocation || '',
        eventDate: formInputs.eventDate || orderData.eventDate || '',
        serviceTime: formInputs.serviceTime || orderData.serviceTime || '',
        guestCount: formInputs.guestCount || orderData.guestCount || 1,
        contactName: formInputs.contactName || orderData.contactName || '',
        phoneNumber: formInputs.phoneNumber || orderData.phoneNumber || '',
        emailAddress: formInputs.emailAddress || orderData.emailAddress || '',
        additionalNotes: formInputs.additionalNotes || orderData.additionalNotes || '',
        addBackupContact: formInputs.hasBackupContact || false,
        taxExemptStatus: isTaxExempt,
        waiveServiceFee: isServiceFeeWaived,
        adminOverrideNotes: adminNotes,
        services: selectedServices.map(service => {
          const serviceType = (service.serviceType || service.type || '').toLowerCase().replace(/-/g, '_');
          
          const parsePrice = (priceStr: any): number => {
            if (!priceStr) return 0;
            const cleanPrice = priceStr.toString().replace(/[^0-9.]/g, '');
            return parseFloat(cleanPrice) || 0;
          };
          
          const servicePrice = parsePrice((service as any).totalPrice) || parsePrice(service.price) || parsePrice((service as any).servicePrice) || 0;
          const serviceId = service.id || (service as any).serviceId;
          const serviceImage = service.image || (service as any).imageUrl || (service as any).serviceImage || serviceImageMap.get(serviceId) || '';
          
          const baseService: any = {
            serviceType,
            serviceName: service.serviceName || service.name || '',
            image: serviceImage,
            totalPrice: servicePrice,
            priceType: serviceType === 'staff' ? 'hourly' : 'flat',
            vendorId: service.vendor_id
          };

          if (serviceType === 'catering') {
            const cateringItems: any[] = [];
            
            if (service.service_details?.catering?.menuItems) {
              service.service_details.catering.menuItems.forEach((item: any) => {
                const quantity = selectedItems[item.id] || 1;
                if (quantity > 0) {
                  const itemImage = item.image || item.imageUrl || itemImageMap.get(item.id) || '';
                  cateringItems.push({
                    menuName: item.menuName || item.category || 'Menu',
                    menuItemName: item.menuItemName || item.name,
                    image: itemImage,
                    price: parseFloat(item.price || 0),
                    quantity,
                    totalPrice: parseFloat(item.price || 0) * quantity,
                    cateringId: item.id,
                    isComboCategoryItem: false
                  });
                }
              });
            }
            
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
          } else if (serviceType === 'party_rentals') {
            const rentalItems: any[] = [];
            let hasItems = false;
            
            if (service.service_details?.rentalItems || service.service_details?.rental?.items) {
              const items = service.service_details.rentalItems || service.service_details.rental.items;
              items.forEach((item: any) => {
                const quantity = selectedItems[item.id] || 1;
                if (quantity > 0) {
                  hasItems = true;
                  rentalItems.push({
                    name: item.name,
                    quantity,
                    eachPrice: parseFloat(item.price || 0),
                    totalPrice: parseFloat(item.price || 0) * quantity,
                    rentalId: item.id
                  });
                }
              });
            }
            
            if (!hasItems) {
              const quantity = service.quantity || 1;
              return {
                serviceType: 'party_rentals',
                serviceName: service.serviceName || service.name || '',
                image: serviceImage,
                vendorId: service.vendor_id,
                price: servicePrice,
                quantity: quantity,
                totalPrice: servicePrice * quantity,
                priceType: 'flat'
              };
            }
            
            baseService.partyRentalItems = rentalItems;
          } else if (serviceType === 'staff' || serviceType === 'events_staff') {
            const staffItems: any[] = [];
            let hasItems = false;
            
            if (service.service_details?.staffServices || service.service_details?.staff?.services) {
              const items = service.service_details.staffServices || service.service_details.staff.services;
              items.forEach((item: any) => {
                const quantity = selectedItems[item.id] || 1;
                const duration = selectedItems[`${item.id}_duration`] || service.duration || 1;
                if (quantity > 0) {
                  hasItems = true;
                  staffItems.push({
                    name: item.name,
                    pricingType: item.pricingType || 'hourly',
                    perHourPrice: parseFloat(item.perHourPrice || item.price || 0),
                    hours: duration,
                    totalPrice: item.pricingType === 'flat' ? parseFloat(item.price || 0) : parseFloat(item.perHourPrice || item.price || 0) * duration,
                    staffId: item.id
                  });
                }
              });
            }
            
            if (!hasItems) {
              const quantity = service.quantity || 1;
              return {
                serviceType: 'events_staff',
                serviceName: service.serviceName || service.name || '',
                image: serviceImage,
                vendorId: service.vendor_id,
                price: servicePrice,
                quantity: quantity,
                totalPrice: servicePrice * quantity,
                priceType: 'hourly'
              };
            }
            
            baseService.staffItems = staffItems;
          } else if (serviceType === 'venue' || serviceType === 'venues') {
            const quantity = service.quantity || 1;
            let actualServicePrice = servicePrice;
            
            if (actualServicePrice === 0) {
              if (service.service_details?.venueOptions?.[0]?.price) {
                actualServicePrice = parsePrice(service.service_details.venueOptions[0].price);
              } else if (service.service_details?.options?.[0]?.price) {
                actualServicePrice = parsePrice(service.service_details.options[0].price);
              }
            }
            
            return {
              serviceType: 'venues',
              serviceName: service.serviceName || service.name || '',
              image: serviceImage,
              vendorId: service.vendor_id,
              price: actualServicePrice,
              quantity: quantity,
              totalPrice: actualServicePrice * quantity,
              priceType: 'flat'
            };
          }
          
          return baseService;
        }),
        customLineItems: customAdjustments.map((adj) => ({
          label: adj.label || '',
          type: adj.type || 'fixed',
          mode: adj.mode || 'surcharge',
          value: adj.value || 0,
          taxable: adj.taxable || false,
          statusForDrafting: false
        }))
      };
      
      await invoiceService.updateInvoice(id!, updatedOrderData);
      
      toast.success('Invoice updated successfully');
      navigate(`/admin/invoices/${id}`);
    } catch (error) {
      toast.error('Failed to update invoice');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/admin/invoices/${id}`);
  };

  const handleAddService = () => {
    sessionStorage.setItem('editOrderState', JSON.stringify({
      editOrderId: id,
      services: selectedServices,
      selectedItems: selectedItems,
      orderData: orderData,
      formInputs: formInputs
    }));
    
    navigate('/admin/marketplace', {
      state: {
        fromEditOrder: true,
        editOrderId: id,
        currentEditOrderServices: selectedServices,
        returnToEditOrder: `/admin/invoices/edit/${id}`
      }
    });
  };

  const handleRemoveService = (index: number) => {
    setSelectedServices(prev => prev.filter((_, i) => i !== index));
  };

  const handleItemQuantityChange = useCallback((itemId: string, quantity: number) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: quantity
    }));
    
    setSelectedServices(prev => 
      prev.map(service => {
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

  if (isLoading) {
    return (
      <Dashboard activeTab="invoices" userRole="admin">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <div className="text-lg font-medium">Loading invoice details...</div>
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
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleCancel}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold">Edit Invoice</h1>
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
                        onRemoveService={() => handleRemoveService(index)}
                        canRemove={true}
                        serviceIndex={index}
                        quantity={service?.quantity || 1}
                        onQuantityChange={(quantity) => {
                          setSelectedServices(prev => 
                            prev.map((s, i) => {
                              if (i === index) {
                                const hasItems = s.service_details?.catering?.menuItems?.length > 0 ||
                                                 s.service_details?.rentalItems?.length > 0 ||
                                                 s.service_details?.staffServices?.length > 0;
                                if (hasItems) {
                                  const { totalPrice, ...serviceWithoutTotal } = s as any;
                                  return { ...serviceWithoutTotal, quantity } as typeof s;
                                }
                                const basePrice = parseFloat(String(s.price || (s as any).servicePrice || '0'));
                                return { ...s, quantity, totalPrice: basePrice * quantity } as any;
                              }
                              return s;
                            })
                          );
                        }}
                        showChangeService={false}
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
                  <label className="block text-sm font-medium mb-2">
                    Company Name (Optional)
                    <span className="text-xs font-normal text-gray-500 ml-2">For business events</span>
                  </label>
                  <input
                    type="text"
                    value={formInputs.companyName || ''}
                    onChange={(e) => setFormInputs(prev => ({ ...prev, companyName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Acme Corporation"
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
              <div className="mt-4 space-y-3">
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

            {/* Invoice Summary Section */}
            {selectedServices.length > 0 && (
              <div className="bg-white border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Invoice Summary</h2>
                <EnhancedOrderSummaryCard
                  selectedServices={selectedServices}
                  selectedItems={selectedItems}
                  showDetailedBreakdown={false}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </Dashboard>
  );
}

export default AdminEditInvoicePage;

