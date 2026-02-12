
import React from 'react';
import { Route } from 'react-router-dom';
import VendorLogin from '../pages/vendor/VendorLogin';
import VendorApplication from '../pages/vendor/VendorApplication';
import HostLogin from '../pages/host/HostLogin';
import HostRegister from '../pages/host/HostRegister';
import AdminLogin from '../pages/admin/AdminLogin';
import SuperAdminLogin from '../pages/admin/SuperAdminLogin';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import VendorResetPasswordPage from '../pages/vendor/VendorResetPasswordPage';
import HostResetPasswordPage from '../pages/host/HostResetPasswordPage';
import EmailVerificationPage from '../pages/EmailVerificationPage';
import GuestOrderPage from '../pages/GuestOrderPage';
import SetupPasswordPage from '../pages/SetupPasswordPage';
import NotFound from '../pages/NotFound';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

const AuthRoutes = (
  <>
    {/* Auth routes */}
    <Route path="/vendor/login" element={<VendorLogin />} />
    <Route path="/vendor/apply" element={<VendorApplication />} />
    
    {/* Application route accessible to everyone now that RLS is disabled */}
    <Route path="/vendor/application" element={<VendorApplication />} />
    
    <Route path="/host/login" element={<HostLogin />} />
    <Route path="/host/register" element={<HostRegister />} />
    <Route path="/admin/login" element={<AdminLogin />} />
    <Route path="/super-admin/login" element={<SuperAdminLogin />} />
    
    {/* Password reset routes */}
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="/vendor/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="/host/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="/reset-password" element={<ResetPasswordPage />} />
    <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
    <Route path="/vendor/reset-password" element={<VendorResetPasswordPage />} />
    <Route path="/host/reset-password" element={<HostResetPasswordPage />} />
    
    {/* Email verification route */}
    <Route path="/auth/verify-email" element={<EmailVerificationPage />} />
    <Route path="/setup-password" element={<SetupPasswordPage />} />
    <Route path="/guest-order/:token" element={<GuestOrderPage />} />
  </>
);

export default AuthRoutes;
