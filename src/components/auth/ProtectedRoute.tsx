
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  userRole?: 'vendor' | 'host' | 'event-host' | 'admin' | 'super-admin';
  redirectTo?: string;
}

export const ProtectedRoute = ({ 
  children, 
  userRole,
  redirectTo
}: ProtectedRouteProps) => {
  const { user, loading: authLoading, userRole: currentUserRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [shouldRender, setShouldRender] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const graceTimeoutRef = useRef<number | null>(null);

  console.log(`ProtectedRoute: Checking access to ${location.pathname}`, {
    requiredRole: userRole,
    hasUser: !!user,
    currentUserRole,
    authLoading,
    isCheckingAccess
  });
  
  // Clean up any stale bypass auth data on mount
  useEffect(() => {
    localStorage.removeItem('admin_bypass_mode');
    localStorage.removeItem('admin_bypass_email');
    localStorage.removeItem('admin_bypass_last_verified');
    localStorage.removeItem('admin-bypass-active');
    localStorage.removeItem('admin-bypass-email');
  }, []);
  
  useEffect(() => {
    // Don't make access decisions while still loading
    if (authLoading) {
      console.log(`ProtectedRoute: Still loading auth state for ${location.pathname}`);
      return;
    }
    
    // Grace period: wait briefly for user role to load before making access decisions
    if (user && !currentUserRole) {
      console.log(`ProtectedRoute: Waiting for role to load for ${location.pathname}`);
      setIsCheckingAccess(true);
      if (graceTimeoutRef.current) {
        clearTimeout(graceTimeoutRef.current);
      }
      graceTimeoutRef.current = window.setTimeout(() => {
        setIsCheckingAccess(false);
      }, 1200);
      return;
    }

    setIsCheckingAccess(false);
    
    // Check if user is trying to access vendor application from admin section
    const isVendorApplicationFromAdmin = 
      location.pathname === '/vendor/application' && 
      location.search.includes('admin=true');
    
    // Special case for vendor application via admin
    if (isVendorApplicationFromAdmin && (currentUserRole === 'admin' || currentUserRole === 'super_admin' || currentUserRole === 'super-admin')) {
      console.log(`ProtectedRoute: BYPASS - Granting access to vendor application from admin ${location.pathname}`);
      setShouldRender(true);
      return;
    }
    
    // Admin and super-admin roles should have access to ALL sections
    // Note: backend uses 'super_admin' with underscore
    const isAdminUser = currentUserRole === 'admin' || currentUserRole === 'super_admin' || currentUserRole === 'super-admin';
    
    if (isAdminUser) {
      console.log(`ProtectedRoute: Admin access granted to ${location.pathname}`);
      setShouldRender(true);
      return;
    }
    
    // For specific role requirements
    if (userRole) {
      // Check if user has the required role (with host/event-host compatibility)
      const hasRequiredRole = currentUserRole === userRole || 
        (userRole === 'event-host' && currentUserRole === 'host') ||
        (userRole === 'host' && currentUserRole === 'event-host');
        
      if (hasRequiredRole) {
        console.log(`ProtectedRoute: Role-specific access granted to ${location.pathname}`);
        setShouldRender(true);
        return;
      }
    } else {
      // If no specific role required, just check authentication
      if (user) {
        console.log(`ProtectedRoute: Authenticated access granted to ${location.pathname}`);
        setShouldRender(true);
        return;
      }
    }
    
    // If we get here, access is denied - redirect to appropriate login page
    console.log(`ProtectedRoute: Access denied to ${location.pathname}, redirecting to appropriate login`);
    
    // Preserve the intended destination with full state
    const destinationState = {
      from: location,
      intended: location.pathname + location.search + location.hash,
      ...location.state
    };
    
    // Determine redirect destination based on context
    let finalRedirectTo;
    
    if (redirectTo) {
      // Use the explicitly provided redirect
      finalRedirectTo = redirectTo;
    } else {
      // Determine redirect based on the path being accessed
      const path = location.pathname;
      
      if (path.startsWith('/admin')) {
        finalRedirectTo = '/admin/login';
      } else if (path.startsWith('/vendor')) {
        finalRedirectTo = '/vendor/login';
      } else {
        // For booking and marketplace routes, use host login
        finalRedirectTo = '/host/login';
      }
    }
    
    navigate(finalRedirectTo, { state: destinationState });
  }, [user, userRole, currentUserRole, location, navigate, redirectTo, authLoading]);

  // Show loading state while checking access
  if (authLoading || isCheckingAccess) {
    console.log(`ProtectedRoute: Loading access check for ${location.pathname}...`);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return shouldRender ? <>{children}</> : null;
};

export default ProtectedRoute;
