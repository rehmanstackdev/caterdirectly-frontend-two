

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, FileText, Headphones, TrendingUp, Users, DollarSign, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SalesCommandCenter = () => {
  const navigate = useNavigate();

  const handleCreateInvoice = () => {
    navigate('/marketplace?mode=invoice');
  };


  return (
    <div className="space-y-6">
      {/* Quick Actions Toolbar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Sales Command Center
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              className="h-16 flex flex-col gap-2" 
              onClick={handleCreateInvoice}
              type="button"
            >
              <Plus className="h-5 w-5" />
              <span className="text-sm">Create Invoice</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-16 flex flex-col gap-2"
              onClick={() => navigate('/admin/invoices')}
            >
              <FileText className="h-5 w-5" />
              <span className="text-sm">Manage Invoices</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-16 flex flex-col gap-2"
              onClick={() => navigate('/admin/invoices?status=pending')}
            >
              <Clock className="h-5 w-5" />
              <span className="text-sm">Pending Invoices</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col gap-2">
              <Headphones className="h-5 w-5" />
              <span className="text-sm">Support Ticket</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sales Pipeline Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Leads</p>
                <p className="text-2xl font-bold">24</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-xs text-gray-500 mt-2">+12% from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Invoices</p>
                <p className="text-2xl font-bold">18</p>
              </div>
              <FileText className="h-8 w-8 text-orange-600" />
            </div>
            <p className="text-xs text-gray-500 mt-2">$127K potential value</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month Revenue</p>
                <p className="text-2xl font-bold">$89.2K</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-xs text-gray-500 mt-2">+23% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Urgent Tickets</p>
                <p className="text-2xl font-bold">7</p>
              </div>
              <Clock className="h-8 w-8 text-red-600" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Avg response: 1.2h</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SalesCommandCenter;
