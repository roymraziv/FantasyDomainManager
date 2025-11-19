'use client';

import { useRouter } from 'next/navigation';
import { Castle, ArrowLeft, Shield, Lock, Eye, Database, UserCheck } from 'lucide-react';

export default function PrivacyPolicyPage() {
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
                Privacy Policy
              </h1>
              <p className="text-amber-200/60">Last updated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-zinc-900 border-2 border-amber-700/50">
          <div className="border-b-2 border-amber-700/50 bg-zinc-950/50 px-6 py-4">
            <h2 className="text-2xl font-bold text-amber-100">Your Privacy Matters</h2>
          </div>

          <div className="px-6 py-6 space-y-6">
            {/* Introduction */}
            <section>
              <div className="flex items-start gap-3 mb-3">
                <Shield className="text-amber-600 flex-shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="text-xl font-bold text-amber-100 mb-2">1. Introduction</h3>
                  <p className="text-amber-200/80 leading-relaxed">
                    Fantasy Domain Manager ("we", "our", or "us") is committed to protecting your privacy.
                    This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.
                  </p>
                </div>
              </div>
            </section>

            {/* Information We Collect */}
            <section className="border-t-2 border-amber-700/30 pt-6">
              <div className="flex items-start gap-3 mb-3">
                <Database className="text-amber-600 flex-shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="text-xl font-bold text-amber-100 mb-2">2. Information We Collect</h3>
                  <div className="text-amber-200/80 leading-relaxed space-y-4">
                    <div>
                      <p className="font-semibold text-amber-100 mb-2">Personal Information</p>
                      <p className="mb-2">When you register for an account, we collect:</p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>First name and last name</li>
                        <li>Email address</li>
                        <li>Username</li>
                        <li>Password (encrypted)</li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-semibold text-amber-100 mb-2">Domain and Content Data</p>
                      <p className="mb-2">When you use our service, we collect:</p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Domain information (names, rulers, population, etc.)</li>
                        <li>Heroes, troops, and enterprises data</li>
                        <li>Notes and custom content you create</li>
                        <li>Financial data (income, upkeep information)</li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-semibold text-amber-100 mb-2">Usage Information</p>
                      <p className="mb-2">We automatically collect certain information:</p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>IP address and browser type</li>
                        <li>Device information</li>
                        <li>Usage patterns and interactions with the service</li>
                        <li>Log data and analytics</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* How We Use Your Information */}
            <section className="border-t-2 border-amber-700/30 pt-6">
              <div className="flex items-start gap-3 mb-3">
                <UserCheck className="text-amber-600 flex-shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="text-xl font-bold text-amber-100 mb-2">3. How We Use Your Information</h3>
                  <div className="text-amber-200/80 leading-relaxed space-y-3">
                    <p>We use the information we collect to:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Provide, maintain, and improve our service</li>
                      <li>Create and manage your account</li>
                      <li>Store and display your domain management data</li>
                      <li>Communicate with you about service updates and support</li>
                      <li>Monitor and analyze usage patterns to improve user experience</li>
                      <li>Detect, prevent, and address technical issues</li>
                      <li>Protect against fraudulent or unauthorized activity</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Data Security */}
            <section className="border-t-2 border-amber-700/30 pt-6">
              <div className="flex items-start gap-3 mb-3">
                <Lock className="text-amber-600 flex-shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="text-xl font-bold text-amber-100 mb-2">4. Data Security</h3>
                  <div className="text-amber-200/80 leading-relaxed space-y-3">
                    <p>
                      We implement appropriate technical and organizational security measures to protect your personal information:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Passwords are encrypted using industry-standard hashing algorithms</li>
                      <li>Data is transmitted over secure HTTPS connections</li>
                      <li>Access to user data is restricted to authorized personnel only</li>
                      <li>Regular security audits and updates</li>
                    </ul>
                    <p className="text-amber-100 font-semibold mt-3">
                      However, no method of transmission over the Internet is 100% secure. While we strive to protect
                      your personal information, we cannot guarantee absolute security.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Data Sharing */}
            <section className="border-t-2 border-amber-700/30 pt-6">
              <div className="flex items-start gap-3 mb-3">
                <Eye className="text-amber-600 flex-shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="text-xl font-bold text-amber-100 mb-2">5. Information Sharing and Disclosure</h3>
                  <div className="text-amber-200/80 leading-relaxed space-y-3">
                    <p className="text-amber-100 font-semibold">
                      We do not sell, trade, or rent your personal information to third parties.
                    </p>
                    <p>We may share your information only in the following circumstances:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>With your explicit consent</li>
                      <li>To comply with legal obligations or court orders</li>
                      <li>To protect our rights, privacy, safety, or property</li>
                      <li>In connection with a merger, acquisition, or sale of assets</li>
                      <li>With service providers who assist in operating our service (under strict confidentiality agreements)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Your Rights */}
            <section className="border-t-2 border-amber-700/30 pt-6">
              <h3 className="text-xl font-bold text-amber-100 mb-3">6. Your Rights</h3>
              <div className="text-amber-200/80 leading-relaxed space-y-3">
                <p>You have the right to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><span className="font-semibold text-amber-100">Access:</span> Request a copy of your personal data</li>
                  <li><span className="font-semibold text-amber-100">Rectification:</span> Correct any inaccurate or incomplete data</li>
                  <li><span className="font-semibold text-amber-100">Deletion:</span> Request deletion of your account and associated data</li>
                  <li><span className="font-semibold text-amber-100">Data Portability:</span> Request your data in a portable format</li>
                  <li><span className="font-semibold text-amber-100">Withdraw Consent:</span> Withdraw consent for data processing at any time</li>
                </ul>
                <p className="mt-3">
                  To exercise these rights, please contact us at{' '}
                  <span className="text-amber-400 font-semibold">privacy@fantasydomainmanager.com</span>
                </p>
              </div>
            </section>

            {/* Data Retention */}
            <section className="border-t-2 border-amber-700/30 pt-6">
              <h3 className="text-xl font-bold text-amber-100 mb-3">7. Data Retention</h3>
              <div className="text-amber-200/80 leading-relaxed space-y-3">
                <p>
                  We retain your personal information for as long as your account is active or as needed to provide you services.
                </p>
                <p>
                  If you close your account, we will delete or anonymize your data within 90 days, unless we are required
                  to retain it for legal or regulatory purposes.
                </p>
              </div>
            </section>

            {/* Children's Privacy */}
            <section className="border-t-2 border-amber-700/30 pt-6">
              <h3 className="text-xl font-bold text-amber-100 mb-3">8. Children's Privacy</h3>
              <div className="text-amber-200/80 leading-relaxed space-y-3">
                <p>
                  Our service is not intended for children under 13 years of age. We do not knowingly collect personal
                  information from children under 13.
                </p>
                <p>
                  If you are a parent or guardian and believe your child has provided us with personal information,
                  please contact us immediately.
                </p>
              </div>
            </section>

            {/* Cookies */}
            <section className="border-t-2 border-amber-700/30 pt-6">
              <h3 className="text-xl font-bold text-amber-100 mb-3">9. Cookies and Tracking</h3>
              <div className="text-amber-200/80 leading-relaxed space-y-3">
                <p>
                  We use cookies and similar tracking technologies to track activity on our service and store certain information.
                </p>
                <p>
                  You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                  However, some parts of our service may not function properly without cookies.
                </p>
              </div>
            </section>

            {/* Changes to Privacy Policy */}
            <section className="border-t-2 border-amber-700/30 pt-6">
              <h3 className="text-xl font-bold text-amber-100 mb-3">10. Changes to This Privacy Policy</h3>
              <div className="text-amber-200/80 leading-relaxed space-y-3">
                <p>
                  We may update our Privacy Policy from time to time. We will notify you of any changes by posting the
                  new Privacy Policy on this page and updating the "Last updated" date.
                </p>
                <p>
                  You are advised to review this Privacy Policy periodically for any changes. Changes are effective when
                  posted on this page.
                </p>
              </div>
            </section>

            {/* Contact */}
            <section className="border-t-2 border-amber-700/30 pt-6">
              <h3 className="text-xl font-bold text-amber-100 mb-3">11. Contact Us</h3>
              <p className="text-amber-200/80 leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us at:{' '}
                <span className="text-amber-400 font-semibold">privacy@fantasydomainmanager.com</span>
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
