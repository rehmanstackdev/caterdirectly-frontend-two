import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface FinancialMetricCardProps {
  title: string;
  value: number;
  format?: 'currency' | 'percentage' | 'number';
  trend?: number;
  subtitle?: string;
  icon: React.ReactNode;
  colorClass: string;
  loading?: boolean;
}

export function FinancialMetricCard({
  title,
  value,
  format = 'currency',
  trend,
  subtitle,
  icon,
  colorClass,
  loading,
}: FinancialMetricCardProps) {
  const formatValue = (val: number): string => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(val);
      case 'percentage':
        return `${val.toFixed(1)}%`;
      case 'number':
        return new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }).format(val);
    }
  };

  const getTrendIcon = () => {
    if (trend === undefined || trend === 0) return <Minus className="w-4 h-4" />;
    return trend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
  };

  const getTrendColor = () => {
    if (trend === undefined || trend === 0) return 'text-finance-neutral';
    return trend > 0 ? 'text-finance-positive' : 'text-finance-negative';
  };

  if (loading) {
    return (
      <Card className="bg-white/50 backdrop-blur-md border border-white/50 shadow-glass rounded-2xl animate-pulse">
        <CardContent className="p-6">
          <div className="h-6 bg-muted rounded mb-4 w-1/2" />
          <div className="h-12 bg-muted rounded mb-2" />
          <div className="h-4 bg-muted rounded w-1/3" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group relative overflow-hidden bg-white/50 backdrop-blur-md border border-white/50 shadow-glass hover:shadow-glass-hover transition-all duration-300 rounded-2xl">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          <div className={`p-2.5 rounded-xl ${colorClass} bg-opacity-10`}>{icon}</div>
        </div>

        {/* Value */}
        <div className="mb-2">
          <span className="text-4xl font-bold tracking-tight">{formatValue(value)}</span>
        </div>

        {/* Trend & Subtitle */}
        <div className="flex items-center gap-3">
          {trend !== undefined && (
            <div className={`flex items-center gap-1 text-sm font-medium ${getTrendColor()}`}>
              {getTrendIcon()}
              <span>{Math.abs(trend).toFixed(1)}%</span>
            </div>
          )}
          {subtitle && (
            <span className="text-sm text-muted-foreground">
              {trend !== undefined && '·'} {subtitle}
            </span>
          )}
        </div>
      </CardContent>

      {/* Hover gradient effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className={`absolute inset-0 bg-gradient-to-br ${colorClass} opacity-5`} />
      </div>
    </Card>
  );
}
