import React from 'react';
import { VendorOrder } from '@/hooks/use-vendor-orders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, MapPin, Users, Mail, Phone, User, Building2 } from 'lucide-react';
import VendorEarningsCard from './VendorEarningsCard';
import { useVendorOrderFinancials } from '@/hooks/use-vendor-order-financials';
import OrderItemsBreakdown from '@/components/order-summary/OrderItemsBreakdown';
import { formatCurrency } from '@/lib/utils';

interface VendorOrderDetailsViewProps {
  order: VendorOrder;
}

const VendorOrderDetailsView: React.FC<VendorOrderDetailsViewProps> = ({ order }) => {
  // Calculate financial breakdown using SSOT
  const financialBreakdown = useVendorOrderFinancials({
    price: order.main_order?.price || 0,
    location: order.main_order?.location || '',
    pricing_snapshot: order.main_order?.pricing_snapshot,
    service_details: order.main_order?.service_details
  });

  // Parse booking details from SSOT (invoice.booking_details)
  const parseBookingDetails = () => {
    try {
      // Priority 1: Use invoice booking_details (SSOT)
      if (order.invoice?.booking_details) {
        return typeof order.invoice.booking_details === 'string'
          ? JSON.parse(order.invoice.booking_details)
          : order.invoice.booking_details;
      }
      
      // Priority 2: Fallback to main_order booking_details
      if (order.main_order?.booking_details) {
        return typeof order.main_order.booking_details === 'string'
          ? JSON.parse(order.main_order.booking_details)
          : order.main_order.booking_details;
      }
      
      return {};
    } catch (e) {
      console.error('Failed to parse booking details:', e);
      return {};
    }
  };

  const bookingDetails = parseBookingDetails();

  // Get event date from SSOT (invoice.booking_details.date)
  const getEventDate = () => {
    const bookingDate = bookingDetails.date; // From invoice booking_details
    
    if (bookingDate) {
      // Parse date string without timezone conversion (format: YYYY-MM-DD)
      const [year, month, day] = bookingDate.split('-').map(Number);
      return new Date(year, month - 1, day).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    }
    
    return 'TBD';
  };

  const eventDate = getEventDate();
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      accepted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      declined: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    };

    return (
      <Badge className={variants[status] || variants.pending}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Parse pricing snapshot for overrides
  const pricingSnapshot = order.main_order?.pricing_snapshot;
  const isServiceFeeWaived = pricingSnapshot?.overrides?.isServiceFeeWaived || false;
  const isTaxExempt = pricingSnapshot?.overrides?.isTaxExempt || false;

  // Extract selectedItems from invoice data (SSOT)
  const extractSelectedItemsFromInvoice = () => {
    const selectedItems: Record<string, number> = {};
    
    // Priority 1: Use invoice.items (SSOT with complete selected_items)
    if (order.invoice?.items) {
      order.invoice.items.forEach((service: any) => {
        // Extract selected_items from each service
        if (service.selected_items) {
          Object.assign(selectedItems, service.selected_items);
        }
        
        // Add service-level quantities for staff/rentals
        if (service.quantity) {
          selectedItems[service.id] = service.quantity;
        }
        if (service.duration) {
          selectedItems[`${service.id}_duration`] = service.duration;
        }
      });
    }
    
    // Priority 2: Fallback to main_order pricing_snapshot
    if (Object.keys(selectedItems).length === 0) {
      const selectedServices = pricingSnapshot?.selectedServices || [];
      selectedServices.forEach((svc: any) => {
        // For staff: quantity and duration
        if (svc.type === 'staff') {
          selectedItems[svc.id] = svc.quantity || 1;
          selectedItems[`${svc.id}_duration`] = svc.duration || 1;
        }
        
        // For rentals: quantity
        if (svc.type === 'party-rentals' || svc.type === 'rental') {
          selectedItems[svc.id] = svc.quantity || 1;
        }
      });
    }
    
    // Priority 3: Fallback to booking_details.selectedItems
    if (Object.keys(selectedItems).length === 0) {
      const bookingDetails = parseBookingDetails();
      if (bookingDetails?.selectedItems) {
        Object.assign(selectedItems, bookingDetails.selectedItems);
      }
    }
    
    return selectedItems;
  };

  return (
    <div className="space-y-6">
      {/* Order Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <CardTitle className="text-xl">{order.main_order?.title}</CardTitle>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {getStatusBadge(order.status)}
                <span className="text-sm text-muted-foreground">
                  Order #{order.main_order_id?.slice(-8)}
                </span>
                {order.created_at && (
                  <span className="text-sm text-muted-foreground">
                    • Created {new Date(order.created_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">
                {formatCurrency(order.main_order?.price || 0)}
              </div>
              <div className="text-sm text-muted-foreground">Customer Total</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Event & Contact Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Event Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Event Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <div className="font-medium">Event Date</div>
                  <div className="text-muted-foreground">{eventDate}</div>
                </div>
              </div>
              
              {bookingDetails.deliveryWindow && (
                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-medium">Time</div>
                    <div className="text-muted-foreground">{bookingDetails.deliveryWindow}</div>
                  </div>
                </div>
              )}
              
              {order.main_order?.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-medium">Location</div>
                    <div className="text-muted-foreground">{order.main_order.location}</div>
                  </div>
                </div>
              )}
              
              {order.main_order?.guests && (
                <div className="flex items-start gap-3">
                  <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-medium">Guest Count</div>
                    <div className="text-muted-foreground">{order.main_order.guests} guests</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(bookingDetails.primaryContactName || bookingDetails.clientName) ? (
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-medium">Primary Contact</div>
                    <div className="text-muted-foreground">
                      {bookingDetails.primaryContactName || bookingDetails.clientName}
                    </div>
                  </div>
                </div>
                
                {(bookingDetails.primaryContactEmail || bookingDetails.clientEmail) && (
                  <div className="flex items-start gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="font-medium">Email</div>
                      <div className="text-muted-foreground">
                        {bookingDetails.primaryContactEmail || bookingDetails.clientEmail}
                      </div>
                    </div>
                  </div>
                )}
                
                {(bookingDetails.primaryContactPhone || bookingDetails.clientPhone) && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="font-medium">Phone</div>
                      <div className="text-muted-foreground">
                        {bookingDetails.primaryContactPhone || bookingDetails.clientPhone}
                      </div>
                    </div>
                  </div>
                )}

                {(bookingDetails.company || bookingDetails.companyName || bookingDetails.clientCompany) && (
                  <div className="flex items-start gap-3">
                    <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="font-medium">Company</div>
                      <div className="text-muted-foreground">
                        {bookingDetails.company || bookingDetails.companyName || bookingDetails.clientCompany}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                No contact information available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Notes */}
      {bookingDetails.additionalNotes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {bookingDetails.additionalNotes}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Services & Items (Reuse customer-facing component with SSOT data) */}
      {(order.invoice?.pricing_snapshot || pricingSnapshot) && (
        <OrderItemsBreakdown
          services={order.services} // Use services from invoice SSOT (already filtered for vendor)
          selectedItems={extractSelectedItemsFromInvoice()} // Extract from invoice.items
          formData={{ location: order.main_order?.location }}
          pricingSnapshot={order.invoice?.pricing_snapshot || pricingSnapshot} // Prefer invoice data
          isTaxExempt={isTaxExempt}
          isServiceFeeWaived={isServiceFeeWaived}
        />
      )}

      {/* Vendor Earnings Breakdown */}
      <VendorEarningsCard 
        breakdown={financialBreakdown}
        isServiceFeeWaived={isServiceFeeWaived}
        isTaxExempt={isTaxExempt}
      />

      {/* Previous Response */}
      {order.vendor_response && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your Response</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded text-sm">
              {order.vendor_response}
            </div>
            {order.responded_at && (
              <div className="text-xs text-muted-foreground mt-2">
                Responded on {new Date(order.responded_at).toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VendorOrderDetailsView;
