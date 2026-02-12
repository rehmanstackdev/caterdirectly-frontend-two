
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const VendorSalesCommandCenter: React.FC = () => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/vendor/new-proposal">
            <Button className="h-20 w-full flex flex-col gap-2 bg-[#F07712] hover:bg-[#F07712]/90">
              <Plus className="h-5 w-5" />
              <span className="text-sm">Create Proposal</span>
            </Button>
          </Link>
          
          <Link to="/vendor/services">
            <Button variant="outline" className="h-20 w-full flex flex-col gap-2">
              <Users className="h-5 w-5" />
              <span className="text-sm">Manage Services</span>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default VendorSalesCommandCenter;
