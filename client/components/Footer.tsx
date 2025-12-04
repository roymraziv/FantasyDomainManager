'use client';

import Link from 'next/link';
import { FileText, Shield, Mail, Copyright, Castle } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t-2 border-amber-700/50 bg-zinc-900 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          {/* Brand Section */}
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 text-amber-100 hover:text-amber-500 transition-colors group w-fit"
            >
              <Castle className="h-6 w-6 text-amber-600 group-hover:text-amber-500 transition-colors" />
              <span className="text-lg font-bold">Fantasy Domain Manager</span>
            </Link>
            <p className="text-amber-200/60 text-sm">
              Manage your fantasy domains, heroes, troops, and enterprises
            </p>
          </div>

          {/* Legal Links Section */}
          <div className="flex flex-col gap-3">
            <h3 className="text-amber-100 font-semibold text-lg mb-1">Legal</h3>
            <div className="flex flex-col gap-2">
              <Link
                href="/terms"
                className="flex items-center gap-2 text-amber-200/80 hover:text-amber-500 transition-colors w-fit"
              >
                <FileText className="h-4 w-4" />
                <span>Terms of Use</span>
              </Link>
              <Link
                href="/privacy"
                className="flex items-center gap-2 text-amber-200/80 hover:text-amber-500 transition-colors w-fit"
              >
                <Shield className="h-4 w-4" />
                <span>Privacy Policy</span>
              </Link>
            </div>
          </div>

          {/* Contact Section */}
          <div className="flex flex-col gap-3">
            <h3 className="text-amber-100 font-semibold text-lg mb-1">Contact</h3>
            <Link
              href="/contact"
              className="flex items-center gap-2 text-amber-200/80 hover:text-amber-500 transition-colors w-fit"
            >
              <Mail className="h-4 w-4" />
              <span>Contact Us</span>
            </Link>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t-2 border-amber-700/30 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-amber-200/60 text-sm">
            <Copyright className="h-4 w-4" />
            <span>{currentYear} Fantasy Domain Manager. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

