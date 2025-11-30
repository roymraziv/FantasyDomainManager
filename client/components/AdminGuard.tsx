'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface AdminGuardProps {
  children: React.ReactNode;
}

/**
 * AdminGuard - Secure route protection for admin-only pages
 *
 * Security layers:
 * 1. Client-side: Prevents unauthorized UI access and redirects
 * 2. Server-side: All admin API endpoints protected with [Authorize(Policy = "RequireAdminRole")]
 *
 * This component only handles UX - real security is enforced by the backend.
 */
export default function AdminGuard({ children }: AdminGuardProps) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth to load
    if (loading) return;

    // Redirect if not authenticated
    if (!user) {
      router.push('/login');
      return;
    }

    // Redirect if not admin
    if (!isAdmin) {
      router.push('/domains'); // Regular users go to domains
      return;
    }
  }, [user, isAdmin, loading, router]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-amber-100 text-xl">Loading...</div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-amber-100 text-xl">Redirecting...</div>
      </div>
    );
  }

  // User is admin - render protected content
  return <>{children}</>;
}
