import React, { useState, useEffect } from 'react';
import Dashboard from '@/components/dashboard/Dashboard';
import { useAuth } from '@/contexts/auth';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VendorCard } from '@/components/marketplace/vendor-card';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { ServiceItem, ServiceType, PriceType } from '@/types/service-types';
import HostService from '@/services/api/host/host.Service';

interface FavoritedVendor {
  id: string;
  name: string;
  image: string;
  serviceCount: number;
  services: ServiceItem[];
}

const mapServiceType = (apiType: string): ServiceType => {
  switch (apiType) {
    case 'party_rentals': return 'party-rentals';
    case 'events_staff': return 'staff';
    case 'venues': return 'venues';
    case 'catering': return 'catering';
    default: return 'catering';
  }
};

const mapStatus = (backendStatus: string): 'draft' | 'pending_approval' | 'approved' | 'rejected' => {
  switch (backendStatus) {
    case 'approved': return 'approved';
    case 'rejected': return 'rejected';
    case 'drafted': return 'draft';
    case 'pending': return 'pending_approval';
    default: return 'pending_approval';
  }
};

const transformFavoriteService = (service: any): ServiceItem => {
  const vendorName = service.vendor?.businessName || 'Unknown Vendor';
  
  let price = 'Contact for pricing';
  let price_type: PriceType | undefined;
  
  if (service.venue) {
    price = service.venue.price ? `$${service.venue.price}` : 'Contact for pricing';
    price_type = service.venue.pricingType === 'per_person' ? 'per_person' : 
                 service.venue.pricingType === 'flat_rate' ? 'flat_rate' : undefined;
  } else if (service.eventStaff) {
    price = service.eventStaff.price ? `$${service.eventStaff.price}` : 'Contact for pricing';
    price_type = service.eventStaff.pricingType === 'per_hour' ? 'per_hour' : 
                 service.eventStaff.pricingType === 'flat_rate' ? 'flat_rate' : undefined;
  } else if (service.partyRental) {
    price = service.partyRental.price ? `$${service.partyRental.price}` : 'Contact for pricing';
    price_type = service.partyRental.pricingType === 'flat_rate' ? 'flat_rate' : undefined;
  } else if (service.catering) {
    price = service.catering.minimumOrderAmount ? `$${service.catering.minimumOrderAmount}` : 'Contact for pricing';
  }
  
  const image = service.venue?.serviceImage || 
                service.eventStaff?.serviceImage || 
                service.partyRental?.serviceImage || 
                service.catering?.menuPhoto || 
                '';
  
  const location = service.vendor?.fullAddress || 
                   (service.vendor?.city && service.vendor?.state 
                     ? `${service.vendor.city}, ${service.vendor.state}` 
                     : '') || 
                   '';
  
  const isActive = service.status === 'approved' && service.visibleStatus === 'active';
  const isManaged = service.manage || service.catering?.manage || service.service_details?.manage || false;
  
  return {
    id: service.id,
    name: service.serviceName,
    type: mapServiceType(service.serviceType),
    serviceType: service.serviceType,
    description: service.description || '',
    price,
    price_type,
    image,
    status: mapStatus(service.status),
    active: isActive,
    isManaged,
    vendorName,
    vendor_id: service.vendor?.id || '',
    location,
    reviews: '0',
    rating: '0',
    createdAt: service.createdAt,
    updatedAt: service.updatedAt,
    service_details: {
      ...(service.venue && { venue: service.venue }),
      ...(service.eventStaff && { eventStaff: service.eventStaff }),
      ...(service.partyRental && { partyRental: service.partyRental }),
      ...(service.catering && { catering: service.catering }),
      ...(service.createdBy && { createdBy: service.createdBy }),
      ...(service.vendor && { vendor: service.vendor })
    }
  };
};

const FavoritesPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [favoritedServices, setFavoritedServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const loadFavorites = async () => {
    if (!user) {
      setFavoritedServices([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await HostService.getFavouriteServices();
      
      let favoritesData: any[] = [];
      if (response?.data && Array.isArray(response.data)) {
        favoritesData = response.data;
      } else if (Array.isArray(response)) {
        favoritesData = response;
      }
      
      const services = favoritesData
        .filter(service => service.isFavourite === true)
        .map(transformFavoriteService);

      setFavoritedServices(services);
    } catch (error: any) {
      console.error('Error loading favorites:', error);
      toast.error('Failed to load favorites');
      setFavoritedServices([]);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (serviceId: string) => {
    try {
      await HostService.removeFavouriteService(serviceId);
      setFavoritedServices(prev => prev.filter(item => item.id !== serviceId));
      toast.success('Removed from favorites');
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Failed to remove favorite');
    }
  };

  const getFavoritedVendors = (): FavoritedVendor[] => {
    const vendorsMap = new Map<string, FavoritedVendor>();
    
    favoritedServices.forEach(service => {
      const vendorName = service.vendorName;
      
      if (!vendorsMap.has(vendorName)) {
        vendorsMap.set(vendorName, {
          id: vendorName.replace(/\s+/g, '-').toLowerCase(),
          name: vendorName,
          image: service.image || '', 
          serviceCount: 1,
          services: [service]
        });
      } else {
        const vendor = vendorsMap.get(vendorName)!;
        vendor.serviceCount += 1;
        vendor.services.push(service);
      }
    });
    
    return Array.from(vendorsMap.values());
  };
  
  const favoritedVendors = getFavoritedVendors();

  useEffect(() => {
    loadFavorites();
  }, [user]);
  
  const handleViewDetails = (serviceId: string) => {
    navigate(`/marketplace?id=${serviceId}`);
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/host/login', { 
        state: { 
          from: '/favorites',
          message: 'Please log in to view your favorites' 
        }
      });
    }
  }, [user, authLoading, navigate]);

  if (authLoading || (user && loading)) {
    return (
      <Dashboard userRole="event-host" activeTab="favorites">
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Your Favorites</h1>
          </div>
          
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F07712] mx-auto"></div>
                  <p className="text-gray-500 mt-4">Loading your favorites...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Dashboard>
    );
  }

  if (!user) {
    return (
      <Dashboard userRole="event-host" activeTab="favorites">
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Your Favorites</h1>
          </div>
          
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-xl font-medium text-gray-500 mb-2">Sign in to view your favorites</p>
                <p className="text-gray-400 mb-6">Keep track of your favorite services across all your devices</p>
                <Button 
                  onClick={() => navigate('/host/login', { state: { from: '/favorites' } })}
                  className="bg-[#F07712] hover:bg-[#F07712]/90 text-white"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Dashboard>
    );
  }
  
  return (
    <Dashboard userRole="event-host" activeTab="favorites">
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Your Favorites</h1>
        </div>
        
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle>Saved Services</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="all">All Services ({favoritedServices.length})</TabsTrigger>
                {favoritedVendors.length > 0 && (
                  <TabsTrigger value="by-vendor">By Vendor ({favoritedVendors.length})</TabsTrigger>
                )}
              </TabsList>
              
              <TabsContent value="all">
                {favoritedServices.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favoritedServices.map(service => (
                      <div key={service.id} className="relative">
                        <VendorCard
                          id={service.id}
                          image={service.image}
                          name={service.name}
                          vendorName={service.vendorName}
                          rating={service.rating || "0"}
                          reviews={service.reviews || "0"}
                          location={service.location || ""}
                          price={service.price}
                          description={service.description || ""}
                          available={service.active !== false}
                          isManaged={service.isManaged}
                          onViewDetails={() => handleViewDetails(service.id)}
                          vendorType={service.type}
                          service={service}
                        />
                        <button
                          onClick={() => removeFavorite(service.id)}
                          className="absolute top-3 right-3 p-2 bg-red-50 rounded-full hover:bg-red-100 transition-colors"
                        >
                          <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-xl font-medium text-gray-500">No favorite services yet</p>
                    <p className="text-gray-400 mt-2">Browse the marketplace and click the heart icon to add services to your favorites</p>
                    <button 
                      className="mt-6 px-4 py-2 bg-[#F07712] text-white rounded-md font-medium hover:bg-[#F07712]/90 transition-colors"
                      onClick={() => navigate('/marketplace')}
                    >
                      Browse Marketplace
                    </button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="by-vendor">
                {favoritedVendors.length > 0 ? (
                  <div className="space-y-12">
                    {favoritedVendors.map(vendor => (
                      <div key={vendor.id} className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full overflow-hidden">
                            <img 
                              src={vendor.image} 
                              alt={vendor.name}
                              className="w-full h-full object-cover" 
                            />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold">{vendor.name}</h3>
                            <p className="text-gray-500">{vendor.serviceCount} {vendor.serviceCount === 1 ? 'service' : 'services'}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {vendor.services.map(service => (
                            <div key={service.id} className="relative">
                              <VendorCard
                                id={service.id}
                                image={service.image}
                                name={service.name}
                                vendorName={service.vendorName}
                                rating={service.rating || "0"}
                                reviews={service.reviews || "0"}
                                location={service.location || ""}
                                price={service.price}
                                description={service.description || ""}
                                available={service.active !== false}
                                isManaged={service.isManaged}
                                onViewDetails={() => handleViewDetails(service.id)}
                                vendorType={service.type}
                                service={service}
                              />
                              <button
                                onClick={() => removeFavorite(service.id)}
                                className="absolute top-3 right-3 p-2 bg-red-50 rounded-full hover:bg-red-100 transition-colors"
                              >
                                <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-xl font-medium text-gray-500">No favorite vendors yet</p>
                    <p className="text-gray-400 mt-2">Browse the marketplace and click the heart icon to add services to your favorites</p>
                    <button 
                      className="mt-6 px-4 py-2 bg-[#F07712] text-white rounded-md font-medium hover:bg-[#F07712]/90 transition-colors"
                      onClick={() => navigate('/marketplace')}
                    >
                      Browse Marketplace
                    </button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Dashboard>
  );
};

export default FavoritesPage;