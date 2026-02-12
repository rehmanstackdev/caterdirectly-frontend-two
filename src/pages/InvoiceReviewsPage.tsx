import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, ArrowLeft, Loader2, MessageSquare, Calendar, User, Plus } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/cater-directly/Header';
import Footer from '@/components/cater-directly/Footer';
import ReviewService, { VendorInfo } from '@/services/api/review.Service';

interface Review {
  id: string;
  rating: number;
  comment?: string;
  customer?: {
    firstName?: string;
    lastName?: string;
  };
  vendor?: {
    id: string;
    businessName: string;
    user?: {
      firstName?: string;
      lastName?: string;
    };
  };
  invoice?: {
    id: string;
    eventName?: string;
    eventDate?: string;
  };
  serviceType: string;
  createdAt: string;
  updatedAt: string;
}

const InvoiceReviewsPage = () => {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [invoiceInfo, setInvoiceInfo] = useState<{ eventName?: string; eventDate?: string } | null>(null);
  const [vendors, setVendors] = useState<VendorInfo[]>([]);

  useEffect(() => {
    if (invoiceId) {
      fetchInvoiceReviews(invoiceId);
    } else {
      toast.error('Invalid invoice ID');
      navigate('/reviews');
    }
  }, [invoiceId, navigate]);

  const fetchInvoiceReviews = async (id: string) => {
    try {
      setLoading(true);
      
      // Fetch both reviews and vendors
      const [reviewsData, vendorsData] = await Promise.all([
        ReviewService.getInvoiceReviews(id),
        ReviewService.getInvoiceVendors(id).catch(() => null), // Don't fail if vendors endpoint fails
      ]);
      
      // Handle reviews data
      if (Array.isArray(reviewsData)) {
        setReviews(reviewsData);
        if (reviewsData.length > 0 && reviewsData[0].invoice) {
          setInvoiceInfo({
            eventName: reviewsData[0].invoice.eventName,
            eventDate: reviewsData[0].invoice.eventDate,
          });
        }
      } else if (reviewsData && typeof reviewsData === 'object') {
        if (reviewsData.invoice) {
          setInvoiceInfo({
            eventName: reviewsData.invoice.eventName,
            eventDate: reviewsData.invoice.eventDate,
          });
        }
        if (Array.isArray(reviewsData.reviews)) {
          setReviews(reviewsData.reviews);
        } else {
          setReviews([]);
        }
      } else {
        setReviews([]);
      }

      // Handle vendors data
      if (vendorsData && vendorsData.vendors) {
        setVendors(vendorsData.vendors);
        // Update invoice info from vendors data if not already set
        if (!invoiceInfo && vendorsData.invoice) {
          setInvoiceInfo({
            eventName: vendorsData.invoice.eventName,
            eventDate: vendorsData.invoice.eventDate,
          });
        }
      }
    } catch (error: any) {
      console.error('Error fetching invoice reviews:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch reviews';
      toast.error(errorMessage);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number | string | undefined) => {
    // Convert to number and handle edge cases
    const numRating = typeof rating === 'string' ? parseFloat(rating) : (rating || 0);
    const validRating = isNaN(numRating) ? 0 : numRating;
    
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= Math.round(validRating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm font-medium text-gray-700">
          {validRating.toFixed(1)}
        </span>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatEventDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-500" />
            <p className="text-gray-600">Loading reviews...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-6xl mx-auto">
          {/* Invoice Info Card */}
          {invoiceInfo && (
            <Card className="mb-8 shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">
                      {invoiceInfo.eventName || 'Event Reviews'}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Event Date: {formatEventDate(invoiceInfo.eventDate)}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-500">
                      {reviews.length}
                    </div>
                    <div className="text-sm text-gray-600">
                      {reviews.length === 1 ? 'Review' : 'Reviews'}
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          )}

          {/* Vendors to Review Section */}
          {vendors.length > 0 && (
            <Card className="mb-8 shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Vendors for This Invoice</CardTitle>
                    <CardDescription>
                      Submit a review for vendors who provided services for this event
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => {
                      // Create a token for bulk review (simple base64 encoded invoiceId)
                      const token = btoa(JSON.stringify({ invoiceId }));
                      navigate(`/submit-reviews?token=${token}`);
                    }}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    Review All Vendors
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {vendors.map((vendor) => (
                    <Card key={vendor.vendorId} className="relative">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <img
                            src={vendor.serviceImage}
                            alt={vendor.vendorName}
                            className="w-12 h-12 object-cover rounded-lg"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300/f0f0f0/999999?text=No+Image';
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm truncate">{vendor.vendorName}</h4>
                            <p className="text-xs text-gray-600 truncate">{vendor.serviceName}</p>
                            {vendor.alreadyReviewed ? (
                              <div className="mt-2">
                                <span className="text-xs text-green-600 font-medium">✓ Reviewed</span>
                                {vendor.review && (
                                  <div className="flex items-center gap-1 mt-1">
                                    {[1, 2, 3, 4, 5].map((star) => {
                                      const reviewRating = typeof vendor.review.rating === 'string' 
                                        ? parseFloat(vendor.review.rating) 
                                        : (vendor.review.rating || 0);
                                      const validRating = isNaN(reviewRating) ? 0 : reviewRating;
                                      return (
                                        <Star
                                          key={star}
                                          className={`h-3 w-3 ${
                                            star <= Math.round(validRating)
                                              ? 'fill-yellow-400 text-yellow-400'
                                              : 'text-gray-300'
                                          }`}
                                        />
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                className="mt-2 w-full bg-orange-500 hover:bg-orange-600"
                                onClick={() => navigate(`/reviews/invoice/${invoiceId}/vendor/${vendor.vendorId}`)}
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Submit Review
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reviews List */}
          {reviews.length > 0 ? (
            <div>
              <h2 className="text-2xl font-bold mb-6">All Reviews for This Invoice</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reviews.map((review) => (
                  <Card key={review.id} className="shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden group">
                    <CardContent className="p-6 bg-gradient-to-br from-white to-gray-50">
                      {/* Header Section */}
                      <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-200">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                              <User className="h-4 w-4 text-white" />
                            </div>
                            <h3 className="font-semibold text-base text-gray-900 truncate">
                              {review.customer?.firstName && review.customer?.lastName
                                ? `${review.customer.firstName} ${review.customer.lastName}`
                                : 'Anonymous Customer'}
                            </h3>
                          </div>
                          {review.vendor && (
                            <p className="text-sm text-gray-600 ml-10 mb-1">
                              Reviewed: <span className="font-semibold text-gray-800">{review.vendor.businessName}</span>
                            </p>
                          )}
                          <p className="text-xs text-gray-500 ml-10">
                            {formatDate(review.createdAt)}
                          </p>
                        </div>
                        <div className="flex-shrink-0 ml-4">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      
                      {/* Comment Section */}
                      {review.comment && (
                        <div className="mt-4">
                          <p className="text-gray-700 leading-relaxed text-sm line-clamp-4">
                            {review.comment}
                          </p>
                        </div>
                      )}
                      
                      {/* Footer Section */}
                      {review.serviceType && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <span className="inline-flex items-center bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-sm">
                            {review.serviceType.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <Card className="shadow-md">
              <CardContent className="p-12 text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Reviews Yet
                </h3>
                <p className="text-gray-600 mb-6">
                  This invoice doesn't have any reviews yet. Reviews will appear here once customers submit them.
                </p>
                <Button
                  onClick={() => navigate('/reviews')}
                  variant="outline"
                >
                  Browse Other Reviews
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default InvoiceReviewsPage;

