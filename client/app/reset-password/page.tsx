'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { resetPassword, validateResetToken } from '@/lib/api';
import { CheckCircle, XCircle, Loader2, Lock, Castle } from 'lucide-react';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setValidatingToken(false);
      setTokenValid(false);
      setError('No reset token provided');
      return;
    }

    const validate = async () => {
      try {
        await validateResetToken(token);
        setTokenValid(true);
      } catch (err) {
        setTokenValid(false);
        setError(err instanceof Error ? err.message : 'Invalid or expired token');
      } finally {
        setValidatingToken(false);
      }
    };

    validate();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await resetPassword(token!, newPassword, confirmPassword);
      setSuccess(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login?reset=true');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  if (validatingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-zinc-900 border-2 border-amber-700/50">
            <div className="px-6 py-8 text-center">
              <Loader2 className="mx-auto h-12 w-12 text-amber-600 animate-spin mb-4" />
              <p className="text-amber-200/80">Validating reset link...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-zinc-900 border-2 border-amber-700/50">
            <div className="border-b-2 border-amber-700/50 bg-zinc-950/50 px-6 py-4">
              <h2 className="text-2xl font-bold text-amber-100">Invalid Reset Link</h2>
            </div>
            <div className="px-6 py-8 text-center">
              <XCircle className="mx-auto h-12 w-12 text-red-600 mb-4" />
              <p className="text-amber-200/80 mb-6">{error}</p>
              <button
                onClick={() => router.push('/forgot-password')}
                className="w-full bg-amber-700 hover:bg-amber-600 text-amber-100 py-3 border-2 border-amber-900 font-bold text-lg transition-all"
              >
                Request New Reset Link
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-zinc-900 border-2 border-amber-700/50">
            <div className="border-b-2 border-amber-700/50 bg-zinc-950/50 px-6 py-4">
              <h2 className="text-2xl font-bold text-amber-100">Password Reset Successful!</h2>
            </div>
            <div className="px-6 py-8 text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-4" />
              <p className="text-amber-200/80 mb-4">
                Your password has been updated successfully.
              </p>
              <p className="text-sm text-amber-200/50">
                Redirecting to login page...
              </p>
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

        {/* Reset Password Card */}
        <div className="bg-zinc-900 border-2 border-amber-700/50">
          <div className="border-b-2 border-amber-700/50 bg-zinc-950/50 px-6 py-4">
            <h2 className="text-2xl font-bold text-amber-100">Reset Your Password</h2>
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
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="text-amber-600" size={20} />
                  </div>
                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 pl-11 pr-4 py-3 focus:border-amber-600 focus:outline-none"
                    required
                    minLength={8}
                  />
                </div>
                <p className="text-amber-200/50 text-xs mt-1">
                  Must be at least 8 characters with uppercase, lowercase, digit, and special character
                </p>
              </div>

              <div>
                <label className="block text-amber-100 font-semibold mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="text-amber-600" size={20} />
                  </div>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 pl-11 pr-4 py-3 focus:border-amber-600 focus:outline-none"
                    required
                    minLength={8}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-700 hover:bg-amber-600 text-amber-100 py-3 border-2 border-amber-900 font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Resetting Password...
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-amber-200/40 text-sm mt-6">
          Secure password reset with token verification
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-amber-200/60">Loading...</div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}

