
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { VendorStatus } from '@/hooks/admin/vendors';
import { VendorDeleteDialog } from './VendorDeleteDialog';
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, XCircle } from "lucide-react";

interface VendorTableProps {
  loading: boolean;
  filteredVendors: any[];
  toggleManagedStatus: (id: string) => void;
  updateVendorStatus: (id: string, status: VendorStatus) => void;
  updateCommissionRate: (id: string, rate: number) => void;
  deleteVendor: (id: string, deleteServices: boolean) => void;
  viewVendorServices: (id: string) => void;
  navigate: ReturnType<typeof useNavigate>;
}

export const VendorTable = ({
  loading,
  filteredVendors,
  toggleManagedStatus,
  updateVendorStatus,
  updateCommissionRate,
  deleteVendor,
  viewVendorServices,
  navigate
}: VendorTableProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState<any>(null);
  const [commissionRateInputs, setCommissionRateInputs] = useState<Record<string, number>>({});

  // Sync commission rate inputs with vendor data (convert decimal to percentage for display)
  useEffect(() => {
    const inputs: Record<string, number> = {};
    filteredVendors.forEach((vendor) => {
      const vendorId = vendor.parent_vendor_id || vendor.id;
      const backendValue = vendor.commissionRate ?? vendor.commission_rate ?? 0;
      // Convert decimal to percentage for display (0.15 → 15, 0.015 → 1.5)
      // If value is <= 1, it's decimal format, convert to percentage
      // If value > 1, it's already percentage format
      inputs[vendorId] = backendValue <= 1 ? backendValue * 100 : backendValue;
    });
    setCommissionRateInputs(inputs);
  }, [filteredVendors]);

  const handleToggleManagedStatus = (id: string) => {
    toggleManagedStatus(id);
  };

  const handleUpdateVendorStatus = (id: string, status: VendorStatus) => {
    updateVendorStatus(id, status);
  };

  const handleUpdateCommissionRate = (id: string, rate: number) => {
    updateCommissionRate(id, rate);
  };

  const handleViewVendorServices = (id: string) => {
    console.log("Navigating to vendor services with vendorId:", id);
    viewVendorServices(id);
  };

  const handleCreateService = (v: any) => {
    const realVendorId = v?.parent_vendor_id || v?.id;
    const brandPart = v?.is_ghost_brand ? `&brandId=${v.id}` : '';
    console.log("Navigating to create service with vendorId:", realVendorId, "brandId:", v?.is_ghost_brand ? v.id : null);
    navigate(`/admin/create-vendor-service?vendorId=${realVendorId}${brandPart}`);
  };

  const handleViewProfile = (vendorId: string) => {
    console.log("Navigating to vendor profile with vendorId:", vendorId);
    navigate(`/admin/vendors/${vendorId}`);
  };

  const handleViewCalendarAvailability = (v: any) => {
    const realVendorId = v?.parent_vendor_id || v?.id;
    const brandPart = v?.is_ghost_brand ? `&brandId=${v.id}` : '';
    navigate(`/admin/calendar-availbility?vendorId=${realVendorId}${brandPart}`);
  };

  const handleDeleteClick = (vendor: any) => {
    setVendorToDelete(vendor);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = (deleteServices: boolean) => {
    if (vendorToDelete) {
      deleteVendor(vendorToDelete.id, deleteServices);
      setVendorToDelete(null);
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Vendor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Email Verified</TableHead>
            <TableHead>Services</TableHead>
            <TableHead className="text-center">Managed Status</TableHead>
            <TableHead>Commission Rate</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-4 w-[200px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-8" />
                </TableCell>
                <TableCell className="text-center">
                  <Skeleton className="h-8 w-20 mx-auto" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-16" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-8 w-8 ml-auto" />
                </TableCell>
              </TableRow>
            ))
          ) : filteredVendors.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-10">
                No vendors found.
              </TableCell>
            </TableRow>
          ) : (
            filteredVendors.map((vendor) => (
              <TableRow key={vendor.id}>
                <TableCell className="font-medium">{vendor.company_name}</TableCell>
                <TableCell>
                  <Badge variant={vendor.status === 'active' ? 'secondary' : 'outline'}>
                    {vendor.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {vendor.is_verified ? (
                    <Badge variant="default" className="bg-green-500 hover:bg-green-600 flex items-center gap-1 w-fit">
                      <CheckCircle2 className="h-3 w-3" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                      <XCircle className="h-3 w-3" />
                      Unverified
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-semibold">
                    {vendor.servicesCount || 0}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleManagedStatus(vendor.parent_vendor_id || vendor.id)}
                  >
                    {vendor.is_managed ? "Managed" : "Unmanaged"}
                  </Button>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={commissionRateInputs[vendor.parent_vendor_id || vendor.id] ?? 
                        (() => {
                          // Convert backend decimal to percentage for display
                          const backendValue = vendor.commissionRate ?? vendor.commission_rate;
                          if (backendValue == null) return 0;
                          // If value is <= 1, it's decimal format, convert to percentage
                          // If value > 1, it's already percentage format
                          return backendValue <= 1 ? backendValue * 100 : backendValue;
                        })()}
                      onChange={(e) => {
                        const vendorId = vendor.parent_vendor_id || vendor.id;
                        const value = parseFloat(e.target.value) || 0;
                        setCommissionRateInputs(prev => ({
                          ...prev,
                          [vendorId]: value
                        }));
                      }}
                      onBlur={(e) => {
                        const vendorId = vendor.parent_vendor_id || vendor.id;
                        const value = parseFloat(e.target.value) || 0;
                        // Get current percentage value for comparison
                        const backendValue = vendor.commissionRate ?? vendor.commission_rate ?? 0;
                        const currentPercentage = backendValue <= 1 ? backendValue * 100 : backendValue;
                        
                        if (value !== currentPercentage && !isNaN(value) && value >= 0 && value <= 100) {
                          // Send percentage value directly (e.g., 15 for 15%, 1.5 for 1.5%)
                          handleUpdateCommissionRate(vendorId, value);
                        } else {
                          // Reset to original value if invalid
                          setCommissionRateInputs(prev => ({
                            ...prev,
                            [vendorId]: currentPercentage
                          }));
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.currentTarget.blur();
                        }
                      }}
                      className="w-20 border rounded px-2 py-1 text-sm"
                      placeholder="0.00"
                    />
                    <span className="text-sm text-gray-500">%</span>
                  
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewProfile(vendor.parent_vendor_id || vendor.id)}>
                        View Complete Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleViewVendorServices(vendor.parent_vendor_id || vendor.id)}>
                        View Services
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleCreateService(vendor)}>
                        Create Service
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleViewCalendarAvailability(vendor)}>
                        Calendar & Availbility
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleUpdateVendorStatus(vendor.parent_vendor_id || vendor.id, 'approved')}>
                        Approve Vendor
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUpdateVendorStatus(vendor.parent_vendor_id || vendor.id, 'rejected')}>
                        Reject Vendor
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDeleteClick({ ...vendor, id: vendor.parent_vendor_id || vendor.id })}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Vendor
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {vendorToDelete && (
        <VendorDeleteDialog
          isOpen={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={handleDeleteConfirm}
          vendorName={vendorToDelete.company_name}
          serviceCount={vendorToDelete.service_count || 0}
        />
      )}
    </>
  );
};
