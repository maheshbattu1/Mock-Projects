'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import Link from 'next/link';
import { Edit, Trash2, Star, ArrowUp, ArrowDown, Eye } from 'lucide-react';
import { Property, PropertyStatus, ListingType } from '@/lib/types';
import { isAdmin, isAgent, getUser } from '@/lib/auth';
import { GET_PROPERTIES } from '@/graphql/quaries';
import { CREATE_PROPERTY, DELETE_PROPERTY } from '@/graphql/mutations';

interface PropertiesTableProps {
  limit?: number;
  showActions?: boolean;
  showFilters?: boolean;
  showPagination?: boolean;
  onPropertyDeleted?: () => void;
}

export default function PropertiesTable({ 
  limit, 
  showActions = true,
  showFilters = true,
  showPagination = true,
  onPropertyDeleted
}: PropertiesTableProps) {
  const [sortConfig, setSortConfig] = useState({
    field: 'createdAt',
    direction: 'desc'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const propertiesPerPage = 10;
  
  const user = getUser();
  const userIsAdmin = isAdmin();
  const userIsAgent = isAgent();

  const { loading, error, data, refetch } = useQuery(GET_PROPERTIES, {
    variables: {
      sortBy: sortConfig.field,
      sortDirection: sortConfig.direction,
    },
  });

  const [deleteProperty] = useMutation(DELETE_PROPERTY);

  const handleSort = (field: string) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
    
    refetch({
      sortBy: field,
      sortDirection: sortConfig.field === field && sortConfig.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  const handleDeleteProperty = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        const { data } = await deleteProperty({ variables: { id } });
        if (data?.deleteProperty?.success) {
          alert('Property deleted successfully');
          refetch();
          if (onPropertyDeleted) onPropertyDeleted();
        } else {
          alert(data?.deleteProperty?.message || 'Failed to delete property');
        }
      } catch (err) {
        console.error('Error deleting property:', err);
        alert('An error occurred while deleting the property');
      }
    }
  };

  // Get properties with pagination if needed
  const allProperties = data?.properties || [];
  
  // If limit is provided, just take that number of properties
  // Otherwise handle pagination
  let properties = [];
  if (limit) {
    properties = allProperties.slice(0, limit);
  } else if (showPagination) {
    const indexOfLastProperty = currentPage * propertiesPerPage;
    const indexOfFirstProperty = indexOfLastProperty - propertiesPerPage;
    properties = allProperties.slice(indexOfFirstProperty, indexOfLastProperty);
  } else {
    properties = allProperties;
  }

  const totalPages = showPagination ? Math.ceil(allProperties.length / propertiesPerPage) : 1;

  // Pagination controls
  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Helper to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  // Format price nicely
  const formatPrice = (price: number) => {
    return price?.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  // Get property status label with color
  const getStatusLabel = (status: string) => {
    switch (status) {
      case PropertyStatus.ACTIVE:
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Active</span>;
      case PropertyStatus.PENDING:
        return <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">Pending</span>;
      case PropertyStatus.SOLD:
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Sold</span>;
      case PropertyStatus.RENTED:
        return <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">Rented</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">{status || 'Unknown'}</span>;
    }
  };

  // Get listing type label with color
  const getListingTypeLabel = (listingType: string) => {
    switch (listingType) {
      case ListingType.SELL:
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">For Sale</span>;
      case ListingType.RENT:
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">For Rent</span>;
      default:
        return null;
    }
  };

  // Render sort arrow
  const renderSortArrow = (field: string) => {
    if (sortConfig.field === field) {
      return sortConfig.direction === 'asc' ? 
        <ArrowUp size={14} className="ml-1 inline" /> : 
        <ArrowDown size={14} className="ml-1 inline" />;
    }
    return null;
  };

  // Check if user can edit a property
  const canEdit = (property: Property) => {
    return userIsAdmin || (userIsAgent && property.owner?.id === user?.id);
  };

  return (
    <div className="w-full overflow-hidden">
      {loading ? (
        <div className="text-center py-8">Loading properties...</div>
      ) : error ? (
        <div className="text-center text-red-500 py-8">
          Error loading properties. Please try again.
        </div>
      ) : properties.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {showActions && (
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('title')}
                  >
                    Property {renderSortArrow('title')}
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('price')}
                  >
                    Price {renderSortArrow('price')}
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('propertyType')}
                  >
                    Type {renderSortArrow('propertyType')}
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('bedrooms')}
                  >
                    Beds {renderSortArrow('bedrooms')}
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('createdAt')}
                  >
                    Listed {renderSortArrow('createdAt')}
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Owner
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {properties.map((property: Property) => (
                  <tr key={property.id} className="hover:bg-gray-50">
                    {showActions && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link href={`/properties/${property.id}`}>
                            <span className="text-blue-600 hover:text-blue-900" title="View Details">
                              <Eye size={18} />
                            </span>
                          </Link>
                          
                          {canEdit(property) && (
                            <>
                              <Link href={`/edit-property/${property.id}`}>
                                <span className="text-green-600 hover:text-green-900" title="Edit">
                                  <Edit size={18} />
                                </span>
                              </Link>
                              
                              <button 
                                onClick={() => handleDeleteProperty(property.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete"
                              >
                                <Trash2 size={18} />
                              </button>
                            </>
                          )}
                          
                          {userIsAdmin && (
                            <button 
                              title={property.featured ? "Remove from featured" : "Add to featured"}
                              className={`${property.featured ? 'text-yellow-500' : 'text-gray-400'} hover:text-yellow-600`}
                            >
                              <Star size={18} className={property.featured ? 'fill-current' : ''} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                          <Link href={`/properties/${property.id}`}>
                            <span className="hover:text-blue-600">{property.title}</span>
                          </Link>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formatPrice(property.price)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{property.propertyType || '-'}</div>
                      <div>{getListingTypeLabel(property.listingType || '')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusLabel(property.status || '')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {property.bedrooms || '-'} Beds | {property.bathrooms || '-'} Baths
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {property.createdAt ? formatDate(property.createdAt) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {property.owner?.name || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {showPagination && totalPages > 1 && (
            <div className="mt-4 flex justify-center">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <span>&laquo; Prev</span>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      number === currentPage
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {number}
                  </button>
                ))}

                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === totalPages ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <span>Next &raquo;</span>
                </button>
              </nav>
            </div>
          )}
          
          {limit && allProperties.length > limit && (
            <div className="mt-4 flex justify-center">
              <Link href="/properties">
                <span className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">
                  View All Properties
                </span>
              </Link>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8 text-gray-500">No properties found.</div>
      )}
    </div>
  );
}