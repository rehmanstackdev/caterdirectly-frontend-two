import { getToken } from "@/utils/utils";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ProtectedRoute = (props: any) => {
  const { Component } = props;
  const navigate = useNavigate();
  //protected Route
  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/", { replace: true });
    }
  }, [navigate]);
  if (!getToken()) {
    return null;
  }
  return <Component />;
};

// For public routes like login: if already authenticated, go to dashboard
export const PublicRoute = (props: any) => {
  const { Component } = props;
  const navigate = useNavigate();

  useEffect(() => {
    const stored = getToken(true) as { access_token?: string } | null;
    if (stored && (stored as any).access_token) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const raw = getToken();
  if (raw) {
    return null;
  }
  return <Component />;
};

export default ProtectedRoute;
