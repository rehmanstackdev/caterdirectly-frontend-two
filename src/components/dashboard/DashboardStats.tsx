
import { useState } from "react";
import { ShoppingBag, Star, Shield, ArrowRight } from "lucide-react";
import StatsTimeFilter from "./stats/StatsTimeFilter";
import StatCard from "./stats/StatCard";
import OrderList from "./stats/OrderList";
import { useOrders } from "@/hooks/use-orders";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const DashboardStats = () => {
  const [timeFilter, setTimeFilter] = useState<string>("Last 30 Days");
  const navigate = useNavigate();
  
  const timeFilters = [
    "Last 7 Days",
    "Last 30 Days",
    "Last 3 Months",
    "Last 6 Months",
    "Last Year"
  ];

  // Get orders data from the useOrders hook
  const { allOrders, ordersNeedingReview, totalOrders, totalReviews, totalDisputes } = useOrders();
  
  // Filter to show only ended/completed orders for the history section
  const completedOrders = allOrders
    .filter(order => order.status === "ended")
    .slice(0, 3) // Limit to 3 orders for the dashboard view
    .map(order => ({
      id: order.id,
      name: order.title,
      image: order.image,
      date: order.date,
      orderNumber: `Order #GRP-2025-${order.id}`,
      amount: `$${order.price.toFixed(2)}`,
      status: "Delivered",
      rating: order.review ? order.review.rating : 0,
      actions: "Download Receipt • Reorder"
    }));

  const handleViewAllOrders = () => {
    navigate('/host/orders');
  };

  // Navigation functions for stat cards
  const navigateToOrders = () => navigate('/host/orders');
  const navigateToReviews = () => navigate('/host/reviews');
  const navigateToDisputes = () => navigate('/host/disputes');

  return (
    <div className="flex flex-col gap-6">
      {/* Order History Section - Frame 1321323718 */}
      <div className="bg-white p-5 rounded-lg shadow-[0px_4px_14px_#F1F1F1] w-full max-w-[1140px] mx-auto">
        <div className="flex flex-col gap-6">
          {/* Order History Header - Frame 1321323714 */}
          <div className="flex flex-row justify-between items-center">
            <h2 className="text-[20px] font-semibold font-['Poppins']">Order History</h2>
            <div className="flex items-center gap-4">
              <StatsTimeFilter 
                timeFilter={timeFilter} 
                setTimeFilter={setTimeFilter} 
                timeFilters={timeFilters} 
              />
              <Button 
                onClick={handleViewAllOrders} 
                variant="ghost" 
                className="flex items-center text-[#F07712] hover:text-[#ff8a2b] hover:bg-transparent"
              >
                View All 
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Order List - Frame 1321323716 */}
          <OrderList orders={completedOrders} />
        </div>
      </div>

      {/* Dashboard Cards - Updated with new specifications */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 w-full">
        <StatCard 
          title="Orders"
          value={totalOrders}
          icon={<ShoppingBag className="w-5 h-5 text-[#469A7E]" strokeWidth={2} />}
          iconBgClass="bg-[rgba(97,196,84,0.2)]"
          actionLabel="View orders"
          actionLink={navigateToOrders}
        />
        
        <StatCard 
          title="Reviews"
          value={totalReviews}
          icon={<Star className="w-[18px] h-[18px] text-[#FFC107]" fill="#FFC107" />}
          iconBgClass="bg-[rgba(255,193,7,0.1)]"
          actionLabel="Manage reviews"
          actionLink={navigateToReviews}
        />
        
        <StatCard 
          title="Disputes"
          value={totalDisputes}
          icon={<Shield className="w-5 h-5 text-[#FF4003]" strokeWidth={2} />}
          iconBgClass="bg-[rgba(255,64,3,0.2)]"
          actionLabel="View Disputes"
          actionLink={navigateToDisputes}
        />
      </div>
    </div>
  );
};

export default DashboardStats;
