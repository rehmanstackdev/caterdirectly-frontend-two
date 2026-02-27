import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { Download, CheckCircle, XCircle, Clock, AlertCircle, Pencil, Truck } from 'lucide-react';
import DeliveryTimeDialog from '@/components/vendor/orders/DeliveryTimeDialog';
import { useState } from 'react';
import invoiceService from '@/services/api/invoice.Service';
import { generateInvoicePDF } from '@/utils/invoice-pdf-generator';
import { toast } from 'sonner';
import { useVendorData } from '@/hooks/vendor/use-vendor-data';

export enum InvoiceStatusEnum {
  DRAFTED = 'draft',
  PENDING = 'pending',
  SENT = 'sent',
  PAID = 'paid',
}

interface Order {
  id: string;
  eventName: string;
  companyName: string;
  status: string;
  invoiceStatus: string;
  groupBy: boolean;
  eventDate: string;
  eventLocation: string;
  guestCount: number;
  contactName: string;
  emailAddress: string;
  services: any[];
  orders: any[];
  additionalTip?: string | null;
  createdAt: string;
}

interface VendorOrdersTableProps {
  orders: Order[];
  loading: boolean;
}

const getInvoiceStatusBadge = (status: string) => {
  switch (status) {
    case InvoiceStatusEnum.PAID:
      return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
    case InvoiceStatusEnum.SENT:
      return <Badge className="bg-blue-100 text-blue-800">Sent</Badge>;
    case InvoiceStatusEnum.PENDING:
      return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    case InvoiceStatusEnum.DRAFTED:
      return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
  }
};

const getVendorStatusBadge = (vendorStatus: string) => {
  switch (vendorStatus?.toLowerCase()) {
    case 'accepted':
      return (
        <Badge className="inline-flex items-center justify-center gap-1.5 bg-green-100 text-green-800 border border-green-200 w-[110px] hover:bg-green-100 hover:text-green-800">
          <CheckCircle className="h-3.5 w-3.5" />
          <span className="font-medium">Accepted</span>
        </Badge>
      );
    case 'declined':
      return (
        <Badge className="inline-flex items-center justify-center gap-1.5 bg-red-100 text-red-800 border border-red-200 w-[110px] hover:bg-red-100 hover:text-red-800">
          <XCircle className="h-3.5 w-3.5" />
          <span className="font-medium">Declined</span>
        </Badge>
      );
    case 'pending':
      return (
        <Badge className="inline-flex items-center justify-center gap-1.5 bg-yellow-100 text-yellow-800 border border-yellow-200 w-[110px] hover:bg-yellow-100 hover:text-yellow-800">
          <Clock className="h-3.5 w-3.5" />
          <span className="font-medium">Pending</span>
        </Badge>
      );
    default:
      return (
        <Badge className="inline-flex items-center justify-center gap-1.5 bg-gray-100 text-gray-800 border border-gray-200 w-[110px] hover:bg-gray-100 hover:text-gray-800">
          <AlertCircle className="h-3.5 w-3.5" />
          <span className="font-medium">{vendorStatus || 'Unknown'}</span>
        </Badge>
      );
  }
};

const calculateTotal = (services: any[]) => {
  return services.reduce((total, service) => total + parseFloat(service.totalPrice || 0), 0);
};

export default function VendorOrdersTable({ orders, loading }: VendorOrdersTableProps) {
  const navigate = useNavigate();
  const { vendorData } = useVendorData();
  const [downloadingOrderId, setDownloadingOrderId] = useState<string | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [showDeliveryDialog, setShowDeliveryDialog] = useState(false);
  const [deliveryOrderId, setDeliveryOrderId] = useState<string | null>(null);

  const handleDownloadPDF = async (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDownloadingOrderId(orderId);

    try {
      const response = await invoiceService.getInvoiceOrderSummary(orderId);

      if (response?.data?.invoice) {
        const invoiceData = response.data.invoice;

        // Filter services to only include those from the logged-in vendor
        if (vendorData?.id) {
          const filteredInvoice = {
            ...invoiceData,
            services: (invoiceData.services || []).filter(
              (service: any) => service.vendorId === vendorData.id
            )
          };

          await generateInvoicePDF(filteredInvoice);
          toast.success('PDF downloaded successfully');
        } else {
          toast.error('Vendor data not available');
        }
      } else {
        toast.error('Failed to load order details');
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF');
    } finally {
      setDownloadingOrderId(null);
    }
  };

  const handleAcceptOrder = async () => {
    if (!selectedOrder?.id) return;

    try {
      setIsAccepting(true);
      await invoiceService.updateVendorStatus(selectedOrder.id, 'accepted');
      toast.success('Order accepted successfully');

      setIsStatusModalOpen(false);
      setSelectedOrder(null);

      // Trigger a refresh
      window.location.reload();
    } catch (error) {
      console.error('Error accepting order:', error);
      toast.error('Failed to accept order');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDeclineOrder = async () => {
    if (!selectedOrder?.id) return;

    try {
      setIsDeclining(true);
      await invoiceService.updateVendorStatus(selectedOrder.id, 'declined');
      toast.success('Order declined successfully');

      setIsStatusModalOpen(false);
      setSelectedOrder(null);

      // Trigger a refresh
      window.location.reload();
    } catch (error) {
      console.error('Error declining order:', error);
      toast.error('Failed to decline order');
    } finally {
      setIsDeclining(false);
    }
  };

  if (loading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Event Name</TableHead>
            <TableHead>Event Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Payment Status</TableHead>
            <TableHead className="text-center">Vendor Order Status</TableHead>
            {/* <TableHead className="text-center">Payment Method</TableHead>
            <TableHead>Total</TableHead>
            <TableHead className="text-center">Additional Tip</TableHead> */}
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell><Skeleton className="h-4 w-32" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16" /></TableCell>
              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
              <TableCell className="text-center"><Skeleton className="h-8 w-24 mx-auto" /></TableCell>
              {/* <TableCell><Skeleton className="h-4 w-12" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16 mx-auto" /></TableCell> */}
              <TableCell><Skeleton className="h-8 w-24 mx-auto" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No orders found
      </div>
    );
  }

  return (
    <>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Event Name</TableHead>
          <TableHead>Event Date</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Payment Status</TableHead>
          <TableHead className="text-center">Vednor Order Status</TableHead>
          {/* <TableHead className="text-center">Payment Method</TableHead>
          <TableHead>Total</TableHead>
          <TableHead className="text-center">Additional Tip</TableHead> */}
          <TableHead className="text-center">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => {
          // Get vendor status from the first service (or aggregate if multiple)
          const vendorStatus = order.services?.[0]?.vendorStatus || 'pending';

          return (
          <TableRow
            key={order.id}
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => navigate(`/vendor/orders/${order.id}`)}
          >
            <TableCell>
              <div>
                <div className="font-medium">{order.eventName}</div>
                {order.companyName && (
                  <div className="text-sm text-gray-500">{order.companyName}</div>
                )}
              </div>
            </TableCell>
            <TableCell>
              {format(new Date(order.eventDate), 'MMM dd, yyyy')}
            </TableCell>
            <TableCell>
              <Badge variant={order.groupBy ? "default" : "secondary"}>
                {order.groupBy ? "Group" : "Single"}
              </Badge>
            </TableCell>
            <TableCell>
              <div>
                <div className="font-medium">{order.contactName}</div>
                <div className="text-sm text-gray-500">{order.emailAddress}</div>
              </div>
            </TableCell>
            <TableCell>
              <div className="text-sm">{order.eventLocation || 'N/A'}</div>
            </TableCell>
            <TableCell>
              {getInvoiceStatusBadge(order.status)}
            </TableCell>
            <TableCell className="text-center">
              {getVendorStatusBadge(vendorStatus)}
            </TableCell>
            {/* <TableCell>
              <div className="flex justify-center items-center text-sm capitalize mr-6">
                {order.invoiceStatus === 'pending' || order.invoiceStatus === 'canceled'
                  ? '-'
                  : order.orders?.[0]?.paymentMethodType || 'N/A'
                }
              </div>
            </TableCell>
            <TableCell>
              {order.invoiceStatus === 'pending' || order.invoiceStatus === 'canceled'
                ? '-'
                : order.orders?.[0]?.amountPaid
                  ? `$${parseFloat(order.orders[0].amountPaid).toFixed(2)}`
                  : `$${calculateTotal(order.services).toFixed(2)}`
              }
            </TableCell>
            <TableCell className="text-center">
              {order.invoiceStatus === 'pending' || order.invoiceStatus === 'canceled'
                ? <span className="text-gray-400">—</span>
                : order.additionalTip
                  ? formatCurrency(parseFloat(order.additionalTip))
                  : <span className="text-gray-400">—</span>
              }
            </TableCell> */}
            <TableCell className="text-center">
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeliveryOrderId(order.id);
                    setShowDeliveryDialog(true);
                  }}
                  className="h-8 w-8 p-0 hover:bg-[#F07712]/10 hover:border-[#F07712] border border-transparent transition-colors"
                  title="Set Delivery Time"
                >
                  <Truck className="h-4 w-4 text-[#F07712]" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedOrder(order);
                    setIsStatusModalOpen(true);
                  }}
                  className="h-8 w-8 p-0 hover:bg-[#F07712]/10 hover:border-[#F07712] border border-transparent transition-colors"
                  title="Update Order Status"
                >
                  <Pencil className="h-4 w-4 text-[#F07712]" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => handleDownloadPDF(order.id, e)}
                  disabled={downloadingOrderId === order.id}
                  className="gap-1"
                >
                  <Download className="h-4 w-4" />
                  {downloadingOrderId === order.id ? 'Downloading...' : 'PDF'}
                </Button>
              </div>
            </TableCell>
          </TableRow>
          );
        })}
      </TableBody>
    </Table>
      <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl font-bold">Update Vendor Order Status</DialogTitle>
            <DialogDescription className="text-base">
              Choose an action for this order. This will update the vendor status for all services.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Current Vendor Order Status:</span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold capitalize border ${
                  selectedOrder?.services?.[0]?.vendorStatus?.toLowerCase() === 'accepted'
                    ? 'bg-green-100 text-green-800 border-green-200'
                    : selectedOrder?.services?.[0]?.vendorStatus?.toLowerCase() === 'declined'
                    ? 'bg-red-100 text-red-800 border-red-200'
                    : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                }`}>
                  {selectedOrder?.services?.[0]?.vendorStatus || 'pending'}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-sm font-medium text-gray-700 min-w-[90px]">Event Name:</span>
                <span className="text-sm font-semibold text-gray-900">{selectedOrder?.eventName}</span>
              </div>
            </div>

            {(selectedOrder?.services?.[0]?.vendorStatus?.toLowerCase() === 'accepted' ||
              selectedOrder?.services?.[0]?.vendorStatus?.toLowerCase() === 'declined') && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 font-medium text-center">
                  {selectedOrder?.services?.[0]?.vendorStatus?.toLowerCase() === 'accepted'
                    ? 'You have already accepted this order'
                    : 'You have already declined this order'}
                </p>
              </div>
            )}
          </div>

          {selectedOrder?.services?.[0]?.vendorStatus?.toLowerCase() !== 'accepted' &&
           selectedOrder?.services?.[0]?.vendorStatus?.toLowerCase() !== 'declined' && (
            <DialogFooter className="gap-3 sm:gap-3">
              <Button
                onClick={handleDeclineOrder}
                disabled={isDeclining}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-6 text-base shadow-sm hover:shadow-md transition-all"
              >
                {isDeclining ? 'Declining...' : 'Decline Order'}
              </Button>
              <Button
                onClick={handleAcceptOrder}
                disabled={isAccepting}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-6 text-base shadow-sm hover:shadow-md transition-all"
              >
                {isAccepting ? 'Accepting...' : 'Accept Order'}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
      <DeliveryTimeDialog
        open={showDeliveryDialog}
        onOpenChange={setShowDeliveryDialog}
        invoiceId={deliveryOrderId}
      />
    </>
  );
}