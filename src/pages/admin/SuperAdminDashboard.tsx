
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// This component now just redirects to the unified admin dashboard
const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to the consolidated admin dashboard
    navigate("/admin/dashboard", { replace: true });
  }, [navigate]);
  
  // Return null since we're redirecting
  return null;
};

export default SuperAdminDashboard;
