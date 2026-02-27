import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Clock, Send } from 'lucide-react';
import { toast } from 'sonner';
import deliveryTrackingService from '@/services/api/delivery-tracking.service';

interface DeliveryTimeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string | null;
}

export default function DeliveryTimeDialog({ open, onOpenChange, invoiceId }: DeliveryTimeDialogProps) {
  const [timeValue, setTimeValue] = useState('');
  const [notes, setNotes] = useState('');
  const [settingTime, setSettingTime] = useState(false);

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
      await deliveryTrackingService.setDeliveryTime(invoiceId, {
        promisedDeliveryTime: timeValue,
        notes: notes || undefined,
      });
      toast.success(`Delivery time set to ${formatTime12h(timeValue)}.`);
      onOpenChange(false);
      setTimeValue('');
      setNotes('');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to set delivery time');
    } finally {
      setSettingTime(false);
    }
  };

  const handleClose = (value: boolean) => {
    if (!value) {
      setTimeValue('');
      setNotes('');
    }
    onOpenChange(value);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
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
              Set the expected delivery time for this order.
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
          <Button variant="outline" onClick={() => handleClose(false)}>
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
                Set Delivery Time
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
