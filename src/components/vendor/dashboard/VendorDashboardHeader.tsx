
import React from 'react';
import { Menu, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import { NotificationsPopover } from '@/components/notifications/NotificationsPopover';
import ProfileAvatarWithDropdown from '@/components/profile/ProfileAvatarWithDropdown';

interface VendorDashboardHeaderProps {
  isMobile: boolean;
  setSidebarOpen: (open: boolean) => void;
  currentTab: string;
}

const getPageTitle = (tab: string) => {
  switch (tab) {
    case 'dashboard': return 'Dashboard';
    case 'services': return 'My Services';
    case 'orders': return 'Orders & Bookings';
    case 'calendar': return 'Calendar';
    case 'team': return 'Team Management';
    case 'proposals': return 'Proposals';
    case 'analytics': return 'Analytics';
    case 'settings': return 'Account Settings';
    default: return 'Dashboard';
  }
};

const VendorDashboardHeader: React.FC<VendorDashboardHeaderProps> = ({
  isMobile,
  setSidebarOpen,
  currentTab
}) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleLogout = async () => {
    await signOut();
  };
  
  // Hide back button on the main dashboard page
  const showBackButton = location.pathname !== '/vendor/dashboard';

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
      <div className="px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden text-[#F07712]"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          {showBackButton && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-[#F07712] hover:bg-[#F07712] hover:text-white"
              onClick={() => navigate(-1)}
              title="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          
          <div className="hidden md:block">
            <h1 className="text-xl font-semibold text-gray-900">
              {getPageTitle(currentTab)}
            </h1>
          </div>
          
          <div className="md:hidden text-lg font-semibold text-gray-900">
            {getPageTitle(currentTab)}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <NotificationsPopover />
          <ProfileAvatarWithDropdown 
            userRole="vendor" 
            onLogout={handleLogout} 
            className="border-2 border-white shadow-sm" 
          />
        </div>
      </div>
    </header>
  );
};

export default VendorDashboardHeader;
