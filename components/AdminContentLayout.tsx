'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import ProtectedRoute from './ProtectedRoute';
import { FiArrowLeft, FiLogOut, FiUser } from 'react-icons/fi';
import { useEffect } from 'react';
import { logAdminActivity } from '@/lib/adminUtils';

interface AdminContentLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export default function AdminContentLayout({ children, title, description }: AdminContentLayoutProps) {
  const { logout, currentUser } = useAuth();
  const router = useRouter();
  
  // Log page visit
  useEffect(() => {
    if (currentUser) {
      logAdminActivity(currentUser.uid, 'page_visit', {
        page: title,
        path: typeof window !== 'undefined' ? window.location.pathname : ''
      });
    }
  }, [currentUser, title]);
  
  const handleLogout = async () => {
    try {
      if (currentUser) {
        await logAdminActivity(currentUser.uid, 'logout', {
          timestamp: new Date().toISOString()
        });
      }
      await logout();
      router.push('/admin/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-[#0d0d0d] to-[#121212]">
        {/* Admin Header */}
        <header className="bg-[#0a0a0a] border-b border-[#222] shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-archivo font-bold text-white">Raju Kumar Portfolio Admin</h1>
            <div className="flex items-center gap-4">
              {currentUser && (
                <div className="flex items-center text-sm text-gray-300">
                  {currentUser.photoURL ? (
                    <Image 
                      src={currentUser.photoURL} 
                      alt={currentUser.displayName || 'Admin'} 
                      width={32} 
                      height={32} 
                      className="rounded-full mr-2" 
                    />
                  ) : (
                    <FiUser className="w-8 h-8 p-1 rounded-full bg-gray-700 mr-2" />
                  )}
                  <span className="hidden md:inline">{currentUser.displayName || currentUser.email}</span>
                </div>
              )}
              <button 
                onClick={handleLogout}
                className="flex items-center px-4 py-2 bg-[#1a1a1a] hover:bg-[#222] text-white rounded-md transition-colors"
              >
                <FiLogOut className="mr-2" />
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="mb-8">
            <Link 
              href="/admin/dashboard" 
              className="inline-flex items-center text-gray-400 hover:text-white mb-4"
            >
              <FiArrowLeft className="mr-2" />
              Back to Dashboard
            </Link>
            <h2 className="text-3xl font-archivo font-bold text-white">{title}</h2>
            {description && <p className="text-gray-400 mt-2">{description}</p>}
          </div>

          <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-6">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
} 