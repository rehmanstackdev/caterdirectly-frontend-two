import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Star, Search, TrendingUp, Users, Award, ArrowRight, Loader2, MessageSquare, User } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/cater-directly/Header';
import Footer from '@/components/cater-directly/Footer';
import ReviewService from '@/services/api/review.Service';

interface VendorReview {
  id: string;
  rating: number;
  comment?: string;
  customer?: {
    firstName?: string;
    lastName?: string;
  };
  createdAt: string;
  serviceType: string;
}

interface VendorStats {
  vendor: {
    id: string;
    businessName: string;
    user?: {
      firstName?: string;
      lastName?: string;
    };
  };
  statistics: {
    totalReviews: number;
    averageRating: number;
    ratingDistribution: Record<number, number>;
  };
  reviews: VendorReview[];
}

const ReviewsPage = () => {
  const navigate = useNavigate();
  const { vendorId: urlVendorId } = useParams<{ vendorId?: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [vendorId, setVendorId] = useState(urlVendorId || '');
  const [loading, setLoading] = useState(false);
  const [vendorStats, setVendorStats] = useState<VendorStats | null>(null);
  const [featuredReviews, setFeaturedReviews] = useState<VendorReview[]>([]);

  // Fetch vendor reviews if vendorId is in URL
  useEffect(() => {
    if (urlVendorId) {
      setVendorId(urlVendorId);
      fetchVendorReviews(urlVendorId);
    }
  }, [urlVendorId]);

  const fetchVendorReviews = async (id: string) => {
    try {
      setLoading(true);
      const data = await ReviewService.getVendorReviews(id, 1, 10);
      setVendorStats(data);
      
      if (data.reviews && data.reviews.length > 0) {
        setFeaturedReviews(data.reviews.slice(0, 6));
      }
    } catch (error: any) {
      console.error('Error fetching vendor reviews:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch reviews';
      toast.error(errorMessage);
      setVendorStats(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!vendorId.trim()) {
      toast.error('Please enter a vendor ID');
      return;
    }

    // Update URL if vendor ID changes
    if (vendorId !== urlVendorId) {
      navigate(`/reviews/vendor/${vendorId}`, { replace: true });
    } else {
      fetchVendorReviews(vendorId);
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
            className={`h-4 w-4 ${
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

  const getRatingLabel = (rating: number | string | undefined) => {
    const numRating = typeof rating === 'string' ? parseFloat(rating) : (rating || 0);
    const validRating = isNaN(numRating) ? 0 : numRating;
    
    if (validRating >= 4.5) return 'Excellent';
    if (validRating >= 4.0) return 'Very Good';
    if (validRating >= 3.5) return 'Good';
    if (validRating >= 3.0) return 'Fair';
    return 'Poor';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-50 via-white to-orange-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Award className="h-4 w-4" />
              Trusted Reviews from Real Customers
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Customer Reviews
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Discover what our customers are saying about vendors. Read authentic reviews and ratings to make informed decisions for your events.
            </p>

            {/* Search Section */}
            <Card className="max-w-2xl mx-auto shadow-lg">
              <CardContent className="p-6">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      type="text"
                      placeholder="Enter Vendor ID to view reviews..."
                      value={vendorId}
                      onChange={(e) => setVendorId(e.target.value)}
                      className="h-12 text-base"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-12 px-8 bg-orange-500 hover:bg-orange-600"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Search Reviews
                      </>
                    )}
                  </Button>
                </form>
                <p className="text-sm text-gray-500 mt-4 text-center">
                  Want to search by vendor name? Visit the marketplace and click on a vendor to see their reviews.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Vendor Stats Section */}
      {vendorStats && (
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              {/* Vendor Info */}
              <Card className="mb-8 shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl mb-2">
                        {vendorStats.vendor.businessName}
                      </CardTitle>
                      <CardDescription>
                        Vendor Reviews & Ratings
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold text-orange-500">
                        {typeof vendorStats.statistics.averageRating === 'number' 
                          ? vendorStats.statistics.averageRating.toFixed(1)
                          : parseFloat(String(vendorStats.statistics.averageRating || 0)).toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {renderStars(vendorStats.statistics.averageRating)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {getRatingLabel(vendorStats.statistics.averageRating)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-3xl font-bold text-gray-900">
                        {vendorStats.statistics.totalReviews}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Total Reviews</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-3xl font-bold text-gray-900">
                        {typeof vendorStats.statistics.averageRating === 'number'
                          ? vendorStats.statistics.averageRating.toFixed(1)
                          : parseFloat(String(vendorStats.statistics.averageRating || 0)).toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Average Rating</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-3xl font-bold text-orange-500">
                        {Math.round((vendorStats.statistics.ratingDistribution[5] / vendorStats.statistics.totalReviews) * 100) || 0}%
                      </div>
                      <div className="text-sm text-gray-600 mt-1">5-Star Reviews</div>
                    </div>
                  </div>

                  {/* Rating Distribution */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4">Rating Distribution</h3>
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map((rating) => {
                        const count = vendorStats.statistics.ratingDistribution[rating] || 0;
                        const percentage = vendorStats.statistics.totalReviews > 0
                          ? (count / vendorStats.statistics.totalReviews) * 100
                          : 0;
                        return (
                          <div key={rating} className="flex items-center gap-3">
                            <div className="flex items-center gap-1 w-20">
                              <span className="text-sm font-medium">{rating}</span>
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            </div>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-yellow-400 h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600 w-12 text-right">
                              {count}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Reviews List */}
              {vendorStats.reviews && vendorStats.reviews.length > 0 ? (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {vendorStats.reviews.map((review) => (
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
                    <p className="text-gray-600">
                      This vendor hasn't received any reviews yet. Check back later!
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      {!vendorStats && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Why Read Reviews?
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Make informed decisions with authentic customer feedback
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="text-center shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                      <Star className="h-8 w-8 text-orange-500" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">Real Ratings</h3>
                    <p className="text-gray-600">
                      See honest ratings from customers who have used the services for their events.
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                      <MessageSquare className="h-8 w-8 text-orange-500" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">Detailed Feedback</h3>
                    <p className="text-gray-600">
                      Read detailed comments and experiences to understand what to expect.
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                      <TrendingUp className="h-8 w-8 text-orange-500" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">Trusted Insights</h3>
                    <p className="text-gray-600">
                      All reviews are verified and approved before being published.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Browse Vendors in Our Marketplace
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Discover top-rated vendors for your next event. Click on any vendor to see their reviews and ratings.
            </p>
            <Button
              onClick={() => navigate('/marketplace')}
              size="lg"
              className="bg-white text-orange-500 hover:bg-gray-100 text-lg px-8 py-6"
            >
              Visit Marketplace
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ReviewsPage;

