import { ReactNode, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/auth/useAuth";
import DashboardHeader from "./DashboardHeader";
import DashboardSidebar from "./DashboardSidebar";
import type { UserRole } from "./AuthAwareDashboardNav";

interface DashboardProps {
  children: ReactNode;
  activeTab?: string;
  userRole: UserRole;
}

const Dashboard = ({ children, activeTab, userRole }: DashboardProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { signOut } = useAuth();

  // Determine active tab based on current path
  const getCurrentTab = () => {
    const path = location.pathname;
    const searchParams = new URLSearchParams(location.search);

    // Enhanced invoice mode detection with sessionStorage fallback
    const isInvoiceMode =
      searchParams.get("mode") === "invoice" ||
      (typeof window !== "undefined" &&
        sessionStorage.getItem("invoiceData") !== null);

    if (userRole === "vendor") {
      if (path.includes("/vendor/dashboard")) return "dashboard";
      if (path.includes("/vendor/marketplace")) return "marketplace";
      if (path.includes("/vendor/services")) return "services";
      if (path.includes("/vendor/orders")) return "orders";
      if (path.includes("/vendor/booking")) return "orders";
      if (path.includes("/vendor/invoices")) return "invoices";
      if (path.includes("/vendor/calendar")) return "calendar";
      if (path.includes("/vendor/messages")) return "messages";
      if (path.includes("/vendor/settings")) return "settings";
      if (path.includes("/order-summary") && isInvoiceMode) return "invoices";
      if (path.includes("/order-summary")) return "orders";
    } else if (userRole === "admin" || userRole === "super-admin") {
      if (path.includes("/admin/dashboard")) return "dashboard";
      if (path.includes("/admin/marketplace")) return "marketplace";
      if (path.includes("/admin/invoices")) return "invoices";
      if (path.includes("/admin/users")) return "users";
      if (path.includes("/admin/vendors")) return "vendors";
      if (path.includes("/admin/services")) return "services";
      if (path.includes("/admin/pending-services")) return "services";
      if (path.includes("/admin/orders")) return "orders";
      if (path.includes("/admin/messaging")) return "messaging";
      if (path.includes("/admin/finances")) return "finances";
      if (path.includes("/admin/reports")) return "reports";
      if (path.includes("/admin/support")) return "support";
      if (path.includes("/admin/config")) return "config";
      if (path.includes("/admin/security")) return "security";
      if (path.includes("/admin/profile")) return "profile";
      if (path.includes("/order-summary") && isInvoiceMode) return "invoices";
      if (path.includes("/order-summary")) return "orders";
      if (path.includes("/admin/hosts")) return "hosts";
    }

    return activeTab || "dashboard";
  };

  const currentTab = getCurrentTab();

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  const handleLogout = async () => {
    try {
      await signOut();
      // No need for navigate - useSignOut handles it with window.location
    } catch (error) {
      console.error("Error signing out:", error);
      // Force navigation on error
      window.location.href = "/host/login";
    }
  };

  const getPageTitle = () => {
    if (userRole === "vendor") {
      switch (currentTab) {
        case "dashboard":
          return "Dashboard";
        case "marketplace":
          return "Marketplace";
        case "services":
          return "My Services";
        case "orders":
          return "Orders & Bookings";
        case "invoices":
          return "My Invoices";
        case "calendar":
          return "Calendar";
        case "messages":
          return "Messages";
        case "settings":
          return "Account Settings";
        default:
          return "Dashboard";
      }
    } else if (userRole === "admin" || userRole === "super-admin") {
      switch (currentTab) {
        case "dashboard":
          return "Admin Dashboard";
        case "marketplace":
          return "Marketplace";
        case "invoices":
          return "Invoice Management";
        case "users":
          return "User Management";
        case "vendors":
          return "Vendor Management";
        case "Hosts Management":
          return "";
        case "services":
          return "Service Management";
        case "pending-services":
          return "Pending Services";
        case "orders":
          return "Order Management";
        case "messaging":
          return "Messages";
        case "finances":
          return "Financial Management";
        case "reports":
          return "Reports & Analytics";
        case "support":
          return "Support Tools";
        case "config":
          return "System Configuration";
        case "security":
          return "Security Settings";
        case "profile":
          return "Admin Profile";
        default:
          return "Admin Dashboard";
      }
    } else {
      return currentTab === "dashboard"
        ? "Dashboard"
        : currentTab === "vendors"
          ? "Vendors"
          : currentTab === "orders"
            ? "Orders"
            : currentTab === "reviews"
              ? "Your Reviews"
              : currentTab === "analytics"
                ? "Orders & Reviews"
                : currentTab === "guests"
                  ? "Guest Database"
                  : currentTab === "earnings"
                    ? "Earnings"
                    : currentTab === "support"
                      ? "Support & Messaging"
                      : "Dashboard";
    }
  };

  return (
    <div className="min-h-screen bg-white flex overflow-x-hidden">
      <DashboardSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeTab={currentTab}
        userRole={userRole}
        onLogout={handleLogout}
      />

      <div className="flex-1 md:ml-64 w-full min-w-0 overflow-x-hidden">
        <DashboardHeader
          isMobile={isMobile}
          setSidebarOpen={setSidebarOpen}
          title={getPageTitle()}
          userRole={userRole}
          onLogout={handleLogout}
        />

        <main className="p-3 sm:p-4 md:p-6 lg:p-8 w-full max-w-full box-border overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
