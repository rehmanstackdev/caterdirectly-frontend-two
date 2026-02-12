import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface InvoiceItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  total: number;
}

interface Invoice {
  id: string;
  title: string;
  client_name: string;
  client_email: string;
  client_phone?: string;
  client_company?: string;
  total: number;
  status: string;
  created_at: string;
  expires_at?: string;
  service_date?: string;
  service_time?: string;
  delivery_notes?: string;
  message?: string;
  vendor_name?: string;
  headcount?: number;
  booking_details?: {
    backupContactName?: string;
    backupContactEmail?: string;
    backupContactPhone?: string;
    eventName?: string;
    eventType?: string;
    specialRequests?: string;
    additionalNotes?: string;
  };
  items?: InvoiceItem[];
}

interface InvoiceViewDialogProps {
  invoice: Invoice | null;
  open: boolean;
  onClose: () => void;
}

const InvoiceViewDialog: React.FC<InvoiceViewDialogProps> = ({
  invoice,
  open,
  onClose
}) => {
  if (!invoice) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Draft', variant: 'secondary' as const },
      sent: { label: 'Sent', variant: 'default' as const },
      pending: { label: 'Pending', variant: 'default' as const },
      accepted: { label: 'Accepted', variant: 'default' as const },
      paid: { label: 'Paid', variant: 'default' as const },
      declined: { label: 'Declined', variant: 'destructive' as const },
      revision_requested: { label: 'Revision Requested', variant: 'default' as const },
      expired: { label: 'Expired', variant: 'destructive' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || 
      { label: status, variant: 'secondary' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{invoice.title}</DialogTitle>
          <div className="flex items-center gap-2 mt-2">
            {getStatusBadge(invoice.status)}
            <span className="text-muted-foreground">
              Created: {new Date(invoice.created_at).toLocaleDateString()}
            </span>
            {invoice.expires_at && (
              <span className="text-muted-foreground">
                Expires: {new Date(invoice.expires_at).toLocaleDateString()}
              </span>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Primary Contact</h4>
                  <p className="text-lg">{invoice.client_name}</p>
                  <p className="text-muted-foreground">{invoice.client_email}</p>
                  {invoice.client_phone && (
                    <p className="text-muted-foreground">{invoice.client_phone}</p>
                  )}
                  {invoice.client_company && (
                    <p className="text-muted-foreground">{invoice.client_company}</p>
                  )}
                </div>
                
                {invoice.booking_details?.backupContactName && (
                  <div>
                    <h4 className="font-semibold">Backup Contact</h4>
                    <p className="text-lg">{invoice.booking_details.backupContactName}</p>
                    {invoice.booking_details.backupContactEmail && (
                      <p className="text-muted-foreground">{invoice.booking_details.backupContactEmail}</p>
                    )}
                    {invoice.booking_details.backupContactPhone && (
                      <p className="text-muted-foreground">{invoice.booking_details.backupContactPhone}</p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Event Details */}
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Event Information</h4>
                  {invoice.booking_details?.eventName && (
                    <p>Event: {invoice.booking_details.eventName}</p>
                  )}
                  {invoice.booking_details?.eventType && (
                    <p>Type: {invoice.booking_details.eventType}</p>
                  )}
                  {invoice.headcount && (
                    <p>Headcount: {invoice.headcount}</p>
                  )}
                </div>
                
                <div>
                  <h4 className="font-semibold">Service Details</h4>
                  {invoice.service_date && (
                    <p>Date: {new Date(invoice.service_date).toLocaleDateString()}</p>
                  )}
                  {invoice.service_time && (
                    <p>Time: {invoice.service_time}</p>
                  )}
                  {invoice.vendor_name && (
                    <p>Vendor: {invoice.vendor_name}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Items */}
          {invoice.items && invoice.items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Services & Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {invoice.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-start p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold">{item.name}</h4>
                        {item.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.description}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          Quantity: {item.quantity} × {formatCurrency(item.price)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(item.total)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Messages and Notes */}
          {(invoice.message || invoice.delivery_notes || invoice.booking_details?.specialRequests || invoice.booking_details?.additionalNotes) && (
            <Card>
              <CardHeader>
                <CardTitle>Messages & Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {invoice.message && (
                  <div>
                    <h4 className="font-semibold">Invoice Message</h4>
                    <p className="text-muted-foreground mt-1">{invoice.message}</p>
                  </div>
                )}
                
                {invoice.delivery_notes && (
                  <div>
                    <h4 className="font-semibold">Delivery Notes</h4>
                    <p className="text-muted-foreground mt-1">{invoice.delivery_notes}</p>
                  </div>
                )}
                
                {invoice.booking_details?.specialRequests && (
                  <div>
                    <h4 className="font-semibold">Special Requests</h4>
                    <p className="text-muted-foreground mt-1">{invoice.booking_details.specialRequests}</p>
                  </div>
                )}
                
                {invoice.booking_details?.additionalNotes && (
                  <div>
                    <h4 className="font-semibold">Additional Notes</h4>
                    <p className="text-muted-foreground mt-1">{invoice.booking_details.additionalNotes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Total */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Total Amount:</span>
                <span>{formatCurrency(invoice.total)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceViewDialog;
