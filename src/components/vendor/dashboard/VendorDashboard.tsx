
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/auth';
import { APP_LOGO } from '@/constants/app-assets';
import VendorNavigation from './VendorNavigation';
import VendorDashboardHeader from './VendorDashboardHeader';

interface VendorDashboardProps {
  children: React.ReactNode;
  activeTab?: string;
}

const VendorDashboard: React.FC<VendorDashboardProps> = ({ children, activeTab }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();
  const { signOut } = useAuth();

  // Determine active tab based on current path
  const getCurrentTab = () => {
    const path = location.pathname;
    if (path.includes("/vendor/dashboard")) return "dashboard";
    if (path.includes("/vendor/services")) return "services";
    if (path.includes("/vendor/orders")) return "orders";
    if (path.includes("/vendor/calendar")) return "calendar";
    if (path.includes("/vendor/team")) return "team";
    if (path.includes("/vendor/proposals")) return "proposals";
    if (path.includes("/vendor/analytics")) return "analytics";
    if (path.includes("/vendor/settings")) return "settings";
    if (path.includes("/vendor/messages") || path.includes("/vendor/messaging")) return "messages";
    return activeTab || "dashboard";
  };

  const currentTab = getCurrentTab();

  React.useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-x-hidden">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 w-64 h-full bg-white border-r border-gray-200 z-50 transition-transform duration-300 md:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6 flex flex-col h-full">
          {/* Close button for mobile */}
          <button 
            className="absolute top-4 right-4 md:hidden text-gray-500"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Logo Section */}
          <div className="mb-8">
            <Link to="/" className="block">
              <img
                src={APP_LOGO.url}
                alt={APP_LOGO.alt}
                className={APP_LOGO.className.dashboard}
              />
            </Link>
            <div className="mt-2 text-sm text-gray-600">Vendor Portal</div>
          </div>

          {/* Navigation */}
          <div className="flex-1">
            <VendorNavigation activeTab={currentTab} />
          </div>

          {/* Logout */}
          <div className="border-t border-gray-200 pt-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2 text-gray-600 w-full hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 md:ml-64 w-full min-w-0 overflow-x-hidden">
        <VendorDashboardHeader
          isMobile={isMobile}
          setSidebarOpen={setSidebarOpen}
          currentTab={currentTab}
        />
        
        <main className="p-4 md:p-6 w-full max-w-full box-border overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default VendorDashboard;
