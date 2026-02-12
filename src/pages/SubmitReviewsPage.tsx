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
}

interface VendorReview {
  vendorId: string;
  rating: number;
  comment: string;
  serviceType: string;
}

const SubmitReviewsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [vendors, setVendors] = useState<VendorInfo[]>([]);
  const [invoiceInfo, setInvoiceInfo] = useState<{ eventName: string; eventDate: string; contactName: string } | null>(null);
  const [reviews, setReviews] = useState<Record<string, VendorReview>>({});
  const [hoveredRatings, setHoveredRatings] = useState<Record<string, number>>({});

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
      
      // Fetch vendors information
      fetchVendorsInfo(decoded.invoiceId);
    } catch (error) {
      console.error('Error decoding token:', error);
      toast.error('Invalid review link');
      navigate('/');
    }
  }, [searchParams, navigate]);

  const fetchVendorsInfo = async (invoiceId: string) => {
    try {
      setLoading(true);
      console.log('[SubmitReviewsPage] Fetching vendors for invoice:', invoiceId);
      const data = await ReviewService.getInvoiceVendors(invoiceId);
      console.log('[SubmitReviewsPage] Received data:', data);
      
      if (!data || !data.vendors) {
        console.error('[SubmitReviewsPage] Invalid data structure:', data);
        toast.error('Invalid response from server');
        return;
      }
      
      // Filter out already reviewed vendors
      const unreviewedVendors = data.vendors.filter((v) => !v.alreadyReviewed);
      
      if (unreviewedVendors.length === 0) {
        toast.info('All vendors have been reviewed');
        setSubmitted(true);
      }

      setVendors(unreviewedVendors);
      setInvoiceInfo(data.invoice);

      // Initialize reviews state
      const initialReviews: Record<string, VendorReview> = {};
      unreviewedVendors.forEach((vendor) => {
        initialReviews[vendor.vendorId] = {
          vendorId: vendor.vendorId,
          rating: 0,
          comment: '',
          serviceType: vendor.serviceType,
        };
      });
      setReviews(initialReviews);
    } catch (error: any) {
      console.error('[SubmitReviewsPage] Error fetching vendors info:', error);
      console.error('[SubmitReviewsPage] Error details:', {
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

  const updateReview = (vendorId: string, field: keyof VendorReview, value: any) => {
    setReviews((prev) => ({
      ...prev,
      [vendorId]: {
        ...prev[vendorId],
        [field]: value,
      },
    }));
  };

  const setHoveredRating = (vendorId: string, rating: number) => {
    setHoveredRatings((prev) => ({
      ...prev,
      [vendorId]: rating,
    }));
  };

  const clearHoveredRating = (vendorId: string) => {
    setHoveredRatings((prev) => {
      const newState = { ...prev };
      delete newState[vendorId];
      return newState;
    });
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
    if (!tokenData) return;

    // Validate all reviews have ratings
    const reviewEntries = Object.values(reviews);
    const incompleteReviews = reviewEntries.filter((r) => r.rating === 0);
    
    if (incompleteReviews.length > 0) {
      toast.error('Please provide a rating for all vendors');
      return;
    }

    try {
      setSubmitting(true);
      await ReviewService.submitBulkReviews({
        invoiceId: tokenData.invoiceId,
        reviews: reviewEntries.map((r) => ({
          vendorId: r.vendorId,
          rating: r.rating,
          comment: r.comment.trim() || undefined,
          serviceType: normalizeServiceType(r.serviceType),
        })),
      });

      toast.success('All reviews submitted successfully! They will be visible after admin approval.');
      setSubmitted(true);
    } catch (error: any) {
      console.error('Error submitting reviews:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit reviews';
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

  if (!vendors.length && !submitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="py-8 text-center">
              <p className="text-gray-600">No vendors found to review.</p>
              <Button onClick={() => navigate('/')} className="mt-4">
                Return to Home
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-4xl mx-auto">
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
              <CardTitle className="text-2xl">Review All Vendors</CardTitle>
              <CardDescription>
                {invoiceInfo && (
                  <>
                    Rate your vendors for "{invoiceInfo.eventName}" on{' '}
                    {new Date(invoiceInfo.eventDate).toLocaleDateString()}
                  </>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {submitted ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Thank You!</h3>
                  <p className="text-gray-600 mb-4">
                    Your reviews have been submitted successfully. They will be visible to other customers after admin approval.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      onClick={() => tokenData && navigate(`/reviews/invoice/${tokenData.invoiceId}`)}
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      Show Reviews
                    </Button>
                    <Button 
                      onClick={() => navigate('/')}
                      variant="outline"
                    >
                      Return to Home
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {vendors.map((vendor) => {
                    const review = reviews[vendor.vendorId];
                    const hoveredRating = hoveredRatings[vendor.vendorId] || 0;
                    const currentRating = review?.rating || 0;

                    return (
                      <div
                        key={vendor.vendorId}
                        className="p-6 border rounded-lg space-y-4"
                      >
                        {/* Vendor Info */}
                        <div className="flex items-center gap-4">
                          <img
                            src={vendor.serviceImage}
                            alt={vendor.vendorName}
                            className="w-16 h-16 object-cover rounded-lg"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300/f0f0f0/999999?text=No+Image';
                            }}
                          />
                          <div>
                            <h3 className="font-semibold text-lg">{vendor.vendorName}</h3>
                            <p className="text-sm text-gray-600">
                              Service: {vendor.serviceName}
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
                                onClick={() =>
                                  updateReview(vendor.vendorId, 'rating', star)
                                }
                                onMouseEnter={() => setHoveredRating(vendor.vendorId, star)}
                                onMouseLeave={() => clearHoveredRating(vendor.vendorId)}
                                className="focus:outline-none transition-transform hover:scale-110"
                              >
                                <Star
                                  className={`h-8 w-8 ${
                                    star <= (hoveredRating || currentRating)
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                          {currentRating > 0 && (
                            <p className="text-sm text-gray-600 mt-2">
                              {currentRating === 1 && 'Poor'}
                              {currentRating === 2 && 'Fair'}
                              {currentRating === 3 && 'Good'}
                              {currentRating === 4 && 'Very Good'}
                              {currentRating === 5 && 'Excellent'}
                            </p>
                          )}
                        </div>

                        {/* Comment */}
                        <div>
                          <Label
                            htmlFor={`comment-${vendor.vendorId}`}
                            className="text-base font-semibold mb-3 block"
                          >
                            Your Review (Optional)
                          </Label>
                          <Textarea
                            id={`comment-${vendor.vendorId}`}
                            placeholder="Share your experience with this vendor..."
                            value={review?.comment || ''}
                            onChange={(e) =>
                              updateReview(vendor.vendorId, 'comment', e.target.value)
                            }
                            rows={4}
                            maxLength={2000}
                            className="resize-none"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {(review?.comment || '').length}/2000 characters
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  {/* Submit Button */}
                  <div className="pt-4 border-t">
                    <Button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="w-full bg-orange-500 hover:bg-orange-600"
                      size="lg"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Submitting Reviews...
                        </>
                      ) : (
                        `Submit All Reviews (${vendors.length})`
                      )}
                    </Button>
                  </div>

                  <p className="text-sm text-gray-500 text-center mt-4">
                    Your reviews will be visible to other customers after admin approval. Thank you for helping our community!
                  </p>
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

export default SubmitReviewsPage;

