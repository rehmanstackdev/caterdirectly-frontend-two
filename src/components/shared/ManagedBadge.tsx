
import React, { useState } from 'react';
import { BadgeCheck } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useIsMobile } from '@/hooks/use-mobile';

interface ManagedBadgeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const ManagedBadge = ({ 
  className = "", 
  size = 'sm' 
}: ManagedBadgeProps) => {
  const isMobile = useIsMobile();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const tooltipContent = "This service is managed by our team, meeting the highest quality and reliability standards.";

  const badgeContent = (
    <div className={`flex items-center gap-1 bg-[#F07712] text-white text-xs px-2 py-1 rounded-full ${className}`}>
      <BadgeCheck className={`${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-3.5 h-3.5' : 'w-4 h-4'} flex-shrink-0`} />
      <span className="font-medium whitespace-nowrap">Managed</span>
    </div>
  );

  if (isMobile) {
    return (
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <button 
            className="cursor-pointer"
            aria-label="Learn more about managed services"
          >
            {badgeContent}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3">
          <p className="text-sm text-gray-700">{tooltipContent}</p>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-help">
            {badgeContent}
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs p-2">
          <p className="text-sm">{tooltipContent}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ManagedBadge;
