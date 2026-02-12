import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/cater-directly/Header';
import Footer from '@/components/cater-directly/Footer';
import ReviewService, { VendorInfo } from '@/services/api/review.Service';

const SubmitInvoiceVendorReviewPage = () => {
  const { invoiceId, vendorId } = useParams<{ invoiceId: string; vendorId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [vendorInfo, setVendorInfo] = useState<VendorInfo | null>(null);
  const [invoiceInfo, setInvoiceInfo] = useState<{ eventName?: string; eventDate?: string } | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (!invoiceId || !vendorId) {
      toast.error('Invalid review link');
      navigate('/reviews');
      return;
    }

    fetchVendorInfo(invoiceId, vendorId);
  }, [invoiceId, vendorId, navigate]);

  const fetchVendorInfo = async (invId: string, vendId: string) => {
    try {
      setLoading(true);
      const data = await ReviewService.getInvoiceVendors(invId);
      
      if (!data || !data.vendors) {
        toast.error('Invalid response from server');
        navigate('/reviews');
        return;
      }

      const vendor = data.vendors.find((v) => v.vendorId === vendId);
      
      if (!vendor) {
        toast.error('Vendor not found for this invoice');
        navigate(`/reviews/invoice/${invId}`);
        return;
      }

      if (vendor.alreadyReviewed) {
        toast.info('You have already reviewed this vendor');
        setSubmitted(true);
        if (vendor.review) {
          setRating(vendor.review.rating);
          setComment(vendor.review.comment || '');
        }
      }

      setVendorInfo(vendor);
      
      // Set invoice info if available
      if (data.invoice) {
        setInvoiceInfo({
          eventName: data.invoice.eventName,
          eventDate: data.invoice.eventDate,
        });
      }
    } catch (error: any) {
      console.error('[SubmitInvoiceVendorReviewPage] Error fetching vendor info:', error);
      
      let errorMessage = 'Failed to load vendor information';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      navigate('/reviews');
    } finally {
      setLoading(false);
    }
  };

  // Normalize service type to match backend enum
  const normalizeServiceType = (serviceType: string): 'catering' | 'venue' | 'party_rental' | 'event_staff' => {
    const normalized = serviceType?.toLowerCase() || '';
    
    // Map invoice service types to review service types
    if (normalized === 'party_rentals') return 'party_rental';
    if (normalized === 'staff' || normalized === 'events_staff') return 'event_staff';
    if (normalized === 'venues') return 'venue';
    if (normalized === 'catering' || normalized === 'venue' || normalized === 'party_rental' || normalized === 'event_staff') {
      return normalized as 'catering' | 'venue' | 'party_rental' | 'event_staff';
    }
    
    // Default to catering if unknown
    return 'catering';
  };

  const handleSubmit = async () => {
    if (!invoiceId || !vendorId || !vendorInfo || rating === 0) {
      toast.error('Please provide a rating');
      return;
    }

    try {
      setSubmitting(true);
      const normalizedServiceType = normalizeServiceType(vendorInfo.serviceType);
      
      await ReviewService.submitReview({
        invoiceId,
        vendorId,
        serviceId: vendorInfo.serviceId,
        serviceType: normalizedServiceType,
        rating,
        comment: comment.trim() || undefined,
      });

      toast.success('Review submitted successfully! It will be visible after admin approval.');
      setSubmitted(true);
      
      // Redirect to invoice reviews page after a short delay
      setTimeout(() => {
        navigate(`/reviews/invoice/${invoiceId}`);
      }, 2000);
    } catch (error: any) {
      console.error('Error submitting review:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit review';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-500" />
            <p className="text-gray-600">Loading review form...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!vendorInfo || !invoiceId || !vendorId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate(`/reviews/invoice/${invoiceId}`)}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Invoice Reviews
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Rate Your Vendor</CardTitle>
              <CardDescription>
                Share your experience with {vendorInfo.vendorName}
                {invoiceInfo?.eventName && (
                  <span> for {invoiceInfo.eventName}</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {submitted ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Thank You!</h3>
                  <p className="text-gray-600 mb-4">
                    Your review has been submitted successfully. It will be visible to other customers after admin approval.
                  </p>
                  <Button onClick={() => navigate(`/reviews/invoice/${invoiceId}`)}>
                    View All Reviews
                  </Button>
                </div>
              ) : (
                <>
                  {/* Invoice Info */}
                  {invoiceInfo && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <span className="font-semibold">Event:</span> {invoiceInfo.eventName}
                        {invoiceInfo.eventDate && (
                          <span className="ml-4">
                            <span className="font-semibold">Date:</span>{' '}
                            {new Date(invoiceInfo.eventDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </span>
                        )}
                      </p>
                    </div>
                  )}

                  {/* Vendor Info */}
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <img
                      src={vendorInfo.serviceImage}
                      alt={vendorInfo.vendorName}
                      className="w-16 h-16 object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300/f0f0f0/999999?text=No+Image';
                      }}
                    />
                    <div>
                      <h3 className="font-semibold text-lg">{vendorInfo.vendorName}</h3>
                      <p className="text-sm text-gray-600">
                        Service: {vendorInfo.serviceName}
                      </p>
                    </div>
                  </div>

                  {/* Rating */}
                  <div>
                    <Label className="text-base font-semibold mb-3 block">
                      Rating <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoveredRating(star)}
                          onMouseLeave={() => setHoveredRating(0)}
                          className="focus:outline-none transition-transform hover:scale-110"
                        >
                          <Star
                            className={`h-10 w-10 ${
                              star <= (hoveredRating || rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    {rating > 0 && (
                      <p className="text-sm text-gray-600 mt-2">
                        {rating === 1 && 'Poor'}
                        {rating === 2 && 'Fair'}
                        {rating === 3 && 'Good'}
                        {rating === 4 && 'Very Good'}
                        {rating === 5 && 'Excellent'}
                      </p>
                    )}
                  </div>

                  {/* Comment */}
                  <div>
                    <Label htmlFor="comment" className="text-base font-semibold mb-3 block">
                      Your Review (Optional)
                    </Label>
                    <Textarea
                      id="comment"
                      placeholder="Share your experience with this vendor..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={5}
                      maxLength={2000}
                      className="resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {comment.length}/2000 characters
                    </p>
                  </div>

                  {/* Submit Button */}
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting || rating === 0}
                    className="w-full bg-orange-500 hover:bg-orange-600"
                    size="lg"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Review'
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SubmitInvoiceVendorReviewPage;

