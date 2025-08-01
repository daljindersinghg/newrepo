// app/providers/AdminAuthProvider.tsx
'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface AdminAuthContextType {
  admin: any;
  loading: boolean;
  error: string;
  isLoggedIn: boolean;
  isAdmin: boolean;
  login: (loginData: any) => Promise<any>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const adminAuth = useAdminAuth();

  return (
    <AdminAuthContext.Provider value={adminAuth}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuthContext() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuthContext must be used within an AdminAuthProvider');
  }
  return context;
}
