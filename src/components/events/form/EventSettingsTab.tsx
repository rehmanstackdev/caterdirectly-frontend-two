
import { Card } from '@/components/ui/card';
import { UseFormReturn } from 'react-hook-form';
import EventInstructions from '@/components/events/form/settings/EventInstructions';
import EventVisibilityOptions from '@/components/events/form/settings/EventVisibilityOptions';
import SocialMediaLinks from '@/components/events/form/settings/SocialMediaLinks';
import EventCapacityAndUrl from '@/components/events/form/settings/EventCapacityAndUrl';

interface EventSettingsTabProps {
  form: UseFormReturn<any>;
}

const EventSettingsTab = ({ form }: EventSettingsTabProps) => {
  return (
    <div className="space-y-8">
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Event Capacity & Website</h3>
        <EventCapacityAndUrl form={form} />
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Event Settings</h3>
        <EventVisibilityOptions form={form} />
      </Card>
      
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Guest Instructions</h3>
        <EventInstructions form={form} />
      </Card>
      
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Social Media</h3>
        <p className="text-gray-500 text-sm mb-4">
          Share your social media profiles with event attendees
        </p>
        <SocialMediaLinks form={form} />
      </Card>
    </div>
  );
};

export default EventSettingsTab;
