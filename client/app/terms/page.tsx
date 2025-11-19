'use client';

import { useRouter } from 'next/navigation';
import { Castle, ArrowLeft, Shield, FileText, Scale } from 'lucide-react';

export default function TermsOfServicePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-amber-100 hover:text-amber-400 mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            Back
          </button>

          <div className="flex items-center gap-4 mb-4">
            <Castle className="text-amber-600" size={48} />
            <div>
              <h1 className="text-4xl font-bold text-amber-100 tracking-wide">
                Terms of Service
              </h1>
              <p className="text-amber-200/60">Last updated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-zinc-900 border-2 border-amber-700/50">
          <div className="border-b-2 border-amber-700/50 bg-zinc-950/50 px-6 py-4">
            <h2 className="text-2xl font-bold text-amber-100">Terms and Conditions</h2>
          </div>

          <div className="px-6 py-6 space-y-6">
            {/* Introduction */}
            <section>
              <div className="flex items-start gap-3 mb-3">
                <FileText className="text-amber-600 flex-shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="text-xl font-bold text-amber-100 mb-2">1. Introduction</h3>
                  <p className="text-amber-200/80 leading-relaxed">
                    Welcome to Fantasy Domain Manager. By accessing or using our application, you agree to be bound by these Terms of Service.
                    If you do not agree to these terms, please do not use our service.
                  </p>
                </div>
              </div>
            </section>

            {/* Use of Service */}
            <section className="border-t-2 border-amber-700/30 pt-6">
              <div className="flex items-start gap-3 mb-3">
                <Shield className="text-amber-600 flex-shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="text-xl font-bold text-amber-100 mb-2">2. Use of Service</h3>
                  <div className="text-amber-200/80 leading-relaxed space-y-3">
                    <p>You agree to use Fantasy Domain Manager only for lawful purposes and in accordance with these Terms.</p>
                    <p className="font-semibold text-amber-100">You agree NOT to:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Use the service in any way that violates any applicable law or regulation</li>
                      <li>Attempt to gain unauthorized access to any part of the service</li>
                      <li>Interfere with or disrupt the service or servers</li>
                      <li>Impersonate any person or entity</li>
                      <li>Upload or transmit viruses or malicious code</li>
                      <li>Collect or harvest any information from other users</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* User Accounts */}
            <section className="border-t-2 border-amber-700/30 pt-6">
              <h3 className="text-xl font-bold text-amber-100 mb-3">3. User Accounts</h3>
              <div className="text-amber-200/80 leading-relaxed space-y-3">
                <p>
                  When you create an account with us, you must provide accurate, complete, and current information.
                  Failure to do so constitutes a breach of the Terms.
                </p>
                <p>
                  You are responsible for safeguarding the password you use to access the service and for any activities
                  or actions under your password.
                </p>
                <p className="text-amber-100 font-semibold">
                  You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
                </p>
              </div>
            </section>

            {/* User Content */}
            <section className="border-t-2 border-amber-700/30 pt-6">
              <h3 className="text-xl font-bold text-amber-100 mb-3">4. User Content</h3>
              <div className="text-amber-200/80 leading-relaxed space-y-3">
                <p>
                  You retain all rights to any content you submit, post, or display on or through the service.
                  By submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use,
                  reproduce, and display such content solely for the purpose of providing the service.
                </p>
                <p>
                  You are solely responsible for your content and the consequences of posting or publishing it.
                </p>
              </div>
            </section>

            {/* Intellectual Property */}
            <section className="border-t-2 border-amber-700/30 pt-6">
              <div className="flex items-start gap-3 mb-3">
                <Scale className="text-amber-600 flex-shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="text-xl font-bold text-amber-100 mb-2">5. Intellectual Property</h3>
                  <div className="text-amber-200/80 leading-relaxed space-y-3">
                    <p>
                      The service and its original content, features, and functionality are and will remain the exclusive
                      property of Fantasy Domain Manager and its licensors.
                    </p>
                    <p>
                      The service is protected by copyright, trademark, and other laws. Our trademarks may not be used in
                      connection with any product or service without our prior written consent.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Termination */}
            <section className="border-t-2 border-amber-700/30 pt-6">
              <h3 className="text-xl font-bold text-amber-100 mb-3">6. Termination</h3>
              <div className="text-amber-200/80 leading-relaxed space-y-3">
                <p>
                  We may terminate or suspend your account immediately, without prior notice or liability, for any reason,
                  including without limitation if you breach the Terms.
                </p>
                <p>
                  Upon termination, your right to use the service will immediately cease. All provisions of the Terms which
                  by their nature should survive termination shall survive.
                </p>
              </div>
            </section>

            {/* Disclaimer */}
            <section className="border-t-2 border-amber-700/30 pt-6">
              <h3 className="text-xl font-bold text-amber-100 mb-3">7. Disclaimer</h3>
              <div className="text-amber-200/80 leading-relaxed space-y-3">
                <p className="uppercase font-semibold text-amber-100">
                  The service is provided "AS IS" and "AS AVAILABLE" without warranties of any kind.
                </p>
                <p>
                  We do not warrant that the service will be uninterrupted, secure, or error-free. We do not warrant
                  the accuracy or reliability of any content obtained through the service.
                </p>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section className="border-t-2 border-amber-700/30 pt-6">
              <h3 className="text-xl font-bold text-amber-100 mb-3">8. Limitation of Liability</h3>
              <div className="text-amber-200/80 leading-relaxed space-y-3">
                <p>
                  In no event shall Fantasy Domain Manager, its directors, employees, or agents be liable for any
                  indirect, incidental, special, consequential, or punitive damages arising out of your use of the service.
                </p>
              </div>
            </section>

            {/* Changes to Terms */}
            <section className="border-t-2 border-amber-700/30 pt-6">
              <h3 className="text-xl font-bold text-amber-100 mb-3">9. Changes to Terms</h3>
              <div className="text-amber-200/80 leading-relaxed space-y-3">
                <p>
                  We reserve the right to modify or replace these Terms at any time. If a revision is material, we will
                  provide at least 30 days' notice prior to any new terms taking effect.
                </p>
                <p>
                  By continuing to access or use our service after revisions become effective, you agree to be bound by
                  the revised terms.
                </p>
              </div>
            </section>

            {/* Contact */}
            <section className="border-t-2 border-amber-700/30 pt-6">
              <h3 className="text-xl font-bold text-amber-100 mb-3">10. Contact Us</h3>
              <p className="text-amber-200/80 leading-relaxed">
                If you have any questions about these Terms, please contact us at:{' '}
                <span className="text-amber-400 font-semibold">support@fantasydomainmanager.com</span>
              </p>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/register')}
            className="text-amber-400 hover:text-amber-300 font-semibold transition-colors"
          >
            Return to Registration
          </button>
        </div>
      </div>
    </div>
  );
}
