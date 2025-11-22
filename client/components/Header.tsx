'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Castle, LogIn, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
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

          {/* Right Side - Auth Actions */}
          <div className="flex items-center gap-4">
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
                  <div className="absolute right-0 mt-2 w-80 bg-zinc-800 border-2 border-amber-700/50 rounded-lg shadow-lg shadow-amber-900/30 overflow-hidden">
                    <div className="p-4 border-b-2 border-amber-700/30">
                      <h3 className="text-lg font-bold text-amber-100 mb-4">Profile Information</h3>

                      {/* Profile Fields - Read Only */}
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-amber-700 mb-1">
                            Name
                          </label>
                          <input
                            type="text"
                            value={user?.name || ''}
                            disabled
                            className="w-full px-3 py-2 bg-zinc-900 border-2 border-amber-700/30 rounded text-amber-100 opacity-75 cursor-not-allowed"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-amber-700 mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            value={user?.email || ''}
                            disabled
                            className="w-full px-3 py-2 bg-zinc-900 border-2 border-amber-700/30 rounded text-amber-100 opacity-75 cursor-not-allowed"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-amber-700 mb-1">
                            User ID
                          </label>
                          <input
                            type="text"
                            value={user?.id || ''}
                            disabled
                            className="w-full px-3 py-2 bg-zinc-900 border-2 border-amber-700/30 rounded text-amber-100 opacity-75 cursor-not-allowed font-mono text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Logout Button */}
                    <div className="p-3">
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 bg-red-700 hover:bg-red-600 text-zinc-100 rounded-lg border-2 border-red-900/50 transition-colors font-semibold flex items-center justify-center gap-2"
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
