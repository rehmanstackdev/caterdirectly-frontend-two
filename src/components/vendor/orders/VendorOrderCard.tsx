import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  Clock, 
  MapPin, 
  Users, 
  DollarSign, 
  Calendar,
  CheckCircle,
  XCircle,
  MessageCircle,
  FileText,
  Download
} from 'lucide-react';
import { VendorOrder } from '@/hooks/use-vendor-orders';
import { formatCurrency } from '@/lib/utils';
import VendorOrderDetailsView from './VendorOrderDetailsView';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface VendorOrderCardProps {
  order: VendorOrder;
  onRespond: (orderId: string, action: 'accept' | 'decline' | 'counter', response?: string) => void;
  isResponding: boolean;
}

const VendorOrderCard: React.FC<VendorOrderCardProps> = ({
  order,
  onRespond,
  isResponding
}) => {
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [selectedAction, setSelectedAction] = useState<'accept' | 'decline' | 'counter'>('accept');
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleGeneratePDF = async () => {
    if (!order.id || !order.vendor_id) return;
    
    setIsGeneratingPDF(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-order-pdf', {
        body: { 
          orderId: order.main_order_id,
          forVendor: true,
          vendorId: order.vendor_id
        }
      });

      if (error) throw error;

      if (data?.pdfUrl) {
        window.open(data.pdfUrl, '_blank');
        toast.success('PDF generated successfully');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      declined: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };

    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleQuickResponse = (action: 'accept' | 'decline') => {
    onRespond(order.id, action);
  };

  const handleDetailedResponse = () => {
    onRespond(order.id, selectedAction, responseText);
    setShowResponseForm(false);
    setResponseText('');
  };

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
  
  // Get event date from invoice booking_details (SSOT)
  const getEventDate = () => {
    const bookingDate = bookingDetails.date; // From invoice booking_details
    
    if (bookingDate) {
      // Parse date string without timezone conversion (format: YYYY-MM-DD)
      const [year, month, day] = bookingDate.split('-').map(Number);
      return new Date(year, month - 1, day).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
    
    return 'TBD';
  };

  const eventDate = getEventDate();
  const total = order.subtotal + order.vendor_fee;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{order.main_order?.title}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              {getStatusBadge(order.status)}
              <span className="text-sm text-gray-500">Order #{order.main_order_id.slice(-8)}</span>
            </div>
          </div>
          <div className="text-right space-y-2">
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(total)}
            </div>
            {order.vendor_fee > 0 && (
              <div className="text-sm text-muted-foreground">
                + {formatCurrency(order.vendor_fee)} delivery
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleGeneratePDF}
              disabled={isGeneratingPDF}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-1" />
              {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Event Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{eventDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{bookingDetails.deliveryWindow || 'TBD'}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{order.main_order?.location || 'TBD'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{order.main_order?.guests || 0} guests</span>
          </div>
        </div>

        {/* Items Ordered - Show itemized breakdown from invoice SSOT */}
        <div>
          <h4 className="font-medium mb-2">Items Ordered:</h4>
          <div className="space-y-2">
            {order.services.map((service: any) => {
              // Get service details from invoice items for complete menu data
              const invoiceService = order.invoice?.items?.find((item: any) => item.id === service.id);
              const selectedItems = invoiceService?.selected_items || service.selected_items || {};
              const serviceDetails = invoiceService?.service_details || service.service_details;
              
              // For catering services, show individual menu items
              if (service.type === 'catering' && serviceDetails?.catering?.menuItems) {
                return serviceDetails.catering.menuItems.map((menuItem: any) => {
                  const qty = selectedItems[menuItem.id];
                  if (!qty || qty === 0) return null;
                  
                  const unitPrice = menuItem.price || 0;
                  const lineTotal = qty * unitPrice;
                  
                  return (
                    <div key={menuItem.id} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                      {menuItem.image && (
                        <img 
                          src={menuItem.image} 
                          alt={menuItem.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground truncate">{menuItem.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {qty} × {formatCurrency(unitPrice)}
                        </div>
                      </div>
                      <span className="font-medium whitespace-nowrap">{formatCurrency(lineTotal)}</span>
                    </div>
                  );
                });
              }
              
              // For staff services
              if (service.type === 'staff') {
                const quantity = service.quantity || 1;
                const duration = service.duration || 1;
                const unitPrice = service.price || 0;
                const lineTotal = quantity * duration * unitPrice;
                
                return (
                  <div key={service.id} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                    {service.image && (
                      <img 
                        src={service.image} 
                        alt={service.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground truncate">{service.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {quantity} × {duration} hrs @ {formatCurrency(unitPrice)}/hr
                      </div>
                    </div>
                    <span className="font-medium whitespace-nowrap">{formatCurrency(lineTotal)}</span>
                  </div>
                );
              }
              
              // For rental items
              if (service.type === 'party-rentals' || service.type === 'rental') {
                const quantity = service.quantity || 1;
                const unitPrice = service.price || 0;
                const lineTotal = quantity * unitPrice;
                
                return (
                  <div key={service.id} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                    {service.image && (
                      <img 
                        src={service.image} 
                        alt={service.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground truncate">{service.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Qty: {quantity} @ {formatCurrency(unitPrice)} each
                      </div>
                    </div>
                    <span className="font-medium whitespace-nowrap">{formatCurrency(lineTotal)}</span>
                  </div>
                );
              }
              
              return null;
            })}
          </div>
        </div>

        {/* Additional Notes */}
        {bookingDetails.additionalNotes && (
          <div>
            <h4 className="font-medium mb-2">Additional Notes:</h4>
            <p className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
              {bookingDetails.additionalNotes}
            </p>
          </div>
        )}

        {/* Previous Response */}
        {order.vendor_response && (
          <div>
            <h4 className="font-medium mb-2">Your Response:</h4>
            <p className="text-sm text-gray-600 p-2 bg-blue-50 rounded">
              {order.vendor_response}
            </p>
            <div className="text-xs text-gray-500 mt-1">
              Responded on {order.responded_at ? new Date(order.responded_at).toLocaleString() : 'Unknown'}
            </div>
          </div>
        )}

        {/* View Details Button */}
        <div className="pt-4 border-t">
          <Button
            onClick={() => setShowDetailsDialog(true)}
            variant="outline"
            className="w-full"
          >
            <FileText className="h-4 w-4 mr-2" />
            View Full Details & Breakdown
          </Button>
        </div>

        {/* Action Buttons */}
        {order.status === 'pending' && (
          <div className="space-y-3 pt-4 border-t">
            {!showResponseForm ? (
              <div className="flex gap-2">
                <Button
                  onClick={() => handleQuickResponse('accept')}
                  disabled={isResponding}
                  className="flex-1"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Accept Order
                </Button>
                <Button
                  onClick={() => handleQuickResponse('decline')}
                  disabled={isResponding}
                  variant="destructive"
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Decline
                </Button>
                <Button
                  onClick={() => setShowResponseForm(true)}
                  disabled={isResponding}
                  variant="outline"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Respond
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={selectedAction === 'accept' ? 'default' : 'outline'}
                    onClick={() => setSelectedAction('accept')}
                  >
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedAction === 'decline' ? 'default' : 'outline'}
                    onClick={() => setSelectedAction('decline')}
                  >
                    Decline
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedAction === 'counter' ? 'default' : 'outline'}
                    onClick={() => setSelectedAction('counter')}
                  >
                    Counter Offer
                  </Button>
                </div>
                
                <Textarea
                  placeholder="Add a message (optional for accept, required for decline/counter)"
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  rows={3}
                />
                
                <div className="flex gap-2">
                  <Button
                    onClick={handleDetailedResponse}
                    disabled={isResponding || (selectedAction !== 'accept' && !responseText.trim())}
                    className="flex-1"
                  >
                    {isResponding ? 'Sending...' : `Send ${selectedAction.charAt(0).toUpperCase() + selectedAction.slice(1)}`}
                  </Button>
                  <Button
                    onClick={() => setShowResponseForm(false)}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl lg:max-w-4xl xl:max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Order Details</DialogTitle>
            <DialogDescription className="sr-only">
              Complete order details including items ordered, pricing breakdown, and vendor earnings
            </DialogDescription>
          </DialogHeader>
          <VendorOrderDetailsView order={order} />
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default VendorOrderCard;
