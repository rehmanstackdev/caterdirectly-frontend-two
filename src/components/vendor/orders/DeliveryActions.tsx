import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Truck, Clock, CheckCircle2, AlertTriangle, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import deliveryTrackingService from '@/services/api/delivery-tracking.service';

interface DeliveryRecord {
  id: string;
  invoiceId: string;
  invoiceServiceId?: string;
  vendorId: string;
  status: 'pending' | 'time_set' | 'delivered';
  promisedDeliveryTime?: string;
  actualDeliveryTime?: string;
  deliveryTimeSentAt?: string;
  timing?: 'on_time' | 'late';
  deliveryAddress?: string;
  hostPhoneNumber?: string;
  hostName?: string;
  smsMessageSetTime?: string;
  smsMessageConfirm?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface DeliveryActionsProps {
  invoiceId: string;
  invoiceStatus: string;
  eventDate: string;
}

function DeliveryActions({ invoiceId, invoiceStatus, eventDate }: DeliveryActionsProps) {
  const { toast } = useToast();
  const [delivery, setDelivery] = useState<DeliveryRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [settingTime, setSettingTime] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [showTimeDialog, setShowTimeDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [timeValue, setTimeValue] = useState('');
  const [notes, setNotes] = useState('');

  const fetchDeliveryStatus = async () => {
    if (!invoiceId) return;
    try {
      setLoading(true);
      const response = await deliveryTrackingService.getDeliveryStatus(invoiceId);
      const data = response?.data;
      if (Array.isArray(data) && data.length > 0) {
        setDelivery(data[0]);
      } else {
        setDelivery(null);
      }
    } catch (error) {
      console.error('Failed to fetch delivery status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (invoiceId && invoiceStatus === 'paid') {
      fetchDeliveryStatus();
    }
  }, [invoiceId, invoiceStatus]);

  if (invoiceStatus !== 'paid') return null;

  const isEventDay = () => {
    if (!eventDate) return false;
    const today = new Date();
    const event = new Date(eventDate);
    return (
      event.getFullYear() === today.getFullYear() &&
      event.getMonth() === today.getMonth() &&
      event.getDate() === today.getDate()
    );
  };

  const formatTime12h = (time24: string) => {
    if (!time24) return '';
    const [h, m] = time24.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
  };

  const handleSetTime = async () => {
    if (!timeValue || !invoiceId) return;
    try {
      setSettingTime(true);
      const response = await deliveryTrackingService.setDeliveryTime(invoiceId, {
        promisedDeliveryTime: timeValue,
        notes: notes || undefined,
      });
      if (response?.data) setDelivery(response.data);
      toast({ title: 'Delivery Time Set', description: `Delivery time set to ${formatTime12h(timeValue)}. SMS sent to host.` });
      setShowTimeDialog(false);
      setTimeValue('');
      setNotes('');
    } catch (error: any) {
      toast({ title: 'Error', description: error?.response?.data?.message || 'Failed to set delivery time', variant: 'destructive' });
    } finally {
      setSettingTime(false);
    }
  };

  const handleConfirmDelivery = async () => {
    if (!invoiceId) return;
    try {
      setConfirming(true);
      const response = await deliveryTrackingService.confirmDelivery(invoiceId, { notes: notes || undefined });
      if (response?.data) setDelivery(response.data);
      toast({ title: 'Delivery Confirmed', description: 'Delivery confirmed! SMS sent to host and admin.' });
      setShowConfirmDialog(false);
      setNotes('');
    } catch (error: any) {
      toast({ title: 'Error', description: error?.response?.data?.message || 'Failed to confirm delivery', variant: 'destructive' });
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-[#F07712]" />
            Delivery Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#F07712]"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-[#F07712]" />
            Delivery Tracking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* No delivery yet */}
          {!delivery && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {isEventDay()
                  ? 'Set a delivery time to notify the host when you will arrive.'
                  : 'Delivery time can only be set on the event day.'}
              </p>
              <Button
                onClick={() => setShowTimeDialog(true)}
                disabled={!isEventDay()}
                className="w-full bg-[#F07712] hover:bg-[#F07712]/90"
              >
                <Clock className="h-4 w-4 mr-2" />
                Set Delivery Time
              </Button>
            </div>
          )}

          {/* Delivery time set - awaiting delivery */}
          {delivery && delivery.status === 'time_set' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Status</span>
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                  <Clock className="h-3 w-3 mr-1" />
                  Time Set
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Promised Time</span>
                <span className="font-semibold">{formatTime12h(delivery.promisedDeliveryTime || '')}</span>
              </div>
              {delivery.deliveryAddress && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Address</span>
                  <span className="text-sm text-right max-w-[60%]">{delivery.deliveryAddress}</span>
                </div>
              )}
              {delivery.hostName && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Host</span>
                  <span className="text-sm">{delivery.hostName}</span>
                </div>
              )}
              {delivery.notes && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Notes</span>
                  <p className="text-sm mt-1">{delivery.notes}</p>
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowTimeDialog(true)}
                  variant="outline"
                  className="flex-1"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Update Time
                </Button>
                <Button
                  onClick={() => {
                    setNotes('');
                    setShowConfirmDialog(true);
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Confirm Delivery
                </Button>
              </div>
            </div>
          )}

          {/* Delivery completed */}
          {delivery && delivery.status === 'delivered' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Status</span>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Delivered
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Timing</span>
                {delivery.timing === 'on_time' ? (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    On Time
                  </Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Late
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Promised Time</span>
                <span className="font-semibold">{formatTime12h(delivery.promisedDeliveryTime || '')}</span>
              </div>
              {delivery.actualDeliveryTime && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Actual Delivery</span>
                  <span className="font-semibold">
                    {new Date(delivery.actualDeliveryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}
              {delivery.notes && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Notes</span>
                  <p className="text-sm mt-1">{delivery.notes}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Set Delivery Time Dialog */}
      <Dialog open={showTimeDialog} onOpenChange={setShowTimeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-[#F07712]" />
              Set Delivery Time
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Delivery Time</label>
              <Input
                type="time"
                value={timeValue}
                onChange={(e) => setTimeValue(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">
                The host will receive an SMS with this delivery time.
              </p>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Notes (optional)</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes about the delivery..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTimeDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSetTime}
              disabled={!timeValue || settingTime}
              className="bg-[#F07712] hover:bg-[#F07712]/90"
            >
              {settingTime ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Set Time & Notify Host
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Delivery Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Confirm Delivery
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Confirm that you have delivered the order. An SMS will be sent to the host and admin.
            </p>
            <div>
              <label className="text-sm font-medium mb-2 block">Notes (optional)</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any notes about the delivery..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelivery}
              disabled={confirming}
              className="bg-green-600 hover:bg-green-700"
            >
              {confirming ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Confirming...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Confirm Delivery
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default DeliveryActions;
