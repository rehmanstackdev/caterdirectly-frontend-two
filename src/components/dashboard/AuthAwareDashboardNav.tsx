
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth";
import { useAdminPermissions } from "@/hooks/use-admin-permissions";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  Calendar,
  BarChart3,
  Store,
  MessageCircle,
  Settings,
  Home,
  Users,
  PieChart,
  Wallet,
  FileText,
  Lock,
  LayoutDashboard,
  DollarSign,
  LogIn,
  Mail
} from "lucide-react";

export type UserRole = "vendor" | "event-host" | "admin" | "super-admin";

interface AuthAwareDashboardNavProps {
  activeTab: string;
  userRole: UserRole;
  onLogout: () => void;
  className?: string;
  onNavigate?: () => void;
}

export function AuthAwareDashboardNav({ activeTab, userRole, onLogout, className, onNavigate }: AuthAwareDashboardNavProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const searchParams = new URLSearchParams(location.search);
  const isInvoiceMode = searchParams.get('mode') === 'invoice';
  const { hasPageAccess, loading: permissionsLoading, pagePermissions } = useAdminPermissions();

  const handleProtectedNavigation = (href: string, event: React.MouseEvent) => {
    // Allow marketplace access for everyone
    if (href === "/marketplace") {
      onNavigate?.();
      return;
    }
    
    // For other routes, check authentication
    if (!user) {
      event.preventDefault();
      navigate("/host/login", { state: { from: href } });
    } else {
      onNavigate?.();
    }
  };

  const vendorLinks = [
    { name: "Dashboard", id: "dashboard", href: "/vendor/dashboard", icon: <Home className="h-5 w-5" />, protected: true },
    { name: "Services", id: "services", href: "/vendor/services", icon: <Store className="h-5 w-5" />, protected: true },
    { name: "Orders", id: "orders", href: "/vendor/orders", icon: <ShieldCheck className="h-5 w-5" />, protected: true },
    { name: "Invoices", id: "invoices", href: "/vendor/invoices", icon: <FileText className="h-5 w-5" />, protected: true },
    { name: "Calendar", id: "calendar", href: "/vendor/calendar", icon: <Calendar className="h-5 w-5" />, protected: true },
    { name: "Messages", id: "messaging", href: "/vendor/messages", icon: <MessageCircle className="h-5 w-5" />, protected: true },
    { name: "Settings", id: "settings", href: "/vendor/settings", icon: <Settings className="h-5 w-5" />, protected: true },
  ];

  const eventHostLinks = [
    { name: "Dashboard", id: "dashboard", href: "/host/dashboard", icon: <Home className="h-5 w-5" />, protected: true },
    { name: "Marketplace", id: "vendors", href: "/marketplace", icon: <Store className="h-5 w-5" />, protected: false },
    { name: "Orders & Reviews", id: "analytics", href: "/host/analytics?section=orders", icon: <BarChart3 className="h-5 w-5" />, protected: true },
    { name: "Guest List", id: "guests", href: "/host/guests", icon: <Users className="h-5 w-5" />, protected: true },
    { name: "Earnings", id: "earnings", href: "/host/earnings", icon: <Wallet className="h-5 w-5" />, protected: true },
    { name: "Support", id: "support", href: "/host/support", icon: <MessageCircle className="h-5 w-5" />, protected: true },
  ];

  const adminLinks = [
    { name: "Dashboard", id: "dashboard", href: "/admin/dashboard", icon: <LayoutDashboard className="h-5 w-5" />, protected: true, pageId: "dashboard" },
    { name: "Invoices", id: "invoices", href: "/admin/invoices", icon: <FileText className="h-5 w-5" />, protected: true, pageId: "invoices" },
    { name: "Services", id: "services", href: "/admin/services", icon: <Store className="h-5 w-5" />, protected: true, pageId: "services" },
    { name: "Vendors", id: "vendors", href: "/admin/vendors", icon: <Users className="h-5 w-5" />, protected: true, pageId: "vendors" },
    { name: "Leads", id: "leads", href: "/admin/leads", icon: <Users className="h-5 w-5" />, protected: true, pageId: "leads" }, // Map leads to proposals permission
    { name: "Waitlist", id: "waitlist", href: "/admin/waitlist", icon: <Mail className="h-5 w-5" />, protected: true, pageId: "waitlist" },
    { name: "Users", id: "users", href: "/admin/users", icon: <Users className="h-5 w-5" />, protected: true, pageId: "users" },
    { name: "Orders", id: "orders", href: "/admin/orders", icon: <ShieldCheck className="h-5 w-5" />, protected: true, pageId: "orders" },
    { name: "Messages", id: "messaging", href: "/admin/messaging", icon: <MessageCircle className="h-5 w-5" />, protected: true, pageId: "proposals" }, // Map messages to proposals permission
    { name: "Finances", id: "finances", href: "/admin/finances", icon: <DollarSign className="h-5 w-5" />, protected: true, pageId: "finances" },
    { name: "Reports", id: "reports", href: "/admin/reports", icon: <BarChart3 className="h-5 w-5" />, protected: true, pageId: "reports" },
    { name: "Support", id: "support", href: "/admin/support", icon: <MessageCircle className="h-5 w-5" />, protected: true, pageId: "support" },
    { name: "Settings", id: "config", href: "/admin/config", icon: <Settings className="h-5 w-5" />, protected: true, pageId: "config" },
    { name: "Security", id: "security", href: "/admin/security", icon: <Lock className="h-5 w-5" />, protected: true, pageId: "security" },
  ];
  
  // Filter admin links based on permissions - memoized to prevent infinite loops
  const filteredAdminLinks = useMemo(() => {
    if (userRole === "admin" && !permissionsLoading) {
      return adminLinks.filter(link => {
        // If pageId is null, always show (for tabs not in API permissions like invoices, waitlist)
        if (link.pageId === null) return true;
        // Check permission for this page using pagePermissions directly
        return pagePermissions[link.pageId] || false;
      });
    }
    // For super-admin, show all links
    return adminLinks;
  }, [userRole, permissionsLoading, pagePermissions]);
  
  const links = useMemo(() => {
    if (userRole === "vendor") {
      return vendorLinks;
    } else if (userRole === "admin" || userRole === "super-admin") {
      return filteredAdminLinks;
    } else {
      return eventHostLinks;
    }
  }, [userRole, filteredAdminLinks]);
  
  return (
    <div className={cn("flex flex-col space-y-1", className)}>
      <nav className="flex flex-col space-y-1">
        {links.map((link) => {
          const isDisabled = link.protected && !user;
          const routeMatchesAny = links.some((l) => pathname.startsWith((l.href || '').split('?')[0]));
          const marketplaceFallback = /^\/(order|booking)/.test(pathname);
          const invoiceFallback = pathname === "/order-summary" && isInvoiceMode;
          const isFallbackActive = !routeMatchesAny && link.href === "/marketplace" && marketplaceFallback;
          const isInvoiceFallbackActive = !routeMatchesAny && link.id === "invoices" && invoiceFallback && (userRole === "admin" || userRole === "super-admin" || userRole === "vendor");
          
          return (
            <NavLink
              key={link.href}
              to={link.href}
              onClick={(e) => handleProtectedNavigation(link.href, e)}
              className={({ isActive }) => cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-200 active:scale-[0.98]",
                {
                  "bg-[#F07712] text-white shadow-sm": (isActive || isFallbackActive || isInvoiceFallbackActive) && !isDisabled,
                  "text-gray-700 hover:bg-gray-100 active:bg-gray-200": !(isActive || isFallbackActive || isInvoiceFallbackActive) && !isDisabled,
                  "text-gray-400 cursor-not-allowed": isDisabled,
                }
              )}
            >
              <span className="flex-shrink-0">{link.icon}</span>
              <span className="text-sm font-medium flex-1 truncate">{link.name}</span>
              {isDisabled && (
                <Lock className="h-3 w-3 text-gray-400 flex-shrink-0" />
              )}
            </NavLink>
          );
        })}
      </nav>
      
      {!user && (
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
          <Button
            onClick={() => {
              navigate("/host/login");
              onNavigate?.();
            }}
            className="w-full flex items-center justify-center gap-2 bg-[#F07712] hover:bg-[#E06600] text-white h-11"
          >
            <LogIn className="h-4 w-4" />
            Sign In
          </Button>
          <Button
            onClick={() => {
              navigate("/host/register");
              onNavigate?.();
            }}
            variant="outline"
            className="w-full flex items-center justify-center gap-2 h-11"
          >
            Create Account
          </Button>
        </div>
      )}
    </div>
  );
}

export default AuthAwareDashboardNav;