
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Users, User } from "lucide-react";

interface OrderTypeHeaderProps {
  isGroupOrder: boolean;
  onOrderTypeChange: (checked: boolean) => void;
  isInvoiceMode?: boolean;
}

const OrderTypeHeader = ({ 
  isGroupOrder, 
  onOrderTypeChange,
  isInvoiceMode = false
}: OrderTypeHeaderProps) => {
  if (isInvoiceMode) {
    return (
      <div className="flex items-center gap-2 py-2 px-3 bg-blue-50 rounded-lg border border-blue-200">
        <Users className="h-4 w-4 text-blue-600" />
        <span className="text-sm font-medium text-blue-800">Creating Invoice</span>
        <Badge variant="secondary" className="text-xs">
          {isGroupOrder ? "Group Order" : "Individual"}
        </Badge>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 py-2 px-3 bg-muted/5 rounded-lg border border-dashed">
      <div className="flex items-center gap-2">
        {isGroupOrder ? (
          <Users className="h-4 w-4 text-primary" />
        ) : (
          <User className="h-4 w-4 text-muted-foreground" />
        )}
        <Badge variant={isGroupOrder ? "default" : "secondary"} className="text-xs">
          {isGroupOrder ? "Group Order" : "Individual"}
        </Badge>
      </div>
      
      <div className="flex items-center gap-2">
        <Label htmlFor="group-order" className="text-sm cursor-pointer">
          Group Order
        </Label>
        <Switch
          id="group-order"
          checked={isGroupOrder}
          onCheckedChange={onOrderTypeChange}
        />
      </div>
    </div>
  );
};

export default OrderTypeHeader;
