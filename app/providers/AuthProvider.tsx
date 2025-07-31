// providers/AuthProvider.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  isEmailVerified: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: SignupData) => Promise<void>;
  logout: () => void;
  showAuthModal: (action?: 'login' | 'signup', redirectAfter?: string) => void;
  hideAuthModal: () => void;
  authModal: {
    isOpen: boolean;
    action: 'login' | 'signup';
    redirectAfter?: string;
  };
  refreshUser: () => Promise<void>;
  requireAuth: (redirectAfter?: string) => boolean;
}

interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authModal, setAuthModal] = useState({
    isOpen: false,
    action: 'login' as 'login' | 'signup',
    redirectAfter: undefined as string | undefined
  });

  const router = useRouter();

  // Check for existing session on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setUser(response.data.data);
      } else {
        // Invalid token
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
      }
    } catch (error) {
      // Token invalid or expired
      localStorage.removeItem('userToken');
      localStorage.removeItem('userData');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`, {
        email,
        password
      });

      if (response.data.success) {
        const { token, user: userData } = response.data.data;
        
        // Store in localStorage
        localStorage.setItem('userToken', token);
        localStorage.setItem('userData', JSON.stringify(userData));
        
        setUser(userData);
        
        // Handle redirect after login
        if (authModal.redirectAfter) {
          router.push(authModal.redirectAfter);
        }
        
        hideAuthModal();
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  const signup = async (userData: SignupData) => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/signup`, userData);

      if (response.data.success) {
        const { token, user: newUser } = response.data.data;
        
        // Store in localStorage
        localStorage.setItem('userToken', token);
        localStorage.setItem('userData', JSON.stringify(newUser));
        
        setUser(newUser);
        
        // Handle redirect after signup
        if (authModal.redirectAfter) {
          router.push(authModal.redirectAfter);
        }
        
        hideAuthModal();
      } else {
        throw new Error(response.data.message || 'Signup failed');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Signup failed. Please try again.');
    }
  };

  const logout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    setUser(null);
    router.push('/');
  };

  const showAuthModal = (action: 'login' | 'signup' = 'login', redirectAfter?: string) => {
    setAuthModal({
      isOpen: true,
      action,
      redirectAfter
    });
  };

  const hideAuthModal = () => {
    setAuthModal(prev => ({
      ...prev,
      isOpen: false
    }));
  };

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) return;

      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setUser(response.data.data);
        localStorage.setItem('userData', JSON.stringify(response.data.data));
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  // Helper function to require authentication
  const requireAuth = (redirectAfter?: string): boolean => {
    if (!user && !isLoading) {
      showAuthModal('login', redirectAfter);
      return false;
    }
    return !!user;
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    showAuthModal,
    hideAuthModal,
    authModal,
    refreshUser,
    requireAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}