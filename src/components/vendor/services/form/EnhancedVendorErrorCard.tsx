
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth';
import { AlertCircle, User, UserX } from 'lucide-react';

interface EnhancedVendorErrorCardProps {
  hasVendorAccess?: boolean;
  error?: string | null;
}

const EnhancedVendorErrorCard: React.FC<EnhancedVendorErrorCardProps> = ({
  hasVendorAccess,
  error
}) => {
  const { userRole } = useAuth();
  
  // Determine the appropriate message and actions based on user context
  const getErrorContent = () => {
    if (error) {
      return {
        title: "Vendor Account Issue",
        description: error,
        icon: <AlertCircle className="h-6 w-6 text-red-600" />,
        actions: (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/vendor/profile'}
            >
              Check Profile
            </Button>
            <Button 
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        )
      };
    }
    
    if (userRole === 'vendor') {
      return {
        title: "Vendor Account Not Found",
        description: "Your user account doesn't appear to be linked to a vendor profile. Please contact support to resolve this issue.",
        icon: <UserX className="h-6 w-6 text-red-600" />,
        actions: (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/vendor/profile'}
            >
              View Profile
            </Button>
            <Button 
              onClick={() => window.location.href = '/vendor/support'}
            >
              Contact Support
            </Button>
          </div>
        )
      };
    }
    
    if (userRole === 'admin' || userRole === 'super-admin') {
      return {
        title: "Select Vendor",
        description: "As an admin, you need to specify which vendor you're creating a service for. Please select a vendor from the vendor management page.",
        icon: <User className="h-6 w-6 text-blue-600" />,
        actions: (
          <div className="flex gap-2">
            <Button 
              onClick={() => window.location.href = '/admin/vendors'}
            >
              Select Vendor
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/admin/services'}
            >
              Back to Services
            </Button>
          </div>
        )
      };
    }
    
    // Default case for users without vendor access
    return {
      title: "Access Denied",
      description: "You don't have permission to create services. Only vendor accounts can create services.",
      icon: <UserX className="h-6 w-6 text-red-600" />,
      actions: (
        <div className="flex gap-2">
          <Button 
            onClick={() => window.location.href = '/marketplace'}
          >
            Browse Services
          </Button>
          <Button 
            variant="outline"
            onClick={() => window.location.href = '/vendor/application'}
          >
            Become a Vendor
          </Button>
        </div>
      )
    };
  };
  
  const { title, description, icon, actions } = getErrorContent();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-red-50 border border-red-200 rounded-md p-4 my-4">
          <p className="text-red-700">{description}</p>
        </div>
        <div className="mt-4">
          {actions}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedVendorErrorCard;
