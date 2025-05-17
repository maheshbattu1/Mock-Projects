'use client';

import React, { useState } from 'react';
import PropertyBrowser from '@/components/PropertyBrowser';
import { ApolloWrapper } from '@/components/ApolloWrapper';
import { isAdmin, isAgent, getUser } from '@/lib/auth';
import Link from 'next/link';
import { UserRole } from '@/lib/types';
import { Plus, Filter, Download } from 'lucide-react';

export default function PropertiesPage() {
  const [showFilters, setShowFilters] = useState(false);
  const userIsAdmin = isAdmin();
  const userIsAgent = isAgent();
  const user = getUser();
  
  return (
    <ApolloWrapper>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Browse Properties</h1>
          
          <div className="flex gap-2">
            {/* Role-specific action buttons */}
            {(userIsAdmin || userIsAgent) && (
              <Link href="/create-property" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-1">
                <Plus size={16} />
                <span>Add Property</span>
              </Link>
            )}
            
            <button 
              className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md flex items-center gap-1"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={16} />
              <span>Filters</span>
            </button>
            
            {userIsAdmin && (
              <button className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md flex items-center gap-1">
                <Download size={16} />
                <span>Export</span>
              </button>
            )}
          </div>
        </div>
        
        {showFilters && (
          <div className="bg-gray-50 p-4 mb-6 rounded-lg border border-gray-200">
            <h2 className="text-lg font-medium mb-3">Filter Properties</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Basic filters for all users */}
              <div>
                <label className="block text-sm font-medium mb-1">Price Range</label>
                <div className="flex gap-2">
                  <input type="number" placeholder="Min" className="w-full px-3 py-2 border rounded-md" />
                  <input type="number" placeholder="Max" className="w-full px-3 py-2 border rounded-md" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Property Type</label>
                <select className="w-full px-3 py-2 border rounded-md">
                  <option value="">All Types</option>
                  <option value="house">House</option>
                  <option value="apartment">Apartment</option>
                  <option value="condo">Condo</option>
                  <option value="land">Land</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Bedrooms</label>
                <select className="w-full px-3 py-2 border rounded-md">
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </select>
              </div>
              
              {/* Additional filters for agents and admins */}
              {(userIsAdmin || userIsAgent) && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select className="w-full px-3 py-2 border rounded-md">
                      <option value="">All</option>
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="sold">Sold</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  
                  {userIsAdmin && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Agent</label>
                      <select className="w-full px-3 py-2 border rounded-md">
                        <option value="">All Agents</option>
                        <option value="1">John Doe</option>
                        <option value="2">Jane Smith</option>
                        <option value="3">Mike Johnson</option>
                      </select>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md">Clear</button>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">Apply Filters</button>
            </div>
          </div>
        )}
        
        <PropertyBrowser 
          showAdminControls={userIsAdmin || userIsAgent}
          showFilters={false} // Using the page's own filters instead
        />
        
        {/* Role-specific instructions or info */}
        {userIsAdmin && (
          <div className="mt-8 bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h3 className="font-medium text-blue-800">Admin Tools</h3>
            <p className="text-sm text-blue-700 mt-1">
              As an administrator, you can edit, delete, or feature any property. 
              You can also export the property database or manage property settings in the Admin Dashboard.
            </p>
          </div>
        )}
        
        {userIsAgent && !userIsAdmin && (
          <div className="mt-8 bg-green-50 border border-green-200 p-4 rounded-lg">
            <h3 className="font-medium text-green-800">Agent Tools</h3>
            <p className="text-sm text-green-700 mt-1">
              As an agent, you can edit or delete properties you've created.
              Click "Add Property" to create a new listing.
            </p>
          </div>
        )}
      </div>
    </ApolloWrapper>
  );
}