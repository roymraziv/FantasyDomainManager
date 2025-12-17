'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Castle, Mail, Lock, User } from 'lucide-react';
import { authApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successEmail, setSuccessEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      // Call the register API
      const response = await authApi.register({
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password,
      });

      // Show success message instead of auto-login
      setSuccess(true);
      setSuccessEmail(formData.email);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-zinc-900 border-2 border-amber-700/50">
            <div className="border-b-2 border-amber-700/50 bg-zinc-950/50 px-6 py-4">
              <h2 className="text-2xl font-bold text-amber-100">Check Your Email</h2>
            </div>
            <div className="px-6 py-8 text-center">
              <Mail className="mx-auto h-12 w-12 text-amber-600 mb-4" />
              <h2 className="text-2xl font-bold text-amber-100 mb-2">
                Verification Email Sent
              </h2>
              <p className="text-amber-200/80 mb-6">
                We've sent a verification email to <strong className="text-amber-400">{successEmail}</strong>.
                Please click the link in the email to activate your account.
              </p>
              <p className="text-sm text-amber-200/50 mb-6">
                Didn't receive an email? Check your spam folder.
              </p>
              <button
                onClick={() => router.push('/login')}
                className="w-full bg-amber-700 hover:bg-amber-600 text-amber-100 py-3 border-2 border-amber-900 font-bold text-lg transition-all"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          <p className="text-amber-200/60">Create your account to begin</p>
        </div>

        {/* Register Card */}
        <div className="bg-zinc-900 border-2 border-amber-700/50">
          <div className="border-b-2 border-amber-700/50 bg-zinc-950/50 px-6 py-4">
            <h2 className="text-2xl font-bold text-amber-100">Create Account</h2>
          </div>

          <div className="px-6 py-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-900/30 border-2 border-red-700 text-red-200 px-4 py-3">
                  {error}
                </div>
              )}

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-amber-100 font-semibold mb-2">
                    First Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="text-amber-600" size={20} />
                    </div>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 pl-11 pr-4 py-3 focus:border-amber-600 focus:outline-none"
                      placeholder="First name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-amber-100 font-semibold mb-2">
                    Last Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="text-amber-600" size={20} />
                    </div>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 pl-11 pr-4 py-3 focus:border-amber-600 focus:outline-none"
                      placeholder="Last name"
                      required
                    />
                  </div>
                </div>
              </div>

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
                    placeholder="Minimum 8 characters"
                    required
                  />
                </div>
                <p className="text-amber-200/50 text-xs mt-1">
                  Must be at least 8 characters with uppercase, lowercase, digit, and special character
                </p>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-amber-100 font-semibold mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="text-amber-600" size={20} />
                  </div>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 pl-11 pr-4 py-3 focus:border-amber-600 focus:outline-none"
                    placeholder="Re-enter password"
                    required
                  />
                </div>
              </div>

              {/* Terms Checkbox */}
              <div>
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    className="w-4 h-4 mt-1 border-2 border-amber-700/50 bg-zinc-800 text-amber-600 focus:ring-amber-600 focus:ring-offset-0"
                    required
                  />
                  <span className="ml-2 text-amber-200/80 text-sm">
                    I agree to the Terms of Service and Privacy Policy
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-700 hover:bg-amber-600 text-amber-100 py-3 border-2 border-amber-900 font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>

              {/* Login Link */}
              <div className="text-center pt-4 border-t-2 border-amber-700/30">
                <p className="text-amber-200/60">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => router.push('/login')}
                    className="text-amber-400 hover:text-amber-300 font-semibold transition-colors"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-amber-200/40 text-sm mt-6">
          Secure registration with JWT authentication
        </p>
      </div>
    </div>
  );
}
