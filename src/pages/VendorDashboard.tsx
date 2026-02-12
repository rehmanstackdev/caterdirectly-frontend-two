
import React from "react";
import { Navigate } from "react-router-dom";
import VendorDashboardPage from "./vendor/VendorDashboardPage";

// This is now just a redirect to our new, more comprehensive VendorDashboardPage
const VendorDashboard = () => {
  return <Navigate to="/vendor/dashboard" replace />;
};

export default VendorDashboard;
