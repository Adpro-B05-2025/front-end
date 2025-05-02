// components/ProtectedRoute.js
'use client';

import { useAuth } from '@/context/AuthProvider';
import { hasPermission } from '@/utils/permissions';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

export default function ProtectedRoute({ 
  children, 
  action,
  resourceId = null,
  fallbackPath = '/login'
}) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Check authentication first
    if (!loading) {
      if (!isAuthenticated) {
        // Redirect to login
        toast.error('Please log in to access this page');
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }
      
      // If action is provided, check permissions
      if (action) {
        const permitted = hasPermission(user, action, resourceId);
        setAuthorized(permitted);
        
        if (!permitted) {
          toast.error('You do not have permission to access this page');
          router.push(fallbackPath);
        }
      } else {
        // If no action needed, just authenticate
        setAuthorized(true);
      }
    }
  }, [loading, isAuthenticated, user, action, resourceId, router, pathname, fallbackPath]);

  // Show loading state
  if (loading || !authorized) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  // If authorized, render children
  return children;
}