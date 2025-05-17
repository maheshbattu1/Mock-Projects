'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/lib/types';
import { Building, Plus, User, Eye, Users, Key, Settings, LogOut, Bell, Activity, BarChart2, Calendar } from 'lucide-react';
import { getUser, logout, isAdmin, isAgent } from '@/lib/auth';
import MostDemandedHomes from '@/components/MostDemandedHomes';
import AuthLayout from '@/components/AuthLayout';
import UserCard from '@/components/UserCard';
import PropertyBrowser from '@/components/PropertyBrowser';
import PropertyForm from '@/components/PropertyForm';

export default function Dashboard() {
  const router = useRouter();
  const user = getUser();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Get user role to display appropriate content
  const userRole = user?.role || UserRole.USER;
  const userIsAdmin = isAdmin();
  const userIsAgent = isAgent();
  
  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Mock data for recent activities
  const recentActivities = [
    { 
      id: 1, 
      type: 'property_view', 
      message: 'Someone viewed your 3BR Condo in Downtown', 
      time: '10 minutes ago',
      icon: <Eye size={16} className="text-blue-600" />
    },
    { 
      id: 2, 
      type: 'inquiry', 
      message: 'New inquiry received for Beach House property', 
      time: '2 hours ago',
      icon: <Bell size={16} className="text-amber-600" />
    },
    { 
      id: 3, 
      type: 'property_added', 
      message: 'New property "Luxury Villa" added to the marketplace', 
      time: '1 day ago',
      icon: <Building size={16} className="text-green-600" />
    },
    { 
      id: 4, 
      type: 'user_joined', 
      message: 'New user Emma Thompson joined the platform', 
      time: '2 days ago',
      icon: <User size={16} className="text-purple-600" />
    }
  ];

  // Mock data for recent inquiries
  const recentInquiries = [
    {
      id: 1,
      propertyTitle: "Modern Downtown Apartment",
      userName: "John Smith",
      message: "I'm interested in scheduling a viewing this weekend. Is that possible?",
      date: "May 3, 2025",
      userEmail: "john.smith@example.com",
      status: "new"
    },
    {
      id: 2,
      propertyTitle: "Seaside Villa",
      userName: "Sarah Jones",
      message: "Hi, does this property come with parking facilities?",
      date: "May 2, 2025",
      userEmail: "sarah.j@example.com",
      status: "replied"
    },
    {
      id: 3,
      propertyTitle: "Family Home in Suburbia",
      userName: "Michael Brown",
      message: "What's the earliest availability for moving in?",
      date: "April 30, 2025",
      userEmail: "mbrown@example.com",
      status: "new"
    }
  ];

  // Get role-specific actions
  const getRoleActions = () => {
    if (userIsAdmin) {
      return [
        {
          title: 'Admin Dashboard',
          description: 'Access the admin control panel',
          icon: <Settings size={24} className="text-purple-600" />,
          color: 'bg-purple-100 border-purple-200',
          link: '/admin'
        },
        {
          title: 'Manage Properties',
          description: 'Review and approve property listings',
          icon: <Building size={24} className="text-green-600" />,
          color: 'bg-green-100 border-green-200',
          link: '/admin/properties'
        },
        {
          title: 'Manage Users',
          description: 'View and edit user accounts',
          icon: <Users size={24} className="text-blue-600" />,
          color: 'bg-blue-100 border-blue-200',
          link: '/admin/users'
        }
      ];
    } 
    else if (userIsAgent) {
      return [
        {
          title: 'My Listings',
          description: 'Manage your property listings',
          icon: <Building size={24} className="text-green-600" />,
          color: 'bg-green-100 border-green-200',
          link: '/my-properties'
        },
        {
          title: 'Add Property',
          description: 'Create a new property listing',
          icon: <Plus size={24} className="text-blue-600" />,
          color: 'bg-blue-100 border-blue-200',
          link: '/create-property'
        },
        {
          title: 'Client Inquiries',
          description: 'View messages from potential clients',
          icon: <User size={24} className="text-orange-600" />,
          color: 'bg-orange-100 border-orange-200',
          link: '/inquiries'
        }
      ];
    } 
    else {
      return [
        {
          title: 'Saved Properties',
          description: 'View your favorited properties',
          icon: <Building size={24} className="text-green-600" />,
          color: 'bg-green-100 border-green-200',
          link: '/favorites'
        },
        {
          title: 'Browse Properties',
          description: 'Find your perfect home',
          icon: <Eye size={24} className="text-blue-600" />,
          color: 'bg-blue-100 border-blue-200',
          link: '/properties'
        },
        {
          title: 'Account Settings',
          description: 'Update your profile information',
          icon: <Key size={24} className="text-orange-600" />,
          color: 'bg-orange-100 border-orange-200',
          link: '/settings'
        }
      ];
    }
  };

  const roleActions = getRoleActions();

  return (
    <AuthLayout>
      <div className="container mx-auto p-4">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar with user info */}
          <div className="md:w-1/4">
            {user && (
              <UserCard 
                user={user}
                showRole={true}
                additionalContent={
                  <button
                    onClick={handleLogout}
                    className="mt-4 w-full flex items-center justify-center text-red-600 hover:bg-red-50 border border-red-200 rounded-lg p-2"
                  >
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </button>
                }
              />
            )}
            
            {/* Role-specific quick actions */}
            <div className="mt-6 bg-white rounded-lg shadow p-4 border border-gray-200">
              <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {roleActions.map((action, index) => (
                  <Link href={action.link} key={index}>
                    <div className={`p-3 rounded-lg ${action.color} border cursor-pointer hover:shadow-md transition-shadow`}>
                      <div className="flex items-start">
                        <div className="mr-3">{action.icon}</div>
                        <div>
                          <h4 className="font-semibold">{action.title}</h4>
                          <p className="text-sm text-gray-600">{action.description}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Activity Feed */}
            <div className="mt-6 bg-white rounded-lg shadow p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Recent Activity</h3>
                <Link href="/activity">
                  <span className="text-sm text-blue-600 hover:underline">View All</span>
                </Link>
              </div>
              <div className="space-y-3">
                {recentActivities.map(activity => (
                  <div key={activity.id} className="flex items-start p-2 border-b border-gray-100 last:border-0">
                    <div className="p-2 mr-3 bg-gray-50 rounded-full">
                      {activity.icon}
                    </div>
                    <div>
                      <p className="text-sm">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Main content */}
          <div className="md:w-3/4">
            {/* Dashboard Tabs */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 mb-6">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-3 font-medium text-sm flex items-center ${
                    activeTab === 'overview' 
                      ? 'text-blue-600 border-b-2 border-blue-600' 
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  <BarChart2 size={16} className="mr-2" />
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('properties')}
                  className={`px-4 py-3 font-medium text-sm flex items-center ${
                    activeTab === 'properties' 
                      ? 'text-blue-600 border-b-2 border-blue-600' 
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  <Building size={16} className="mr-2" />
                  Properties
                </button>
                <button
                  onClick={() => setActiveTab('activity')}
                  className={`px-4 py-3 font-medium text-sm flex items-center ${
                    activeTab === 'activity' 
                      ? 'text-blue-600 border-b-2 border-blue-600' 
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  <Activity size={16} className="mr-2" />
                  Activity
                </button>
                {(userIsAgent || userIsAdmin) && (
                  <button
                    onClick={() => setActiveTab('inquiries')}
                    className={`px-4 py-3 font-medium text-sm flex items-center ${
                      activeTab === 'inquiries' 
                        ? 'text-blue-600 border-b-2 border-blue-600' 
                        : 'text-gray-600 hover:text-blue-600'
                    }`}
                  >
                    <Bell size={16} className="mr-2" />
                    Inquiries
                    <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">2</span>
                  </button>
                )}
              </div>

              <div className="p-5">
                <h1 className="text-2xl font-bold mb-2">
                  Welcome back, {user?.name}!
                </h1>
                <p className="text-gray-600 mb-6">
                  {userIsAdmin && "You have administrator privileges."}
                  {userIsAgent && !userIsAdmin && "You have agent privileges to create and manage property listings."}
                  {!userIsAdmin && !userIsAgent && "Thanks for using our platform to find your perfect home."}
                </p>

                {activeTab === 'overview' && (
                  <>
                    {/* Admin-specific content */}
                    {userIsAdmin && (
                      <div className="mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <h3 className="font-semibold text-lg">Total Users</h3>
                            <p className="text-3xl font-bold text-blue-700">247</p>
                            <div className="text-xs text-blue-600 mt-2 flex items-center">
                              <span className="mr-1">↑</span> 5% from last month
                            </div>
                          </div>
                          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <h3 className="font-semibold text-lg">Active Listings</h3>
                            <p className="text-3xl font-bold text-green-700">183</p>
                            <div className="text-xs text-green-600 mt-2 flex items-center">
                              <span className="mr-1">↑</span> 12% from last month
                            </div>
                          </div>
                          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                            <h3 className="font-semibold text-lg">New Inquiries</h3>
                            <p className="text-3xl font-bold text-amber-700">24</p>
                            <div className="text-xs text-amber-600 mt-2 flex items-center">
                              <span className="mr-1">↓</span> 3% from last month
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
                          <h3 className="font-semibold text-lg mb-2">Monthly Property Listings</h3>
                          <div className="h-64 bg-gray-50 rounded p-4 flex items-center justify-center">
                            <p className="text-gray-400">Chart visualization would appear here</p>
                            {/* In a real implementation, you would integrate a chart library like Chart.js or Recharts */}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Agent-specific content */}
                    {userIsAgent && (
                      <div className="mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <h3 className="font-semibold text-lg">Your Listings</h3>
                            <p className="text-3xl font-bold text-blue-700">12</p>
                            <div className="text-xs text-blue-600 mt-2 flex items-center">
                              <span className="mr-1">↑</span> 2 new this month
                            </div>
                          </div>
                          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <h3 className="font-semibold text-lg">Property Views</h3>
                            <p className="text-3xl font-bold text-green-700">436</p>
                            <div className="text-xs text-green-600 mt-2 flex items-center">
                              <span className="mr-1">↑</span> 28% from last month
                            </div>
                          </div>
                          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                            <h3 className="font-semibold text-lg">Inquiries</h3>
                            <p className="text-3xl font-bold text-purple-700">18</p>
                            <div className="text-xs text-purple-600 mt-2 flex items-center">
                              <span className="mr-1">↑</span> 4 new this week
                            </div>
                          </div>
                          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                            <h3 className="font-semibold text-lg">Conversions</h3>
                            <p className="text-3xl font-bold text-amber-700">3</p>
                            <div className="text-xs text-amber-600 mt-2 flex items-center">
                              <span className="mr-1">↑</span> 1 this month
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <h3 className="font-semibold text-lg mb-2">Performance</h3>
                            <div className="h-48 bg-gray-50 rounded p-4 flex items-center justify-center">
                              <p className="text-gray-400">Performance chart would appear here</p>
                            </div>
                          </div>
                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <h3 className="font-semibold text-lg mb-2">Upcoming Appointments</h3>
                            <div className="divide-y">
                              <div className="py-2 flex justify-between items-center">
                                <div className="flex items-center">
                                  <Calendar size={16} className="mr-2 text-blue-600" />
                                  <div>
                                    <p className="font-medium">Property Viewing</p>
                                    <p className="text-sm text-gray-500">Modern Apartment</p>
                                  </div>
                                </div>
                                <div className="text-sm text-gray-500">Tomorrow, 2:00 PM</div>
                              </div>
                              <div className="py-2 flex justify-between items-center">
                                <div className="flex items-center">
                                  <Calendar size={16} className="mr-2 text-blue-600" />
                                  <div>
                                    <p className="font-medium">Client Meeting</p>
                                    <p className="text-sm text-gray-500">John Wilson</p>
                                  </div>
                                </div>
                                <div className="text-sm text-gray-500">May 7, 10:00 AM</div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <Link href="/create-property">
                          <div className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium p-3 rounded-lg">
                            <div className="flex items-center">
                              <Plus size={18} className="mr-2" />
                              Add New Property Listing
                            </div>
                          </div>
                        </Link>
                      </div>
                    )}

                    {/* Regular user dashboard */}
                    {!userIsAdmin && !userIsAgent && (
                      <div className="mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <h3 className="font-semibold text-lg">Saved Properties</h3>
                            <p className="text-3xl font-bold text-blue-700">5</p>
                          </div>
                          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                            <h3 className="font-semibold text-lg">Recent Searches</h3>
                            <p className="text-3xl font-bold text-purple-700">8</p>
                          </div>
                          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <h3 className="font-semibold text-lg">New Listings in Your Area</h3>
                            <p className="text-3xl font-bold text-green-700">12</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Content for all users */}
                    <div>
                      <h2 className="text-xl font-bold mb-4">Popular Properties</h2>
                      <PropertyBrowser
                        showFilters={false}
                        limit={3}
                        className="bg-transparent p-0 shadow-none"
                        showAdminControls={userIsAdmin || userIsAgent}
                      />
                    </div>
                  </>
                )}
                
                {activeTab === 'properties' && (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold">All Properties</h2>
                      {(userIsAdmin || userIsAgent) && (
                        <Link href="/create-property">
                          <span className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2 rounded">
                            <Plus size={16} className="inline mr-1" />
                            Add New Property
                          </span>
                        </Link>
                      )}
                    </div>
                    <PropertyBrowser
                      showFilters={true}
                      limit={6}
                      className="bg-transparent p-0 shadow-none"
                      showAdminControls={userIsAdmin || userIsAgent}
                    />
                  </>
                )}
                
                {activeTab === 'activity' && (
                  <>
                    <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
                    <div className="space-y-4">
                      {recentActivities.map(activity => (
                        <div key={activity.id} className="flex items-start p-3 border border-gray-100 rounded-lg">
                          <div className="p-3 mr-4 bg-gray-50 rounded-full">
                            {activity.icon}
                          </div>
                          <div>
                            <p className="font-medium">{activity.message}</p>
                            <p className="text-sm text-gray-500">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                
                {activeTab === 'inquiries' && (userIsAgent || userIsAdmin) && (
                  <>
                    <h2 className="text-xl font-bold mb-4">Property Inquiries</h2>
                    <div className="space-y-4">
                      {recentInquiries.map(inquiry => (
                        <div 
                          key={inquiry.id} 
                          className={`p-4 border rounded-lg ${
                            inquiry.status === 'new' ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                          }`}
                        >
                          <div className="flex justify-between">
                            <h3 className="font-medium">{inquiry.propertyTitle}</h3>
                            {inquiry.status === 'new' && (
                              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">New</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">From: {inquiry.userName} ({inquiry.userEmail})</p>
                          <p className="mb-2">{inquiry.message}</p>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">{inquiry.date}</span>
                            <button className="text-blue-600 hover:underline">Reply</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {activeTab === 'overview' && (
              <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
                <h2 className="text-xl font-bold mb-4">Most Demanded Homes</h2>
                <MostDemandedHomes/>
                <PropertyForm/>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}