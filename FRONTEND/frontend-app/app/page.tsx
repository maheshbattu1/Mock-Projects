'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import PropertyBrowser from '@/components/PropertyBrowser';
import PropertiesTable from '@/components/PropertiesTable';

import { isAdmin } from '@/lib/auth';
import { Building, Grid, List } from 'lucide-react';
import MostDemandedHomes from '@/components/MostDemandedHomes';

const HomePage = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const userIsAdmin = isAdmin();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header/>
      
      {/* Hero Section with Search */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-700 py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-white mb-6">Find Your Dream Home</h1>
          <p className="text-xl text-white mb-8">Browse through our collection of premium properties</p>
          <div className="max-w-3xl mx-auto">
            <SearchBar />
          
          </div>
        </div>
      </div>
      <MostDemandedHomes />
      
      {/* Featured Section */}
      <div className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Properties</h2>

        </div>
      </div>
      
      {/* All Listings */}
      <div className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">All Available Properties</h2>
            
            <div className="flex space-x-2">
              <button 
                onClick={() => setViewMode('grid')} 
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
                title="Grid View"
              >
                <Grid size={20} />
              </button>
              <button 
                onClick={() => setViewMode('table')} 
                className={`p-2 rounded ${viewMode === 'table' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
                title="Table View"
              >
                <List size={20} />
              </button>
            </div>
          </div>
          
          {viewMode === 'grid' ? (
            <PropertyBrowser />
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <PropertiesTable 
                showActions={userIsAdmin} 
                limit={10} 
              />
            </div>
          )}
        </div>
      </div>

      {/* Admin Section - Visible only to admins */}
      {userIsAdmin && (
        <div className="py-12 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Building className="text-blue-500 mr-3" size={24} />
                  <h2 className="text-2xl font-bold">Property Management</h2>
                </div>
                <a href="/create-property" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Add New Property
                </a>
              </div>
              
              <p className="text-gray-600 mb-6">
                Manage all property listings in one place. Add, edit, or remove properties as needed.
              </p>
              
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <PropertiesTable showPagination={false} limit={5} />
              </div>
              
              <div className="mt-4 text-center">
                <a href="/admin/properties" className="text-blue-600 hover:underline">
                  View All Properties in Admin Panel
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;