

import { Card, CardContent } from "@/components/ui/card";
import { Users, Building2, ShoppingBag, DollarSign } from "lucide-react";

const PlatformStats = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-3xl font-bold">3,245</p>
            </div>
            <div className="p-3 rounded-full bg-[rgba(240,119,18,0.1)]">
              <Users className="h-6 w-6 text-[rgba(240,119,18,1)]" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Vendors</p>
              <p className="text-3xl font-bold">186</p>
            </div>
            <div className="p-3 rounded-full bg-[rgba(240,119,18,0.1)]">
              <Building2 className="h-6 w-6 text-[rgba(240,119,18,1)]" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Bookings</p>
              <p className="text-3xl font-bold">1,258</p>
            </div>
            <div className="p-3 rounded-full bg-[rgba(240,119,18,0.1)]">
              <ShoppingBag className="h-6 w-6 text-[rgba(240,119,18,1)]" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Revenue</p>
              <p className="text-3xl font-bold">$245,783</p>
            </div>
            <div className="p-3 rounded-full bg-[rgba(240,119,18,0.1)]">
              <DollarSign className="h-6 w-6 text-[rgba(240,119,18,1)]" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlatformStats;
