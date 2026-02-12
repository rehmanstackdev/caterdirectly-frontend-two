
import { 
  Users, Building2, ShoppingBag, DollarSign, 
  Activity, Server, AlertTriangle, CheckCircle
} from "lucide-react";
import { SystemPerformanceItem } from "../system-performance/SystemPerformanceCard";
import { RecentActivity } from "../recent-activities/RecentActivitiesTable";

export const platformStatsMockData = [
  {
    title: "Total Users",
    value: "12,583",
    change: "+15%",
    icon: Users,
    color: "bg-blue-100 text-blue-600"
  },
  {
    title: "Active Vendors",
    value: "328",
    change: "+8%",
    icon: Building2,
    color: "bg-amber-100 text-amber-600"
  },
  {
    title: "Total Bookings",
    value: "5,729",
    change: "+24%",
    icon: ShoppingBag,
    color: "bg-green-100 text-green-600"
  },
  {
    title: "Monthly Revenue",
    value: "$285,942",
    change: "+12%",
    icon: DollarSign,
    color: "bg-purple-100 text-purple-600"
  },
];

export const performanceStatsMockData: SystemPerformanceItem[] = [
  {
    title: "System Uptime",
    value: "99.98%",
    status: "healthy",
    icon: Server
  },
  {
    title: "API Response",
    value: "132ms",
    status: "healthy",
    icon: Activity
  },
  {
    title: "Error Rate",
    value: "0.03%",
    status: "healthy",
    icon: AlertTriangle
  },
  {
    title: "Payment Success",
    value: "99.7%",
    status: "healthy",
    icon: CheckCircle
  },
];

export const recentActivitiesMockData: RecentActivity[] = [
  {
    id: "1",
    action: "New vendor application",
    user: "Luxury Catering Co.",
    timestamp: "Today at 2:45 PM",
    status: "pending_approval"
  },
  {
    id: "2",
    action: "Service rejected",
    user: "Elite Events Staffing",
    timestamp: "Today at 1:30 PM",
    status: "rejected"
  },
  {
    id: "3",
    action: "Customer dispute opened",
    user: "Wedding Reception Booking #WR-2023-05",
    timestamp: "Today at 11:20 AM",
    status: "requires_attention"
  },
  {
    id: "4",
    action: "Payout processed",
    user: "Sunset Venues ($8,750.00)",
    timestamp: "Today at 10:15 AM",
    status: "completed"
  },
  {
    id: "5",
    action: "New support ticket",
    user: "Ticket #ST-2023-187",
    timestamp: "Yesterday at 5:15 PM",
    status: "open"
  }
];
