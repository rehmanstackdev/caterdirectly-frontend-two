import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Dashboard from '@/components/dashboard/Dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, MapPin, Users, Clock, Mail, Phone, User, DollarSign, ImageIcon, ShoppingCart, CreditCard, Receipt } from 'lucide-react';
import OrdersService from '@/services/api/orders.service';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

function AdminOrderDetailsPage() {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState<any>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!invoiceId) return;

      try {
        setLoading(true);
        const response = await OrdersService.getOrderDetailsByInvoiceId(invoiceId);

        if (response?.data) {
          setOrderData(response.data);
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
        toast({
          title: "Error",
          description: "Failed to load order details",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [invoiceId, toast]);

  if (loading) {
    return (
      <Dashboard activeTab="invoices" userRole="admin">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <div className="text-lg font-medium">Loading order details...</div>
          </div>
        </div>
      </Dashboard>
    );
  }

  if (!orderData || !orderData.invoice) {
    return (
      <Dashboard activeTab="invoices" userRole="admin">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Order detail not found</p>
          <Button onClick={() => navigate('/admin/invoices')} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Invoices
          </Button>
        </div>
      </Dashboard>
    );
  }

  const invoice = orderData.invoice;
  const orders = orderData.orders || [];

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive'; className?: string }> = {
      drafted: { label: 'Draft', variant: 'secondary' },
      draft: { label: 'Draft', variant: 'secondary' },
      pending: { label: 'Pending', variant: 'default' },
      accepted: { label: 'Accepted', variant: 'default' },
      paid: { label: 'Paid', variant: 'default', className: 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200' },
      declined: { label: 'Declined', variant: 'destructive' },
      revision_requested: { label: 'Revision Requested', variant: 'default', className: 'bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-200' },
      expired: { label: 'Expired', variant: 'destructive' },
      cancelled: { label: 'Cancelled', variant: 'destructive' }
    };

    const config = statusConfig[status?.toLowerCase()] || { label: status, variant: 'secondary' as const };
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'PPP');
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(numAmount);
  };

  const calculateServiceTotal = (service: any) => {
    if (service.totalPrice && parseFloat(service.totalPrice) > 0) {
      return parseFloat(service.totalPrice);
    }
    return parseFloat(service.price || 0) * (service.quantity || 1);
  };

  const calculateGrandTotal = () => {
    const servicesTotal = invoice.services?.reduce((sum: number, s: any) => sum + calculateServiceTotal(s), 0) || 0;
    const customLineItems = invoice.customLineItems || [];
    const adjustmentsTotal = customLineItems.reduce((sum: number, adj: any) => {
      const amount = parseFloat(adj.value || adj.amount || 0);
      return sum + amount;
    }, 0);
    const isServiceFeeWaived = invoice.waiveServiceFee || false;
    const serviceFeePercentage = 5;
    const serviceFee = isServiceFeeWaived ? 0 : servicesTotal * (serviceFeePercentage / 100);
    const additionalTip = parseFloat(invoice.additionalTip || 0);
    return servicesTotal + adjustmentsTotal + serviceFee + additionalTip;
  };

  return (
    <Dashboard activeTab="invoices" userRole="admin">
      <div className="space-y-6 p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Order Details</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-black">Status:</span>
            {getStatusBadge(invoice.status)}
          </div>
        </div>

        {/* Invoice Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Invoice Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Event Date</p>
                    <p className="font-medium">{formatDate(invoice.eventDate)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Service Time</p>
                    <p className="font-medium">{invoice.serviceTime || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{invoice.eventLocation || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Guest Count</p>
                    <p className="font-medium">{invoice.guestCount || 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Contact Name</p>
                    <p className="font-medium">{invoice.contactName || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{invoice.emailAddress || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{invoice.phoneNumber || 'N/A'}</p>
                  </div>
                </div>
                {invoice.companyName && (
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Company</p>
                      <p className="font-medium">{invoice.companyName}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {invoice.additionalNotes && (
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-muted-foreground mb-2">Additional Notes</p>
                <p className="text-sm">{invoice.additionalNotes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Services Card */}
        <Card>
          <CardHeader>
            <CardTitle>Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invoice.services?.map((service: any, index: number) => (
                <div key={service.id || index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      {service.image ? (
                        <img
                          src={service.image}
                          alt={service.serviceName}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold">{service.serviceName}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs capitalize">
                            {service.serviceType?.replace(/-/g, ' ').replace(/_/g, ' ')}
                          </Badge>
                          {service.vendorId && (
                            <Badge variant="default" className="text-xs bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200">
                              Vendor Earnings: {formatCurrency(service.vendorEarnings || 0)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(calculateServiceTotal(service))}</p>
                      <p className="text-sm text-muted-foreground">
                        {service.serviceType?.toLowerCase() === 'venue' || service.serviceType?.toLowerCase() === 'venues' 
                          ? `Hours: ${service.quantity || service.hours || 1}` 
                          : `Qty: ${service.quantity || 1}`}
                      </p>
                    </div>
                  </div>

                  {/* Service Items Breakdown */}
                  {(service.cateringItems?.length > 0 ||
                    service.partyRentalItems?.length > 0 ||
                    service.staffItems?.length > 0) && (
                    <div className="mt-3 pt-3 border-t">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Item</TableHead>
                            <TableHead className="text-right">Qty</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {service.cateringItems?.map((item: any) => (
                            <TableRow key={item.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {item.image && (
                                    <img
                                      src={item.image}
                                      alt={item.menuItemName}
                                      className="w-10 h-10 rounded object-cover"
                                    />
                                  )}
                                  <span>{item.menuItemName}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">{item.quantity || 1}</TableCell>
                              <TableCell className="text-right">{formatCurrency(item.price || 0)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(item.totalPrice || 0)}</TableCell>
                            </TableRow>
                          ))}
                          {service.partyRentalItems?.map((item: any) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.name}</TableCell>
                              <TableCell className="text-right">{item.quantity || 1}</TableCell>
                              <TableCell className="text-right">{formatCurrency(item.price || 0)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(item.totalPrice || 0)}</TableCell>
                            </TableRow>
                          ))}
                          {service.staffItems?.map((item: any) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.name} {item.hours ? `(${item.hours}h)` : ''}</TableCell>
                              <TableCell className="text-right">1</TableCell>
                              <TableCell className="text-right">{formatCurrency(item.perHourPrice || item.price || 0)}/h</TableCell>
                              <TableCell className="text-right">{formatCurrency(item.totalPrice || 0)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Financial Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(() => {
              const servicesTotal = invoice.services?.reduce((sum: number, s: any) => sum + calculateServiceTotal(s), 0) || 0;
              const customLineItems = invoice.customLineItems || [];
              
              // Calculate adjustments like OrderSummary - handle percentage and discount mode
              const adjustmentsBreakdown = customLineItems.map((adj: any) => {
                const isPercentage = adj.type === 'percentage';
                const base = servicesTotal; // percentage is applied on subtotal (service costs)
                let amount = isPercentage ? base * (Number(adj.value || adj.amount || 0) / 100) : Number(adj.value || adj.amount || 0);
                if (adj.mode === 'discount') amount = -amount;
                
                return {
                  ...adj,
                  calculatedAmount: amount
                };
              });
              
              const adjustmentsTotal = adjustmentsBreakdown.reduce((sum: number, adj: any) => sum + adj.calculatedAmount, 0);
              const isServiceFeeWaived = invoice.waiveServiceFee || false;
              const serviceFeePercentage = 5;
              const serviceFee = isServiceFeeWaived ? 0 : servicesTotal * (serviceFeePercentage / 100);
              const additionalTip = parseFloat(invoice.additionalTip || 0);
              const grandTotal = servicesTotal + adjustmentsTotal + serviceFee + additionalTip;

              return (
                <>
                  {customLineItems.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                          {customLineItems.length}
                        </span>
                        <span className="font-medium text-sm">Adjustments</span>
                      </div>
                      <div className="space-y-2 pl-7">
                        {adjustmentsBreakdown.map((adj: any, idx: number) => {
                          const amount = adj.calculatedAmount;
                          const isDiscount = adj.mode === 'discount' || amount < 0;
                          const isSurcharge = adj.mode === 'surcharge' || amount > 0;
                          const isPercentage = adj.type === 'percentage';

                          return (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                {adj.description || adj.label} {isPercentage && adj.value ? `(${adj.value}%)` : ''}
                              </span>
                              <span className={`font-medium ${isDiscount ? 'text-green-600' : 'text-primary'}`}>
                                {isSurcharge ? '+' : ''}{formatCurrency(amount)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-medium">Subtotal</span>
                      <p className="text-xs text-muted-foreground">*Tax and fees will be calculated at checkout</p>
                    </div>
                    <span className="text-lg font-semibold">{formatCurrency(servicesTotal)}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className={`text-muted-foreground ${isServiceFeeWaived ? 'line-through' : ''}`}>
                        Service Fee ({serviceFeePercentage}%)
                      </span>
                      {isServiceFeeWaived && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                          WAIVED
                        </Badge>
                      )}
                    </div>
                    <span className={`font-medium ${isServiceFeeWaived ? 'line-through text-muted-foreground' : ''}`}>
                      {formatCurrency(serviceFee)}
                    </span>
                  </div>

                  {additionalTip > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Additional Tip</span>
                      <span className="font-medium">{formatCurrency(additionalTip)}</span>
                    </div>
                  )}

                  <div className="pt-3 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg">Total</span>
                      <span className="text-2xl font-bold text-primary">
                        {formatCurrency(grandTotal)}
                      </span>
                    </div>
                  </div>
                </>
              );
            })()}
          </CardContent>
        </Card>

        {/* Payment Information Card */}
        {orders.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.map((order: any) => (
                  <div key={order.id} className="border rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Receipt className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Payment Status</span>
                        </div>
                        <Badge 
                          variant={order.paymentStatus === 'succeeded' ? 'default' : 'destructive'}
                          className={order.paymentStatus === 'succeeded' ? 'bg-green-100 text-green-800' : ''}
                        >
                          {order.paymentStatus}
                        </Badge>
                        <div>
                          <p className="text-sm text-muted-foreground">Amount Paid</p>
                          <p className="font-semibold text-lg">
                            {formatCurrency(
                              order.paymentDetails?.amount 
                                ? order.paymentDetails.amount / 100 
                                : parseFloat(order.amountPaid || 0)
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Payment Method</p>
                          <p className="font-medium capitalize">{order.paymentMethodType || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm text-muted-foreground">Payment Intent ID</p>
                          <p className="font-mono text-xs break-all">{order.stripePaymentIntentId}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Payment Date</p>
                          <p className="font-medium">{formatDate(order.createdAt)}</p>
                        </div>
                        {order.receiptUrl && (
                          <div>
                            <a 
                              href={order.receiptUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline"
                            >
                              View Receipt
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Dashboard>
  );
}

export default AdminOrderDetailsPage;

