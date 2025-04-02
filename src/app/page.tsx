'use client'
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store'; // Adjust the import based on your store structure

const RedirectToLogin = () => {
  const router = useRouter();
  const isLoggedIn = useSelector((state: RootState) => state.auth.token); // Adjust based on your auth state

  useEffect(() => {
    if (isLoggedIn) {
      router.push('/dashboard/my-projects');
    } else {
      router.push('/login');
    }
  }, [isLoggedIn, router]);

  return null; // Render nothing while redirecting
};

export default RedirectToLogin;