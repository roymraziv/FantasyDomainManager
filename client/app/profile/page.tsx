'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Mail, IdCard } from 'lucide-react';
import { useEffect } from 'react';

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-amber-100 hover:text-amber-500 transition-colors mb-6 font-semibold"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Home
        </button>

        {/* Profile Card */}
        <div className="bg-zinc-900 border-2 border-amber-700/50 rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-zinc-800 border-b-2 border-amber-700/30 p-6">
            <div className="flex items-center gap-4">
              <div className="bg-amber-700 p-4 rounded-full">
                <User className="h-8 w-8 text-zinc-100" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-amber-100">Profile Information</h1>
                <p className="text-amber-200/70 text-sm mt-1">View your account details</p>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-6 space-y-6">
            {/* Name Field */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-amber-700 mb-2">
                <User className="h-4 w-4" />
                Name
              </label>
              <div className="w-full px-4 py-3 bg-zinc-800 border-2 border-amber-700/30 rounded text-amber-100">
                {user.name}
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-amber-700 mb-2">
                <Mail className="h-4 w-4" />
                Email Address
              </label>
              <div className="w-full px-4 py-3 bg-zinc-800 border-2 border-amber-700/30 rounded text-amber-100">
                {user.email}
              </div>
            </div>

            {/* User ID Field */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-amber-700 mb-2">
                <IdCard className="h-4 w-4" />
                User ID
              </label>
              <div className="w-full px-4 py-3 bg-zinc-800 border-2 border-amber-700/30 rounded text-amber-100 font-mono text-sm">
                {user.id}
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="bg-zinc-950/50 border-t-2 border-amber-700/30 p-4">
            <p className="text-amber-200/60 text-sm text-center">
              Profile editing will be available in a future update
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
