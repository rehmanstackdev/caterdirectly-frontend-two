import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
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
  Star,
} from "lucide-react";
import { useAdminPermissions } from "@/hooks/use-admin-permissions";

export type UserRole = "vendor" | "event-host" | "admin" | "super-admin";

interface DashboardNavProps {
  activeTab: string;
  userRole: UserRole;
  onLogout: () => void;
  className?: string;
}

export function DashboardNav({
  activeTab,
  userRole,
  onLogout,
  className,
}: DashboardNavProps) {
  const { hasPageAccess } = useAdminPermissions();

  const vendorLinks = [
    {
      name: "Dashboard",
      id: "dashboard",
      href: "/vendor/dashboard",
      icon: <Home className="h-5 w-5" />,
    },
    {
      name: "Services",
      id: "services",
      href: "/vendor/services",
      icon: <Store className="h-5 w-5" />,
    },
    {
      name: "Orders",
      id: "orders",
      href: "/vendor/orders",
      icon: <ShieldCheck className="h-5 w-5" />,
    },
    {
      name: "Invoices",
      id: "invoices",
      href: "/vendor/invoices",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      name: "Calendar",
      id: "calendar",
      href: "/vendor/calendar",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      name: "Messages",
      id: "messaging",
      href: "/vendor/messages",
      icon: <MessageCircle className="h-5 w-5" />,
    },
    {
      name: "Settings",
      id: "settings",
      href: "/vendor/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  const eventHostLinks = [
    {
      name: "Dashboard",
      id: "dashboard",
      href: "/host/dashboard",
      icon: <Home className="h-5 w-5" />,
    },
    {
      name: "Marketplace",
      id: "vendors",
      href: "/marketplace",
      icon: <Store className="h-5 w-5" />,
    },
    {
      name: "Orders",
      id: "orders",
      href: "/host/orders",
      icon: <ShieldCheck className="h-5 w-5" />,
    },
    {
      name: "Reviews",
      id: "reviews",
      href: "/host/reviews",
      icon: <Star className="h-5 w-5" />,
    },
    {
      name: "Guest List",
      id: "guests",
      href: "/host/guests",
      icon: <Users className="h-5 w-5" />,
    },
    {
      name: "Earnings",
      id: "earnings",
      href: "/host/earnings",
      icon: <Wallet className="h-5 w-5" />,
    },
    {
      name: "Support",
      id: "support",
      href: "/host/support",
      icon: <MessageCircle className="h-5 w-5" />,
    },
    {
      name: "Settings",
      id: "settings",
      href: "/host/EventhostAccountinfo",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  const adminLinks = [
    {
      name: "Dashboard",
      id: "dashboard",
      href: "/admin/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      pageId: "dashboard",
    },
    {
      name: "Invoices",
      id: "invoices",
      href: "/admin/invoices",
      icon: <FileText className="h-5 w-5" />,
      pageId: "invoices",
    },
    {
      name: "Services",
      id: "services",
      href: "/admin/services",
      icon: <Store className="h-5 w-5" />,
      pageId: "services",
    },
    {
      name: "Vendors",
      id: "vendors",
      href: "/admin/vendors",
      icon: <Users className="h-5 w-5" />,
      pageId: "vendors",
    },
    {
      name: "Users",
      id: "users",
      href: "/admin/users",
      icon: <Users className="h-5 w-5" />,
      pageId: "users",
    },
    {
      name: "Orders",
      id: "orders",
      href: "/admin/orders",
      icon: <ShieldCheck className="h-5 w-5" />,
      pageId: "orders",
    },
    {
      name: "Finances",
      id: "finances",
      href: "/admin/finances",
      icon: <DollarSign className="h-5 w-5" />,
      pageId: "finances",
    },
    // { name: "Content", id: "content", href: "/admin/content", icon: <PieChart className="h-5 w-5" />, pageId: "content" },
    {
      name: "Reports",
      id: "reports",
      href: "/admin/reports",
      icon: <BarChart3 className="h-5 w-5" />,
      pageId: "reports",
    },
    {
      name: "Support",
      id: "support",
      href: "/admin/support",
      icon: <MessageCircle className="h-5 w-5" />,
      pageId: "support",
    },
    {
      name: "Settings",
      id: "config",
      href: "/admin/config",
      icon: <Settings className="h-5 w-5" />,
      pageId: "config",
    },
    {
      name: "Security",
      id: "security",
      href: "/admin/security",
      icon: <Lock className="h-5 w-5" />,
      pageId: "security",
    },
  ];

  const links =
    userRole === "vendor"
      ? vendorLinks
      : userRole === "admin" || userRole === "super-admin"
        ? adminLinks.filter((link) => hasPageAccess(link.pageId))
        : eventHostLinks;

  return (
    <nav className={cn("flex flex-col space-y-1", className)}>
      {links.map((link) => (
        <NavLink
          key={link.href}
          to={link.href}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-100 transition-all duration-200",
              {
                "bg-[#F07712] text-white": isActive,
                "text-gray-600": !isActive,
              },
            )
          }
        >
          {link.icon}
          <span className="text-sm font-medium">{link.name}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export default DashboardNav;
