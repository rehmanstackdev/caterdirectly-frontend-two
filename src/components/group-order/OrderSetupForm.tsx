
import React from "react";
import BudgetSection from "./order-setup/BudgetSection";

import DeadlineSection from "./order-setup/DeadlineSection";

const OrderSetupForm = () => {
  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-lg">Order Setup</h3>
      <BudgetSection />

      <DeadlineSection />
    </div>
  );
};

export default OrderSetupForm;
