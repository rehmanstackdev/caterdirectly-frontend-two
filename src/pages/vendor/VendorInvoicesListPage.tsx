
import { useState, useEffect } from 'react';
import VendorDashboard from '@/components/vendor/dashboard/VendorDashboard';
import VendorActionButtons from '@/components/vendor/action-buttons/VendorActionButtons';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';
import VendorInvoicesService from '@/services/api/vendor/invoices.Service';
import VendorInvoicesTable from '@/components/vendor/invoices/VendorInvoicesTable';


type VendorStatus = 'pending' | 'accepted' | 'declined';

function VendorInvoicesListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async (status?: VendorStatus) => {
    const userData = localStorage.getItem('user_data');
    if (!userData) return;
    
    try {
      setLoading(true);
      const parsedUser = JSON.parse(userData);
      const vendorId = parsedUser.vendorId || parsedUser.vendor?.id;
      
      if (!vendorId) {
        toast({
          title: "Error",
          description: "Vendor ID not found",
          variant: "destructive",
        });
        return;
      }
      
      const response = await VendorInvoicesService.getVendorInvoices(vendorId, status);
      setInvoices(response.data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast({
        title: "Error",
        description: "Failed to load invoices",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (activeTab === 'all') {
      fetchInvoices();
    } else if (activeTab === 'canceled') {
      fetchInvoices('declined');
    } else {
      fetchInvoices(activeTab as VendorStatus);
    }
  }, [activeTab]);
  
  return (
    <VendorDashboard activeTab="proposals">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <VendorActionButtons />
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="accepted">Accepted</TabsTrigger>
            <TabsTrigger value="canceled">Cancelled</TabsTrigger>
          </TabsList>
          
          <Button 
            onClick={() => navigate('/vendor/invoices/new')}
            className="bg-[#F07712] hover:bg-[#F07712]/90"
          >
            <FileText className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
        </div>
        
        {['all', 'pending', 'accepted', 'canceled'].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-0">
            <Card>
              <CardContent className="p-0">
                <VendorInvoicesTable
                  invoices={invoices}
                  loading={loading}
                />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </VendorDashboard>
  );
};

export default VendorInvoicesListPage;
