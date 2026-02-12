

import { Card, CardContent } from '@/components/ui/card';

interface EventTicketsProps {
  stats: any;
  isTicketed: boolean;
}

const EventTickets = ({ stats, isTicketed }: EventTicketsProps) => {
  return (
    <div className="text-center py-10">
      <h3 className="text-xl font-semibold">Ticket Sales</h3>
      <p className="text-gray-500 mt-2">
        {isTicketed
          ? "View your ticket sales and manage ticket options."
          : "This event doesn't have ticketing enabled."}
      </p>
      
      {isTicketed && stats && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold text-green-600">
                ${(stats.revenue / 100).toFixed(2)}
              </div>
              <div className="mt-2 text-gray-500">Total Revenue</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold">
                {stats.confirmed}
              </div>
              <div className="mt-2 text-gray-500">Tickets Sold</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold text-amber-600">
                ${((stats.revenue * 0.05) / 100).toFixed(2)}
              </div>
              <div className="mt-2 text-gray-500">Platform Fee (5%)</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EventTickets;
