
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import BadgeCard from './BadgeCard';
import BadgeBenefits from './BadgeBenefits';
import { useVendorBadges } from '@/hooks/vendor/use-vendor-badges';

const BadgesTab: React.FC = () => {
  const { badges, loading } = useVendorBadges();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Badges & Incentives</CardTitle>
        <CardDescription>
          Track your progress towards earning special recognition
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {badges.map(badge => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
            
            <BadgeBenefits />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BadgesTab;
