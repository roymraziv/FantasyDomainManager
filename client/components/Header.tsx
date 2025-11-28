'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Castle, LogIn, User, Map, Shield } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

export default function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const router = useRouter();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    }

    if (showProfileDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showProfileDropdown]);

  const handleLogout = () => {
    logout();
    setShowProfileDropdown(false);
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-amber-700/50 bg-zinc-900/95 backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo / Home Link */}
          <Link
            href="/"
            className="flex items-center gap-2 text-amber-100 hover:text-amber-500 transition-colors group"
          >
            <Castle className="h-8 w-8 text-amber-600 group-hover:text-amber-500 transition-colors" />
            <span className="hidden sm:inline-block text-xl font-bold">
              Fantasy Domain Manager
            </span>
            <span className="sm:hidden text-xl font-bold">FDM</span>
          </Link>

          {/* Navigation & Auth Actions */}
          <div className="flex items-center gap-4">
            {/* Domains Link - Only for authenticated users */}
            {isAuthenticated && (
              <Link
                href="/domains"
                className="flex items-center gap-2 px-4 py-2 text-amber-100 hover:text-amber-500 transition-colors font-semibold"
              >
                <Map className="h-4 w-4" />
                <span className="hidden sm:inline">Domains</span>
              </Link>
            )}

            {/* Admin Link - Only for admin users */}
            {isAdmin && (
              <Link
                href="/admin/users"
                className="flex items-center gap-2 px-4 py-2 text-amber-100 hover:text-amber-500 transition-colors font-semibold"
              >
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            )}
            {!isAuthenticated ? (
              <Link
                href="/login"
                className="flex items-center gap-2 px-4 py-2 bg-amber-700 hover:bg-amber-600 text-zinc-100 rounded-lg border-2 border-amber-900/50 transition-colors font-semibold"
              >
                <LogIn className="h-4 w-4" />
                <span>Login</span>
              </Link>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-amber-100 rounded-lg border-2 border-amber-700/50 transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{user?.name || user?.email}</span>
                  <svg
                    className={`h-4 w-4 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Profile Dropdown */}
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-zinc-800 border-2 border-amber-700/50 rounded-lg shadow-lg shadow-amber-900/30 overflow-hidden">
                    <div className="p-2">
                      {/* View Profile Info Link */}
                      <Link
                        href="/profile"
                        onClick={() => setShowProfileDropdown(false)}
                        className="w-full px-4 py-2 text-amber-100 hover:bg-zinc-700 rounded transition-colors font-semibold flex items-center gap-2"
                      >
                        <User className="h-4 w-4" />
                        View Profile Info
                      </Link>

                      {/* Logout Button */}
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 mt-1 text-red-400 hover:bg-zinc-700 rounded transition-colors font-semibold flex items-center gap-2"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
