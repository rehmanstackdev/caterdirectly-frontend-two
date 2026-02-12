
// Re-export all functions for backward compatibility
export { 
  getServiceName, 
  getServicePrice, 
  getMenuItems, 
  requiresItemSelection,
  isStaffService 
} from "./order/service-helpers";

export { 
  calculateSelectedItemsTotal, 
  getSelectedItemsCountForService 
} from "./order/item-calculations";

export { 
  calculateServiceTotal 
} from "./order/service-calculations";

export { 
  calculateOrderTotals 
} from "./order/order-totals";
