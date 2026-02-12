
import React from "react";
import Dashboard from "@/components/dashboard/Dashboard";
import HostMessagingHub from "@/components/host/messaging/HostMessagingHub";

const EventHostSupport = () => {
  return (
    <Dashboard activeTab="support" userRole="event-host">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#F07712] to-[#FFB473] bg-clip-text text-transparent">
            Support & Messaging
          </h1>
        </div>
        
        <HostMessagingHub />
      </div>
    </Dashboard>
  );
};

export default EventHostSupport;
