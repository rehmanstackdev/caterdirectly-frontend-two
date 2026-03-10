
import React from "react";
import BudgetSection from "./order-setup/BudgetSection";

const OrderSetupForm = () => {
  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-lg">Order Setup</h3>
      <BudgetSection />
    </div>
  );
};

export default OrderSetupForm;
