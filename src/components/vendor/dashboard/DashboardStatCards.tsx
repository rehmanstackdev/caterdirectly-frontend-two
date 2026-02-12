
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, DollarSign, Bell, ShoppingBag, ArrowRight } from 'lucide-react';

interface DashboardStatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
  gradientFrom: string;
  onClick: () => void;
  linkText: string;
}

const DashboardStatCard = ({
  title,
  value,
  icon,
  iconBgColor,
  iconColor,
  gradientFrom,
  onClick,
  linkText,
}: DashboardStatCardProps) => {
  return (
    <div className={`w-full rounded-xl p-5 bg-gradient-to-br from-${gradientFrom} to-white shadow-lg border border-[#E9F2FF]`}>
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <h3 className="font-poppins text-base font-medium text-gray-800">{title}</h3>
          <div className={`w-10 h-10 flex items-center justify-center rounded-full ${iconBgColor}`}>
            {icon}
          </div>
        </div>
        <span className="font-poppins text-3xl font-semibold text-gray-900">{value}</span>
        <div className="flex items-center mt-1 group cursor-pointer" onClick={onClick}>
          <span className="font-poppins text-sm text-[#F07712] font-medium group-hover:underline">{linkText}</span>
          <ArrowRight className="ml-2 w-4 h-4 text-[#F07712] group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
};

export const DashboardStatCards = ({ setActiveTab }: { setActiveTab: (tab: string) => void }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Upcoming Bookings Card */}
      <DashboardStatCard
        title="Upcoming Bookings"
        value="3"
        icon={<Calendar className="w-5 h-5 text-[#F07712]" strokeWidth={2.5} />}
        iconBgColor="bg-[rgba(240,119,18,0.15)]"
        iconColor="text-[#F07712]"
        gradientFrom="[#F5FAFF]"
        onClick={() => setActiveTab('calendar')}
        linkText="View bookings"
      />

      {/* Monthly Revenue Card */}
      <DashboardStatCard
        title="Monthly Revenue"
        value="$10,050"
        icon={<DollarSign className="w-5 h-5 text-[#FFC107]" strokeWidth={2.5} />}
        iconBgColor="bg-[rgba(255,193,7,0.15)]"
        iconColor="text-[#FFC107]"
        gradientFrom="[#FFFAF0]"
        onClick={() => setActiveTab('financials')}
        linkText="View revenue"
      />

      {/* New Inquiries Card */}
      <DashboardStatCard
        title="New Inquiries"
        value="5"
        icon={<Bell className="w-5 h-5 text-[#FF4003]" strokeWidth={2.5} />}
        iconBgColor="bg-[rgba(255,64,3,0.15)]"
        iconColor="text-[#FF4003]"
        gradientFrom="[#FFF5F5]"
        onClick={() => setActiveTab('messaging')}
        linkText="View inquiries"
      />

      {/* Orders Card */}
      <DashboardStatCard
        title="Orders"
        value="28"
        icon={<ShoppingBag className="w-5 h-5 text-[#469A7E]" strokeWidth={2.5} />}
        iconBgColor="bg-[rgba(97,196,84,0.15)]"
        iconColor="text-[#469A7E]"
        gradientFrom="[#F5FFF5]"
        onClick={() => setActiveTab('orders')}
        linkText="Manage orders"
      />
    </div>
  );
};

export default DashboardStatCards;
