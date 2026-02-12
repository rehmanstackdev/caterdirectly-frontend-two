import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, Users, DollarSign, Clock } from "lucide-react";

interface PipelineStatsCardsProps {
  stats: {
    new: { count: number; value: number };
    contacted: { count: number; value: number };
    interested: { count: number; value: number };
    not_interested: { count: number; value: number };
    follow_up_needed: { count: number; value: number };
  };
}

export function PipelineStatsCards({ stats }: PipelineStatsCardsProps) {
  const totalLeads = Object.values(stats).reduce((sum, stage) => sum + stage.count, 0);
  const totalValue = Object.values(stats).reduce((sum, stage) => sum + stage.value, 0);
  const avgDealSize = totalLeads > 0 ? totalValue / totalLeads : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Active Leads</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalLeads}</div>
          <p className="text-xs text-muted-foreground">In active pipeline</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
          <p className="text-xs text-muted-foreground">Total estimated value</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Deal Size</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(avgDealSize)}</div>
          <p className="text-xs text-muted-foreground">Per lead</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Need Follow-up</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.follow_up_needed.count}</div>
          <p className="text-xs text-muted-foreground">Require attention</p>
        </CardContent>
      </Card>
    </div>
  );
}