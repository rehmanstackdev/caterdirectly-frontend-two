
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Badge as BadgeType } from '@/hooks/vendor/use-vendor-badges';
import { Award, Flag, Star } from 'lucide-react';

interface BadgeCardProps {
  badge: BadgeType;
}

const BadgeCard: React.FC<BadgeCardProps> = ({ badge }) => {
  const getIconByName = (iconName: BadgeType['iconName']) => {
    switch (iconName) {
      case 'award': return Award;
      case 'flag': return Flag;
      case 'star': return Star;
      default: return Award;
    }
  };
  
  const IconComponent = getIconByName(badge.iconName);
  
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`p-2 rounded-full ${
            badge.achieved ? 'bg-green-100' : 'bg-gray-100'
          }`}>
            <IconComponent className="h-5 w-5" />
          </div>
          <div className="ml-3">
            <h3 className="font-medium">{badge.name}</h3>
            <p className="text-sm text-gray-500">{badge.description}</p>
          </div>
        </div>
        
        {badge.achieved && (
          <Badge className="bg-green-100 text-green-800">
            Achieved
          </Badge>
        )}
      </div>
      
      {!badge.achieved && (
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-500">Progress</span>
            <span className="text-sm font-medium">{badge.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-[#F07712] h-2 rounded-full" 
              style={{ width: `${badge.progress}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BadgeCard;
