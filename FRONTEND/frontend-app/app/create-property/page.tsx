'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import PropertyForm from '@/components/PropertyForm';
import AuthLayout from '@/components/AuthLayout';
import RoleGuard from '@/components/RoleGuard';
import { UserRole } from '@/lib/types';

export default function CreatePropertyPage() {
  const router = useRouter();
  
  return (
    <AuthLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Create New Property Listing</h1>
        
        <RoleGuard 
          requiredRole={UserRole.AGENT}
          fallback={
            <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md text-center">
              <h2 className="text-xl font-bold text-red-600 mb-4">Access Restricted</h2>
              <p className="mb-6 text-gray-600">
                Only agents and administrators can create property listings.
              </p>
              <p className="mb-6 text-gray-600">
                Please contact the administrator if you need agent privileges.
              </p>
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
              >
                Back to Dashboard
              </button>
            </div>
          }
        >
          <PropertyForm />
        </RoleGuard>
      </div>
    </AuthLayout>
  );
}