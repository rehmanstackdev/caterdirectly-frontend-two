import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Info, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CommissionBoostPanelProps {
  vendorId: string;
  currentCommissionRate: number;
  currentBoostRate: number;
}

const CommissionBoostPanel: React.FC<CommissionBoostPanelProps> = ({
  vendorId,
  currentCommissionRate,
  currentBoostRate
}) => {
  const [boostRate, setBoostRate] = useState(currentBoostRate || 0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [estimatedRankingImprovement, setEstimatedRankingImprovement] = useState(0);
  const { toast } = useToast();

  // Calculate estimated ranking improvement based on boost
  useEffect(() => {
    const baseImprovement = Math.min(boostRate * 2, 30); // Max 30% improvement
    setEstimatedRankingImprovement(baseImprovement);
  }, [boostRate]);

  const handleBoostUpdate = async () => {
    if (!vendorId) return;
    
    try {
      setIsUpdating(true);
      
      const { error } = await supabase
        .from('vendors')
        .update({ boost_commission_rate: boostRate })
        .eq('id', vendorId);
      
      if (error) throw error;
      
      toast({
        title: "Commission boost updated!",
        description: `Your boost rate is now set to ${boostRate}%. This will improve your ranking visibility.`,
      });
      
      // Trigger ranking recalculation
      await supabase.rpc('update_all_service_rankings');
      
    } catch (error) {
      console.error('Error updating commission boost:', error);
      toast({
        title: "Update failed",
        description: "Failed to update commission boost. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const totalCommissionRate = currentCommissionRate + boostRate;
  const monthlyBoostCost = (boostRate / 100) * 1000; // Example calculation

  return (
    <TooltipProvider>
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-[#F07712]" />
          <h3 className="text-lg font-semibold">Commission Boost</h3>
          <Tooltip>
            <TooltipTrigger>
              <Info className="w-4 h-4 text-gray-400" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">
                Increase your commission rate above the standard {currentCommissionRate}% 
                to boost your services higher in search results. Higher boost = better visibility.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="space-y-6">
          {/* Current Status */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Current Total Commission</p>
              <p className="text-xl font-semibold">{totalCommissionRate}%</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Boost Active</p>
              <Badge variant={boostRate > 0 ? "default" : "secondary"}>
                {boostRate > 0 ? `+${boostRate}%` : 'None'}
              </Badge>
            </div>
          </div>

          {/* Boost Slider */}
          <div className="space-y-3">
            <Label htmlFor="boost-slider">
              Commission Boost: +{boostRate}%
            </Label>
            <Slider
              id="boost-slider"
              value={[boostRate]}
              onValueChange={(value) => setBoostRate(value[0])}
              max={10}
              min={0}
              step={0.5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0% (Standard)</span>
              <span>5% (Popular)</span>
              <span>10% (Premium)</span>
            </div>
          </div>

          {/* Estimated Impact */}
          {boostRate > 0 && (
            <div className="p-4 bg-[#F07712]/10 rounded-lg border border-[#F07712]/20">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-[#F07712]" />
                <h4 className="font-medium">Estimated Impact</h4>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Ranking Improvement</p>
                  <p className="font-semibold text-green-600">
                    +{estimatedRankingImprovement.toFixed(0)}%
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Additional Cost/Month</p>
                  <p className="font-semibold">
                    ~${monthlyBoostCost.toFixed(0)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Boost Tiers Info */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Popular Boost Tiers:</h4>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2 bg-gray-50 rounded text-center">
                <p className="font-medium">+2%</p>
                <p className="text-gray-600">Starter</p>
              </div>
              <div className="p-2 bg-[#F07712]/10 rounded text-center border border-[#F07712]/30">
                <p className="font-medium">+5%</p>
                <p className="text-gray-600">Popular</p>
              </div>
              <div className="p-2 bg-yellow-50 rounded text-center border border-yellow-300">
                <p className="font-medium">+10%</p>
                <p className="text-gray-600">Premium</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleBoostUpdate}
              disabled={isUpdating || boostRate === currentBoostRate}
              className="flex-1"
            >
              {isUpdating ? 'Updating...' : 'Apply Boost'}
            </Button>
            {boostRate !== currentBoostRate && (
              <Button
                variant="outline"
                onClick={() => setBoostRate(currentBoostRate)}
              >
                Reset
              </Button>
            )}
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-gray-500">
            * Ranking improvements are estimates based on current algorithm weights. 
            Actual results may vary based on competition and other factors.
          </p>
        </div>
      </Card>
    </TooltipProvider>
  );
};

export default CommissionBoostPanel;