'use client';

import { useState, useEffect, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { EyeIcon, EyeSlashIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { API_URL } from '@/utils/config';

type FormData = {
  newPassword: string;
  confirmPassword: string;
};

type PageState = 'form' | 'success' | 'invalid_token';

function ResetPasswordContent() {
  const [pageState, setPageState] = useState<PageState>('form');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordMismatch, setPasswordMismatch] = useState(false);

  const { register, handleSubmit } = useForm<FormData>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get('token') ?? null;

  useEffect(() => {
    if (!token) setPageState('invalid_token');
  }, [token]);

  const onSubmit = async (data: FormData) => {
    if (data.newPassword !== data.confirmPassword) {
      setPasswordMismatch(true);
      return;
    }
    setPasswordMismatch(false);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: data.newPassword }),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (body.error === 'invalid_or_expired_token') {
          setPageState('invalid_token');
          return;
        }
        throw new Error(body.error || 'Something went wrong. Please try again.');
      }

      setPageState('success');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const background = (
    <div
      className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
      style={{ backgroundImage: 'url("/background.jpg")' }}
    />
  );

  /* ── Success ── */
  if (pageState === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        {background}
        <div className="w-full max-w-md relative z-10">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-8 text-center">
            <div className="mx-auto mb-4 flex items-center justify-center w-14 h-14 rounded-full bg-green-50">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Password reset!</h2>
            <p className="text-sm text-gray-600 mb-8">
              Your password has been reset successfully. You can now sign in with your new password.
            </p>
            <button
              onClick={() => router.push('/login')}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Invalid / expired token ── */
  if (pageState === 'invalid_token') {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        {background}
        <div className="w-full max-w-md relative z-10">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-8 text-center">
            <div className="mx-auto mb-4 flex items-center justify-center w-14 h-14 rounded-full bg-red-50">
              <ExclamationCircleIcon className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Link expired or invalid</h2>
            <p className="text-sm text-gray-600 mb-8">
              This password reset link has expired or is invalid. Reset links are only valid for 1 hour.
            </p>
            <Link
              href="/forgot-password"
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Request a new link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── Form ── */
  return (
    <div className="min-h-screen flex items-center justify-center relative">
      {background}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900">Set new password</h2>
            <p className="mt-2 text-sm text-gray-600">
              Your new password must be at least 6 characters.
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          {passwordMismatch && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              Passwords do not match.
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                New password
              </label>
              <div className="relative">
                <input
                  {...register('newPassword', {
                    onChange: () => { setError(null); setPasswordMismatch(false); },
                  })}
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="New password"
                  required
                  minLength={6}
                  className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {showPassword
                    ? <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    : <EyeIcon className="h-5 w-5 text-gray-400" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm new password
              </label>
              <div className="relative">
                <input
                  {...register('confirmPassword', {
                    onChange: () => { setError(null); setPasswordMismatch(false); },
                  })}
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  required
                  className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-shadow ${
                    passwordMismatch
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {showConfirm
                    ? <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    : <EyeIcon className="h-5 w-5 text-gray-400" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}
