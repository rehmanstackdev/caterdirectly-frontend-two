import { ServiceItem } from '@/types/service-types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ServiceImage from '@/components/shared/ServiceImage';
import { 
  DollarSign, 
  Users, 
  Clock, 
  Award, 
  Shirt,
  Briefcase,
  FileText
} from 'lucide-react';

export interface EventStaffServiceDetailsViewProps {
  service: ServiceItem;
}

const EventStaffServiceDetailsView = ({ service }: EventStaffServiceDetailsViewProps) => {
  const eventStaff = service.service_details?.eventStaff || service.eventStaff;

  if (!eventStaff) {
    return <div className="text-gray-400">No event staff details available</div>;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatPricingType = (type: string) => {
    if (!type) return 'Not specified';
    const types: Record<string, string> = {
      'hourly_rate': 'Hourly Rate',
      'daily_rate': 'Daily Rate',
      'flat_rate': 'Flat Rate',
      'per_person': 'Per Person',
      'per_day': 'Per Day',
      'per_hour': 'Per Hour'
    };
    return types[type] || type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="space-y-6">
      {/* Service Image */}
      {eventStaff.serviceImage && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Service Image
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-w-2xl mx-auto">
              <div className="aspect-[4/3] w-full rounded-lg overflow-hidden border">
                <ServiceImage 
                  src={eventStaff.serviceImage}
                  alt={service.name || service.serviceName}
                  className="w-full h-full object-cover"
                  imageId={`event-staff-${service.id}`}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pricing & Requirements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Pricing Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Pricing Type</p>
              <Badge variant="secondary" className="text-sm">
                {formatPricingType(eventStaff.pricingType)}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Rate</p>
              <p className="text-2xl font-bold text-[#F07712]">
                {formatCurrency(eventStaff.price)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {eventStaff.pricingType === 'hourly_rate' ? 'per hour' : 
                 eventStaff.pricingType === 'daily_rate' ? 'per day' : 
                 eventStaff.pricingType === 'per_person' ? 'per person' : ''}
              </p>
            </div>
            {eventStaff.minimumHours && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <p className="text-sm font-medium text-gray-500">Minimum Hours</p>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {eventStaff.minimumHours} hours
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Minimum booking requirement
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Service Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Service Name</p>
              <p className="font-semibold text-gray-900 text-lg">
                {service.name || service.serviceName}
              </p>
            </div>
            {service.description && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Overview</p>
                <p className="text-sm text-gray-700 line-clamp-3">
                  {service.description}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Attire Options */}
      {eventStaff.attireOptions && eventStaff.attireOptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shirt className="h-5 w-5" />
              Attire Options
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {eventStaff.attireOptions.map((option: string, index: number) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="py-2 px-4 text-sm bg-blue-50 text-blue-700 border-blue-200"
                >
                  <Shirt className="h-3 w-3 mr-1.5" />
                  {option.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-3">
              Available dress code options for your event
            </p>
          </CardContent>
        </Card>
      )}

      {/* Qualifications & Experience */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-600" />
            Qualifications & Experience
          </CardTitle>
        </CardHeader>
        <CardContent>
          {eventStaff.qualificationsExperience ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                {eventStaff.qualificationsExperience}
              </p>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Award className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No qualifications specified</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Full Description */}
      {service.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Full Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {service.description}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EventStaffServiceDetailsView;