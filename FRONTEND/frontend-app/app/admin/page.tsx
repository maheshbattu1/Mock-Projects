'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, Building, Settings, Activity, HelpCircle, Home } from 'lucide-react';
import RoleGuard from '@/components/RoleGuard';
import { UserRole } from '@/lib/types';
import AuthLayout from '@/components/AuthLayout';

export default function AdminDashboard() {
  const router = useRouter();
  
  // Admin panels/cards to display
  const adminPanels = [
    {
      title: 'User Management',
      description: 'Manage users, change roles, and monitor activity.',
      icon: <Users size={40} className="text-blue-500" />,
      link: '/admin/users',
      color: 'bg-blue-100'
    },
    {
      title: 'Property Management',
      description: 'Moderate property listings, set featured properties.',
      icon: <Building size={40} className="text-green-500" />,
      link: '/admin/properties',
      color: 'bg-green-100'
    },
    {
      title: 'Site Settings',
      description: 'Configure site settings and appearance.',
      icon: <Settings size={40} className="text-purple-500" />,
      link: '/admin/settings',
      color: 'bg-purple-100'
    },
    {
      title: 'Analytics & Reports',
      description: 'View site statistics and generate reports.',
      icon: <Activity size={40} className="text-orange-500" />,
      link: '/admin/analytics',
      color: 'bg-orange-100'
    },
    {
      title: 'Help Center',
      description: 'Manage FAQs and support resources.',
      icon: <HelpCircle size={40} className="text-red-500" />,
      link: '/admin/help',
      color: 'bg-red-100'
    }
  ];
  
  return (
    <AuthLayout>
      <RoleGuard 
        requiredRole={UserRole.ADMIN}
        redirectTo="/dashboard"
      >
        <div className="container mx-auto py-8 px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <Link href="/dashboard">
              <span className="flex items-center bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-gray-700">
                <Home size={16} className="mr-2" />
                Back to User Dashboard
              </span>
            </Link>
          </div>
          
          {/* Admin Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-xl font-semibold text-gray-800">Total Users</div>
              <div className="text-3xl font-bold text-blue-600 mt-2">247</div>
              <div className="text-sm text-gray-500 mt-1">+12% from last month</div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-xl font-semibold text-gray-800">Active Listings</div>
              <div className="text-3xl font-bold text-green-600 mt-2">183</div>
              <div className="text-sm text-gray-500 mt-1">+5% from last month</div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-xl font-semibold text-gray-800">Pending Approvals</div>
              <div className="text-3xl font-bold text-orange-600 mt-2">14</div>
              <div className="text-sm text-gray-500 mt-1">Requires your attention</div>
            </div>
          </div>
          
          {/* Admin Panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminPanels.map((panel, index) => (
              <Link key={index} href={panel.link}>
                <div className={`${panel.color} border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full`}>
                  <div className="mb-4">{panel.icon}</div>
                  <h2 className="text-xl font-bold mb-2">{panel.title}</h2>
                  <p className="text-gray-600">{panel.description}</p>
                </div>
              </Link>
            ))}
          </div>
          
          {/* Recent Activity */}
          <div className="mt-10">
            <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-100">
                <div className="font-medium">New user registered</div>
                <div className="text-sm text-gray-500">John Doe (john@example.com) created an account</div>
                <div className="text-xs text-gray-400 mt-1">10 minutes ago</div>
              </div>
              
              <div className="p-4 border-b border-gray-100">
                <div className="font-medium">Property listing approved</div>
                <div className="text-sm text-gray-500">Luxury Apartment in Downtown was approved</div>
                <div className="text-xs text-gray-400 mt-1">1 hour ago</div>
              </div>
              
              <div className="p-4 border-b border-gray-100">
                <div className="font-medium">User role changed</div>
                <div className="text-sm text-gray-500">Sarah Johnson was upgraded to AGENT role</div>
                <div className="text-xs text-gray-400 mt-1">3 hours ago</div>
              </div>
              
              <div className="p-4">
                <div className="font-medium">System update completed</div>
                <div className="text-sm text-gray-500">Database optimizations and security patches applied</div>
                <div className="text-xs text-gray-400 mt-1">Yesterday</div>
              </div>
            </div>
          </div>
        </div>
      </RoleGuard>
    </AuthLayout>
  );
}