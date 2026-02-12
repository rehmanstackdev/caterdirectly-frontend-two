import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface RevenueTrendChartProps {
  data: Array<{
    date: string;
    total: number;
    profit: number;
    pipeline: number;
  }>;
  loading?: boolean;
}

export function RevenueTrendChart({ data, loading }: RevenueTrendChartProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload) return null;

    return (
      <div className="bg-white/95 backdrop-blur-md border border-white/50 shadow-glass-lg rounded-xl p-4">
        <p className="text-sm font-medium text-foreground mb-2">{payload[0]?.payload?.date}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 text-sm">
            <span className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              {entry.name}:
            </span>
            <span className="font-semibold">
              ${entry.value.toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <Card className="bg-white/50 backdrop-blur-md border border-white/50 shadow-glass rounded-3xl animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/4" />
        </CardHeader>
        <CardContent>
          <div className="h-[400px] bg-muted rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/50 backdrop-blur-md border border-white/50 shadow-glass-lg rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-glass-hover">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <TrendingUp className="w-5 h-5 text-brand" />
          Revenue Trends
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-6">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="grossGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--finance-revenue))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--finance-revenue))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="netGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--brand))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--brand))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="pipelineGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--finance-pipeline))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--finance-pipeline))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis
              dataKey="date"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
            />
            <Line
              type="monotone"
              dataKey="total"
              name="Total Revenue"
              stroke="hsl(var(--finance-revenue))"
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--finance-revenue))', r: 4 }}
              activeDot={{ r: 6 }}
              fill="url(#grossGradient)"
            />
            <Line
              type="monotone"
              dataKey="profit"
              name="Gross Profit"
              stroke="hsl(var(--brand))"
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--brand))', r: 4 }}
              activeDot={{ r: 6 }}
              fill="url(#netGradient)"
            />
            <Line
              type="monotone"
              dataKey="pipeline"
              name="Sales Pipeline"
              stroke="hsl(var(--finance-pipeline))"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: 'hsl(var(--finance-pipeline))', r: 3 }}
              activeDot={{ r: 5 }}
              fill="url(#pipelineGradient)"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
