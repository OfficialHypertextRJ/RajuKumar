'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { logAdminActivity } from '@/lib/adminUtils';

interface AdminActivityLoggerProps {
  action: string;
  details?: any;
  children: React.ReactNode;
}

/**
 * Component that logs admin activity when mounted
 * Wrap any admin action component with this to automatically log the activity
 */
export default function AdminActivityLogger({ 
  action, 
  details = {}, 
  children 
}: AdminActivityLoggerProps) {
  const { currentUser } = useAuth();
  
  useEffect(() => {
    if (currentUser) {
      // Log the admin activity when the component mounts
      logAdminActivity(currentUser.uid, action, {
        ...details,
        timestamp: new Date().toISOString(),
        page: typeof window !== 'undefined' ? window.location.pathname : '',
      });
    }
  }, [currentUser, action, details]);

  // Just render the children - this is a utility component
  return <>{children}</>;
} 