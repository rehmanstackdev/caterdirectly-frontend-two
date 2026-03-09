import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Dashboard from "@/components/dashboard/Dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Clock,
  Mail,
  Phone,
  User,
  FileText,
  MoreHorizontal,
  Trash2,
  ShoppingCart,
} from "lucide-react";
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
import InvoicesService from "@/services/api/admin/invoices.Service";
import { useToast } from "@/hooks/use-toast";
import invoiceService from "@/services/api/invoice.Service";
import { format } from "date-fns";
import OrderItemsBreakdown from "@/components/order-summary/OrderItemsBreakdown";
import { ServiceSelection } from "@/types/order";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function mapInvoiceToOrderSummaryData(invoice: any) {
  const mappedSelectedItems: Record<string, number> = {};

  const mappedServices: ServiceSelection[] = (invoice.services || []).map(
    (service: any) => {
      const serviceId = service.id;
      const serviceType = service.serviceType || "";

      let serviceItems: any[] = [];
      let menuItems: any[] = [];
      let rentalItems: any[] = [];
      let staffItems: any[] = [];
      let venueItems: any[] = [];

      if (service.cateringItems && service.cateringItems.length > 0) {
        serviceItems = service.cateringItems;
        menuItems = service.cateringItems.map((item: any) => {
          const comboCategoryItems = (invoice.services || []).flatMap(
            (s: any) =>
              (s.comboCategoryItems || []).filter(
                (comboItem: any) =>
                  comboItem.comboId === (item.cateringId || item.id),
              ),
          );

          return {
            id: item.cateringId || item.id,
            name: item.menuItemName || item.name,
            price: parseFloat(item.price || 0),
            quantity: item.quantity || 1,
            category: item.menuName || "Menu",
            menuName: item.menuName,
            menuItemName: item.menuItemName,
            isCombo: comboCategoryItems.length > 0 || item.isCombo || false,
            comboCategories: item.comboCategories || [],
            comboCategoryItems,
            priceType: item.priceType || "fixed",
            image: item.image || item.imageUrl,
            imageUrl: item.imageUrl || item.image,
            description: item.description || "",
          };
        });

        service.cateringItems.forEach((item: any) => {
          const itemId = item.cateringId || item.id;
          if (itemId) {
            mappedSelectedItems[itemId] =
              (mappedSelectedItems[itemId] || 0) + (item.quantity || 1);
          }
        });
      }

      if (serviceType === "catering") {
        const allComboCategoryItems = service.comboCategoryItems || [];
        const comboGroups = new Map();

        allComboCategoryItems.forEach((item: any) => {
          if (!comboGroups.has(item.comboId)) {
            comboGroups.set(item.comboId, []);
          }
          comboGroups.get(item.comboId).push(item);
        });

        comboGroups.forEach((comboCategoryItems, comboId) => {
          const existingCombo = menuItems.find((item) => item.id === comboId);
          const matchingCateringItem = service.cateringItems?.find(
            (item: any) => (item.cateringId || item.id) === comboId,
          );
          const comboImage =
            comboCategoryItems[0]?.image || matchingCateringItem?.image || "";

          if (!existingCombo) {
            const comboName =
              matchingCateringItem?.menuItemName ||
              matchingCateringItem?.menuName ||
              matchingCateringItem?.name ||
              "Combo";

            menuItems.push({
              id: comboId,
              name: comboName,
              price: parseFloat(matchingCateringItem?.price || 0) || 0,
              category: "Combo Packages",
              menuName: "Combo Packages",
              menuItemName: comboName,
              isCombo: true,
              comboCategories: [],
              comboCategoryItems: comboCategoryItems.map((item: any) => ({
                ...item,
                image: item.image || item.imageUrl || "",
              })),
              priceType: "fixed",
              image: comboImage,
              imageUrl: comboImage,
              description: "",
            });

            if (!(comboId in mappedSelectedItems)) {
              mappedSelectedItems[comboId] = 0;
            }
          } else {
            existingCombo.comboCategoryItems = comboCategoryItems.map(
              (item: any) => ({
                ...item,
                image: item.image || item.imageUrl || "",
              }),
            );
            if (comboImage && !existingCombo.image) {
              existingCombo.image = comboImage;
              existingCombo.imageUrl = comboImage;
            }
          }
        });
      }

      if (service.partyRentalItems && service.partyRentalItems.length > 0) {
        serviceItems = service.partyRentalItems;
        rentalItems = service.partyRentalItems.map((item: any) => ({
          id: item.rentalId || item.id,
          name: item.name,
          price: parseFloat(item.eachPrice || item.price || 0),
          priceType: "fixed",
        }));

        service.partyRentalItems.forEach((item: any) => {
          const itemId = item.rentalId || item.id;
          if (itemId) {
            mappedSelectedItems[itemId] =
              (mappedSelectedItems[itemId] || 0) + (item.quantity || 1);
          }
        });
      }

      if (service.staffItems && service.staffItems.length > 0) {
        serviceItems = service.staffItems;
        staffItems = service.staffItems.map((item: any) => ({
          id: item.staffId || item.id,
          name: item.name,
          price: parseFloat(item.perHourPrice || item.price || 0),
          pricingType: item.pricingType || "hourly",
          perHourPrice: parseFloat(item.perHourPrice || item.price || 0),
        }));

        service.staffItems.forEach((item: any) => {
          const itemId = item.staffId || item.id;
          if (itemId) {
            mappedSelectedItems[itemId] =
              (mappedSelectedItems[itemId] || 0) + 1;
            if (item.hours) {
              mappedSelectedItems[`${itemId}_duration`] = item.hours;
            }
          }
        });
      }

      if (service.venueItems && service.venueItems.length > 0) {
        serviceItems = service.venueItems;
        venueItems = service.venueItems.map((item: any) => ({
          id: item.id,
          name: item.name,
          price: parseFloat(item.price || 0),
        }));
      }

      let serviceDetails: any = {};

      if (serviceType === "catering") {
        const mappedComboCategoryItems = (service.comboCategoryItems || []).map(
          (item: any) => ({
            id: item.id,
            name: item.menuItemName || item.name,
            menuName: item.menuName,
            price: parseFloat(item.price) || 0,
            quantity: item.quantity || 1,
            additionalCharge: item.premiumCharge
              ? parseFloat(item.premiumCharge)
              : 0,
            premiumCharge: item.premiumCharge
              ? parseFloat(item.premiumCharge)
              : 0,
            comboId: item.comboId,
            cateringId: item.cateringId,
            image: item.image || item.imageUrl || "",
          }),
        );

        const menuItemsWithImages = menuItems.map((mi: any) => ({
          ...mi,
          image: mi.image || mi.imageUrl || "",
        }));

        const comboIds = [
          ...new Set(mappedComboCategoryItems.map((item: any) => item.comboId)),
        ];

        const combos = comboIds.map((comboId: any) => {
          const comboItems = mappedComboCategoryItems.filter(
            (item: any) => item.comboId === comboId,
          );
          const categoryMap = new Map();

          comboItems.forEach((item: any) => {
            if (!categoryMap.has(item.menuName)) {
              categoryMap.set(item.menuName, {
                id: item.menuName,
                categoryId: item.menuName,
                name: item.menuName,
                items: [],
              });
            }
            categoryMap.get(item.menuName).items.push({
              id: item.cateringId || item.id,
              itemId: item.cateringId || item.id,
              name: item.name,
              price: item.price,
              additionalCharge: item.additionalCharge,
              image: item.image || "",
            });
          });

          const matchingCateringItem = service.cateringItems?.find(
            (ci: any) => (ci.cateringId || ci.id) === comboId,
          );
          const comboName =
            matchingCateringItem?.menuItemName ||
            matchingCateringItem?.menuName ||
            matchingCateringItem?.name ||
            "Combo";

          return {
            id: comboId,
            name: comboName,
            isCombo: true,
            pricePerPerson: matchingCateringItem
              ? parseFloat(matchingCateringItem.price || 0)
              : 0,
            comboCategories: Array.from(categoryMap.values()),
          };
        });

        serviceDetails = {
          catering: {
            menuItems: menuItemsWithImages,
            combos,
          },
          menuItems: menuItemsWithImages,
          comboCategoryItems: mappedComboCategoryItems,
        };
      } else if (
        serviceType === "party_rentals" ||
        serviceType === "party-rentals" ||
        serviceType === "party-rental"
      ) {
        serviceDetails = {
          rentalItems,
          rental: {
            items: rentalItems,
          },
        };
      } else if (serviceType === "events_staff" || serviceType === "staff") {
        serviceDetails = {
          staffServices: staffItems,
          services: staffItems,
          staff: {
            services: staffItems,
          },
        };
      } else if (serviceType === "venues" || serviceType === "venue") {
        serviceDetails = {
          venueOptions: venueItems,
          options: venueItems,
        };
      }

      return {
        id: serviceId,
        serviceId,
        name: service.serviceName,
        serviceName: service.serviceName,
        price: parseFloat(service.price) || 0,
        servicePrice: service.price,
        totalPrice: parseFloat(service.totalPrice) || 0,
        quantity: service.quantity || 1,
        duration: service.staffItems?.[0]?.hours || 0,
        serviceType,
        type: serviceType,
        description: "",
        vendor_id: service.vendorId || undefined,
        vendor: service.vendorName || service.businessName || "",
        vendorName: service.vendorName || service.businessName || "",
        vendorEarnings: parseFloat(service.vendorEarnings || "0") || 0,
        priceType: service.priceType || "flat",
        price_type: service.priceType || "flat",
        service_details: serviceDetails,
        selected_menu_items: serviceItems,
        image: service.image || service.imageUrl || "",
        imageUrl: service.imageUrl || service.image || "",
        serviceImage: service.image || service.imageUrl || "",
        deliveryFee: service.deliveryFee || "0",
      } as ServiceSelection;
    },
  );

  const mappedAdjustments = (invoice.customLineItems || []).map(
    (item: any) => ({
      id: item.id,
      label: item.label,
      type: item.type === "percentage" ? "percentage" : "fixed",
      mode: item.mode === "surcharge" ? "surcharge" : "discount",
      value: parseFloat(item.value) || 0,
      taxable: item.taxable !== false,
    }),
  );

  const allComboCategoryItems = (invoice.services || []).flatMap(
    (s: any) => s.comboCategoryItems || [],
  );
  allComboCategoryItems.forEach((item: any) => {
    const itemKey = `${item.comboId}_${item.menuName}_${item.cateringId}`;
    mappedSelectedItems[itemKey] = item.quantity;
  });

  const formData = {
    invoiceId: invoice.id,
    eventName: invoice.eventName || "",
    company: invoice.companyName || "",
    location: invoice.eventLocation || "",
    date: invoice.eventDate || "",
    time: invoice.serviceTime || "",
    headcount: invoice.guestCount || 1,
    primaryContactName: invoice.contactName || "",
    primaryContactPhone: invoice.phoneNumber || "",
    primaryContactEmail: invoice.emailAddress || "",
    additionalNotes: invoice.additionalNotes || "",
    customAdjustments: mappedAdjustments,
    adminOverrides: {
      isTaxExempt: invoice.taxExemptStatus || false,
      isServiceFeeWaived: invoice.waiveServiceFee || false,
    },
    isTaxExempt: invoice.taxExemptStatus || false,
    isServiceFeeWaived: invoice.waiveServiceFee || false,
  };

  return { mappedServices, mappedSelectedItems, formData };
}

function AdminInvoiceDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [selectedServices, setSelectedServices] = useState<ServiceSelection[]>(
    [],
  );
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>(
    {},
  );
  const [formData, setFormData] = useState<any>({});

  const handleDeleteInvoice = async () => {
    if (!id) return;
    try {
      await InvoicesService.deleteInvoice(id);
      toast({
        title: "Success",
        description: "Invoice deleted successfully",
      });
      navigate("/admin/invoices");
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

  useEffect(() => {
    const fetchInvoiceDetails = async () => {
      if (!id) return;

      try {
        setLoading(true);

        let invoice: any = null;
        try {
          const summaryResponse =
            await invoiceService.getInvoiceOrderSummary(id);
          invoice = summaryResponse?.data?.invoice || null;
        } catch (summaryError) {
          invoice = null;
        }

        if (!invoice) {
          const response = await invoiceService.getInvoiceById(id);
          invoice = response?.data || null;
        }

        if (invoice) {
          const mapped = mapInvoiceToOrderSummaryData(invoice);

          setInvoiceData({
            ...invoice,
            isGroupOrder: !!(
              invoice.budgetPerPerson ||
              invoice.paymentSettings ||
              invoice.orderDeadline
            ),
          });
          setSelectedServices(mapped.mappedServices);
          setSelectedItems(mapped.mappedSelectedItems);
          setFormData(mapped.formData);
        }
      } catch (error) {
        console.error("Error fetching invoice details:", error);
        toast({
          title: "Error",
          description: "Failed to load invoice details",
          variant: "destructive",
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
            <div className="text-lg font-medium">
              Loading invoice details...
            </div>
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
          <Button onClick={() => navigate("/admin/invoices")} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Invoices
          </Button>
        </div>
      </Dashboard>
    );
  }

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
      cancelled: { label: "Cancelled", variant: "destructive" },
    };

    const config = statusConfig[status?.toLowerCase()] || {
      label: status,
      variant: "secondary" as const,
    };
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "PPP");
    } catch {
      return dateString;
    }
  };
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  return (
    <Dashboard activeTab="invoices" userRole="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                Invoice Details
              </h1>
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
                {invoiceData.status === "paid" && (
                  <DropdownMenuItem
                    onClick={() => navigate(`/admin/orders/${id}`)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    View Order Detail
                  </DropdownMenuItem>
                )}

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
                      <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to permanently delete this
                        invoice? This action cannot be undone.
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
                    <p className="font-medium">
                      {formatDate(invoiceData.eventDate)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Service Time
                    </p>
                    <p className="font-medium">
                      {invoiceData.serviceTime || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">
                      {invoiceData.eventLocation || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Guest Count</p>
                    <p className="font-medium">
                      {invoiceData.guestCount || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Contact Name
                    </p>
                    <p className="font-medium">
                      {invoiceData.contactName || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">
                      {invoiceData.emailAddress || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">
                      {invoiceData.phoneNumber || "N/A"}
                    </p>
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
                <p className="text-sm text-muted-foreground mb-2">
                  Additional Notes
                </p>
                <p className="text-sm">{invoiceData.additionalNotes}</p>
              </div>
            )}
          </CardContent>
        </Card>


        <OrderItemsBreakdown
          services={selectedServices}
          selectedItems={selectedItems}
          formData={formData}
          isTaxExempt={Boolean(invoiceData.taxExemptStatus)}
          isServiceFeeWaived={Boolean(invoiceData.waiveServiceFee)}
          pricingSnapshot={(invoiceData as any).pricing_snapshot || null}
          showVendorEarningsBadge={true}
        />
      </div>
    </Dashboard>
  );
}

export default AdminInvoiceDetailsPage;
