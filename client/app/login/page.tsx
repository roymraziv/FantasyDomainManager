'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Castle, Mail, Lock } from 'lucide-react';
import { authApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const verified = searchParams.get('verified');
    const reset = searchParams.get('reset');
    
    if (verified) {
      setSuccessMessage('Email verified successfully! You can now log in.');
    } else if (reset) {
      setSuccessMessage('Password reset successfully! Please log in with your new password.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Call the login API
      const data = await authApi.login({
        email: formData.email,
        password: formData.password,
      });

      // Cookies are set automatically by browser
      // Store user data and token expiry
      login(data, data.tokenExpiry);

      // Redirect to domains page
      router.push('/domains');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed. Please check your credentials.';
      
      // Check if error response contains requiresVerification flag
      try {
        const errorObj = JSON.parse(errorMessage);
        if (errorObj.requiresVerification) {
          setError('Please verify your email address before logging in. Check your inbox for the verification email.');
        } else {
          setError(errorMessage);
        }
      } catch {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Castle className="text-amber-600" size={64} />
          </div>
          <h1 className="text-4xl font-bold text-amber-100 tracking-wide mb-2">
            Fantasy Domain Manager
          </h1>
          <p className="text-amber-200/60">Sign in to manage your domains</p>
        </div>

        {/* Login Card */}
        <div className="bg-zinc-900 border-2 border-amber-700/50">
          <div className="border-b-2 border-amber-700/50 bg-zinc-950/50 px-6 py-4">
            <h2 className="text-2xl font-bold text-amber-100">Sign In</h2>
          </div>

          <div className="px-6 py-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {successMessage && (
                <div className="bg-green-900/30 border-2 border-green-700 text-green-200 px-4 py-3">
                  {successMessage}
                </div>
              )}
              {error && (
                <div className="bg-red-900/30 border-2 border-red-700 text-red-200 px-4 py-3">
                  {error}
                </div>
              )}

              {/* Email Field */}
              <div>
                <label className="block text-amber-100 font-semibold mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="text-amber-600" size={20} />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 pl-11 pr-4 py-3 focus:border-amber-600 focus:outline-none"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-amber-100 font-semibold mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="text-amber-600" size={20} />
                  </div>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 pl-11 pr-4 py-3 focus:border-amber-600 focus:outline-none"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 border-2 border-amber-700/50 bg-zinc-800 text-amber-600 focus:ring-amber-600 focus:ring-offset-0"
                  />
                  <span className="ml-2 text-amber-200/80 text-sm">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => router.push('/forgot-password')}
                  className="text-amber-400 hover:text-amber-300 text-sm font-semibold transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-700 hover:bg-amber-600 text-amber-100 py-3 border-2 border-amber-900 font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

              {/* Register Link */}
              <div className="text-center pt-4 border-t-2 border-amber-700/30">
                <p className="text-amber-200/60">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => router.push('/register')}
                    className="text-amber-400 hover:text-amber-300 font-semibold transition-colors"
                  >
                    Create one
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-amber-200/40 text-sm mt-6">
          Secure authentication with JWT
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-amber-200/60">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
