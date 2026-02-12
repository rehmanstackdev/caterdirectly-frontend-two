
import React from "react";
import { useParams } from "react-router-dom";
import Dashboard from "@/components/dashboard/Dashboard";
import VendorInfo from "@/components/vendor/VendorInfo";
import VendorServices from "@/components/vendor/VendorServices";
import { Card } from "@/components/ui/card";

const VendorProfile = () => {
  const { vendorName } = useParams();

  return (
    <Dashboard userRole="event-host" activeTab="vendors">
      <div className="container mx-auto py-8 space-y-8">
        <Card className="p-6">
          <VendorInfo vendorName={vendorName || ""} />
        </Card>
        <Card className="p-6">
          <VendorServices vendorName={vendorName || ""} />
        </Card>
      </div>
    </Dashboard>
  );
};

export default VendorProfile;
