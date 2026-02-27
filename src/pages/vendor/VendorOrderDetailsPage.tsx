import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VendorDashboard from '@/components/vendor/dashboard/VendorDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import invoiceService from '@/services/api/invoice.Service';
import { useVendorData } from '@/hooks/vendor/use-vendor-data';
import { format } from 'date-fns';
import React from 'react';

function VendorOrderDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { vendorData } = useVendorData();
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState<any>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!id || !vendorData?.id) return;

      try {
        setLoading(true);
        const response = await invoiceService.getInvoiceOrderSummary(id);

        if (response?.data?.invoice) {
          const invoiceData = response.data.invoice;

          // Filter services to only include those from the logged-in vendor
          const vendorServices = (invoiceData.services || []).filter(
            (service: any) => service.vendorId === vendorData.id
          );

          // Build selectedItems from service items
          const mappedSelectedItems: Record<string, number> = {};

          // Map services to ServiceSelection format
          const mappedServices = vendorServices.map((service: any) => {
            const serviceType = service.serviceType || '';
            let menuItems: any[] = [];
            let rentalItems: any[] = [];
            let staffItems: any[] = [];

            if (service.cateringItems && service.cateringItems.length > 0) {
              menuItems = service.cateringItems.map((item: any) => {
                const itemImage = item.image || item.imageUrl || item.menuItemImage || '';
                const comboCategoryItems = vendorServices.flatMap((s: any) => 
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
                  comboCategoryItems: comboCategoryItems,
                  comboCategories: item.comboCategories || [],
                  priceType: item.priceType || 'fixed',
                  image: itemImage,
                  imageUrl: itemImage,
                  description: item.description || '',
                  isComboCategoryItem: false
                };
              });
              
              // Build selectedItems from cateringItems
              service.cateringItems.forEach((item: any) => {
                const itemId = item.cateringId || item.id;
                if (itemId) {
                  mappedSelectedItems[itemId] = (mappedSelectedItems[itemId] || 0) + (item.quantity || 1);
                }
              });
            }

            // Add combo category items from comboCategoryItems array


            if (service.partyRentalItems && service.partyRentalItems.length > 0) {
              rentalItems = service.partyRentalItems.map((item: any) => ({
                id: item.rentalId || item.id,
                name: item.name,
                price: parseFloat(item.eachPrice || item.price || 0),
                priceType: 'fixed'
              }));
              
              // Build selectedItems from partyRentalItems
              service.partyRentalItems.forEach((item: any) => {
                const itemId = item.rentalId || item.id;
                if (itemId) {
                  mappedSelectedItems[itemId] = (mappedSelectedItems[itemId] || 0) + (item.quantity || 1);
                }
              });
            }

            if (service.staffItems && service.staffItems.length > 0) {
              staffItems = service.staffItems.map((item: any) => ({
                id: item.staffId || item.id,
                name: item.name,
                price: parseFloat(item.perHourPrice || item.price || 0),
                pricingType: item.pricingType || 'hourly',
                perHourPrice: parseFloat(item.perHourPrice || item.price || 0)
              }));
              
              // Build selectedItems from staffItems
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

            let serviceDetails: any = {};
            if (serviceType === 'catering') {
              serviceDetails = { catering: { menuItems }, menuItems };
            } else if (serviceType === 'party_rentals' || serviceType === 'party-rentals') {
              serviceDetails = { rentalItems, rental: { items: rentalItems } };
            } else if (serviceType === 'events_staff' || serviceType === 'staff') {
              serviceDetails = { staffServices: staffItems, services: staffItems, staff: { services: staffItems } };
            }

            return {
              id: service.id,
              serviceId: service.id,
              name: service.serviceName,
              serviceName: service.serviceName,
              price: parseFloat(service.price) || 0,
              totalPrice: parseFloat(service.totalPrice) || 0,
              quantity: service.quantity || 1,
              duration: service.staffItems?.[0]?.hours || 0,
              serviceType: serviceType,
              type: serviceType,
              vendor_id: service.vendorId,
              priceType: service.priceType || 'flat',
              service_details: serviceDetails,
              image: service.image || service.imageUrl || '',
              imageUrl: service.imageUrl || service.image || '',
              vendorStatus: service.vendorStatus || 'pending',
              deliveryFee: service.deliveryFee || null
            };
          });

          const formData = {
            invoiceId: invoiceData.id,
            eventName: invoiceData.eventName || '',
            company: invoiceData.companyName || '',
            location: invoiceData.eventLocation || '',
            date: invoiceData.eventDate || '',
            time: invoiceData.serviceTime || '',
            headcount: invoiceData.guestCount || 1,
            primaryContactName: invoiceData.contactName || '',
            primaryContactPhone: invoiceData.phoneNumber || '',
            primaryContactEmail: invoiceData.emailAddress || '',
            additionalNotes: invoiceData.additionalNotes || ''
          };

          // Add combo category items to selectedItems
          const allComboCategoryItems = vendorServices.flatMap((s: any) => s.comboCategoryItems || []);
          allComboCategoryItems.forEach((item: any) => {
            const itemKey = `${item.comboId}_${item.menuName}_${item.cateringId}`;
            mappedSelectedItems[itemKey] = item.quantity;
          });

          setOrderData({
            services: mappedServices,
            formData,
            selectedItems: mappedSelectedItems,
            invites: invoiceData.invites || [],
            isGroupOrder: !!(invoiceData.budgetPerPerson || invoiceData.paymentSettings || invoiceData.orderDeadline),
            customLineItems: invoiceData.customLineItems || [],
            invoiceStatus: invoiceData.status || '',
          });
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
        toast({
          title: "Error",
          description: "Failed to load order details",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id, vendorData?.id, toast]);

  if (loading) {
    return (
      <VendorDashboard activeTab="orders">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <div className="text-lg font-medium">Loading order details...</div>
          </div>
        </div>
      </VendorDashboard>
    );
  }

  if (!orderData) {
    return (
      <VendorDashboard activeTab="orders">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Order not found</p>
          <Button onClick={() => navigate('/vendor/orders')} className="mt-4">
            Back to Orders
          </Button>
        </div>
      </VendorDashboard>
    );
  }

  const calculateServiceTotal = (service: any) => {
    // Calculate total from all items in the service
    let itemsTotal = 0;

    // Add menu items
    if (service.service_details?.menuItems) {
      service.service_details.menuItems.forEach((item: any) => {
        if (!item.isCombo && !item.isComboCategoryItem) {
          itemsTotal += (orderData.selectedItems[item.id] || 0) * item.price;
        } else if (item.isCombo) {
          // Add combo base price
          itemsTotal += (orderData.selectedItems[item.id] || 0) * item.price;
          // Add combo category items
          if (item.comboCategoryItems) {
            item.comboCategoryItems.forEach((comboItem: any) => {
              itemsTotal += comboItem.quantity * parseFloat(comboItem.price || 0);
            });
          }
        }
      });
    }

    // Add rental items
    if (service.service_details?.rentalItems) {
      service.service_details.rentalItems.forEach((item: any) => {
        itemsTotal += (orderData.selectedItems[item.id] || 0) * item.price;
      });
    }

    // Add staff items
    if (service.service_details?.staffServices) {
      service.service_details.staffServices.forEach((item: any) => {
        itemsTotal += (orderData.selectedItems[item.id] || 0) * item.price * (service.duration || 1);
      });
    }

    return itemsTotal || service.totalPrice || service.price * service.quantity;
  };

  const calculateSubtotal = () => {
    return orderData.services.reduce((total: number, service: any) =>
      total + calculateServiceTotal(service), 0
    );
  };

  const calculateCustomLineItemAmount = (item: any, subtotal: number) => {
    const value = Number(item.value) || 0;
    if (item.type === 'percentage') {
      return subtotal * (value / 100);
    }
    return value;
  };

  const calculateDeliveryFee = () => {
    return orderData.services.reduce((total: number, service: any) => {
      const deliveryFee = parseFloat(service.deliveryFee || 0);
      return total + deliveryFee;
    }, 0);
  };

  const calculateGrandTotal = () => {
    const subtotal = calculateSubtotal();
    const deliveryFee = calculateDeliveryFee();
    let adjustments = 0;

    // Calculate custom line items (discounts and surcharges)
    if (orderData.customLineItems && orderData.customLineItems.length > 0) {
      orderData.customLineItems.forEach((item: any) => {
        const amount = calculateCustomLineItemAmount(item, subtotal);
        if (item.mode === 'discount') {
          adjustments -= amount;
        } else if (item.mode === 'surcharge') {
          adjustments += amount;
        }
      });
    }

    return subtotal + adjustments + deliveryFee;
  };

  return (
    <VendorDashboard activeTab="orders">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/vendor/orders')}
            className="hover:bg-[#F07712]/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
          <h1 className="text-2xl font-bold">Order Details</h1>
        </div>

        {/* Event and Contact Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Event Information */}
          <Card>
            <CardHeader>
              <CardTitle>Event Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Event Name</div>
                <div className="font-semibold">{orderData.formData.eventName || 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Event Date</div>
                <div className="font-semibold">
                  {orderData.formData.date ? format(new Date(orderData.formData.date), 'MMMM dd, yyyy') : 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Event Time</div>
                <div className="font-semibold">{orderData.formData.time || 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Location</div>
                <div className="font-semibold">{orderData.formData.location || 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Guest Count</div>
                <div className="font-semibold">{orderData.formData.headcount || 'N/A'}</div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Name</div>
                <div className="font-semibold">{orderData.formData.primaryContactName || 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Email</div>
                <div className="font-semibold">{orderData.formData.primaryContactEmail || 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Phone</div>
                <div className="font-semibold">{orderData.formData.primaryContactPhone || 'N/A'}</div>
              </div>
              {orderData.formData.company && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Company</div>
                  <div className="font-semibold">{orderData.formData.company}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Group Order Invites */}
        {orderData.isGroupOrder && orderData.invites && orderData.invites.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Group Order Invites</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-center">Order Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderData.invites.map((invite: any, index: number) => {
                    const email = invite.email || invite.guestEmail || invite.guest_email || 'N/A';
                    const status = invite.acceptanceStatus || 'pending';
                    return (
                      <TableRow key={invite.id || index}>
                        <TableCell className="font-medium">{email}</TableCell>
                        <TableCell className="text-center">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${
                            status === 'accepted' ? 'bg-green-100 text-green-800' :
                            status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            status === 'declined' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {status}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Services & Items */}
        <Card>
          <CardHeader>
            <CardTitle>Your Services & Items</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service/Item</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderData.services.map((service: any) => {
                  const serviceTypeLabel = service.serviceType === 'catering' ? 'Catering' : 
                    service.serviceType === 'party_rentals' || service.serviceType === 'party-rentals' ? 'Party Rentals' :
                    service.serviceType === 'events_staff' || service.serviceType === 'staff' ? 'Event Staff' : 'Service';
                  
                  return (
                  <React.Fragment key={service.id}>
                    <TableRow className="bg-[#F07712]/10 border-l-4 border-[#F07712]">
                      <TableCell className="font-semibold" colSpan={service.serviceType === 'catering' ? 4 : 1}>
                        <div className="flex items-center gap-2">
                          {service.image && (
                            <img src={service.image} alt={service.name} className="w-10 h-10 object-cover rounded" />
                          )}
                          {service.name}
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#F07712]/20 text-[#F07712] ml-2">
                            {serviceTypeLabel}
                          </span>
                        </div>
                      </TableCell>
                      {service.serviceType !== 'catering' && (
                        <>
                          <TableCell className="text-center font-semibold">{service.quantity || 1}</TableCell>
                          <TableCell className="text-right font-semibold">${(service.price || 0).toFixed(2)}</TableCell>
                          <TableCell className="text-right font-semibold">${calculateServiceTotal(service).toFixed(2)}</TableCell>
                        </>
                      )}
                    </TableRow>
                    {service.service_details?.menuItems?.filter((item: any) => !item.isComboCategoryItem && !item.isCombo).map((item: any) => (
                      <TableRow key={item.id} className="hover:bg-muted/30">
                        <TableCell className="pl-6">
                          <div className="flex items-center gap-3">
                            {item.image && (
                              <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded border" />
                            )}
                            <div>
                              <div className="font-medium">{item.name}</div>
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                                Menu Item
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          {orderData.selectedItems[item.id] || 0}
                        </TableCell>
                        <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-medium">
                          ${((orderData.selectedItems[item.id] || 0) * item.price).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                    {service.service_details?.menuItems?.filter((item: any) => item.isCombo).map((combo: any) => (
                      <React.Fragment key={combo.id}>
                        <TableRow className="hover:bg-muted/30">
                          <TableCell className="pl-6">
                            <div className="flex items-center gap-3">
                              {combo.image && (
                                <img src={combo.image} alt={combo.name} className="w-12 h-12 object-cover rounded border" />
                              )}
                              <div>
                                <div className="font-medium">{combo.name}</div>
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 mt-1">
                                  Combo Package
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center font-medium">
                            {orderData.selectedItems[combo.id] || 0}
                          </TableCell>
                          <TableCell className="text-right">${combo.price.toFixed(2)}</TableCell>
                          <TableCell className="text-right font-medium">
                            ${((orderData.selectedItems[combo.id] || 0) * combo.price).toFixed(2)}
                          </TableCell>
                        </TableRow>
                        {combo.comboCategoryItems && combo.comboCategoryItems.length > 0 && combo.comboCategoryItems.map((comboItem: any, idx: number) => {
                          const itemName = comboItem.menuItemName || comboItem.name;
                          const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(itemName);
                          if (!itemName || isUUID) return null;

                          return (
                            <TableRow key={idx} className="hover:bg-muted/30">
                              <TableCell className="pl-12">
                                <div className="flex items-center gap-3">
                                  {comboItem.image && (
                                    <img src={comboItem.image} alt={itemName} className="w-10 h-10 object-cover rounded border" />
                                  )}
                                  <div>
                                    <div className="text-sm">
                                      <span className="text-[#F07712]">•</span> {itemName}
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-xs text-muted-foreground">from {comboItem.menuName}</span>
                                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                                        Combo Item
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-center font-medium">
                                {comboItem.quantity}
                              </TableCell>
                              <TableCell className="text-right">${parseFloat(comboItem.price || 0).toFixed(2)}</TableCell>
                              <TableCell className="text-right font-medium">
                                ${(parseFloat(comboItem.price || 0) * comboItem.quantity).toFixed(2)}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </React.Fragment>
                    ))}
                    {service.service_details?.rentalItems?.map((item: any) => (
                      <TableRow key={item.id} className="hover:bg-muted/30">
                        <TableCell className="pl-6">
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 mt-1">
                              Rental Item
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          {orderData.selectedItems[item.id] || 0}
                        </TableCell>
                        <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-medium">
                          ${((orderData.selectedItems[item.id] || 0) * item.price).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                    {service.service_details?.staffServices?.map((item: any) => (
                      <TableRow key={item.id} className="hover:bg-muted/30">
                        <TableCell className="pl-6">
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mt-1">
                              Staff Member
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          {orderData.selectedItems[item.id] || 0}
                          {service.duration > 0 && <span className="text-xs text-muted-foreground ml-1">({service.duration}h)</span>}
                        </TableCell>
                        <TableCell className="text-right">${item.price.toFixed(2)}/hr</TableCell>
                        <TableCell className="text-right font-medium">
                          ${((orderData.selectedItems[item.id] || 0) * item.price * (service.duration || 1)).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/20">
                      <TableCell colSpan={3} className="text-right font-semibold">Service Total:</TableCell>
                      <TableCell className="text-right font-semibold text-[#F07712]">
                        ${calculateServiceTotal(service).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                  );
                })}
                <TableRow className="bg-muted/20">
                  <TableCell colSpan={3} className="text-right font-semibold">Subtotal:</TableCell>
                  <TableCell className="text-right font-semibold">
                    ${calculateSubtotal().toFixed(2)}
                  </TableCell>
                </TableRow>
                {/* Custom Line Items (Discounts/Surcharges) */}
                {orderData.customLineItems && orderData.customLineItems.length > 0 && orderData.customLineItems.map((item: any, index: number) => {
                  const amount = calculateCustomLineItemAmount(item, calculateSubtotal());
                  const isDiscount = item.mode === 'discount';
                  return (
                    <TableRow key={index} className="bg-muted/20">
                      <TableCell colSpan={3} className="text-right font-semibold">
                        {item.label || (isDiscount ? 'Discount' : 'Surcharge')}:
                      </TableCell>
                      <TableCell className={`text-right font-semibold ${isDiscount ? 'text-green-600' : ''}`}>
                        {isDiscount ? '-' : ''}${amount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {/* <TableRow className="bg-muted/20">
                  <TableCell colSpan={3} className="text-right font-semibold">Service Fee (5%):</TableCell>
                  <TableCell className="text-right font-semibold">
                    ${calculateServiceFee().toFixed(2)}
                  </TableCell>
                </TableRow> */}
                <TableRow className="bg-muted/20">
                  <TableCell colSpan={3} className="text-right font-semibold">Delivery Fee:</TableCell>
                  <TableCell className="text-right font-semibold">
                    ${calculateDeliveryFee().toFixed(2)}
                  </TableCell>
                </TableRow>
                <TableRow className="bg-[#F07712]/10 border-t-2 border-[#F07712]">
                  <TableCell colSpan={3} className="text-right font-bold text-lg">Grand Total:</TableCell>
                  <TableCell className="text-right font-bold text-lg text-[#F07712]">
                    ${calculateGrandTotal().toFixed(2)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {orderData.formData.additionalNotes && (
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{orderData.formData.additionalNotes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </VendorDashboard>
  );
}

export default VendorOrderDetailsPage;
