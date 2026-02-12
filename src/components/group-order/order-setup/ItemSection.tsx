
import React from "react";
import { Input } from "@/components/ui/input";

const ItemSection = () => {
  return (
    <>
      <div className="space-y-2">
        <label className="text-sm">Select Item</label>
        <Input placeholder="Enter item" />
      </div>

      <div className="space-y-2">
        <label className="text-sm">Quantity</label>
        <Input placeholder="Enter Quantity" />
      </div>
    </>
  );
};

export default ItemSection;
