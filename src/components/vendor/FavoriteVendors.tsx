
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import ServiceImage from "../shared/ServiceImage";
import { ChevronRight, Heart, LogIn } from "lucide-react";
import { useFavorites, FavoritedVendor } from '@/hooks/use-favorites';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface FavoriteVendorsProps {
  limit?: number;
}

const FavoriteVendors = ({ limit = 5 }: FavoriteVendorsProps) => {
  const { getFavoritedVendors, loading } = useFavorites();
  const { user } = useAuth();
  const navigate = useNavigate();
  const favoritedVendors = getFavoritedVendors();
  
  const handleVendorClick = (vendor: FavoritedVendor) => {
    navigate(`/vendors/${vendor.id}`, { 
      state: { 
        vendor,
        favoritedOnly: true 
      }
    });
  };
  
  const handleViewAll = () => {
    navigate('/favorites');
  };

  const handleSignIn = () => {
    navigate('/host/login', { state: { from: window.location.pathname } });
  };

  // Display only the specified number of vendors
  const displayedVendors = favoritedVendors.slice(0, limit);
  
  return (
    <Card className="w-full shadow-md border-0 rounded-[12px] bg-white overflow-hidden">
      <CardHeader className="py-3 px-5 flex items-center justify-between">
        <CardTitle className="text-[16px] font-semibold text-black">Favorite Vendors</CardTitle>
        <Button
          variant="ghost"
          onClick={handleViewAll}
          className="h-7 px-2 text-xs text-[#F07712] hover:bg-transparent"
          disabled={!user}
        >
          View all
          <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
        </Button>
      </CardHeader>
      <CardContent className="px-5 pt-0 pb-3">
        {!user ? (
          // Show login prompt for unauthenticated users
          <div className="text-center py-4">
            <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-600 mb-3">Sign in to see your favorite vendors</p>
            <Button
              onClick={handleSignIn}
              size="sm"
              className="bg-[#F07712] hover:bg-[#F07712]/90 text-white"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          </div>
        ) : loading ? (
          // Show loading state
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#F07712]"></div>
            <span className="ml-2 text-sm text-gray-600">Loading favorites...</span>
          </div>
        ) : displayedVendors.length > 0 ? (
          // Show favorite vendors
          <div className="flex gap-3 overflow-x-auto pb-1">
            {displayedVendors.map((vendor) => (
              <div 
                key={vendor.id} 
                className="flex flex-col min-w-[112px] border border-[rgba(0,0,0,0.2)] border-opacity-20 rounded-lg p-2 cursor-pointer hover:shadow-md transition-all duration-300"
                onClick={() => handleVendorClick(vendor)}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-[31px] h-[31px] rounded-full overflow-hidden flex-shrink-0">
                    <ServiceImage 
                      src={vendor.image} 
                      alt={vendor.name} 
                      aspectRatio="aspect-square"
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-black leading-[18px]">
                      {vendor.name}
                    </span>
                    <span className="text-[10px] font-light text-[#525252] leading-[15px]">
                      {vendor.serviceCount} {vendor.serviceCount === 1 ? 'service' : 'services'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Show empty state for authenticated users
          <div className="text-center py-4 text-gray-500">
            <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm">No favorite vendors yet.</p>
            <p className="text-xs mt-1">Browse the marketplace and click the heart icon to add services to your favorites.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FavoriteVendors;
