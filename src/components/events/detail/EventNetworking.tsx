

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';

const EventNetworking = () => {
  return (
    <div className="text-center py-10">
      <h3 className="text-xl font-semibold">Guest Networking</h3>
      <p className="text-gray-500 mt-2">
        Enable networking for your event to help guests connect with each other.
      </p>
      
      <div className="max-w-md mx-auto mt-8 space-y-6">
        <Card>
          <CardContent className="p-6 text-center">
            <h4 className="font-semibold">Guest Directory</h4>
            <p className="text-sm text-gray-500 mt-2">
              Allow attendees to view other guests and their contact information.
            </p>
            <Button variant="outline" className="mt-4">
              <Users className="mr-2 h-4 w-4" />
              Setup Directory
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <h4 className="font-semibold">Post-Event Networking</h4>
            <p className="text-sm text-gray-500 mt-2">
              Enable attendees to connect after the event is over.
            </p>
            <Button variant="outline" className="mt-4">
              <Users className="mr-2 h-4 w-4" />
              Setup Networking
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EventNetworking;
