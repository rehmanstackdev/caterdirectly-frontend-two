
// No React import needed
import { Menu, LogIn, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationsPopover } from "@/components/notifications/NotificationsPopover";
import ProfileAvatarWithDropdown from "@/components/profile/ProfileAvatarWithDropdown";
import { UserRole } from "@/components/dashboard/AuthAwareDashboardNav";
import { useAuth } from "@/contexts/auth";
import { useNavigate, useLocation } from "react-router-dom";

interface DashboardHeaderProps {
  isMobile: boolean;
  setSidebarOpen: (open: boolean) => void;
  title: string;
  userRole: UserRole;
  onLogout: () => void;
}

const DashboardHeader = ({ 
  isMobile, 
  setSidebarOpen, 
  title, 
  userRole,
  onLogout
}: DashboardHeaderProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Hide back button on main dashboard pages
  const showBackButton = !['/host/dashboard', '/admin/dashboard'].includes(location.pathname);
  const hideMobileAdminHeaderTitle = isMobile && (userRole === "admin" || userRole === "super-admin");
  
  return (
    <header className="bg-white border-b sticky top-0 z-30 shadow-sm">
      <div className="px-3 sm:px-4 md:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden text-[#F07712] hover:bg-[#F07712]/10 flex-shrink-0"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          {showBackButton && !hideMobileAdminHeaderTitle && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-[#F07712] hover:bg-[#F07712] hover:text-white flex-shrink-0"
              onClick={() => navigate(-1)}
              title="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          
          {!hideMobileAdminHeaderTitle && (
            <h1 className="md:hidden text-base sm:text-lg font-semibold text-gray-800 truncate">
              {title}
            </h1>
          )}
          
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {user ? (
            <>
              <NotificationsPopover />
              <ProfileAvatarWithDropdown 
                userRole={userRole} 
                onLogout={onLogout} 
                className="border-2 border-white shadow-sm" 
              />
            </>
          ) : (
            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/host/login")}
                className="text-[#F07712] hover:bg-[#F07712]/10 hidden sm:flex"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
              <Button
                size="sm"
                onClick={() => navigate(isMobile ? "/host/login" : "/host/register")}
                className="bg-[#F07712] hover:bg-[#E06600] text-white text-xs sm:text-sm px-3 sm:px-4"
              >
                {isMobile ? <LogIn className="h-4 w-4" /> : "Sign Up"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
