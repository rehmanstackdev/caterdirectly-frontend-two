import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import {
  Eye,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  RefreshCw,
  DollarSign,
  Clock,
  AlertTriangle,
  Trash2,
  MapPin,
  Mail,
  Phone,
  CreditCard
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Order } from '@/types/order-types';
import OrdersService from '@/services/api/admin/orders.Service';
import { useToast } from '@/hooks/use-toast';
import { APP_LOGO } from '@/constants/app-assets';

const AdminOrdersTable = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await OrdersService.getAllOrders(currentPage, itemsPerPage);

        const responseData = response?.data;
        const ordersData = responseData?.data || response?.data || response;
        const paginationData = responseData?.pagination;

        setOrders(Array.isArray(ordersData) ? ordersData : []);

        if (paginationData?.totalItems) {
          setTotalItems(paginationData.totalItems);
          setTotalPages(paginationData.totalPages || Math.ceil(paginationData.totalItems / itemsPerPage));
        }

        setError(null);
      } catch (err: any) {
        console.error('Error fetching orders:', err);
        setError(err.message || 'Failed to fetch orders');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentPage, itemsPerPage]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: 'bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-100', // Brand Orange
      active: 'bg-green-100 text-green-800 border-green-300 hover:bg-green-100',
      completed: 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-100',
      cancelled: 'bg-red-100 text-red-800 border-red-300 hover:bg-red-100',
      canceled: 'bg-red-100 text-red-800 border-red-300 hover:bg-red-100',
      refunded: 'bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-100',
      partially_declined: 'bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-100',
      drafted: 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-100',
      accepted: 'bg-green-100 text-green-800 border-green-300 hover:bg-green-100',
      declined: 'bg-red-100 text-red-800 border-red-300 hover:bg-red-100',
      expired: 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-100',
      revision_requested: 'bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-100',
      paid: 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
    };

    const statusKey = status?.toLowerCase() || '';
    const variantClass = variants[statusKey] || 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-100';

    return (
      <Badge className={`${variantClass} font-medium px-2.5 py-0.5 rounded-full border shadow-sm`}>
        {status ? status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ') : 'Unknown'}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      succeeded: 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-100',
      paid: 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-100',
      pending: 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-100',
      processing: 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-100',
      failed: 'bg-red-100 text-red-800 border-red-300 hover:bg-red-100',
      refunded: 'bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-100',
      cancelled: 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-100',
      canceled: 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-100',
      declined: 'bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-100',
      requires_payment: 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-100'
    };

    const statusKey = status?.toLowerCase() || '';
    const variantClass = variants[statusKey] || 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-100';

    return (
      <Badge className={`${variantClass} font-medium px-2.5 py-0.5 rounded-full border shadow-sm`}>
        {status ? status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ') : 'Unknown'}
      </Badge>
    );
  };

  const getOrderPriority = (order: Order) => {
    if (order.paymentStatus === 'failed') return 'high';
    if (order.paymentStatus === 'pending') return 'medium';
    return 'low';
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <Clock className="h-4 w-4 text-amber-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrderIds(orders.map(o => o.id));
    } else {
      setSelectedOrderIds([]);
    }
  };

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrderIds(prev => [...prev, orderId]);
    } else {
      setSelectedOrderIds(prev => prev.filter(id => id !== orderId));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedOrderIds.length === 0) return;

    const selectedOrders = orders.filter(o => selectedOrderIds.includes(o.id));
    const orderTitles = selectedOrders.map(o => o.invoice?.eventName || o.id).join(', ');

    if (!confirm(`Are you sure you want to permanently delete ${selectedOrderIds.length} order(s)?\n\nOrders: ${orderTitles}\n\nThis action cannot be undone.`)) {
      return;
    }

    // TODO: Implement bulk delete API call
    toast({
      title: "Info",
      description: "Bulk delete functionality not implemented yet",
    });

    setSelectedOrderIds([]);
  };


  return (
    <div className="space-y-6">
      {/* Brand Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-sm overflow-hidden">
            <img
              src={APP_LOGO.url}
              alt={APP_LOGO.alt}
              className="h-8 w-auto object-contain"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Order Management</h1>
            <p className="text-slate-500">Manage and track all customer orders</p>
          </div>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Button variant="outline" className="gap-2 w-full sm:w-auto" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedOrderIds.length > 0 && (
        <Card className="bg-blue-50 border-blue-200 shadow-sm animate-in fade-in slide-in-from-top-2">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-medium text-blue-900 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  {selectedOrderIds.length} order{selectedOrderIds.length !== 1 ? 's' : ''} selected
                </span>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="shadow-sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected Orders
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete {selectedOrderIds.length} Order{selectedOrderIds.length !== 1 ? 's' : ''}</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to permanently delete these orders? This will remove all selected orders and related records from the database. This action cannot be undone.
                      <div className="mt-2 max-h-32 overflow-y-auto bg-slate-50 p-2 rounded text-sm border">
                        {orders.filter(o => selectedOrderIds.includes(o.id)).map(o => (
                          <div key={o.id} className="py-1 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                            {o.invoice?.eventName || o.id}
                          </div>
                        ))}
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleBulkDelete}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Yes, Delete {selectedOrderIds.length} Order{selectedOrderIds.length !== 1 ? 's' : ''}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-sm border-slate-200">
        <CardHeader className="border-b bg-slate-50/50 pb-4">
          <CardTitle className="text-xl font-bold text-slate-800">All Orders</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-none border-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50 border-b border-slate-200">
                  <TableHead className="w-12 pl-4">
                    <Checkbox
                      checked={selectedOrderIds.length === orders.length && orders.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 py-4">Order Details</TableHead>
                  <TableHead className="font-semibold text-slate-700 py-4">Client Info</TableHead>
                  <TableHead className="font-semibold text-slate-700 py-4">Location</TableHead>
                  <TableHead className="font-semibold text-slate-700 py-4">Status</TableHead>
                  <TableHead className="text-center font-semibold text-slate-700 py-4">Method</TableHead>
                  <TableHead className="text-right font-semibold text-slate-700 py-4 pr-6">Amount</TableHead>
                  <TableHead className="text-center font-semibold text-slate-700 py-4">Additional Tip</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      <TableCell className="pl-4">
                        <Skeleton className="h-4 w-4" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-10 w-10 rounded-lg" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-28" />
                          <Skeleton className="h-3 w-36" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16 mx-auto" />
                      </TableCell>
                      <TableCell className="pr-6">
                        <Skeleton className="h-4 w-20 ml-auto" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16 mx-auto" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-8" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center text-red-500">
                        <AlertTriangle className="h-8 w-8 mb-2" />
                        <p className="font-medium">Error loading orders</p>
                        <p className="text-sm text-red-400 mt-1">Please try refreshing the page</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12 text-slate-500">
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.id} className="group hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-0">
                      <TableCell className="pl-4">
                        <Checkbox
                          checked={selectedOrderIds.includes(order.id)}
                          onCheckedChange={(checked) => handleSelectOrder(order.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {getPriorityIcon(getOrderPriority(order))}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 text-base">
                              {order.invoice?.eventName || 'Untitled Event'}
                            </div>
                            <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
                              <Clock className="h-3.5 w-3.5" />
                              {order.invoice?.eventDate ? new Date(order.invoice.eventDate).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              }) : 'Date TBD'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div>
                          <div className="font-medium text-slate-900">
                            {order.invoice?.contactName || 'Unknown Client'}
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-1 truncate max-w-[200px]" title={order.invoice?.emailAddress}>
                            <Mail className="h-3.5 w-3.5" />
                            {order.invoice?.emailAddress || 'No email'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-1.5 text-sm text-slate-600 max-w-[150px]" title={order.invoice?.eventLocation}>
                          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate">{order.invoice?.eventLocation || 'Location TBD'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        {getPaymentStatusBadge(order.paymentStatus)}
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <Badge variant="outline" className="font-normal text-slate-600 bg-white gap-1.5 pl-1.5 pr-2.5 py-0.5">
                          <CreditCard className="h-3 w-3" />
                          {order.paymentMethodType || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right py-4 pr-6">
                        <div className="font-bold text-slate-900 text-base">
                          {formatCurrency(order.paymentDetails?.amount ? order.paymentDetails.amount / 100 : 0)}
                        </div>
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <div className="font-medium text-slate-700">
                          {order.invoice?.additionalTip 
                            ? formatCurrency(parseFloat(order.invoice.additionalTip))
                            : <span className="text-slate-400">—</span>
                          }
                        </div>
                      </TableCell>

                      <TableCell className="py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem 
                              onClick={() => {
                                const invoiceId = order.invoiceId || order.invoice?.id;
                                if (invoiceId) {
                                  navigate(`/admin/orders/${invoiceId}`);
                                }
                              }} 
                              className="cursor-pointer"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600 focus:text-red-600 cursor-pointer">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Order
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {totalItems > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="text-sm text-muted-foreground">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ) : (
                  <>
                    Showing <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> to{" "}
                    <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{" "}
                    <span className="font-medium">{totalItems}</span> orders
                  </>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {loading ? (
                  <>
                    {/* Skeleton for pagination buttons */}
                    <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                      ))}
                    </div>
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="h-8 w-8 p-0"
                    >
                      <span className="sr-only">Go to first page</span>
                      &laquo;
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => prev - 1)}
                      disabled={currentPage === 1}
                      className="h-8 px-3"
                    >
                      Previous
                    </Button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {(() => {
                        const pages: (number | string)[] = [];

                        if (totalPages <= 7) {
                          for (let i = 1; i <= totalPages; i++) {
                            pages.push(i);
                          }
                        } else {
                          pages.push(1);

                          if (currentPage > 3) {
                            pages.push('...');
                          }

                          for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                            if (!pages.includes(i)) {
                              pages.push(i);
                            }
                          }

                          if (currentPage < totalPages - 2) {
                            pages.push('...');
                          }

                          if (!pages.includes(totalPages)) {
                            pages.push(totalPages);
                          }
                        }

                        return pages.map((page, index) =>
                          page === '...' ? (
                            <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">...</span>
                          ) : (
                            <Button
                              key={page}
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(page as number)}
                              className="h-8 w-8 p-0"
                            >
                              {page}
                            </Button>
                          )
                        );
                      })()}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      disabled={currentPage >= totalPages}
                      className="h-8 px-3"
                    >
                      Next
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage >= totalPages}
                      className="h-8 w-8 p-0"
                    >
                      <span className="sr-only">Go to last page</span>
                      &raquo;
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl border-slate-200">
            <CardHeader className="border-b bg-slate-50/50 sticky top-0 z-10">
              <CardTitle className="flex justify-between items-center text-xl">
                <div className="flex items-center gap-3">
                  <span className="bg-blue-100 text-blue-700 p-2 rounded-lg">
                    <Eye className="h-5 w-5" />
                  </span>
                  <span>Order Details</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(null)} className="rounded-full hover:bg-slate-200/50">
                  <XCircle className="h-5 w-5 text-slate-500" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 p-6">
              {/* Header Info */}
              <div className="flex flex-col md:flex-row justify-between gap-6 pb-6 border-b">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{selectedOrder.invoice?.eventName || 'Untitled Event'}</h3>
                  <div className="flex items-center gap-4 text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      {selectedOrder.invoice?.eventDate ? new Date(selectedOrder.invoice.eventDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Date TBD'}
                    </div>
                    <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      {selectedOrder.invoice?.eventLocation || 'Location TBD'}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="text-sm text-slate-500 uppercase tracking-wide font-medium">Total Amount</div>
                  <div className="text-3xl font-bold text-slate-900">
                    {formatCurrency(selectedOrder.paymentDetails?.amount ? selectedOrder.paymentDetails.amount / 100 : 0)}
                  </div>
                  <div className="flex gap-2 mt-1">
                    {getPaymentStatusBadge(selectedOrder.paymentStatus)}
                  </div>
                </div>
              </div>

              {/* Order Summary Grid */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider border-b pb-2">Client Information</h4>
                  <div className="grid gap-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-slate-100 p-2 rounded-md">
                        <CheckCircle className="h-4 w-4 text-slate-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-500">Name</div>
                        <div className="text-slate-900 font-medium">{selectedOrder.invoice?.contactName || 'N/A'}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-slate-100 p-2 rounded-md">
                        <Mail className="h-4 w-4 text-slate-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-500">Email</div>
                        <div className="text-slate-900">{selectedOrder.invoice?.emailAddress || 'N/A'}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-slate-100 p-2 rounded-md">
                        <Phone className="h-4 w-4 text-slate-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-500">Phone</div>
                        <div className="text-slate-900">{selectedOrder.invoice?.phoneNumber || 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider border-b pb-2">Payment Information</h4>
                  <div className="grid gap-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-slate-100 p-2 rounded-md">
                        <CreditCard className="h-4 w-4 text-slate-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-500">Payment Method</div>
                        <div className="text-slate-900 capitalize">{selectedOrder.paymentMethodType || 'N/A'}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-slate-100 p-2 rounded-md">
                        <DollarSign className="h-4 w-4 text-slate-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-500">Currency</div>
                        <div className="text-slate-900 uppercase">{selectedOrder.currency}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-slate-100 p-2 rounded-md">
                        <Clock className="h-4 w-4 text-slate-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-500">Transaction Date</div>
                        <div className="text-slate-900">{new Date(selectedOrder.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-slate-100 p-2 rounded-md">
                        <DollarSign className="h-4 w-4 text-slate-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-500">Additional Tip</div>
                        <div className="text-slate-900">
                          {selectedOrder.invoice?.additionalTip 
                            ? formatCurrency(parseFloat(selectedOrder.invoice.additionalTip))
                            : 'None'
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Details */}
              <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                  <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Technical Details</h4>
                  <Badge variant="outline" className="text-xs bg-white">ID: {selectedOrder.id}</Badge>
                </div>
                <div className="p-4 grid md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                  <div className="flex justify-between border-b border-slate-200 pb-2 border-dashed">
                    <span className="text-slate-500">Stripe Payment Intent</span>
                    <span className="font-mono text-slate-700">{selectedOrder.stripePaymentIntentId || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2 border-dashed">
                    <span className="text-slate-500">Invoice Status</span>
                    <span className="font-medium text-slate-700 capitalize">{selectedOrder.invoice?.status || 'unknown'}</span>
                  </div>
                </div>
                {selectedOrder.paymentDetails && (
                  <div className="p-4 border-t border-slate-200">
                    <div className="text-xs font-semibold text-slate-500 mb-2 uppercase">Raw Payment Data</div>
                    <pre className="text-xs bg-slate-900 text-slate-50 p-3 rounded-md overflow-auto max-h-40 font-mono">
                      {JSON.stringify(selectedOrder.paymentDetails, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersTable;