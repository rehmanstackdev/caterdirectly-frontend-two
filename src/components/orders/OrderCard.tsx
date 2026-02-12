
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Star, Edit, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useOrders } from "@/hooks/use-orders";
import type { Order, Review } from "@/types/order-types";
import { APP_LOGO } from "@/constants/app-assets";
import { formatCurrency } from "@/lib/utils";
import invoiceService from '@/services/api/invoice.Service';
import { generateInvoicePDF } from '@/utils/invoice-pdf-generator';
import { toast } from 'sonner';

interface OrderCardProps extends Order {
  invoice?: any;
}

const OrderCard = ({
  id,
  image,
  title,
  location,
  date,
  price,
  guests,
  status,
  vendor_name,
  needs_review,
  review,
  additionalTip,
  invoice,
}: OrderCardProps) => {
  const navigate = useNavigate();
  const { submitReview, isSubmittingReview } = useOrders();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const statusColors = {
    active: "bg-green-100 text-green-800",
    ended: "bg-gray-100 text-gray-800",
    draft: "bg-amber-100 text-amber-800"
  };

  const handleEditDraft = () => {
    try {
      if (id) localStorage.setItem('currentDraftId', id);
    } catch {}
    navigate(`/booking?draft=${id}`);
  };

  const handleGoToDetails = () => {
    if (status !== 'draft') {
      const invoiceId = invoice?.id || id;
      navigate(`/host/orders/${invoiceId}`);
    }
  };

  const handleSubmitReview = async () => {
    if (isSubmittingReview) return;
    
    const newReview: Review = {
      rating,
      comment,
      dateSubmitted: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    };
    
    await submitReview(id, newReview);
    setIsOpen(false);
    setRating(5);
    setComment("");
  };

  const handleDownloadPDF = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDownloading(true);
    
    try {
      const invoiceId = invoice?.id || id;
      const response = await invoiceService.getInvoiceOrderSummary(invoiceId);
      
      if (response?.data?.invoice) {
        await generateInvoicePDF(response.data.invoice);
        toast.success('PDF downloaded successfully');
      } else {
        toast.error('Failed to load order details');
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card className="overflow-hidden group hover:shadow-md transition-shadow duration-200 cursor-pointer flex flex-col h-full" onClick={handleGoToDetails} role="button">
      {/* Image section commented out
      <div className="relative aspect-video overflow-hidden bg-background">
        <img
          src={image || APP_LOGO.url}
          alt={title}
          className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-200"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = APP_LOGO.url; }}
          loading="lazy"
        />
        <div className="absolute top-3 right-3 flex gap-2">
          <span className={cn(
            "px-2 py-1 rounded-full text-xs font-medium",
            statusColors[status]
          )}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
          {status === 'draft' && (
            <Button
              size="sm"
              variant="secondary"
              className="h-6 px-2 bg-white hover:bg-gray-100"
              onClick={(e) => { e.stopPropagation(); handleEditDraft(); }}
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
          )}
        </div>
      </div>
      */}
      <CardContent className="p-4 flex flex-col flex-1">
        <div>
          <h3 className="font-semibold text-lg mb-1 truncate">{title}</h3>
          <p className="text-sm text-gray-500 mb-1">{vendor_name}</p>
          <div className="flex items-center text-sm text-gray-500">
            <span>{location}</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div>
            <div className="font-medium">${price.toLocaleString()}</div>
            <div className="text-gray-500">{date}</div>
          </div>
          <div className="text-right">
            <div className="font-medium">{guests}</div>
            <div className="text-gray-500">Guests</div>
          </div>
        </div>
        {additionalTip != null && additionalTip !== '' && parseFloat(additionalTip) > 0 && (
          <div className="flex items-center justify-between text-sm pt-2 border-t">
            <span className="text-gray-500">Additional Tip:</span>
            <span className="font-medium text-gray-900">
              {formatCurrency(parseFloat(additionalTip))}
            </span>
          </div>
        )}

        <div className="mt-auto space-y-4">
        {status !== 'draft' && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="w-full gap-2"
          >
            <Download className="h-4 w-4" />
            {isDownloading ? 'Downloading...' : 'Download PDF'}
          </Button>
        )}

        {status === "ended" && needs_review && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="w-full bg-[#9b87f5] hover:bg-[#8b77e5]" onClick={(e) => e.stopPropagation()}>
                Leave Review
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Review for {title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={cn(
                          "w-6 h-6",
                          star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                        )}
                      />
                    </button>
                  ))}
                </div>
                <Textarea
                  placeholder="Write your review..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-[100px]"
                />
                <Button
                  onClick={handleSubmitReview}
                  className="w-full bg-[#9b87f5] hover:bg-[#8b77e5]"
                  disabled={!comment.trim() || isSubmittingReview}
                >
                  {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {review && (
          <div className="border-t pt-3">
            <div className="flex items-center gap-1 mb-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-4 h-4",
                    i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                  )}
                />
              ))}
            </div>
            <p className="text-sm text-gray-600">{review.comment}</p>
            <p className="text-xs text-gray-400 mt-1">{review.dateSubmitted}</p>
          </div>
        )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderCard;
