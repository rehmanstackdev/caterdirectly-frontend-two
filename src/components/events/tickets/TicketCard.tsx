import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Edit } from "lucide-react";
import { TicketType } from "@/types/order";

interface TicketCardProps {
  ticket: TicketType;
  onEdit: () => void;
  onRemove: () => void;
}

const TicketCard = ({ ticket, onEdit, onRemove }: TicketCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const quantity = Number(ticket.quantity ?? 0);
  const showQuantity = Number.isFinite(quantity) && quantity > 0;

  return (
    <Card>
      <CardContent className="p-4 flex justify-between items-center">
        <div className="space-y-1">
          <div className="font-medium">{ticket.name}</div>
          <div className="text-lg font-bold">{formatPrice(ticket.price)}</div>
          {ticket.description && (
            <div className="text-sm text-gray-500">{ticket.description}</div>
          )}
          {showQuantity && (
            <div className="text-sm text-gray-500">{quantity} available</div>
          )}
          {ticket.sold > 0 && (
            <div className="text-sm text-blue-600 font-medium">
              {ticket.sold} sold
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="ghost" size="icon" onClick={onEdit}>
            <Edit className="h-4 w-4 text-blue-500" />
          </Button>
          <Button type="button" variant="ghost" size="icon" onClick={onRemove}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TicketCard;
