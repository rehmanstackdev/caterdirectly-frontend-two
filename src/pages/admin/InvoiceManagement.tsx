import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { MobileOptimizedButton } from "@/components/ui/mobile-optimized-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useMobileDetection } from "@/hooks/use-mobile-detection";
import {
  Search,
  Eye,
  Clock,
  CheckCircle,
  Trash2,
  MoreHorizontal,
  MessageSquare,
  Download,
  Ban,
  FileText,
  Edit,
  ShoppingCart,
  Loader2,
} from "lucide-react";
import { generateInvoicePDF } from "@/utils/invoice-pdf-generator";
import { useNavigate } from "react-router-dom";
import Dashboard from "@/components/dashboard/Dashboard";
import { Invoice as InvoiceType } from "@/types/invoice-types";
import InvoicesService from "@/services/api/admin/invoices.Service";

interface ChangeRequest {
  id: string;
  proposal_id: string;
  client_name: string;
  client_email: string;
  requested_changes: string;
  status: string;
  created_at: string;
  proposal: {
    title: string;
  };
}

const DUMMY_CHANGE_REQUESTS: ChangeRequest[] = [
  {
    id: "cr1",
    proposal_id: "4",
    client_name: "Emily Chen",
    client_email: "emily.chen@example.com",
    requested_changes:
      "We need to add vegetarian options for 20 guests and adjust the menu to include gluten-free alternatives.",
    status: "pending",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    proposal: {
      title: "Conference Dinner",
    },
  },
];

const InvoiceManagement = () => {
  const [invoices, setInvoices] = useState<InvoiceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>(
    DUMMY_CHANGE_REQUESTS,
  );
  const [selectedChangeRequest, setSelectedChangeRequest] =
    useState<ChangeRequest | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [editStatusInvoice, setEditStatusInvoice] =
    useState<InvoiceType | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // console.log('📝 InvoiceManagement: Invoices:', JSON.stringify(invoices));

  const { toast } = useToast();
  const navigate = useNavigate();
  const { isMobile, isTablet } = useMobileDetection();

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch invoices function
  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const response = await InvoicesService.getAllInvoices(
        currentPage,
        itemsPerPage,
        statusFilter,
        debouncedSearch,
      );

      const responseData = response?.data;
      const invoicesData = responseData?.data || response?.data || response;
      const paginationData = responseData?.pagination;

      setInvoices(Array.isArray(invoicesData) ? invoicesData : []);

      if (paginationData && typeof paginationData.totalItems === "number") {
        setTotalItems(paginationData.totalItems);
        setTotalPages(
          paginationData.totalPages ||
            Math.ceil(paginationData.totalItems / itemsPerPage),
        );
      }

      setError(null);
    } catch (err: any) {
      console.error("Error fetching invoices:", err);
      setError(err.message || "Failed to fetch invoices");
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, statusFilter, debouncedSearch]);

  // Fetch invoices on component mount and when filters/pagination change
  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // Helper function to calculate total from orders (actual payment data) or budget
  const calculateInvoiceTotal = (invoice: InvoiceType): number => {
    // For paid invoices, use actual payment amount
    if (invoice.orders && invoice.orders.length > 0) {
      return invoice.orders.reduce(
        (sum, order) => sum + parseFloat(order.amountPaid || "0"),
        0,
      );
    }
    // For drafted/pending invoices, use budget if available
    if ((invoice as any).budget) {
      return parseFloat((invoice as any).budget);
    }
    return 0;
  };

  // Clear selection when filters change
  useEffect(() => {
    setSelectedInvoiceIds([]);
  }, [searchTerm, statusFilter]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter]);

  // Use invoices directly since search is now server-side
  const filteredInvoices = invoices;

  // Helper to check if invoice can be deleted (SSOT for deletion rules)
  const isDeletable = (status: string) => {
    // Handle both 'draft' and 'drafted' status values
    return ["draft", "drafted", "declined", "expired"].includes(status);
  };

  // Get list of deletable invoices for "select all" logic
  const deletableInvoices = filteredInvoices.filter((inv: InvoiceType) =>
    isDeletable(inv.status),
  );

  // Handler for "select all" checkbox - only selects deletable invoices
  const handleSelectAll = () => {
    if (deletableInvoices.length === 0) return;

    const allDeletableIds = deletableInvoices.map((inv) => inv.id);
    const allSelected = allDeletableIds.every((id) =>
      selectedInvoiceIds.includes(id),
    );

    if (allSelected) {
      // Deselect all deletable invoices
      setSelectedInvoiceIds((prev) =>
        prev.filter((id) => !allDeletableIds.includes(id)),
      );
    } else {
      // Select all deletable invoices (merge with existing selections)
      setSelectedInvoiceIds((prev) => {
        const newIds = [...prev];
        allDeletableIds.forEach((id) => {
          if (!newIds.includes(id)) {
            newIds.push(id);
          }
        });
        return newIds;
      });
    }
  };

  // Handler for individual checkbox
  const handleSelectInvoice = (invoiceId: string) => {
    setSelectedInvoiceIds((prev) =>
      prev.includes(invoiceId)
        ? prev.filter((id) => id !== invoiceId)
        : [...prev, invoiceId],
    );
  };

  // Bulk delete handler
  const handleBulkDelete = async () => {
    if (selectedInvoiceIds.length === 0) return;

    try {
      const response = await InvoicesService.deleteInvoices(selectedInvoiceIds);
      const data = response.data;

      // Remove deleted invoices from state
      setInvoices((prev) =>
        prev.filter((invoice) => !selectedInvoiceIds.includes(invoice.id)),
      );
      setSelectedInvoiceIds([]);

      // Update total items count
      setTotalItems((prev) =>
        Math.max(0, prev - (data.deletedCount || selectedInvoiceIds.length)),
      );

      toast({
        title: "Success",
        description: `${data.deletedCount || selectedInvoiceIds.length} invoice(s) deleted successfully`,
      });
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Failed to delete invoices";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      {
        label: string;
        variant: "default" | "secondary" | "destructive";
        className?: string;
      }
    > = {
      drafted: { label: "Draft", variant: "secondary" },
      draft: { label: "Draft", variant: "secondary" },
      pending: { label: "Pending", variant: "default" },
      accepted: { label: "Accepted", variant: "default" },
      paid: {
        label: "Paid",
        variant: "default",
        className:
          "bg-green-100 text-green-800 border-green-300 hover:bg-green-200",
      },
      declined: { label: "Declined", variant: "destructive" },
      revision_requested: {
        label: "Revision Requested",
        variant: "default",
        className:
          "bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-200",
      },
      expired: { label: "Expired", variant: "destructive" },
    };

    const config = statusConfig[status] || {
      label: status,
      variant: "secondary" as const,
    };
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const handleViewInvoice = (invoice: InvoiceType) => {
    // Navigate to dedicated invoice details page
    navigate(`/admin/invoices/${invoice.id}`);
  };

  const handleViewOrderDetail = (invoice: InvoiceType) => {
    // Navigate to admin order details page using invoice ID
    navigate(`/admin/orders/${invoice.id}`);
  };

  const handleCreateInvoice = (invoice: InvoiceType) => {
    console.log("🔥 handleCreateInvoice called with:", invoice);
    try {
      console.log("🔥 About to call generateInvoicePDF");
      generateInvoicePDF(invoice);
      console.log("🔥 generateInvoicePDF completed successfully");
      toast({
        title: "Success",
        description: "Invoice PDF generated successfully",
      });
    } catch (error) {
      console.error("🔥 Error in handleCreateInvoice:", error);
      toast({
        title: "Error",
        description: "Failed to generate invoice PDF",
        variant: "destructive",
      });
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    try {
      await InvoicesService.deleteInvoice(invoiceId);

      // Remove deleted invoice from state
      setInvoices((prev) => prev.filter((invoice) => invoice.id !== invoiceId));

      toast({
        title: "Success",
        description: "Invoice deleted successfully",
      });
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Failed to delete invoice";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handlePreviewPdf = (proposalId: string, debug = false) => {
    toast({
      title: debug ? "Debug PDF" : "PDF Preview",
      description: `PDF preview for invoice ${proposalId} (demo mode)`,
    });
  };

  const handleAcceptChanges = (proposalId: string) => {
    setChangeRequests((prev) =>
      prev.map((req) =>
        req.proposal_id === proposalId ? { ...req, status: "accepted" } : req,
      ),
    );

    toast({
      title: "Success",
      description: "Change request accepted",
    });

    setSelectedChangeRequest(null);
  };

  const handleDeclineChanges = (proposalId: string) => {
    setChangeRequests((prev) =>
      prev.map((req) =>
        req.proposal_id === proposalId ? { ...req, status: "declined" } : req,
      ),
    );

    toast({
      title: "Success",
      description: "Change request declined",
    });

    setSelectedChangeRequest(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const isExpiringSoon = (expiresAt: string) => {
    const expiryDate = new Date(expiresAt);
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    return expiryDate <= threeDaysFromNow;
  };

  const handleOpenEditStatus = (invoice: InvoiceType) => {
    setEditStatusInvoice(invoice);
    setNewStatus(invoice.status);
  };

  const handleUpdateStatus = async () => {
    if (!editStatusInvoice || !newStatus) return;

    try {
      setIsUpdatingStatus(true);
      await InvoicesService.updateInvoiceStatus(
        editStatusInvoice.id,
        newStatus,
      );

      toast({
        title: "Success",
        description: "Invoice status updated successfully",
      });

      setEditStatusInvoice(null);
      setNewStatus("");

      // Refresh the invoices list from API
      await fetchInvoices();
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Failed to update invoice status";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <Dashboard activeTab="invoices" userRole="admin">
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Invoice Management</h1>
          <MobileOptimizedButton
            onClick={() => navigate("/admin/marketplace")}
            className="w-full sm:w-auto"
          >
            Create New Invoice
          </MobileOptimizedButton>
        </div>

        {/* Change Requests Alert */}
        {/* {changeRequests.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-orange-800 text-lg sm:text-xl">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">Pending Change Requests ({changeRequests.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {changeRequests.slice(0, 3).map((request) => (
                  <div key={request.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-white rounded border gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{request.proposal.title}</div>
                      <div className="text-sm text-gray-600">from {request.client_name}</div>
                    </div>
                    <Badge variant="outline" className="self-start sm:self-center">Review Required</Badge>
                  </div>
                ))}
                {changeRequests.length > 3 && (
                  <p className="text-sm text-orange-700">+{changeRequests.length - 3} more requests...</p>
                )}
              </div>
            </CardContent>
          </Card>
        )} */}

        {/* Invoice Recovery Tool */}
        {/* <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-800 text-lg sm:text-xl">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>Invoice Recovery Tool</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-blue-700">
                This tool checks for orders that are missing invoices and automatically creates them with proper tokens and URLs. Use "Rebuild Pricing Snapshots" to fix invoices with incomplete financial data.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={handleRecoverMissingInvoices}
                  disabled={isRecovering}
                  variant="outline"
                  size="sm"
                  className="border-blue-300 hover:bg-blue-100"
                >
                  {isRecovering ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      Recovering...
                    </>
                  ) : (
                    <>
                      <FileEdit className="h-4 w-4 mr-2" />
                      Run Invoice Recovery
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleRebuildPricingSnapshots}
                  disabled={isRebuilding}
                  variant="outline"
                  size="sm"
                  className="border-purple-300 hover:bg-purple-100"
                >
                  {isRebuilding ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                      Rebuilding...
                    </>
                  ) : (
                    <>
                      <DollarSign className="h-4 w-4 mr-2" />
                      Rebuild Pricing Snapshots
                    </>
                  )}
                </Button>
              </div>

              {showRecoveryResults && recoveryResults && (
                <div className="mt-4 p-3 bg-white rounded border border-blue-200">
                  <h4 className="font-medium mb-2">Recovery Results:</h4>
                  <div className="space-y-1 text-sm">
                    <p>✅ Total Orders Checked: {recoveryResults.totalOrphanedOrders || 0}</p>
                    <p className="text-green-600">✅ Successfully Recovered: {recoveryResults.successCount || 0}</p>
                    {recoveryResults.failureCount > 0 && (
                      <p className="text-red-600">❌ Failed: {recoveryResults.failureCount || 0}</p>
                    )}
                  </div>
                  {recoveryResults.results && recoveryResults.results.length > 0 && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                        View Details
                      </summary>
                      <ScrollArea className="h-48 mt-2">
                        <div className="space-y-2">
                          {recoveryResults.results.map((result: any, idx: number) => (
                            <div key={idx} className="text-xs p-2 bg-gray-50 rounded">
                              <p><strong>Order:</strong> {result.orderId}</p>
                              {result.success ? (
                                <>
                                  <p className="text-green-600">✅ Invoice created: {result.invoiceId}</p>
                                  <p><strong>Token:</strong> {result.token}</p>
                                  <p><strong>Email:</strong> {result.clientEmail}</p>
                                </>
                              ) : (
                                <p className="text-red-600">❌ {result.error}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </details>
                  )}
                </div>
              )}

              {showRebuildResults && rebuildResults && (
                <div className="mt-4 p-3 bg-white rounded border border-purple-200">
                  <h4 className="font-medium mb-2">Rebuild Results:</h4>
                  <div className="space-y-1 text-sm">
                    <p>✅ Total Invoices Checked: {rebuildResults.results?.total || 0}</p>
                    <p className="text-green-600">✅ Successfully Updated: {rebuildResults.results?.updated || 0}</p>
                    {rebuildResults.results?.skipped > 0 && (
                      <p className="text-yellow-600">⚠️ Skipped: {rebuildResults.results?.skipped || 0}</p>
                    )}
                    {rebuildResults.results?.failed > 0 && (
                      <p className="text-red-600">❌ Failed: {rebuildResults.results?.failed || 0}</p>
                    )}
                  </div>
                  {rebuildResults.results?.details && rebuildResults.results.details.length > 0 && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-purple-600 hover:text-purple-800">
                        View Details
                      </summary>
                      <ScrollArea className="h-48 mt-2">
                        <div className="space-y-2">
                          {rebuildResults.results.details.map((result: any, idx: number) => (
                            <div key={idx} className="text-xs p-2 bg-gray-50 rounded">
                              <p><strong>Invoice:</strong> {result.id}</p>
                              {result.status === 'updated' ? (
                                <>
                                  <p className="text-green-600">✅ Pricing snapshot rebuilt</p>
                                  {result.snapshot && (
                                    <>
                                      <p><strong>Total:</strong> ${result.snapshot.total.toFixed(2)}</p>
                                      <p><strong>Tax:</strong> ${result.snapshot.tax.toFixed(2)}</p>
                                      <p><strong>Service Fee:</strong> ${result.snapshot.serviceFee.toFixed(2)}</p>
                                    </>
                                  )}
                                </>
                              ) : result.status === 'skipped' ? (
                                <p className="text-yellow-600">⚠️ {result.reason}</p>
                              ) : (
                                <p className="text-red-600">❌ {result.reason}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </details>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card> */}

        {/* Search */}
        <div className="flex flex-col justify-between sm:flex-row gap-4 items-stretch sm:items-center">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by invoice or event location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select
            value={statusFilter === "all" ? "" : statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value === "" ? "all" : value)
            }
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter Invoices" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="drafted">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status Tabs */}
        <Tabs
          value={statusFilter}
          onValueChange={setStatusFilter}
          className="w-full"
        >
          <TabsList className="w-full">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="paid">Paid</TabsTrigger>
            <TabsTrigger value="drafted">Draft</TabsTrigger>
            <TabsTrigger value="expired">Expired</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Bulk Action Bar - only shows when invoices are selected */}
        {selectedInvoiceIds.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="py-3 px-4 flex justify-between items-center">
              <span className="text-sm font-medium">
                {selectedInvoiceIds.length} invoice(s) selected
              </span>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Delete {selectedInvoiceIds.length} Invoice(s)?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to permanently delete these
                      invoices? This action cannot be undone.
                      <ScrollArea className="mt-4 max-h-60">
                        <div className="space-y-2 pr-4">
                          {selectedInvoiceIds.map((id) => {
                            const invoice = invoices.find(
                              (inv: InvoiceType) => inv.id === id,
                            );
                            return invoice ? (
                              <div
                                key={id}
                                className="text-sm bg-white p-2 rounded border"
                              >
                                {invoice.eventName} - {invoice.contactName}
                              </div>
                            ) : null;
                          })}
                        </div>
                      </ScrollArea>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleBulkDelete}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete {selectedInvoiceIds.length} Invoice(s)
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        )}

        {/* Invoices Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg sm:text-xl">Invoices</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isMobile ? (
              // Mobile Card Layout
              <div className="space-y-4 p-4">
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <Card key={`skeleton-${index}`} className="shadow-sm">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <Skeleton className="h-4 w-4 mt-1" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-5 w-32" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                            <Skeleton className="h-5 w-16" />
                          </div>
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-3 w-36" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                          <Skeleton className="h-3 w-40" />
                          <div className="flex justify-end">
                            <Skeleton className="h-8 w-8" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-red-600">Error loading invoices</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Please try refreshing the page
                    </p>
                  </div>
                ) : filteredInvoices.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No invoices found
                  </div>
                ) : (
                  filteredInvoices.map((invoice: InvoiceType) => (
                    <Card key={invoice.id} className="shadow-sm">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {/* Header */}
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={selectedInvoiceIds.includes(invoice.id)}
                              onCheckedChange={() =>
                                handleSelectInvoice(invoice.id)
                              }
                              disabled={!isDeletable(invoice.status)}
                              className="mt-1"
                            />
                            <div className="flex-1 flex justify-between items-start gap-2 min-w-0">
                              <div className="min-w-0 flex-1">
                                <h3 className="font-medium truncate">
                                  {invoice.eventName}
                                </h3>
                                {invoice.eventDate && (
                                  <p className="text-sm text-muted-foreground">
                                    Event:{" "}
                                    {new Date(
                                      invoice.eventDate,
                                    ).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                              {getStatusBadge(invoice.status)}
                            </div>
                          </div>

                          {/* Client Info */}
                          <div>
                            <p className="font-medium text-sm">
                              {invoice.contactName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {invoice.emailAddress}
                            </p>
                            {invoice.companyName && (
                              <p className="text-sm text-muted-foreground">
                                {invoice.companyName}
                              </p>
                            )}
                          </div>

                          {/* Event Location */}
                          {invoice.eventLocation && (
                            <div>
                              <span className="text-muted-foreground text-sm">
                                Location:{" "}
                              </span>
                              <span className="text-sm">
                                {invoice.eventLocation}
                              </span>
                            </div>
                          )}

                          {/* Value and Dates */}
                          <div className="flex justify-between text-sm">
                            {/* <div>
                            <span className="text-muted-foreground">Value: </span>
                            <span className="font-semibold">{formatCurrency(calculateInvoiceTotal(invoice))}</span>
                          </div> */}
                            <div className="text-right">
                              {invoice.createdBy ? (
                                <div>
                                  <div className="text-muted-foreground text-sm">
                                    Created by: {invoice.createdBy.firstName}{" "}
                                    {invoice.createdBy.lastName}
                                  </div>
                                  {(invoice.createdBy as any).email && (
                                    <div className="text-xs text-muted-foreground">
                                      {(invoice.createdBy as any).email}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="text-muted-foreground text-sm">
                                  Created:{" "}
                                  {new Date(
                                    invoice.createdAt,
                                  ).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex justify-end">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuItem
                                  onClick={() => handleViewInvoice(invoice)}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Invoice
                                </DropdownMenuItem>

                                {invoice.status === "paid" && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleViewOrderDetail(invoice)
                                    }
                                  >
                                    <ShoppingCart className="h-4 w-4 mr-2" />
                                    View Order Detail
                                  </DropdownMenuItem>
                                )}

                                <DropdownMenuItem
                                  onClick={() => handleCreateInvoice(invoice)}
                                >
                                  <FileText className="h-4 w-4 mr-2" />
                                  Create Invoice PDF
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  onClick={() => handleOpenEditStatus(invoice)}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Status
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem
                                      onSelect={(e) => e.preventDefault()}
                                      className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete Invoice
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Delete Invoice
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to permanently
                                        delete this invoice? This action cannot
                                        be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          handleDeleteInvoice(invoice.id)
                                        }
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
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            ) : (
              // Desktop/Tablet Table Layout
              <ScrollArea className={isTablet ? "w-full" : undefined}>
                <div className={isTablet ? "min-w-[800px]" : undefined}>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={
                              deletableInvoices.length > 0 &&
                              deletableInvoices.every((inv) =>
                                selectedInvoiceIds.includes(inv.id),
                              )
                            }
                            onCheckedChange={handleSelectAll}
                            aria-label="Select all deletable invoices"
                          />
                        </TableHead>
                        <TableHead>Invoice</TableHead>
                        <TableHead className="w-[150px] max-w-[150px]">
                          Client
                        </TableHead>
                        <TableHead>Event Location</TableHead>
                        {/* <TableHead>Value</TableHead> */}
                        <TableHead>Status</TableHead>
                        <TableHead
                          className={
                            isTablet ? "hidden lg:table-cell" : undefined
                          }
                        >
                          Created
                        </TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        Array.from({ length: 5 }).map((_, index) => (
                          <TableRow key={`skeleton-${index}`}>
                            <TableCell>
                              <Skeleton className="h-4 w-4" />
                            </TableCell>
                            <TableCell>
                              <div className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-24" />
                              </div>
                            </TableCell>
                            <TableCell className="w-[240px] max-w-[240px]">
                              <div className="space-y-2">
                                <Skeleton className="h-4 w-28" />
                                <Skeleton className="h-3 w-36" />
                                <Skeleton className="h-3 w-24" />
                              </div>
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-40" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-5 w-20" />
                            </TableCell>
                            <TableCell
                              className={
                                isTablet ? "hidden lg:table-cell" : undefined
                              }
                            >
                              <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-3 w-32" />
                              </div>
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-8 w-8" />
                            </TableCell>
                          </TableRow>
                        ))
                      ) : error ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <div className="text-center">
                              <p className="text-red-600">
                                Error loading invoices
                              </p>
                              <p className="text-sm text-muted-foreground mt-2">
                                Please try refreshing the page
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredInvoices.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="text-center py-8 text-muted-foreground"
                          >
                            No invoices found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredInvoices.map((invoice: InvoiceType) => (
                          <TableRow key={invoice.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedInvoiceIds.includes(
                                  invoice.id,
                                )}
                                onCheckedChange={() =>
                                  handleSelectInvoice(invoice.id)
                                }
                                disabled={!isDeletable(invoice.status)}
                                aria-label={`Select ${invoice.eventName}`}
                              />
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">
                                  {invoice.eventName}
                                </p>
                                {invoice.eventDate && (
                                  <p className="text-sm text-gray-600">
                                    Event Date:{" "}
                                    {new Date(
                                      invoice.eventDate,
                                    ).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="w-[240px] max-w-[240px]">
                              <div className="truncate">
                                <p className="font-medium truncate">
                                  {invoice.contactName}
                                </p>
                                <p className="text-sm text-gray-600 truncate">
                                  {invoice.emailAddress}
                                </p>
                                {invoice.phoneNumber && (
                                  <p className="text-sm text-gray-600 truncate">
                                    {invoice.phoneNumber}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm">
                                {invoice.eventLocation || "N/A"}
                              </p>
                            </TableCell>
                            {/* <TableCell className="font-semibold">
                            {formatCurrency(calculateInvoiceTotal(invoice))}
                          </TableCell> */}
                            <TableCell>
                              {getStatusBadge(invoice.status)}
                            </TableCell>
                            <TableCell
                              className={
                                isTablet ? "hidden lg:table-cell" : undefined
                              }
                            >
                              {invoice.createdBy ? (
                                <div>
                                  <p className="font-medium text-sm">
                                    {invoice.createdBy.firstName}{" "}
                                    {invoice.createdBy.lastName}
                                  </p>
                                  {"email" in invoice.createdBy && (
                                    <p className="text-xs text-gray-600">
                                      {(invoice.createdBy as any).email}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground">
                                  N/A
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="w-56"
                                >
                                  <DropdownMenuItem
                                    onClick={() => handleViewInvoice(invoice)}
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Invoice
                                  </DropdownMenuItem>

                                  {invoice.status === "paid" && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleViewOrderDetail(invoice)
                                      }
                                    >
                                      <ShoppingCart className="h-4 w-4 mr-2" />
                                      View Order Detail
                                    </DropdownMenuItem>
                                  )}

                                  <DropdownMenuItem
                                    onClick={() => handleCreateInvoice(invoice)}
                                  >
                                    <FileText className="h-4 w-4 mr-2" />
                                    Create Invoice PDF
                                  </DropdownMenuItem>

                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleOpenEditStatus(invoice)
                                    }
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Status
                                  </DropdownMenuItem>

                                  <DropdownMenuSeparator />

                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <DropdownMenuItem
                                        onSelect={(e) => e.preventDefault()}
                                        className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete Invoice
                                      </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>
                                          Delete Invoice
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Permanently delete this invoice? This
                                          cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>
                                          Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() =>
                                            handleDeleteInvoice(invoice.id)
                                          }
                                          className="bg-red-600 hover:bg-red-700"
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

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
                  Showing{" "}
                  <span className="font-medium">
                    {(currentPage - 1) * itemsPerPage + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, totalItems)}
                  </span>{" "}
                  of <span className="font-medium">{totalItems}</span> invoices
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
                      <div
                        key={i}
                        className="h-8 w-8 bg-gray-200 rounded animate-pulse"
                      ></div>
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
                    onClick={() => setCurrentPage((prev) => prev - 1)}
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
                          pages.push("...");
                        }

                        for (
                          let i = Math.max(2, currentPage - 1);
                          i <= Math.min(totalPages - 1, currentPage + 1);
                          i++
                        ) {
                          if (!pages.includes(i)) {
                            pages.push(i);
                          }
                        }

                        if (currentPage < totalPages - 2) {
                          pages.push("...");
                        }

                        if (!pages.includes(totalPages)) {
                          pages.push(totalPages);
                        }
                      }

                      return pages.map((page, index) =>
                        page === "..." ? (
                          <span
                            key={`ellipsis-${index}`}
                            className="px-2 text-muted-foreground"
                          >
                            ...
                          </span>
                        ) : (
                          <Button
                            key={page}
                            variant={
                              currentPage === page ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => setCurrentPage(page as number)}
                            className="h-8 w-8 p-0"
                          >
                            {page}
                          </Button>
                        ),
                      );
                    })()}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => prev + 1)}
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

        {/* Change Request Dialog */}
        {selectedChangeRequest && (
          <Dialog
            open={!!selectedChangeRequest}
            onOpenChange={() => setSelectedChangeRequest(null)}
          >
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Change Request Details</DialogTitle>
                <DialogDescription>
                  Review the client's requested changes for "
                  {selectedChangeRequest.proposal.title}"
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Client Information</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedChangeRequest.client_name} (
                    {selectedChangeRequest.client_email})
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Requested on{" "}
                    {new Date(
                      selectedChangeRequest.created_at,
                    ).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Requested Changes</h4>
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm">
                      {selectedChangeRequest.requested_changes}
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() =>
                      handleDeclineChanges(selectedChangeRequest.proposal_id)
                    }
                  >
                    <Ban className="h-4 w-4 mr-2" />
                    Decline Request
                  </Button>
                  <Button
                    onClick={() =>
                      handleAcceptChanges(selectedChangeRequest.proposal_id)
                    }
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Accept Changes
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Edit Status Dialog */}
        <Dialog
          open={!!editStatusInvoice}
          onOpenChange={(open) => !open && setEditStatusInvoice(null)}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Invoice Status</DialogTitle>
              <DialogDescription>
                Update the status for invoice: {editStatusInvoice?.eventName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Current Status</label>
                <div>
                  {editStatusInvoice &&
                    getStatusBadge(editStatusInvoice.status)}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">New Status</label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditStatusInvoice(null)}
                disabled={isUpdatingStatus}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateStatus}
                disabled={
                  isUpdatingStatus ||
                  !newStatus ||
                  newStatus === editStatusInvoice?.status
                }
              >
                {isUpdatingStatus && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {isUpdatingStatus ? "Updating..." : "Update Status"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Dashboard>
  );
};

export default InvoiceManagement;
