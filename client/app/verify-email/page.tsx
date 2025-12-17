'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { verifyEmail, resendVerificationEmail } from '@/lib/api';
import { CheckCircle, XCircle, Loader2, Mail, Castle } from 'lucide-react';

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [resending, setResending] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided');
      return;
    }

    const verify = async () => {
      try {
        const response = await verifyEmail(token);
        setStatus('success');
        setMessage(response.message);

        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login?verified=true');
        }, 3000);
      } catch (error) {
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Verification failed');
      }
    };

    verify();
  }, [token, router]);

  const handleResendEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      alert('Please enter your email address');
      return;
    }

    setResending(true);
    try {
      await resendVerificationEmail(email);
      alert('Verification email sent! Please check your inbox.');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to resend email');
    } finally {
      setResending(false);
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
          <p className="text-amber-200/60">Email Verification</p>
        </div>

        {/* Verification Card */}
        <div className="bg-zinc-900 border-2 border-amber-700/50">
          <div className="border-b-2 border-amber-700/50 bg-zinc-950/50 px-6 py-4">
            <h2 className="text-2xl font-bold text-amber-100">
              {status === 'loading' && 'Verifying Email'}
              {status === 'success' && 'Email Verified'}
              {status === 'error' && 'Verification Failed'}
            </h2>
          </div>

          <div className="px-6 py-8 text-center">
            {status === 'loading' && (
              <>
                <Loader2 className="mx-auto h-12 w-12 text-amber-600 animate-spin mb-4" />
                <h2 className="text-2xl font-bold text-amber-100 mb-2">
                  Verifying your email...
                </h2>
                <p className="text-amber-200/80">
                  Please wait while we confirm your email address.
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-4" />
                <h2 className="text-2xl font-bold text-amber-100 mb-2">
                  Email Verified!
                </h2>
                <p className="text-amber-200/80 mb-4">{message}</p>
                <p className="text-sm text-amber-200/50">
                  Redirecting to login page...
                </p>
              </>
            )}

            {status === 'error' && (
              <>
                <XCircle className="mx-auto h-12 w-12 text-red-600 mb-4" />
                <h2 className="text-2xl font-bold text-amber-100 mb-2">
                  Verification Failed
                </h2>
                <p className="text-amber-200/80 mb-6">{message}</p>

                <div className="mt-8 bg-zinc-800 border-2 border-amber-700/50 p-6">
                  <h3 className="text-lg font-medium text-amber-100 mb-4 flex items-center justify-center">
                    <Mail className="mr-2 h-5 w-5 text-amber-600" />
                    Resend Verification Email
                  </h3>
                  <form onSubmit={handleResendEmail} className="space-y-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="text-amber-600" size={20} />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full bg-zinc-900 border-2 border-amber-700/50 text-amber-100 pl-11 pr-4 py-3 focus:border-amber-600 focus:outline-none"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={resending}
                      className="w-full bg-amber-700 hover:bg-amber-600 text-amber-100 py-3 border-2 border-amber-900 font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                    >
                      {resending ? (
                        <>
                          <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                          Sending...
                        </>
                      ) : (
                        'Resend Email'
                      )}
                    </button>
                  </form>
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => router.push('/login')}
                    className="text-amber-400 hover:text-amber-300 font-semibold transition-colors text-sm"
                  >
                    Back to Login
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-amber-200/40 text-sm mt-6">
          Secure email verification
        </p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-amber-200/60">Loading...</div>
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  );
}

