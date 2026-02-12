
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, MapPinIcon, Users } from "lucide-react";

interface VendorSelectionSummaryProps {
  vendorName: string;
  vendorType: string;
  vendorImage?: string;
  vendorPrice?: string;
  eventDate?: string;
  eventLocation?: string;
  guestCount?: number;
}

const VendorSelectionSummary: React.FC<VendorSelectionSummaryProps> = ({
  vendorName,
  vendorType,
  vendorImage,
  vendorPrice,
  eventDate,
  eventLocation,
  guestCount
}) => {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-32 bg-gray-100">
        {vendorImage && (
          <img 
            src={vendorImage} 
            alt={vendorName} 
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div className="absolute bottom-3 left-4 text-white">
          <p className="text-xs uppercase tracking-wider">{vendorType}</p>
          <h3 className="font-bold text-xl">{vendorName}</h3>
        </div>
      </div>
      
      <CardContent className="pt-4">
        {vendorPrice && (
          <div className="mb-4">
            <p className="font-semibold text-lg text-[#F07712]">{vendorPrice}</p>
          </div>
        )}
        
        <div className="space-y-2">
          {eventDate && (
            <div className="flex items-center text-sm">
              <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
              <span>{eventDate}</span>
            </div>
          )}
          
          {eventLocation && (
            <div className="flex items-center text-sm">
              <MapPinIcon className="mr-2 h-4 w-4 text-gray-500" />
              <span>{eventLocation}</span>
            </div>
          )}
          
          {guestCount && (
            <div className="flex items-center text-sm">
              <Users className="mr-2 h-4 w-4 text-gray-500" />
              <span>{guestCount} guests</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VendorSelectionSummary;
