
import React from "react";
import Dashboard from "@/components/dashboard/Dashboard";

import DashboardStats from "@/components/dashboard/DashboardStats";
import UpcomingEventsTable from "@/components/dashboard/UpcomingEventsTable";
import { useProfile } from "@/hooks/use-profile";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { UsersRound, Calendar, Heart } from "lucide-react";

const EventHostDashboard = () => {
  const { profileData, isLoading } = useProfile();
  
  const welcomeMessage = isLoading 
    ? "Welcome back" 
    : `Welcome back, ${profileData?.personal.firstName || "Guest"}`;

  return (
    <Dashboard activeTab="dashboard" userRole="event-host">
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#F07712] to-[#FFB473] bg-clip-text text-transparent">Dashboard</h1>
          <div className="text-sm text-gray-500">{welcomeMessage}</div>
        </div>
        
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Quick Actions</h2>
          <div className="flex gap-3">
            <Link to="/events/create">
              <Button variant="outline" className="gap-2">
                <Calendar className="h-4 w-4" />
                Create Event
              </Button>
            </Link>
            <Link to="/host/guests">
              <Button className="gap-2 bg-[#F07712] hover:bg-[#F07712]/90">
                <UsersRound className="h-4 w-4" />
                Guest List
              </Button>
            </Link>
            <Link to="/favorites">
              <Button variant="outline" className="gap-2">
                <Heart className="h-4 w-4" />
                Favorite Vendors
              </Button>
            </Link>
          </div>
        </div>

        
        <DashboardStats />
        <UpcomingEventsTable />
      </div>
    </Dashboard>
  );
};

export default EventHostDashboard;
