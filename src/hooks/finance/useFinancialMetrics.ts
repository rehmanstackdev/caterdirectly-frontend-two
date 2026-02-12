import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { calculateOrderFinancialBreakdown } from '@/utils/financial-calculations';

export type TimeFilter = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'all' | 'custom';

export interface FinancialMetrics {
  totalRevenue: number;
  grossProfit: number;
  salesPipeline: number;
  accountsPayable: number;
  costOfRevenue: number;
  averageDealSize: number;
  monthlyRecurringRevenue: number;
  conversionRate: number;
  grossProfitMargin: number;
  growthRate: number;
  revenueData: Array<{
    date: string;
    total: number;
    profit: number;
    pipeline: number;
  }>;
}

interface UseFinancialMetricsReturn extends FinancialMetrics {
  loading: boolean;
  error: string | null;
}

export function useFinancialMetrics(
  timeFilter: TimeFilter,
  customStartDate?: Date,
  customEndDate?: Date
): UseFinancialMetricsReturn {
  const [metrics, setMetrics] = useState<FinancialMetrics>({
    totalRevenue: 0,
    grossProfit: 0,
    salesPipeline: 0,
    accountsPayable: 0,
    costOfRevenue: 0,
    averageDealSize: 0,
    monthlyRecurringRevenue: 0,
    conversionRate: 0,
    grossProfitMargin: 0,
    growthRate: 0,
    revenueData: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      setError(null);

      try {
        const { startDate, endDate } = getDateRange(timeFilter, customStartDate, customEndDate);

        // Fetch paid orders with full data needed for calculations
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select('id, price, location, pricing_snapshot, service_details, created_at')
          .eq('payment_status', 'paid')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString());

        if (ordersError) throw ordersError;

        // Fetch invoices for pipeline
      const { data: proposals, error: proposalsError } = await supabase
        .from('invoices')
        .select('total, status, created_at')
        .in('status', ['sent', 'draft'])
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

        if (proposalsError) throw proposalsError;

        // Fetch all payouts for commission liability calculation
        const { data: payouts, error: payoutsError } = await supabase
          .from('payouts')
          .select('source_id, source_type, amount_net, status')
          .eq('entity_type', 'vendor')
          .eq('status', 'paid');

        if (payoutsError) throw payoutsError;

        // Calculate metrics using correct financial breakdown
        const totalRevenue = orders?.reduce((sum, order) => sum + order.price, 0) || 0;
        
        // Calculate accurate financial breakdown for all orders
        let totalGrossProfit = 0;
        let totalCostOfRevenue = 0;
        let totalCommission = 0;

        orders?.forEach(order => {
          const breakdown = calculateOrderFinancialBreakdown(order);
          totalGrossProfit += breakdown.platformEarnings; // What CD keeps
          totalCostOfRevenue += breakdown.vendorShare; // What vendors get
          totalCommission += breakdown.commission;
        });

        const grossProfit = totalGrossProfit;
        const costOfRevenue = totalCostOfRevenue;
        
        const salesPipeline = proposals?.reduce((sum, proposal) => sum + (proposal.total || 0), 0) || 0;
        
        // Calculate Accounts Payable: vendor share minus already paid amounts
        const accountsPayable = orders?.reduce((sum, order) => {
          const breakdown = calculateOrderFinancialBreakdown(order);
          
          // Check if this order has been paid out to vendor
          const orderPayouts = payouts?.filter(p => 
            p.source_id === order.id && 
            p.source_type === 'order'
          ) || [];
          
          const paidAmount = orderPayouts.reduce((sum, p) => 
            sum + (p.amount_net || 0), 0
          ) / 100; // Convert from cents
          
          // What we still owe = vendor share - already paid
          return sum + Math.max(0, breakdown.vendorShare - paidAmount);
        }, 0) || 0;

        const averageDealSize = orders && orders.length > 0 ? totalRevenue / orders.length : 0;

        // Calculate MRR based on time period
        const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const monthlyRecurringRevenue = days > 0 ? (totalRevenue / days) * 30 : 0;

        // Calculate conversion rate
        const totalProposals = proposals?.length || 0;
        const paidProposals = orders?.length || 0;
        const conversionRate = totalProposals > 0 ? (paidProposals / totalProposals) * 100 : 0;

        // Calculate gross profit margin
        const grossProfitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

        // Calculate growth rate (comparing to previous period)
        const { startDate: prevStartDate, endDate: prevEndDate } = getPreviousPeriod(
          startDate,
          endDate,
          timeFilter
        );
        const { data: prevOrders } = await supabase
          .from('orders')
          .select('price')
          .eq('payment_status', 'paid')
          .gte('created_at', prevStartDate.toISOString())
          .lte('created_at', prevEndDate.toISOString());

        const prevTotalRevenue = prevOrders?.reduce((sum, order) => sum + order.price, 0) || 0;
        const growthRate =
          prevTotalRevenue > 0 ? ((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100 : 0;

        // Generate revenue data for chart
        const revenueData = generateRevenueData(orders || [], proposals || [], startDate, endDate, timeFilter);

        // Log financial breakdown for verification
        console.log('[FinancialMetrics] Breakdown:', {
          totalRevenue: totalRevenue.toFixed(2),
          grossProfit: grossProfit.toFixed(2),
          costOfRevenue: costOfRevenue.toFixed(2),
          accountsPayable: accountsPayable.toFixed(2),
          totalCommission: totalCommission.toFixed(2),
          grossProfitMargin: grossProfitMargin.toFixed(2) + '%',
          orderCount: orders?.length || 0
        });

      setMetrics({
        totalRevenue,
        grossProfit,
        salesPipeline,
        accountsPayable,
        costOfRevenue,
        averageDealSize,
        monthlyRecurringRevenue,
        conversionRate,
        grossProfitMargin,
        growthRate,
        revenueData,
      });
      } catch (e: any) {
        console.error('Error fetching financial metrics:', e);
        setError(e.message || 'Failed to load financial metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [timeFilter, customStartDate, customEndDate]);

  return { ...metrics, loading, error };
}

function getDateRange(
  timeFilter: TimeFilter,
  customStartDate?: Date,
  customEndDate?: Date
): { startDate: Date; endDate: Date } {
  if (timeFilter === 'custom' && customStartDate && customEndDate) {
    return { startDate: customStartDate, endDate: customEndDate };
  }

  const now = new Date();
  const startDate = new Date();
  const endDate = new Date();

  switch (timeFilter) {
    case 'today':
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'week':
      // Start of current week (Sunday)
      const day = startDate.getDay();
      startDate.setDate(startDate.getDate() - day);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'month':
      // Start of current month
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      // End of current month
      endDate.setMonth(endDate.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'quarter':
      // Start of current quarter
      const quarter = Math.floor(startDate.getMonth() / 3);
      startDate.setMonth(quarter * 3, 1);
      startDate.setHours(0, 0, 0, 0);
      // End of current quarter
      endDate.setMonth(quarter * 3 + 3, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'year':
      // Start of current year
      startDate.setMonth(0, 1);
      startDate.setHours(0, 0, 0, 0);
      // End of current year
      endDate.setMonth(11, 31);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'all':
      startDate.setFullYear(2020, 0, 1);
      endDate.setHours(23, 59, 59, 999);
      break;
    default:
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
  }

  return { startDate, endDate };
}

function getPreviousPeriod(
  startDate: Date,
  endDate: Date,
  timeFilter: TimeFilter
): { startDate: Date; endDate: Date } {
  const duration = endDate.getTime() - startDate.getTime();
  const prevEndDate = new Date(startDate.getTime() - 1);
  const prevStartDate = new Date(prevEndDate.getTime() - duration);
  return { startDate: prevStartDate, endDate: prevEndDate };
}

function generateRevenueData(
  orders: any[],
  proposals: any[],
  startDate: Date,
  endDate: Date,
  timeFilter: TimeFilter
): Array<{ date: string; total: number; profit: number; pipeline: number }> {
  const dataPoints: Array<{ date: string; total: number; profit: number; pipeline: number }> = [];
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const pointCount = Math.min(days, timeFilter === 'all' || timeFilter === 'year' ? 12 : 30);

  for (let i = 0; i < pointCount; i++) {
    const pointDate = new Date(startDate.getTime() + (i * days * 24 * 60 * 60 * 1000) / pointCount);
    const nextPointDate = new Date(startDate.getTime() + ((i + 1) * days * 24 * 60 * 60 * 1000) / pointCount);

    const ordersInRange = orders.filter((order) => {
      const orderDate = new Date(order.created_at);
      return orderDate >= pointDate && orderDate < nextPointDate;
    });

    const proposalsInRange = proposals.filter((proposal) => {
      const proposalDate = new Date(proposal.created_at);
      return proposalDate >= pointDate && proposalDate < nextPointDate;
    });

    const total = ordersInRange.reduce((sum, order) => sum + order.price, 0);
    
    const profit = ordersInRange.reduce((sum, order) => {
      const breakdown = calculateOrderFinancialBreakdown(order);
      return sum + breakdown.platformEarnings; // What CD keeps
    }, 0);
    
    const pipeline = proposalsInRange.reduce((sum, proposal) => sum + (proposal.total || 0), 0);

    dataPoints.push({
      date: pointDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      total,
      profit,
      pipeline,
    });
  }

  return dataPoints;
}
