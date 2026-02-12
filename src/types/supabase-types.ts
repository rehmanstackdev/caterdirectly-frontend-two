// Stub Database type to replace Supabase auto-generated types
export type Database = {
  public: {
    Tables: {
      [key: string]: {
        Row: any;
        Insert: any;
        Update: any;
      };
    };
    Enums: {
      [key: string]: string;
    };
  };
};

// User role enum
export type UserRole = 'host' | 'vendor' | 'admin' | 'guest' | 'super_admin';

// Define stub types based on the database schema
export type ProfileRow = any;
export type EventRow = any;
export type EventGuestRow = any;
export type TicketTypeRow = any;
export type ServiceRow = any;
export type OrderRow = any;
export type ReviewRow = any;
export type DisputeRow = any;
export type ChatRow = any;
export type MessageRow = any;
export type EventServiceRow = any;

// Additional helper types for the application
export type User = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  profileImage?: string | null;
  userType: string;
  role: UserRole;
};

export type Session = {
  user: User | null;
  accessToken: string | null;
};
