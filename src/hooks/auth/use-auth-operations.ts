
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useSignIn } from "./use-sign-in";
import { useSignUp } from "./use-sign-up";
import { useSignOut } from "./use-sign-out";

export function useAuthOperations() {
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const { signOut } = useSignOut();

  return {
    loading,
    setLoading,
    signIn,
    signUp,
    signOut,
    toast,
    navigate
  };
}
