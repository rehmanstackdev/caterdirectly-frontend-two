import { UserRole } from './supabase-types';

// Simple User and Session types to replace Supabase types
export interface User {
  id: string;
  email: string;
  user_metadata?: {
    first_name?: string;
    last_name?: string;
    [key: string]: any;
  };
  app_metadata?: {
    [key: string]: any;
  };
}

export interface Session {
  access_token: string;
  refresh_token: string;
  user: User;
  expires_at?: number;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRole: string | null;
  signIn: (email: string, password: string) => Promise<SignInResponse>;
  signUp: (email: string, password: string, userData?: any) => Promise<{
    success: boolean;
    error?: string;
  }>;
  signOut: () => Promise<void>;
}

export interface UserProfile {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  profileImage?: string;
  userType: string;
  role?: UserRole;
}

// Simplified SignInResponse without bypass complexity
export interface SignInResponse {
  success: boolean;
  error?: string;
}

export interface AdminVerificationResult {
  success: boolean;
  error?: string;
  cached?: boolean;
  pendingVerification?: boolean;
  routeVerified?: string;
}

export interface VerifiedRoute {
  path: string;
  timestamp: number;
  method: 'standard' | 'bypass';
}

export interface NavigationState {
  isNavigating: boolean;
  destination: string | null;
  source: string | null;
  timestamp: number;
  lockExpiration?: number;
}
