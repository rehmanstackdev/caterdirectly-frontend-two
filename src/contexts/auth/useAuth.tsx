
import { useContext } from "react";
import { AuthContext } from "./AuthContext";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  // Only log in development for debugging
  // if (process.env.NODE_ENV === 'development') {
  //   console.log("useAuth hook called, auth state:", {
  //     isAuthenticated: !!context.user,
  //     loading: context.loading
  //   });
  // }
  
  return context;
};
