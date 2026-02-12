
import React from "react";
import { Input } from "@/components/ui/input";
import { useGroupOrder } from "@/contexts/GroupOrderContext";

const BudgetSection = () => {
  const { state, setOrderInfo } = useGroupOrder();

  const budgetPerPerson = (state.orderInfo as any)?.budgetPerPerson || 0;
  const headcount = state.orderInfo?.headcount || 1;
  const totalBudget = budgetPerPerson ? budgetPerPerson * headcount : 0;

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="text-sm">Budget per Person</label>
        <div className="relative">
          <span className="absolute left-3 top-3">$</span>
          <Input
            className="pl-8"
            placeholder="Enter Amount"
            type="number"
            min="0"
            value={budgetPerPerson || ""}
            onChange={(e) => {
              const value = parseFloat(e.target.value) || 0;
              setOrderInfo({
                ...(state.orderInfo || {}),
                budgetPerPerson: value,
              } as any);
            }}
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm">Budget (group orders will always be individual)</label>
        <Input
          className="text-gray-500"
          placeholder="Enter Amount"
          value={totalBudget ? `$${totalBudget.toFixed(2)}` : ""}
          readOnly
        />
      </div>
    </div>
  );
};

export default BudgetSection;
