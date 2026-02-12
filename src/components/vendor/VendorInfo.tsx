
import React, { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import vendorService from "@/services/api/vendor/vendor.Service";
import vendorAnalyticsService from "@/services/api/vendor/analytics.Service";

interface VendorInfoProps {
  vendorName: string;
}

interface VendorData {
  name: string;
  rating: number;
  reviews: number;
  description: string;
  location: string;
  yearsInBusiness: number;
  completedEvents: number;
}

const VendorInfo = ({ vendorName }: VendorInfoProps) => {
  const { user } = useAuth();
  const [vendorData, setVendorData] = useState<VendorData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendorData = async () => {
      if (!user) {
        console.log('VendorInfo: No user found');
        return;
      }

      console.log('VendorInfo: Fetching data for user:', user.id);

      try {
        // Get vendor data from backend API
        const vendor = await vendorService.getVendorByUserId(user.id);

        if (!vendor || !vendor.id) {
          console.error('VendorInfo: No vendor found for user');
          return;
        }

        console.log('VendorInfo: Found vendor:', vendor);

        // Use vendor analytics API for ratings and reviews
        try {
          const analytics = await vendorAnalyticsService.getVendorAnalytics();

          const totalReviews = analytics.reviews?.totalReviews || 0;
          const avgRating = analytics.reviews?.averageRating || 0;
          const completedEvents = analytics.orders?.fulfilledOrders || 0;

          const yearsInBusiness = vendor.createdAt 
            ? Math.max(1, new Date().getFullYear() - new Date(vendor.createdAt).getFullYear())
            : 1;

          const location = [vendor.city, vendor.state].filter(Boolean).join(', ') || 'Location not specified';

          const finalVendorData = {
            name: vendor.businessName,
            rating: avgRating,
            reviews: totalReviews,
            description: vendor.businessName + " - Professional event services provider",
            location,
            yearsInBusiness,
            completedEvents
          };

          console.log('VendorInfo: Setting vendor data:', finalVendorData);
          setVendorData(finalVendorData);
        } catch (analyticsError) {
          console.error('Error fetching analytics:', analyticsError);
          // Fallback data
          const location = [vendor.city, vendor.state].filter(Boolean).join(', ') || 'Location not specified';
          const finalVendorData = {
            name: vendor.businessName,
            rating: 0,
            reviews: 0,
            description: vendor.businessName + " - Professional event services provider",
            location,
            yearsInBusiness: 1,
            completedEvents: 0
          };
          setVendorData(finalVendorData);
        }
      } catch (error) {
        console.error('Error fetching vendor data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVendorData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#F07712]"></div>
      </div>
    );
  }

  if (!vendorData) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Unable to load vendor information</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{vendorData.name}</h1>
          <p className="text-gray-600 mt-2">{vendorData.location}</p>
        </div>
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-400 fill-current" />
          <span className="font-semibold">{vendorData.rating.toFixed(1)}</span>
          <span className="text-gray-600">({vendorData.reviews} reviews)</span>
        </div>
      </div>

      <p className="text-gray-700">{vendorData.description}</p>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-orange-50 rounded-lg">
          <p className="text-orange-600 font-semibold">Years in Business</p>
          <p className="text-2xl font-bold text-gray-900">{vendorData.yearsInBusiness}+</p>
        </div>
        <div className="p-4 bg-orange-50 rounded-lg">
          <p className="text-orange-600 font-semibold">Completed Events</p>
          <p className="text-2xl font-bold text-gray-900">{vendorData.completedEvents}</p>
        </div>
      </div>
    </div>
  );
};

export default VendorInfo;
