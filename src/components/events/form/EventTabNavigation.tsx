
import { TabsList, TabsTrigger } from '@/components/ui/tabs';

interface EventTabNavigationProps {
  isTicketed: boolean;
}

const EventTabNavigation = ({ isTicketed }: EventTabNavigationProps) => {
  return (
    <TabsList className="w-full mb-6">
      <TabsTrigger value="basic" className="flex-1">Basic Info</TabsTrigger>
      <TabsTrigger value="settings" className="flex-1">Event Settings</TabsTrigger>
      {isTicketed && (
        <TabsTrigger value="tickets" className="flex-1">Tickets</TabsTrigger>
      )}
    </TabsList>
  );
};

export default EventTabNavigation;
