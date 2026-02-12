import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  Clock, 
  Award
} from 'lucide-react';

interface EventStaffServiceDetailsViewProps {
  details: any;
}

const EventStaffServiceDetailsView: React.FC<EventStaffServiceDetailsViewProps> = ({ details }) => {
  if (!details) return null;

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
    return types[type] || type.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="space-y-6">
      {/* Pricing & Requirements */}
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
              {formatPricingType(details.pricingType)}
            </Badge>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Rate</p>
            <p className="text-2xl font-bold text-[#F07712]">
              {formatCurrency(details.price)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {details.pricingType === 'hourly_rate' ? 'per hour' : 
               details.pricingType === 'daily_rate' ? 'per day' : 
               details.pricingType === 'per_person' ? 'per person' : ''}
            </p>
          </div>
          {details.minimumHours && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-gray-500" />
                <p className="text-sm font-medium text-gray-500">Minimum Hours</p>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {details.minimumHours} hours
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Minimum booking requirement
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Qualifications & Experience */}
      {details.qualificationsExperience && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-600" />
              Qualifications & Experience
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                {details.qualificationsExperience}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EventStaffServiceDetailsView;
