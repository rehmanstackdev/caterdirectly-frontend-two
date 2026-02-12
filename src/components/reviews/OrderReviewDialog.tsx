import React, { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';
import { Order } from '@/types/order-types';

interface OrderReviewDialogProps {
  order: Order | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (reviews: { serviceId: string; rating: number; comment?: string }[]) => Promise<void> | void;
}

interface ServiceForReview {
  id: string;
  name: string;
  vendorName?: string;
}

const StarRating = ({ value, onChange, labelId }: { value: number; onChange: (v: number) => void; labelId: string }) => {
  return (
    <div role="radiogroup" aria-labelledby={labelId} className="flex items-center gap-1">
      {[1,2,3,4,5].map((n) => (
        <button
          key={n}
          type="button"
          aria-label={`${n} star`}
          aria-checked={value === n}
          role="radio"
          onClick={() => onChange(n)}
          className={`p-1 rounded transition-colors ${n <= value ? 'text-yellow-500' : 'text-muted-foreground'}`}
        >
          <Star className={`${n <= value ? 'fill-yellow-500' : ''} h-5 w-5`} />
        </button>
      ))}
    </div>
  );
};

const OrderReviewDialog = ({ order, open, onClose, onSubmit }: OrderReviewDialogProps) => {
  const services: ServiceForReview[] = useMemo(() => {
    if (!order) return [];
    try {
      const raw = order.service_details ? JSON.parse(order.service_details as any) : [];
      const arr = Array.isArray(raw) ? raw : [];
      const mapped: ServiceForReview[] = arr.map((s: any) => ({
        id: s.serviceId || s.id || s.service_id || '',
        name: s.serviceName || s.name || 'Service',
        vendorName: s.vendorName || s.vendor || order.vendor_name,
      })).filter(s => !!s.id);
      // Fallback when no service_details are present: use vendor on order as single service
      if (mapped.length === 0 && order.vendor_id) {
        return [{ id: order.vendor_id, name: order.vendor_name || 'Service' }];
      }
      return mapped;
    } catch (e) {
      console.warn('Failed to parse service_details for review dialog', e);
      return [];
    }
  }, [order]);

  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const allRated = services.length > 0 && services.every(s => (ratings[s.id] ?? 0) > 0);

  const handleSubmit = async () => {
    if (!allRated) return;
    setSubmitting(true);
    try {
      const payload = services.map(s => ({
        serviceId: s.id,
        rating: ratings[s.id],
        comment: comments[s.id]?.trim() || undefined,
      }));
      await onSubmit(payload);
      onClose();
      setRatings({});
      setComments({});
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[600px] md:max-w-[680px]">
        <DialogHeader>
          <DialogTitle>Review your order</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {services.length === 0 ? (
            <p className="text-sm text-muted-foreground">No services found for this order.</p>
          ) : (
            services.map((s) => {
              const labelId = `label-${s.id}`;
              return (
                <section key={s.id} className="rounded-md border p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 id={labelId} className="font-medium">{s.name}</h3>
                      {s.vendorName && (
                        <p className="text-xs text-muted-foreground">{s.vendorName}</p>
                      )}
                    </div>
                    <StarRating
                      value={ratings[s.id] || 0}
                      onChange={(v) => setRatings(prev => ({ ...prev, [s.id]: v }))}
                      labelId={labelId}
                    />
                  </div>
                  <div className="mt-3 space-y-2">
                    <Label htmlFor={`comment-${s.id}`}>Comments (optional)</Label>
                    <Textarea
                      id={`comment-${s.id}`}
                      placeholder="Share details about your experience"
                      value={comments[s.id] || ''}
                      onChange={(e) => setComments(prev => ({ ...prev, [s.id]: e.target.value }))}
                    />
                  </div>
                </section>
              );
            })
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!allRated || submitting}>
              {submitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderReviewDialog;
