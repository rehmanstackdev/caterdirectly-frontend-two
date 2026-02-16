import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

export function useHostNavigation() {
  const navigate = useNavigate();

  const createNewHost = () => {
    navigate("/host/register?adminCreate=true");
    toast({
      title: "Creating Host Account",
      description: "Fill out the form to create a host account.",
    });
  };

  return {
    createNewHost,
    navigate,
  };
}
