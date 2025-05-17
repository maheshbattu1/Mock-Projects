'use client';

import React, { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, hasRequiredRole } from '@/lib/auth';
import { UserRole } from '@/lib/types';

interface RoleGuardProps {
  children: ReactNode;
  requiredRole: UserRole;
  redirectTo?: string;
}

/**
 * A component that restricts access based on user role
 * 
 * @param children - The content to render if the user has the required role
 * @param requiredRole - The minimum role required to access the content
 * @param redirectTo - The path to redirect to if the user doesn't have the required role
 */
export default function RoleGuard({ 
  children, 
  requiredRole, 
  redirectTo = '/dashboard' 
}: RoleGuardProps) {
  const router = useRouter();
  const user = getUser();

  useEffect(() => {
    // If no user is logged in, redirect to login
    if (!user) {
      router.push('/login');
      return;
    }

    // Check if user has the required role
    if (!hasRequiredRole(user, requiredRole)) {
      router.push(redirectTo);
    }
  }, [user, requiredRole, redirectTo, router]);

  // If no user or user doesn't have the required role, render nothing
  if (!user || !hasRequiredRole(user, requiredRole)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  // User has the required role, render the children
  return <>{children}</>;
}