
// No React import needed
import { Link } from "react-router-dom";
import { LogOut, X } from "lucide-react";
import AuthAwareDashboardNav from "./AuthAwareDashboardNav";
import type { UserRole } from "./AuthAwareDashboardNav";
import { APP_LOGO } from "@/constants/app-assets";
import { useAuth } from "@/contexts/auth";
import { useEffect, useRef } from "react";

interface DashboardSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  activeTab: string;
  userRole: UserRole;
  onLogout: () => void;
}

const DashboardSidebar = ({
  sidebarOpen,
  setSidebarOpen,
  activeTab,
  userRole,
  onLogout
}: DashboardSidebarProps) => {
  const { user } = useAuth();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isRestoringRef = useRef(false);
  const SCROLL_POSITION_KEY = `sidebar-scroll-${userRole}`;
  
  // Save scroll position to sessionStorage
  const handleScroll = () => {
    if (scrollContainerRef.current && !isRestoringRef.current) {
      sessionStorage.setItem(SCROLL_POSITION_KEY, scrollContainerRef.current.scrollTop.toString());
    }
  };
  
  // Restore scroll position on mount only
  useEffect(() => {
    const savedPosition = sessionStorage.getItem(SCROLL_POSITION_KEY);
    if (scrollContainerRef.current && savedPosition) {
      isRestoringRef.current = true;
      const position = parseInt(savedPosition, 10);
      // Restore immediately without animation to prevent jitter
      scrollContainerRef.current.scrollTop = position;
      // Reset flag after a short delay
      setTimeout(() => {
        isRestoringRef.current = false;
      }, 100);
    }
  }, []); // Only run on mount
  
  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen]);
  
  return (
    <>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 w-72 sm:w-80 md:w-64 h-full bg-white border-r z-50 transition-transform duration-300 ease-in-out md:translate-x-0 shadow-2xl md:shadow-none ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header with logo and close button */}
          <div className="flex items-center justify-between p-4 md:p-6 border-b md:border-b-0">
            <Link 
              to="/" 
              className="block flex-1"
              onClick={() => setSidebarOpen(false)}
            >
              <img
                src={APP_LOGO.url}
                alt={APP_LOGO.alt}
                className={APP_LOGO.className.dashboard}
              />
            </Link>
            
            {/* Close button for mobile */}
            <button 
              className="md:hidden text-gray-500 hover:text-gray-700 p-2 -mr-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation - scrollable on mobile */}
          <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto overflow-x-hidden px-4 md:px-6 py-4"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(203, 213, 225, 0.6) transparent'
            }}
          >
            <style>{`
              .flex-1.overflow-y-auto::-webkit-scrollbar {
                width: 6px;
              }
              .flex-1.overflow-y-auto::-webkit-scrollbar-track {
                background: transparent;
                margin: 4px 0;
              }
              .flex-1.overflow-y-auto::-webkit-scrollbar-thumb {
                background: rgba(203, 213, 225, 0.6);
                border-radius: 10px;
                border: 2px solid transparent;
                background-clip: padding-box;
              }
              .flex-1.overflow-y-auto::-webkit-scrollbar-thumb:hover {
                background: rgba(148, 163, 184, 0.8);
                background-clip: padding-box;
              }
            `}</style>
            <AuthAwareDashboardNav 
              userRole={userRole} 
              activeTab={activeTab} 
              onLogout={onLogout}
              onNavigate={() => setSidebarOpen(false)}
            />
          </div>

          {/* User Controls - Only show logout if user is authenticated */}
          {user && (
            <div className="border-t border-[#E1E5F3] p-4 md:p-6">
              <button
                onClick={() => {
                  onLogout();
                  setSidebarOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-3 text-[#817F9B] w-full hover:bg-gray-100 rounded-lg transition-colors active:bg-gray-200"
              >
                <LogOut className="h-5 w-5" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DashboardSidebar;
