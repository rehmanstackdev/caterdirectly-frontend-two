import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckCircle, Clock, Download, Search, AlertCircle } from 'lucide-react';
interface VendorPayoutOrder {
  vendorId: string;
  vendorName: string;
  orderNumber: string;
  orderTotal: number;
  subtotal: number;
  serviceFee: number;
  tax: number;
  delivery: number;
  commission: number;
  keptByCD: number;
  owedToVendor: number;
  status: string;
  invoiceId: string;
  eventDate: string;
  paymentTransferred: boolean;
}
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface VendorPayoutOrdersTableProps {
  orders: VendorPayoutOrder[];
  loading?: boolean;
  onMarkOrderPaid: (orderId: string) => Promise<void>;
}

export const VendorPayoutOrdersTable = ({
  orders,
  loading,
  onMarkOrderPaid,
}: VendorPayoutOrdersTableProps) => {
  const navigate = useNavigate();
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const [vendorFilter, setVendorFilter] = useState<string>('all');

  const handleMarkPaid = async (invoiceId: string) => {
    setProcessingOrderId(invoiceId);
    try {
      await onMarkOrderPaid(invoiceId);
    } finally {
      setProcessingOrderId(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get unique vendors for filter
  const uniqueVendors = Array.from(new Set(orders.map(o => o.vendorName))).sort();

  // Apply filters
  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      searchQuery === '' ||
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.vendorName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPaymentStatus =
      paymentStatusFilter === 'all' ||
      (paymentStatusFilter === 'paid' && order.status.toLowerCase() === 'paid') ||
      (paymentStatusFilter === 'unpaid' && order.status.toLowerCase() === 'pending');
    
    const matchesVendor =
      vendorFilter === 'all' || order.vendorName === vendorFilter;

    return matchesSearch && matchesPaymentStatus && matchesVendor;
  });



  const exportToCSV = () => {
    const headers = [
      'Vendor',
      'Order Number',
      'Order Date',
      'Order Total',
      'Subtotal',
      'Service Fee',
      'Tax',
      'Delivery Fee',
      'Commission',
      'Kept by CD',
      'Owed to Vendor',
      'Payment Status',
      'Paid Date',
    ];

    const rows = filteredOrders.map(o => [
      o.vendorName,
      o.orderNumber,
      formatDate(o.eventDate),
      o.orderTotal,
      o.subtotal,
      o.serviceFee,
      o.tax,
      o.delivery,
      o.commission,
      o.keptByCD,
      o.owedToVendor,
      o.status,
      o.paymentTransferred ? 'Yes' : 'No',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vendor-payout-orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vendor Payout Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <CardTitle>Vendor Payout Orders</CardTitle>
            <Button onClick={exportToCSV} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
          
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by order number or vendor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={vendorFilter} onValueChange={setVendorFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="All Vendors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vendors</SelectItem>
                {uniqueVendors.map(vendor => (
                  <SelectItem key={vendor} value={vendor}>
                    {vendor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left">Vendor</TableHead>
                <TableHead className="text-left">Order Total</TableHead>
                <TableHead className="text-left">Kept by CD</TableHead>
                <TableHead className="text-left">Owed to Vendor</TableHead>
                <TableHead className="text-left">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order, index) => (
                  <TableRow key={`${order.invoiceId}-${order.vendorId}-${index}`}>
                    <TableCell className="font-medium text-left">{order.vendorName}</TableCell>
                    
                    <TableCell className="text-left font-semibold">
                      {formatCurrency(order.orderTotal)}
                    </TableCell>
                    
                    <TableCell className="text-left">
                      <div className="font-semibold text-green-600">
                        {formatCurrency(order.keptByCD)}
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-left">
                      <div className="font-semibold text-blue-600">
                        {formatCurrency(order.owedToVendor)}
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-left">
                      {order.status === 'Paid' ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Paid
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-orange-300 text-orange-700">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
