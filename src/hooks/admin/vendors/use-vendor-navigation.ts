
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

export function useVendorNavigation() {
  const navigate = useNavigate();

  // Create new vendor with separate user account
  const createNewVendor = () => {
    navigate('/vendor/application?adminCreate=true');
    
    toast({
      title: "Creating Vendor Account",
      description: "Fill out the form to create a vendor with their own login credentials."
    });
  };

  // View vendor services with consistent parameter naming
  const viewVendorServices = (vendorId: string) => {
    console.log("Navigating to services page with vendorId:", vendorId);
    
    // Clear any previous vendor validation status
    sessionStorage.removeItem('vendor_validation_complete');
    
    // Store in session storage as fallback
    sessionStorage.setItem('selected_vendor_id', vendorId);
    
    navigate(`/admin/services?vendorId=${vendorId}`);
  };
  
  // View vendor profile
  const viewVendorProfile = (vendorId: string) => {
    console.log("Navigating to vendor profile with vendorId:", vendorId);
    navigate(`/admin/vendor-profile/${vendorId}`);
  };
  
  // Enhanced navigation function that ensures consistent parameter passing
  const navigateWithVendor = (path: string, vendorId: string) => {
    console.log(`Navigation with vendor: path=${path}, vendorId=${vendorId}`);
    
    // Clear any previous vendor validation status
    sessionStorage.removeItem('vendor_validation_complete');
    
    // Store in session storage as fallback
    sessionStorage.setItem('selected_vendor_id', vendorId);
    
    // Ensure the vendorId parameter is always included
    const hasQueryParams = path.includes('?');
    const separator = hasQueryParams ? '&' : '?';
    const finalPath = `${path}${separator}vendorId=${vendorId}`;
    
    console.log("Final navigation path:", finalPath);
    navigate(finalPath);
  };

  return {
    createNewVendor,
    viewVendorServices,
    viewVendorProfile,
    navigateWithVendor,
    navigate
  };
}
