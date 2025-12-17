'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { forgotPassword } from '@/lib/api';
import { Mail, Loader2, ArrowLeft, Castle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
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
                Reset Link Sent
              </h2>
              <p className="text-amber-200/80 mb-6">
                If an account exists for <strong className="text-amber-400">{email}</strong>, you will receive a password reset email shortly.
              </p>
              <p className="text-sm text-amber-200/50 mb-6">
                Didn't receive an email? Check your spam folder or try again.
              </p>
              <button
                onClick={() => router.push('/login')}
                className="w-full bg-amber-700 hover:bg-amber-600 text-amber-100 py-3 border-2 border-amber-900 font-bold text-lg transition-all flex justify-center items-center"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
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
          <p className="text-amber-200/60">Reset your password</p>
        </div>

        {/* Forgot Password Card */}
        <div className="bg-zinc-900 border-2 border-amber-700/50">
          <div className="border-b-2 border-amber-700/50 bg-zinc-950/50 px-6 py-4">
            <h2 className="text-2xl font-bold text-amber-100">Forgot Password?</h2>
          </div>

          <div className="px-6 py-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-900/30 border-2 border-red-700 text-red-200 px-4 py-3">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-amber-100 font-semibold mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="text-amber-600" size={20} />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 pl-11 pr-4 py-3 focus:border-amber-600 focus:outline-none"
                    required
                  />
                </div>
                <p className="text-amber-200/50 text-xs mt-1">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-700 hover:bg-amber-600 text-amber-100 py-3 border-2 border-amber-900 font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>

              <div className="text-center pt-4 border-t-2 border-amber-700/30">
                <Link
                  href="/login"
                  className="text-amber-400 hover:text-amber-300 font-semibold transition-colors text-sm flex items-center justify-center"
                >
                  <ArrowLeft className="mr-1 h-3 w-3" />
                  Back to Login
                </Link>
              </div>
            </form>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-amber-200/40 text-sm mt-6">
          Secure password reset with email verification
        </p>
      </div>
    </div>
  );
}

