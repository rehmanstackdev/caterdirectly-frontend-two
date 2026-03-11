import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CreateOrderButtonProps {
  isGroupOrder: boolean;
  onClick?: () => void;
  isLoading?: boolean;
}

function CreateOrderButton({
  isGroupOrder,
  onClick,
  isLoading = false,
}: CreateOrderButtonProps) {
  const navigate = useNavigate();

  const handleCreateOrder = () => {
    if (onClick) {
      onClick();
    } else if (isGroupOrder) {
      navigate("/group-order/review");
    } else {
      navigate("/booking");
    }
  };

  return (
    <Button
      className="w-full h-12 bg-[#F07712] hover:bg-[#F07712]/90 disabled:opacity-50 disabled:cursor-not-allowed"
      onClick={handleCreateOrder}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <PlusCircle className="mr-2 h-4 w-4" />
      )}
      {isLoading
        ? "Creating..."
        : isGroupOrder
          ? "Create Group Order"
          : "Create Order"}
    </Button>
  );
}

export default CreateOrderButton;
