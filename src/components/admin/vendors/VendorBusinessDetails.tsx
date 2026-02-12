

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit2, Save, X } from 'lucide-react';
import SimpleAddressAutocomplete from '@/components/shared/SimpleAddressAutocomplete';
import { LocationData } from '@/components/shared/address/types';

interface VendorBusinessDetailsProps {
  vendor: any;
  updateVendorAddress: (addressData: {
    address: string;
    city: string;
    state: string;
    zip_code: string;
    full_address: string;
    coordinates_lat: number;
    coordinates_lng: number;
  }) => Promise<boolean>;
}

export const VendorBusinessDetails = ({ vendor, updateVendorAddress }: VendorBusinessDetailsProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [addressData, setAddressData] = useState({
    fullAddress: vendor.full_address || '',
    address: vendor.address || '',
    city: vendor.city || '',
    state: vendor.state || '',
    zipCode: vendor.zip_code || '',
    coordinates: {
      lat: vendor.coordinates_lat || 0,
      lng: vendor.coordinates_lng || 0
    }
  });

  const handleAddressSelected = (address: string, locationData?: LocationData) => {
    if (locationData) {
      setAddressData({
        fullAddress: address,
        address: locationData.street || '',
        city: locationData.city,
        state: locationData.state,
        zipCode: locationData.zipCode || '',
        coordinates: {
          lat: locationData.lat || 0,
          lng: locationData.lng || 0
        }
      });
    }
  };

  const handleSaveAddress = async () => {
    setIsUpdating(true);
    const success = await updateVendorAddress({
      address: addressData.address,
      city: addressData.city,
      state: addressData.state,
      zip_code: addressData.zipCode,
      full_address: addressData.fullAddress,
      coordinates_lat: addressData.coordinates.lat,
      coordinates_lng: addressData.coordinates.lng
    });
    
    if (success) {
      setIsEditing(false);
    }
    setIsUpdating(false);
  };

  const handleCancel = () => {
    setAddressData({
      fullAddress: vendor.full_address || '',
      address: vendor.address || '',
      city: vendor.city || '',
      state: vendor.state || '',
      zipCode: vendor.zip_code || '',
      coordinates: {
        lat: vendor.coordinates_lat || 0,
        lng: vendor.coordinates_lng || 0
      }
    });
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Business Details
          {!isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">EIN/TIN</h4>
            <p className="text-gray-600">{vendor.ein_tin || 'Not provided'}</p>
          </div>
          
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">Business Address</h4>
              {isEditing && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancel}
                    disabled={isUpdating}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleSaveAddress}
                    disabled={isUpdating}
                  >
                    <Save className="h-4 w-4" />
                    {isUpdating ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              )}
            </div>
            
            {isEditing ? (
              <div className="space-y-3">
                <SimpleAddressAutocomplete
                  placeholder="Enter complete business address"
                  onAddressSelected={handleAddressSelected}
                  value={addressData.fullAddress}
                  className="w-full"
                />
                {addressData.fullAddress && (
                  <div className="text-xs text-muted-foreground bg-green-50 p-2 rounded">
                    ✓ Using Google-validated address for accurate delivery calculations
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-600">
                {vendor.full_address || vendor.address ? (
                  <>
                    {vendor.full_address && <p className="font-medium">{vendor.full_address}</p>}
                    {!vendor.full_address && vendor.address && (
                      <>
                        <p>{vendor.address}</p>
                        <p>
                          {vendor.city}{vendor.city && vendor.state && ', '}{vendor.state} {vendor.zip_code}
                        </p>
                      </>
                    )}
                  </>
                ) : (
                  <p>Address not provided</p>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
