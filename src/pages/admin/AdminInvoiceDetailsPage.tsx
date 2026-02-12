import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Dashboard from '@/components/dashboard/Dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, MapPin, Users, Clock, Mail, Phone, User, DollarSign, Edit, FileText, ImageIcon, MoreHorizontal, Trash2, ShoppingCart } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import InvoicesService from '@/services/api/admin/invoices.Service';
import { useToast } from '@/hooks/use-toast';
import invoiceService from '@/services/api/invoice.Service';
import { format } from 'date-fns';

function AdminInvoiceDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [invoiceData, setInvoiceData] = useState<any>(null);

  const handleDeleteInvoice = async () => {
    if (!id) return;
    try {
      await InvoicesService.deleteInvoice(id);
      toast({
        title: "Success",
        description: "Invoice deleted successfully",
      });
      navigate('/admin/invoices');
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to delete invoice';
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    const fetchInvoiceDetails = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await invoiceService.getInvoiceById(id);

        if (response?.data) {
          const invoice = response.data;

          setInvoiceData({
            ...invoice,
            isGroupOrder: !!(invoice.budgetPerPerson || invoice.paymentSettings || invoice.orderDeadline)
          });
        }
      } catch (error) {
        console.error('Error fetching invoice details:', error);
        toast({
          title: "Error",
          description: "Failed to load invoice details",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInvoiceDetails();
  }, [id, toast]);

  if (loading) {
    return (
      <Dashboard activeTab="invoices" userRole="admin">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <div className="text-lg font-medium">Loading invoice details...</div>
          </div>
        </div>
      </Dashboard>
    );
  }

  if (!invoiceData) {
    return (
      <Dashboard activeTab="invoices" userRole="admin">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Invoice not found</p>
          <Button onClick={() => navigate('/admin/invoices')} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Invoices
          </Button>
        </div>
      </Dashboard>
    );
  }

  const calculateServiceTotal = (service: any) => {
    // Use totalPrice directly from API if available
    if (service.totalPrice && parseFloat(service.totalPrice) > 0) {
      return parseFloat(service.totalPrice);
    }

    // Fallback: Calculate total from items
    let itemsTotal = 0;

    // Add catering items
    if (service.cateringItems?.length > 0) {
      service.cateringItems.forEach((item: any) => {
        itemsTotal += parseFloat(item.totalPrice || 0);
      });
    }

    // Add party rental items
    if (service.partyRentalItems?.length > 0) {
      service.partyRentalItems.forEach((item: any) => {
        itemsTotal += parseFloat(item.totalPrice || item.price || 0) * (item.quantity || 1);
      });
    }

    // Add staff items
    if (service.staffItems?.length > 0) {
      service.staffItems.forEach((item: any) => {
        itemsTotal += parseFloat(item.totalPrice || 0);
      });
    }

    return itemsTotal || parseFloat(service.price) || 0;
  };

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <Dashboard activeTab="invoices" userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Invoice Details</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-black">Status:</span>
            {getStatusBadge(invoiceData.status)}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {/* <DropdownMenuItem onClick={() => navigate(`/admin/invoices/${id}/edit`)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Invoice
                </DropdownMenuItem> */}
                {invoiceData.status === 'paid' && (
                  <DropdownMenuItem onClick={() => navigate(`/admin/orders/${id}`)}>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    View Order Detail
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Invoice
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to permanently delete this invoice? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteInvoice}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete Permanently
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Invoice Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Invoice Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Event Date</p>
                    <p className="font-medium">{formatDate(invoiceData.eventDate)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Service Time</p>
                    <p className="font-medium">{invoiceData.serviceTime || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{invoiceData.eventLocation || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Guest Count</p>
                    <p className="font-medium">{invoiceData.guestCount || 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Contact Name</p>
                    <p className="font-medium">{invoiceData.contactName || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{invoiceData.emailAddress || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{invoiceData.phoneNumber || 'N/A'}</p>
                  </div>
                </div>
                {invoiceData.companyName && (
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Company</p>
                      <p className="font-medium">{invoiceData.companyName}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {invoiceData.additionalNotes && (
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-muted-foreground mb-2">Additional Notes</p>
                <p className="text-sm">{invoiceData.additionalNotes}</p>
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
              {invoiceData.services.map((service: any, index: number) => (
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
                      <p className="font-semibold">${calculateServiceTotal(service).toFixed(2)}</p>
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
                          {/* Catering Items */}
                          {service.cateringItems?.map((item: any) => (
                            <TableRow key={item.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {item.image ? (
                                    <img
                                      src={item.image}
                                      alt={item.menuItemName}
                                      className="w-10 h-10 rounded object-cover"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                                      <ImageIcon className="w-5 h-5 text-muted-foreground" />
                                    </div>
                                  )}
                                  <span>{item.menuItemName}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">{item.quantity || 1}</TableCell>
                              <TableCell className="text-right">${parseFloat(item.price || 0).toFixed(2)}</TableCell>
                              <TableCell className="text-right">${parseFloat(item.totalPrice || 0).toFixed(2)}</TableCell>
                            </TableRow>
                          ))}
                          {/* Party Rental Items */}
                          {service.partyRentalItems?.map((item: any) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.name}</TableCell>
                              <TableCell className="text-right">{item.quantity || 1}</TableCell>
                              <TableCell className="text-right">${parseFloat(item.price || item.eachPrice || 0).toFixed(2)}</TableCell>
                              <TableCell className="text-right">${parseFloat(item.totalPrice || item.price || 0).toFixed(2)}</TableCell>
                            </TableRow>
                          ))}
                          {/* Staff Items */}
                          {service.staffItems?.map((item: any) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.name} {item.hours ? `(${item.hours}h)` : ''}</TableCell>
                              <TableCell className="text-right">1</TableCell>
                              <TableCell className="text-right">${parseFloat(item.perHourPrice || item.price || 0).toFixed(2)}/h</TableCell>
                              <TableCell className="text-right">${parseFloat(item.totalPrice || 0).toFixed(2)}</TableCell>
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
              const servicesTotal = invoiceData.services.reduce((sum: number, s: any) => sum + calculateServiceTotal(s), 0);
              const customLineItems = invoiceData.customLineItems || [];
              
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
              const isServiceFeeWaived = invoiceData.waiveServiceFee || false;
              const serviceFeePercentage = 5;
              const serviceFee = isServiceFeeWaived ? 0 : servicesTotal * (serviceFeePercentage / 100);
              const grandTotal = servicesTotal + adjustmentsTotal + serviceFee;

              return (
                <>
                  {/* Adjustments Section */}
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

                  {/* Subtotal Section */}
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-medium">Subtotal</span>
                      <p className="text-xs text-muted-foreground">*Tax and fees will be calculated at checkout</p>
                    </div>
                    <span className="text-lg font-semibold">${servicesTotal.toFixed(2)}</span>
                  </div>

                  {/* Service Fee */}
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
                      ${serviceFee.toFixed(2)}
                    </span>
                  </div>

                  {/* Final Total */}
                  <div className="pt-3 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg">Total</span>
                      <span className="text-2xl font-bold text-primary">
                        ${grandTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </>
              );
            })()}
          </CardContent>
        </Card>

        {/* Group Order Info */}
        {invoiceData.isGroupOrder && (
          <Card>
            <CardHeader>
              <CardTitle>Group Order Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {invoiceData.budgetPerPerson && (
                  <div>
                    <p className="text-sm text-muted-foreground">Budget Per Person</p>
                    <p className="font-medium">${invoiceData.budgetPerPerson}</p>
                  </div>
                )}
                {invoiceData.orderDeadline && (
                  <div>
                    <p className="text-sm text-muted-foreground">Order Deadline</p>
                    <p className="font-medium">{formatDate(invoiceData.orderDeadline)}</p>
                  </div>
                )}
                {invoiceData.invites && invoiceData.invites.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground">Invited Guests</p>
                    <p className="font-medium">{invoiceData.invites.length} guests</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Dashboard>
  );
}

export default AdminInvoiceDetailsPage;

