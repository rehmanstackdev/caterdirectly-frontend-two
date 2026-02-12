import { useState } from 'react';
import { DollarSign, TrendingUp, PiggyBank, AlertCircle, BarChart3, Percent } from 'lucide-react';
import Dashboard from '@/components/dashboard/Dashboard';
import { LaunchDateSettings } from '@/components/finance/LaunchDateSettings';
import { TimeFilterTabs } from '@/components/finance/TimeFilterTabs';
import { FinancialMetricCard } from '@/components/finance/FinancialMetricCard';
import { VendorPayoutOrdersTable } from '@/components/finance/VendorPayoutOrdersTable';
import { RevenueTrendChart } from '@/components/finance/RevenueTrendChart';
import { TimeFilter } from '@/hooks/finance/useFinancialMetrics';
import { useVendorPayoutOrders } from '@/hooks/finance/useVendorPayoutOrders';
import { LaunchDatesProvider, useLaunchDatesContext } from '@/contexts/LaunchDatesContext';

const generateChartData = (orders: any[]) => {
  const dateMap = new Map<string, { total: number; profit: number; pipeline: number }>();
  
  orders.forEach(order => {
    const date = new Date(order.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const existing = dateMap.get(date) || { total: 0, profit: 0, pipeline: 0 };
    
    if (order.status === 'Paid') {
      existing.total += order.orderTotal;
      existing.profit += order.keptByCD;
    } else {
      existing.pipeline += order.orderTotal;
    }
    
    dateMap.set(date, existing);
  });
  
  return Array.from(dateMap.entries())
    .map(([date, values]) => ({ date, ...values }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

function FinanceManagementContent() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month');
  const { softLaunchDate, fullLaunchDate } = useLaunchDatesContext();
  
  const { orders, loading: ordersLoading, metrics, markOrderPaid } = useVendorPayoutOrders(timeFilter, softLaunchDate, fullLaunchDate);
  
  const {
    totalRevenue,
    grossProfit,
    costOfRevenue,
    accountsPayable,
    salesPipeline,
    averageDealSize,
    conversionRate,
    grossProfitMargin,
  } = metrics;

  return (
    <Dashboard userRole="admin" activeTab="finances">
      <div className="space-y-6 p-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Finance Management</h1>
            <p className="text-muted-foreground mt-1">
              Track revenue, manage vendor payouts, and monitor financial performance
            </p>
          </div>
        </div>

        {/* Launch Date Settings */}
        <LaunchDateSettings />

        {/* Time Filter */}
        <div className="flex justify-center">
          <TimeFilterTabs activeFilter={timeFilter} onFilterChange={setTimeFilter} />
        </div>

        {/* Primary Metrics - Top Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <FinancialMetricCard
            title="Total Revenue"
            value={totalRevenue}
            format="currency"
            subtitle="All paid orders"
            icon={<DollarSign className="w-5 h-5" />}
            colorClass="text-finance-revenue"
            loading={ordersLoading}
          />
          
          <FinancialMetricCard
            title="Gross Profit"
            value={grossProfit}
            format="currency"
            subtitle="Platform earnings"
            icon={<TrendingUp className="w-5 h-5" />}
            colorClass="text-brand"
            loading={ordersLoading}
          />
          
          <FinancialMetricCard
            title="Cost of Revenue"
            value={costOfRevenue}
            format="currency"
            subtitle="Vendor payouts"
            icon={<BarChart3 className="w-5 h-5" />}
            colorClass="text-finance-neutral"
            loading={ordersLoading}
          />
          
          <FinancialMetricCard
            title="Accounts Payable"
            value={accountsPayable}
            format="currency"
            subtitle="Payouts due"
            icon={<AlertCircle className="w-5 h-5" />}
            colorClass="text-finance-expense"
            loading={ordersLoading}
          />
          
          <FinancialMetricCard
            title="Sales Pipeline"
            value={salesPipeline}
            format="currency"
            subtitle="Unpaid proposals"
            icon={<PiggyBank className="w-5 h-5" />}
            colorClass="text-finance-pipeline"
            loading={ordersLoading}
          />
        </div>

        {/* Secondary Metrics - Bottom Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FinancialMetricCard
            title="Average Deal Size"
            value={averageDealSize}
            format="currency"
            subtitle="Per order"
            icon={<BarChart3 className="w-5 h-5" />}
            colorClass="text-finance-neutral"
            loading={ordersLoading}
          />
          
          <FinancialMetricCard
            title="Conversion Rate"
            value={conversionRate}
            format="percentage"
            subtitle="Proposals to paid"
            icon={<Percent className="w-5 h-5" />}
            colorClass="text-finance-positive"
            loading={ordersLoading}
          />
          
          <FinancialMetricCard
            title="Gross Profit Margin"
            value={grossProfitMargin}
            format="percentage"
            subtitle="Profit margin"
            icon={<Percent className="w-5 h-5" />}
            colorClass="text-finance-positive"
            loading={ordersLoading}
          />
        </div>

        {/* Revenue Trend Chart */}
        <RevenueTrendChart data={generateChartData(orders)} loading={ordersLoading} />

        {/* Vendor Payout Orders Table */}
        <VendorPayoutOrdersTable 
          orders={orders} 
          loading={ordersLoading}
          onMarkOrderPaid={markOrderPaid}
        />
      </div>
    </Dashboard>
  );
}

function FinanceManagement() {
  return (
    <LaunchDatesProvider>
      <FinanceManagementContent />
    </LaunchDatesProvider>
  );
}

export default FinanceManagement;
