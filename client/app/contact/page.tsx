'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail } from 'lucide-react';
import Contact from '@/components/Contact';

export default function ContactPage() {
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
            <Mail className="text-amber-600" size={48} />
            <div>
              <h1 className="text-4xl font-bold text-amber-100 tracking-wide">
                Contact Us
              </h1>
              <p className="text-amber-200/60">Get in touch with us</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <Contact />
      </div>
    </div>
  );
}

