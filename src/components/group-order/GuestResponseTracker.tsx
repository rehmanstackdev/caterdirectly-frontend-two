
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Clock, Check, X } from "lucide-react";

interface GuestResponse {
  email: string;
  name: string;
  status: 'pending' | 'responded' | 'declined';
  responseTime?: Date;
}

interface GuestResponseTrackerProps {
  guests: GuestResponse[];
  cutoffTime?: Date;
}

const GuestResponseTracker = ({ 
  guests,
  cutoffTime
}: GuestResponseTrackerProps) => {
  const totalGuests = guests.length;
  const respondedGuests = guests.filter(g => g.status === 'responded').length;
  const declinedGuests = guests.filter(g => g.status === 'declined').length;
  const pendingGuests = guests.filter(g => g.status === 'pending').length;
  
  const responseRate = totalGuests > 0 ? Math.round((respondedGuests / totalGuests) * 100) : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Guest Responses</CardTitle>
          {cutoffTime && (
            <div className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded">
              <Clock className="h-3 w-3" />
              <span>Cutoff: {cutoffTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Response progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{respondedGuests} of {totalGuests} responded</span>
              <span>{responseRate}%</span>
            </div>
            <Progress value={responseRate} className="h-2" />
          </div>
          
          {/* Response stats */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-blue-50 p-2 rounded">
              <p className="text-xs text-blue-600">Pending</p>
              <p className="font-bold text-blue-700">{pendingGuests}</p>
            </div>
            <div className="bg-green-50 p-2 rounded">
              <p className="text-xs text-green-600">Responded</p>
              <p className="font-bold text-green-700">{respondedGuests}</p>
            </div>
            <div className="bg-red-50 p-2 rounded">
              <p className="text-xs text-red-600">Declined</p>
              <p className="font-bold text-red-700">{declinedGuests}</p>
            </div>
          </div>
          
          {/* Guest list */}
          <div className="max-h-60 overflow-y-auto space-y-2">
            {guests.map((guest, idx) => (
              <div 
                key={idx}
                className="flex justify-between items-center p-2 text-sm border-b last:border-0"
              >
                <span className="font-medium">{guest.name}</span>
                {guest.status === 'pending' ? (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Pending</span>
                ) : guest.status === 'responded' ? (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded flex items-center gap-1">
                    <Check className="w-3 h-3" /> Ordered
                  </span>
                ) : (
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded flex items-center gap-1">
                    <X className="w-3 h-3" /> Declined
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GuestResponseTracker;
