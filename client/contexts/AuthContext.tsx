'use client';

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { User } from '@/types/models';
import { authApi } from '@/lib/api';
import { extractRolesFromToken } from '@/lib/jwt';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (user: User, tokenExpiry: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  updateTokenExpiry: (expiry: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tokenExpiry, setTokenExpiry] = useState<Date | null>(null);
  const refreshIntervalRef = useRef<number | null>(null);
  const lastActivityRef = useRef<Date>(new Date());

  // Track user activity
  useEffect(() => {
    const updateActivity = () => {
      lastActivityRef.current = new Date();
    };

    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('click', updateActivity);
    window.addEventListener('scroll', updateActivity);

    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('scroll', updateActivity);
    };
  }, []);

  // Background token refresh every 25 minutes
  useEffect(() => {
    if (user) {
      // Clear existing interval
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }

      // Set up new interval
      refreshIntervalRef.current = window.setInterval(async () => {
        // Only refresh if user has been active in last 30 minutes
        const timeSinceActivity = Date.now() - lastActivityRef.current.getTime();
        const thirtyMinutes = 30 * 60 * 1000;

        if (timeSinceActivity < thirtyMinutes) {
          try {
            const data = await authApi.refreshToken();
            setTokenExpiry(new Date(data.tokenExpiry));
          } catch (error) {
            console.error('Background refresh failed:', error);
            // Don't logout on background refresh failure
            // 401 interceptor will handle it on next API call
          }
        }
      }, 25 * 60 * 1000); // 25 minutes
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [user]);

  // Silent authentication on mount
  useEffect(() => {
    async function initAuth() {
      try {
        // Try to refresh token (this will work if valid refresh cookie exists)
        const data = await authApi.refreshToken();

        // Validate that we received valid user data (not empty object from 204)
        if (data && data.id && data.email && data.name && data.tokenExpiry) {
          const roles = extractRolesFromToken(data.token);
          console.log('[AuthContext] User roles extracted from token:', roles);
          setUser({
            id: data.id,
            email: data.email,
            name: data.name,
            token: data.token,
            tokenExpiry: data.tokenExpiry,
            roles,
          });
          setTokenExpiry(new Date(data.tokenExpiry));
        } else {
          // No valid session data
          console.log('No active session');
        }
      } catch (error) {
        // No valid session - user stays logged out
        console.log('No active session');
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = (userData: User, tokenExpiryString: string) => {
    const roles = extractRolesFromToken(userData.token);
    console.log('[AuthContext] Login - User roles extracted from token:', roles);
    setUser({ ...userData, roles });
    setTokenExpiry(new Date(tokenExpiryString));
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setTokenExpiry(null);
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    }
  };

  const updateTokenExpiry = (expiry: string) => {
    setTokenExpiry(new Date(expiry));
  };

  // Expose to window for API client
  useEffect(() => {
    (window as any).__authContext = {
      logout,
      updateTokenExpiry,
    };

    return () => {
      delete (window as any).__authContext;
    };
  }, []);

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: !!user && (user.roles?.includes('Admin') || false),
    updateTokenExpiry,
  };

  // Debug logging for admin status
  useEffect(() => {
    if (user) {
      console.log('[AuthContext] User:', user.name);
      console.log('[AuthContext] User roles:', user.roles);
      console.log('[AuthContext] Is Admin:', !!user && (user.roles?.includes('Admin') || false));
    }
  }, [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
