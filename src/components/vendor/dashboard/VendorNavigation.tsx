
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Calendar, 
  Users, 
  FileText, 
  BarChart3, 
  Settings,
  MessageSquare,
  User,
  HeadphonesIcon
} from 'lucide-react';

interface VendorNavigationProps {
  activeTab: string;
}

const navigationItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/vendor/dashboard'
  },
  {
    id: 'services',
    label: 'My Services',
    icon: Package,
    href: '/vendor/services'
  },
  {
    id: 'orders',
    label: 'Orders',
    icon: ShoppingCart,
    href: '/vendor/orders'
  },
  {
    id: 'messages',
    label: 'Messages',
    icon: MessageSquare,
    href: '/vendor/messages'
  },
  {
    id: 'calendar',
    label: 'Calendar',
    icon: Calendar,
    href: '/vendor/calendar'
  },
  {
    id: 'team',
    label: 'Team',
    icon: Users,
    href: '/vendor/team'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    href: '/vendor/analytics'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    href: '/vendor/settings'
  }
];

const VendorNavigation: React.FC<VendorNavigationProps> = ({ activeTab }) => {
  return (
    <nav className="space-y-1">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        
        return (
          <Link
            key={item.id}
            to={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive 
                ? 'bg-[#F07712] text-white' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default VendorNavigation;
