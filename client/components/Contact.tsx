'use client';

import { useRef, useState } from 'react';

export default function Contact() {
  const form = useRef<HTMLFormElement>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const sendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!form.current) {
      setError('Form reference not available');
      setLoading(false);
      return;
    }

    const formData = new FormData(form.current);
    console.log('Form Data:', Object.fromEntries(formData.entries()));

    try {
      const response = await fetch('https://sjh6tr29bk.execute-api.us-east-1.amazonaws.com/prod/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'jd&,T}Y02p=h7j.txQnmi=CfK-Tp?Z',
          'x-form-type': 'contact',
        },
        body: JSON.stringify({
          clientId: 'client1',
          ...Object.fromEntries(formData.entries()),
        }),
      });

      if (response.status !== 200) {
        setError('Something went wrong. Please try again later.');
        setLoading(false);
        return { success: false };
      }

      const data = await response.json();
      form.current.reset();
      setLoading(false);
      setIsSubmitted(true);
      return data;
    } catch (error) {
      console.error('Error:', error);
      setError('Something went wrong. Please try again later.');
      setLoading(false);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  return (
    <section id="contact-page" className="w-full max-w-2xl mx-auto">
      <h2 className="text-4xl font-bold text-amber-100 mb-4 text-center">Contact Me</h2>
      <p className="text-amber-200/80 text-center mb-8">Please fill out to reach me!</p>

      {isSubmitted ? (
        <div className="bg-zinc-900 border-2 border-amber-700/50 p-8 text-center">
          <h3 className="text-2xl font-bold text-amber-100 mb-4">Thank You!</h3>
          <p className="text-amber-200/80 leading-relaxed">
            Your message has been sent successfully. I'll get back to you soon!
          </p>
        </div>
      ) : (
        <form
          ref={form}
          onSubmit={sendEmail}
          className="bg-zinc-900 border-2 border-amber-700/50 p-8 space-y-6 relative"
        >
          {loading && (
            <div className="absolute inset-0 bg-zinc-900/80 flex items-center justify-center z-10">
              <div className="w-12 h-12 border-4 border-amber-700/50 border-t-amber-600 rounded-full animate-spin"></div>
            </div>
          )}

          <input
            type="text"
            className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 px-4 py-3 focus:border-amber-600 focus:outline-none"
            placeholder="Your Name"
            name="name"
            disabled={loading}
            required
          />

          <input
            type="email"
            className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 px-4 py-3 focus:border-amber-600 focus:outline-none"
            placeholder="Your Email"
            name="email"
            disabled={loading}
            required
          />

          <textarea
            name="message"
            rows={7}
            className="w-full bg-zinc-800 border-2 border-amber-700/50 text-amber-100 px-4 py-3 focus:border-amber-600 focus:outline-none resize-none"
            placeholder="Your Message"
            disabled={loading}
            required
          />

          {error && (
            <div className="bg-red-900/30 border-2 border-red-700 text-red-200 px-4 py-3">
              {error}
            </div>
          )}

          <button
            className="w-full bg-amber-700 hover:bg-amber-600 text-amber-100 py-3 border-2 border-amber-900 font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      )}
    </section>
  );
}

