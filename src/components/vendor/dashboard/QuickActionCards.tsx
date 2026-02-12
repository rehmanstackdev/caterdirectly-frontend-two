
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

interface QuickActionCardProps {
  title: string;
  description: string;
  onClick: () => void;
}

const QuickActionCard = ({ title, description, onClick }: QuickActionCardProps) => {
  return (
    <Card className="overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]" onClick={onClick}>
      <CardContent className="p-0">
        <div className="p-6 bg-[#F97316] text-white">
          <h3 className="font-semibold mb-2">{title}</h3>
          <p className="text-sm text-white/90">{description}</p>
        </div>
        <div className="p-4 text-right bg-[#F97316] text-white">
          <span className="flex items-center justify-end font-medium">
            View {title} <ArrowRight className="ml-1 w-4 h-4" />
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export const QuickActionCards = ({ setActiveTab }: { setActiveTab: (tab: string) => void }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Manage your vendor business with these quick links</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickActionCard
            title="Services"
            description="Update your service listings, prices, and availability"
            onClick={() => setActiveTab('services')}
          />
          
          <QuickActionCard
            title="Orders"
            description="Review your upcoming orders and inquiries"
            onClick={() => setActiveTab('orders')}
          />
          
          <QuickActionCard
            title="Calendar"
            description="Manage your schedule and blocked dates"
            onClick={() => setActiveTab('calendar')}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActionCards;
