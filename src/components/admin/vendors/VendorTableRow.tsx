

import { CheckCircle, XCircle, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface Vendor {
  id: string;
  company_name: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'inactive';
  is_managed: boolean;
  commission_rate: number;
  date_joined: string;
  serviceCount: number;
}

interface VendorTableRowProps {
  vendor: Vendor;
  toggleManagedStatus: (vendorId: string) => void;
  updateVendorStatus: (vendorId: string, status: 'pending' | 'approved' | 'rejected' | 'active' | 'inactive') => void;
  updateCommissionRate: (vendorId: string, newRate: number) => void;
  viewVendorServices: (vendorId: string) => void;
  navigate: (path: string) => void;
}

export const VendorTableRow = ({
  vendor,
  toggleManagedStatus,
  updateVendorStatus,
  updateCommissionRate,
  viewVendorServices,
  navigate,
}: VendorTableRowProps) => {
  const getStatusBadge = (status: 'pending' | 'approved' | 'rejected' | 'active' | 'inactive') => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'active':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Inactive</Badge>;
    }
  };

  // Enhanced create service handler with better state management
  const handleCreateService = () => {
    console.log("Creating service for vendor:", vendor.id, vendor.company_name);
    
    // Store vendor info in session storage as fallback
    sessionStorage.setItem('selected_vendor_id', vendor.id);
    sessionStorage.setItem('selected_vendor_name', vendor.company_name);
    
    // Use consistent parameter naming
    const url = `/admin/create-vendor-service?vendorId=${vendor.id}`;
    console.log("Navigating to:", url);
    
    // Navigate to the create service page with the vendor ID
    navigate(url);
  };

  return (
    <TableRow key={vendor.id}>
      <TableCell className="font-medium">{vendor.company_name}</TableCell>
      <TableCell>{vendor.email}</TableCell>
      <TableCell>{getStatusBadge(vendor.status)}</TableCell>
      <TableCell className="text-center">
        {vendor.is_managed ? (
          <CheckCircle className="inline-block h-5 w-5 text-green-600" />
        ) : (
          <XCircle className="inline-block h-5 w-5 text-gray-300" />
        )}
      </TableCell>
      <TableCell>{vendor.commission_rate}%</TableCell>
      <TableCell>
        <Button 
          variant="ghost" 
          size="sm" 
          className="hover:bg-gray-100"
          onClick={() => viewVendorServices(vendor.id)}
        >
          {vendor.serviceCount} Services
        </Button>
      </TableCell>
      <TableCell>{new Date(vendor.date_joined).toLocaleDateString()}</TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              onClick={() => toggleManagedStatus(vendor.id)}
            >
              {vendor.is_managed ? "Remove Managed Status" : "Set as Managed"}
            </DropdownMenuItem>
            
            {vendor.status !== 'approved' && (
              <DropdownMenuItem 
                onClick={() => updateVendorStatus(vendor.id, 'approved')}
              >
                Approve Vendor
              </DropdownMenuItem>
            )}
            
            {vendor.status !== 'rejected' && (
              <DropdownMenuItem 
                onClick={() => updateVendorStatus(vendor.id, 'rejected')}
              >
                Reject Vendor
              </DropdownMenuItem>
            )}
            
            <DropdownMenuItem
              onClick={() => updateCommissionRate(vendor.id, 15)}
            >
              Update Commission Rate
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={handleCreateService}>
              Create Service
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => viewVendorServices(vendor.id)}>
              View Services
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};
