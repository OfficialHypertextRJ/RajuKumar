'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { FcGoogle } from 'react-icons/fc';
import { FiAlertTriangle } from 'react-icons/fi';
import { isUserAdmin } from '@/lib/adminUtils';

export default function AdminLogin() {
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(false);
  const { loginWithGoogle, logout, currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    async function checkUserAdmin() {
      if (currentUser) {
        setCheckingAdmin(true);
        try {
          const adminStatus = await isUserAdmin(currentUser);
          
          if (adminStatus) {
            router.push('/admin/dashboard');
          } else {
            setError(`Access denied. Only authorized administrators can access this area.`);
            await logout();
          }
        } catch (err) {
          console.error("Error checking admin status:", err);
          setError('An error occurred while checking permissions.');
        } finally {
          setCheckingAdmin(false);
        }
      }
    }

    checkUserAdmin();
  }, [currentUser, router, logout]);

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setGoogleLoading(true);
      await loginWithGoogle();
      // The useEffect above will handle redirection if user is admin
    } catch (err: any) {
      console.error("Google sign-in error:", err);
      
      // More specific error message
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled. Please try again.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Sign-in popup was blocked. Please allow popups for this website.');
      } else {
        setError('Failed to sign in with Google. Please try again later.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0d0d0d] to-[#121212] p-4">
      <div className="w-full max-w-md bg-[#0a0a0a] rounded-lg shadow-xl overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-archivo font-bold text-white">Admin Login</h1>
            <div className="w-16 h-1 bg-[#3bcf9a] mx-auto mt-2"></div>
            <p className="mt-4 text-gray-400">Sign in to access the admin dashboard</p>
          </div>
          
          {error && (
            <div className="bg-red-900/30 border border-red-500 text-red-300 px-4 py-3 rounded mb-6 flex items-start">
              <FiAlertTriangle className="text-red-400 mt-0.5 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign In Button */}
          <div className="mb-6">
            <button
              onClick={handleGoogleSignIn}
              disabled={googleLoading || checkingAdmin}
              className="w-full flex items-center justify-center bg-white text-gray-800 font-medium py-4 px-4 rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3bcf9a] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {googleLoading || checkingAdmin ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {checkingAdmin ? 'Checking permissions...' : 'Signing in...'}
                </span>
              ) : (
                <>
                  <FcGoogle className="w-6 h-6 mr-2" />
                  Sign in with Google
                </>
              )}
            </button>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              This area is restricted to administrators only.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Only authorized email addresses can access the admin panel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 