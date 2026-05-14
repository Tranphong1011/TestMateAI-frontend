'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { EnvelopeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { API_URL } from '@/utils/config';

type FormData = { email: string };

type PageState = 'form' | 'sent';

export default function ForgotPasswordPage() {
  const [pageState, setPageState] = useState<PageState>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const { register, handleSubmit } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Something went wrong. Please try again.');
      }
      setSubmittedEmail(data.email);
      setPageState('sent');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: 'url("/background.jpg")' }}
      />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-8">

          {pageState === 'form' ? (
            <>
              <div className="text-center mb-8">
                <div className="mx-auto mb-4 flex items-center justify-center w-14 h-14 rounded-full bg-blue-50">
                  <EnvelopeIcon className="h-7 w-7 text-blue-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900">Forgot password?</h2>
                <p className="mt-2 text-sm text-gray-600">
                  Enter the email address associated with your account and we&apos;ll send you a link to reset your password.
                </p>
              </div>

              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email address
                  </label>
                  <input
                    {...register('email')}
                    id="email"
                    type="email"
                    placeholder="john.doe@tempmail.com"
                    required
                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Sending...' : 'Send reset link'}
                </button>
              </form>
            </>
          ) : (
            /* Success state */
            <div className="text-center">
              <div className="mx-auto mb-4 flex items-center justify-center w-14 h-14 rounded-full bg-green-50">
                <EnvelopeIcon className="h-7 w-7 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Check your email</h2>
              <p className="text-sm text-gray-600 mb-1">
                We sent a password reset link to
              </p>
              <p className="text-sm font-medium text-gray-900 mb-6">{submittedEmail}</p>
              <p className="text-xs text-gray-500 mb-8">
                Didn&apos;t receive the email? Check your spam folder, or{' '}
                <button
                  onClick={() => { setPageState('form'); setError(null); }}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  try again
                </button>
                .
              </p>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Sign In
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
