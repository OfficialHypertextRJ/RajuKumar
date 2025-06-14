'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import LoadingSpinner from './LoadingSpinner';
import { isUserAdmin } from '@/lib/adminUtils';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAdminStatus() {
      if (currentUser) {
        try {
          // Force token refresh to ensure we have the latest claims
          await currentUser.getIdToken(true);
          const adminStatus = await isUserAdmin(currentUser);
          setIsAdmin(adminStatus);
          
          // If not an admin, redirect to login
          if (!adminStatus) {
            console.warn('User is not an admin. Redirecting to login page.');
            router.push('/admin/login');
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
          router.push('/admin/login');
        }
      }
      setCheckingAdmin(false);
    }

    if (!loading) {
      if (!currentUser) {
        console.log('No user logged in. Redirecting to login page.');
        router.push('/admin/login');
      } else {
        checkAdminStatus();
      }
    }
  }, [currentUser, loading, router]);

  if (loading || checkingAdmin) {
    return <LoadingSpinner />;
  }

  // Only render children if user is authenticated and is an admin
  return currentUser && isAdmin ? <>{children}</> : null;
} 