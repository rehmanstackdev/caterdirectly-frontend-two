import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/cater-directly/Header';
import Footer from '@/components/cater-directly/Footer';
import ReviewService, { VendorInfo } from '@/services/api/review.Service';

interface TokenData {
  invoiceId: string;
  vendorId: string;
  serviceId?: string;
  serviceType: string;
}

const SubmitReviewPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [vendorInfo, setVendorInfo] = useState<VendorInfo | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      toast.error('Invalid review link');
      navigate('/');
      return;
    }

    try {
      // Decode the token (browser-compatible base64 decoding)
      const decoded = JSON.parse(window.atob(token));
      setTokenData(decoded);
      
      // Fetch vendor information
      fetchVendorInfo(decoded.invoiceId, decoded.vendorId);
    } catch (error) {
      console.error('Error decoding token:', error);
      toast.error('Invalid review link');
      navigate('/');
    }
  }, [searchParams, navigate]);

  const fetchVendorInfo = async (invoiceId: string, vendorId: string) => {
    try {
      setLoading(true);
      const data = await ReviewService.getInvoiceVendors(invoiceId);
      const vendor = data.vendors.find((v) => v.vendorId === vendorId);
      
      if (!vendor) {
        toast.error('Vendor not found');
        navigate('/');
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
    } catch (error: any) {
      console.error('[SubmitReviewPage] Error fetching vendor info:', error);
      console.error('[SubmitReviewPage] Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
      });
      
      let errorMessage = 'Failed to load vendor information';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
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
    if (!tokenData || !vendorInfo || rating === 0) {
      toast.error('Please provide a rating');
      return;
    }

    try {
      setSubmitting(true);
      const normalizedServiceType = normalizeServiceType(tokenData.serviceType);
      
      await ReviewService.submitReview({
        invoiceId: tokenData.invoiceId,
        vendorId: tokenData.vendorId,
        serviceId: tokenData.serviceId,
        serviceType: normalizedServiceType,
        rating,
        comment: comment.trim() || undefined,
      });

      toast.success('Review submitted successfully! It will be visible after admin approval.');
      setSubmitted(true);
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

  if (!vendorInfo || !tokenData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Rate Your Vendor</CardTitle>
              <CardDescription>
                Share your experience with {vendorInfo.vendorName}
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
                  <Button onClick={() => navigate('/')}>
                    Return to Home
                  </Button>
                </div>
              ) : (
                <>
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

export default SubmitReviewPage;

