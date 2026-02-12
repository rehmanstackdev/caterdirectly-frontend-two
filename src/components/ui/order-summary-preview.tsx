import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, MapPin, Users, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderSummaryPreviewProps {
  orderData: {
    orderName: string;
    location: string;
    date: string;
    deliveryWindow: string;
    headcount: number;
    primaryContactName: string;
    primaryContactEmail: string;
  };
  services: any[];
  selectedItems: Record<string, number>;
  subtotal: number;
  serviceFee: number;
  deliveryFee: number;
  tax: number;
  total: number;
  className?: string;
  compact?: boolean;
}

export const OrderSummaryPreview = ({
  orderData,
  services,
  selectedItems,
  subtotal,
  serviceFee,
  deliveryFee,
  tax,
  total,
  className,
  compact = false
}: OrderSummaryPreviewProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className={compact ? "pb-3" : "pb-4"}>
        <CardTitle className={compact ? "text-base" : "text-lg"}>
          Order Summary
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Event Details */}
        <div className="space-y-3">
          <div className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Event Details
          </div>
          
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="font-medium">{orderData.orderName}</div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(orderData.date)} at {formatTime(orderData.deliveryWindow)}
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="text-sm text-muted-foreground min-w-0 flex-1">
                {orderData.location}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">
                {orderData.headcount} guests
              </div>
            </div>
          </div>
        </div>

        {/* Services */}
        {!compact && services.length > 0 && (
          <div className="space-y-3">
            <div className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Services
            </div>
            
            <div className="space-y-2">
              {services.map((service, index) => (
                <div key={service.id || index} className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm">{service.name}</div>
                    {service.vendorName && (
                      <div className="text-xs text-muted-foreground">
                        by {service.vendorName}
                      </div>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    ${service.price}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pricing Breakdown */}
        <div className="space-y-3 pt-3 border-t">
          <div className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Pricing
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            
            {serviceFee > 0 && (
              <div className="flex justify-between">
                <span>Service Fee</span>
                <span>${serviceFee.toFixed(2)}</span>
              </div>
            )}
            
            {deliveryFee > 0 && (
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>${deliveryFee.toFixed(2)}</span>
              </div>
            )}
            
            {tax > 0 && (
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
            )}
            
            <div className="flex justify-between font-bold text-base pt-2 border-t">
              <span>Total</span>
              <span className="text-primary">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        {!compact && (
          <div className="space-y-2 pt-3 border-t">
            <div className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Contact
            </div>
            <div className="text-sm">
              <div className="font-medium">{orderData.primaryContactName}</div>
              <div className="text-muted-foreground">{orderData.primaryContactEmail}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};