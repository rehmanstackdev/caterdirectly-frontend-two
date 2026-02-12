
import React from 'react';
import { Route, Navigate } from 'react-router-dom';

// Redirect any lingering super admin routes to the unified admin routes
const SuperAdminRoutes = (
  <Route path="/super-admin/*" element={<Navigate to="/admin/dashboard" />} />
);

export default SuperAdminRoutes;
