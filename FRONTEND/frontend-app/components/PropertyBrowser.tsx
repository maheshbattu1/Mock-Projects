'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import Link from 'next/link';
import { Heart, Edit, Trash2, Star, PlusSquare, ArrowUp, ArrowDown, Filter, Tag } from 'lucide-react';
import { isAdmin, isAgent, getUser } from '@/lib/auth';
import { UserRole, PropertyType, ListingType, PropertyStatus } from '@/lib/types';
import { GET_PROPERTIES } from '@/graphql/quaries';
import { DELETE_PROPERTY } from '@/graphql/mutations';

// Mutation for adding a property to favorites (placeholder - to be implemented later)
const ADD_TO_FAVORITES = gql`
  mutation AddToFavorites($propertyId: ID!) {
    addToFavorites(propertyId: $propertyId) {
      success
      message
    }
  }
`;

// Mutation for featuring a property (placeholder - to be implemented later)
const FEATURE_PROPERTY = gql`
  mutation FeatureProperty($propertyId: ID!, $featured: Boolean!) {
    featureProperty(propertyId: $propertyId, featured: $featured) {
      success
      message
    }
  }
`;

interface PropertyBrowserProps {
  showFilters?: boolean;
  limit?: number;
  className?: string;
  showAdminControls?: boolean;
}

export default function PropertyBrowser({ 
  showFilters = true, 
  limit, 
  className = "",
  showAdminControls = true
}: PropertyBrowserProps) {
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    minBedrooms: '',
    propertyType: '',
    status: '',
    location: '',
  });
  const [sortConfig, setSortConfig] = useState({
    field: 'createdAt',
    direction: 'desc'
  });
  const [favorites, setFavorites] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const propertiesPerPage = 6;
  const [filtersVisible, setFiltersVisible] = useState(false);

  const user = getUser();
  const userIsAdmin = isAdmin();
  const userIsAgent = isAgent();

  const { loading, error, data, refetch } = useQuery(GET_PROPERTIES, {
    variables: {
      minPrice: filters.minPrice ? parseFloat(filters.minPrice) : null,
      maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : null,
      propertyType: filters.propertyType || null,
      city: filters.location || null,
    },
  });

  const [deleteProperty] = useMutation(DELETE_PROPERTY);
  const [addToFavorites] = useMutation(ADD_TO_FAVORITES);
  const [featureProperty] = useMutation(FEATURE_PROPERTY);

  useEffect(() => {
    // Initialize favorites from local storage
    const savedFavorites = localStorage.getItem('propertyFavorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  useEffect(() => {
    // Save favorites to local storage
    localStorage.setItem('propertyFavorites', JSON.stringify(favorites));
  }, [favorites]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    refetch({
      minPrice: filters.minPrice ? parseFloat(filters.minPrice) : null,
      maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : null,
      propertyType: filters.propertyType || null,
      city: filters.location || null,
    });
  };

  const handleDeleteProperty = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        const { data } = await deleteProperty({ variables: { id } });
        if (data?.deleteProperty?.success) {
          alert('Property deleted successfully');
          refetch();
        } else {
          alert(data?.deleteProperty?.message || 'Failed to delete property');
        }
      } catch (err) {
        console.error('Error deleting property:', err);
        alert('An error occurred while deleting the property');
      }
    }
  };

  const handleToggleFavorite = async (propertyId: string) => {
    // Frontend-only implementation until backend supports favorites
    setFavorites(prev => {
      if (prev.includes(propertyId)) {
        return prev.filter(id => id !== propertyId);
      } else {
        return [...prev, propertyId];
      }
    });
    
    // This would be replaced with actual backend call when implemented
    try {
      await addToFavorites({ variables: { propertyId } });
    } catch (err) {
      console.log('This is a placeholder for favorites feature');
    }
  };

  const handleFeatureProperty = async (propertyId: string, featured: boolean) => {
    // This would be implemented in the backend later
    try {
      await featureProperty({ variables: { propertyId, featured } });
      alert(`Property ${featured ? 'featured' : 'unfeatured'} successfully`);
    } catch (err) {
      console.error('Error featuring property:', err);
      alert('This feature is not yet implemented in the backend');
    }
  };

  const handleSort = (field: string) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
    
    refetch({
      ...filters,
      sortBy: field,
      sortDirection: sortConfig.field === field && sortConfig.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  // Get properties with pagination
  const allProperties = data?.properties || [];
  
  // If limit is provided, just take that number of properties
  // Otherwise handle pagination
  let properties = [];
  if (limit) {
    properties = allProperties.slice(0, limit);
  } else {
    const indexOfLastProperty = currentPage * propertiesPerPage;
    const indexOfFirstProperty = indexOfLastProperty - propertiesPerPage;
    properties = allProperties.slice(indexOfFirstProperty, indexOfLastProperty);
  }

  const totalPages = Math.ceil(allProperties.length / propertiesPerPage);

  const getPropertyImage = (property: any) => {
    // Find primary image or use the first one
    const primaryImage = property.images?.find((img: any) => img.isPrimary);
    const firstImage = property.images?.[0];
    
    if (primaryImage?.imageUrl) {
      return primaryImage.imageUrl;
    } else if (firstImage?.imageUrl) {
      return firstImage.imageUrl;
    }
    return null;
  };

  // Check if the user is the owner of the property
  const isPropertyOwner = (property: any) => {
    return user && user.id === property.owner?.id;
  };

  // Check if a property is considered new (less than 7 days old)
  const isNewProperty = (createdAt: string) => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return new Date(createdAt) > oneWeekAgo;
  };

  // Pagination controls
  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const clearFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      minBedrooms: '',
      propertyType: '',
      status: '',
      location: '',
    });
    setSortConfig({
      field: 'createdAt',
      direction: 'desc'
    });
    refetch({
      minPrice: null,
      maxPrice: null,
      propertyType: null,
      city: null,
    });
  };

  return (
    <div className={`container mx-auto p-4 ${className}`}>
      {/* Admin Quick Actions - Only shown to admins */}
      {showAdminControls && userIsAdmin && (
        <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-3">Admin Actions</h3>
          <div className="flex space-x-4">
            <Link 
              href="/create-property"
              className="bg-green-500 text-white px-4 py-2 rounded flex items-center"
            >
              <PlusSquare size={18} className="mr-2" />
              Add Property
            </Link>
            <Link 
              href="/admin/properties"
              className="bg-blue-500 text-white px-4 py-2 rounded flex items-center"
            >
              <Star size={18} className="mr-2" />
              Manage Featured
            </Link>
          </div>
        </div>
      )}

      {showFilters && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Browse Properties</h2>
            <button 
              onClick={() => setFiltersVisible(!filtersVisible)}
              className="bg-blue-500 text-white px-3 py-2 rounded flex items-center text-sm"
            >
              <Filter size={16} className="mr-2" />
              {filtersVisible ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>

          {/* Filter Form */}
          {filtersVisible && (
            <div className="bg-gray-100 p-4 rounded-lg mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium">Filter Properties</h3>
                <button 
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Clear all filters
                </button>
              </div>
              <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Price Range</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      name="minPrice"
                      value={filters.minPrice}
                      onChange={handleFilterChange}
                      className="w-full p-2 border rounded"
                      min="0"
                      step="1000"
                      placeholder="Min $"
                    />
                    <span>to</span>
                    <input
                      type="number"
                      name="maxPrice"
                      value={filters.maxPrice}
                      onChange={handleFilterChange}
                      className="w-full p-2 border rounded"
                      min="0"
                      step="1000"
                      placeholder="Max $"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Bedrooms</label>
                  <input
                    type="number"
                    name="minBedrooms"
                    value={filters.minBedrooms}
                    onChange={handleFilterChange}
                    className="w-full p-2 border rounded"
                    min="0"
                    placeholder="Minimum bedrooms"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Property Type</label>
                  <select
                    name="propertyType"
                    value={filters.propertyType}
                    onChange={handleFilterChange}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Any</option>
                    <option value="APARTMENT">Apartment</option>
                    <option value="HOUSE">House</option>
                    <option value="CONDO">Condo</option>
                    <option value="TOWNHOUSE">Townhouse</option>
                    <option value="LAND">Land</option>
                    <option value="COMMERCIAL">Commercial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={filters.location}
                    onChange={handleFilterChange}
                    className="w-full p-2 border rounded"
                    placeholder="City, State, or Zip"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Any</option>
                    <option value="ACTIVE">Active</option>
                    <option value="PENDING">Pending</option>
                    <option value="SOLD">Sold</option>
                    <option value="RENTED">Rented</option>
                  </select>
                </div>
                
                <div className="flex items-end">
                  <button 
                    type="submit"
                    className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                  >
                    Apply Filters
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      )}

      {/* Sorting options */}
      {!loading && properties.length > 0 && (
        <div className="flex flex-wrap justify-between items-center mb-4">
          <div className="text-sm text-gray-500 mb-2 md:mb-0">
            Showing {properties.length} of {allProperties.length} properties
          </div>
          
          <div className="flex space-x-2 items-center">
            <span className="text-sm text-gray-500">Sort by:</span>
            <button 
              onClick={() => handleSort('price')} 
              className={`text-sm px-3 py-1 rounded-full flex items-center ${
                sortConfig.field === 'price' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'
              }`}
            >
              Price 
              {sortConfig.field === 'price' && (
                sortConfig.direction === 'asc' ? 
                <ArrowUp size={12} className="ml-1" /> : 
                <ArrowDown size={12} className="ml-1" />
              )}
            </button>
            <button 
              onClick={() => handleSort('createdAt')} 
              className={`text-sm px-3 py-1 rounded-full flex items-center ${
                sortConfig.field === 'createdAt' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'
              }`}
            >
              Date 
              {sortConfig.field === 'createdAt' && (
                sortConfig.direction === 'asc' ? 
                <ArrowUp size={12} className="ml-1" /> : 
                <ArrowDown size={12} className="ml-1" />
              )}
            </button>
            <button 
              onClick={() => handleSort('bedrooms')} 
              className={`text-sm px-3 py-1 rounded-full flex items-center ${
                sortConfig.field === 'bedrooms' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'
              }`}
            >
              Bedrooms 
              {sortConfig.field === 'bedrooms' && (
                sortConfig.direction === 'asc' ? 
                <ArrowUp size={12} className="ml-1" /> : 
                <ArrowDown size={12} className="ml-1" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Properties Grid */}
      {loading ? (
        <div className="text-center py-8">Loading properties...</div>
      ) : error ? (
        <div className="text-center text-red-500 py-8">
          Error loading properties. Please try again.
        </div>
      ) : properties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property: any) => (
            <div key={property.id} className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <div className="relative bg-gray-200 h-48">
                {/* Property image */}
                {getPropertyImage(property) ? (
                  <img 
                    src={getPropertyImage(property)} 
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <span className="text-gray-500">No Image Available</span>
                  </div>
                )}
                
                {/* Status badges - positioned in corners */}
                <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                  <div className={`text-white text-xs px-2 py-1 rounded ${
                    property.listingType === 'SELL' ? 'bg-blue-500' : 'bg-green-500'
                  }`}>
                    {property.listingType === 'SELL' ? 'For Sale' : 'For Rent'}
                  </div>
                  
                  {/* Status badge: PENDING, SOLD, etc */}
                  {property.status && property.status !== 'ACTIVE' && (
                    <div className={`text-white text-xs px-2 py-1 rounded ${
                      property.status === 'PENDING' ? 'bg-amber-500' : 
                      property.status === 'SOLD' ? 'bg-red-500' : 
                      property.status === 'RENTED' ? 'bg-purple-500' : 'bg-gray-500'
                    }`}>
                      {property.status.charAt(0) + property.status.slice(1).toLowerCase()}
                    </div>
                  )}
                </div>
                
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {/* New badge */}
                  {isNewProperty(property.createdAt) && (
                    <div className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                      New
                    </div>
                  )}
                  
                  {/* Featured badge */}
                  {property.featured && (
                    <div className="bg-yellow-500 text-white text-xs px-2 py-1 rounded flex items-center">
                      <Star size={10} className="mr-1" /> Featured
                    </div>
                  )}
                </div>
                
                {/* Favorite button - shown to all logged-in users */}
                {user && (
                  <button
                    onClick={() => handleToggleFavorite(property.id)}
                    className="absolute bottom-2 left-2 bg-white p-1 rounded-full shadow hover:bg-gray-100"
                    title="Add to favorites"
                  >
                    <Heart 
                      size={20} 
                      className={`${favorites.includes(property.id) ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} 
                    />
                  </button>
                )}
                
                {/* Feature star - only shown to admins */}
                {userIsAdmin && (
                  <button
                    onClick={() => handleFeatureProperty(property.id, !property.featured)}
                    className="absolute bottom-2 right-2 bg-white p-1 rounded-full shadow hover:bg-gray-100"
                    title={property.featured ? "Remove from featured" : "Add to featured"}
                  >
                    <Star 
                      size={20} 
                      className={`${property.featured ? 'fill-yellow-400 text-yellow-400' : 'text-gray-500'}`} 
                    />
                  </button>
                )}
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold line-clamp-1">{property.title}</h3>
                  {property.propertyType && (
                    <div className="flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      <Tag size={10} className="mr-1" />
                      {property.propertyType.charAt(0) + property.propertyType.slice(1).toLowerCase()}
                    </div>
                  )}
                </div>
                <p className="text-gray-600 mb-2 line-clamp-2">{property.description}</p>
                <div className="text-lg font-bold text-blue-600 mb-2">${property.price?.toLocaleString()}</div>
                <div className="text-sm text-gray-500 mb-2">
                  {property.address}
                  {property.city && `, ${property.city}`}
                  {property.state && `, ${property.state}`}
                </div>
                
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{property.bedrooms} Bed{property.bedrooms !== 1 ? 's' : ''}</span>
                  <span>{property.bathrooms} Bath{property.bathrooms !== 1 ? 's' : ''}</span>
                  <span>{property.area?.toLocaleString()} sq ft</span>
                </div>
                
                <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    Listed by {property.owner?.name || 'Unknown'}
                  </div>
                  <Link href={`/properties/${property.id}`}>
                    <span className="bg-blue-500 text-white text-sm py-1 px-3 rounded hover:bg-blue-600 cursor-pointer">
                      View Details
                    </span>
                  </Link>
                </div>
                
                {/* Admin/Agent controls */}
                {showAdminControls && ((userIsAdmin) || (userIsAgent && isPropertyOwner(property))) && (
                  <div className="mt-3 pt-3 border-t border-gray-200 flex justify-end space-x-2">
                    <Link href={`/edit-property/${property.id}`}>
                      <span className="bg-green-500 text-white text-sm py-1 px-2 rounded hover:bg-green-600 cursor-pointer flex items-center">
                        <Edit size={14} className="mr-1" />
                        Edit
                      </span>
                    </Link>
                    <button 
                      onClick={() => handleDeleteProperty(property.id)}
                      className="bg-red-500 text-white text-sm py-1 px-2 rounded hover:bg-red-600 cursor-pointer flex items-center"
                    >
                      <Trash2 size={14} className="mr-1" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No properties found matching your criteria.
        </div>
      )}

      {/* Pagination */}
      {!limit && totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <nav className="inline-flex rounded shadow">
            <button 
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-2 border-r text-sm ${
                currentPage === 1 ? 'text-gray-400' : 'hover:bg-gray-50 cursor-pointer'
              }`}
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
              <button
                key={number}
                onClick={() => paginate(number)}
                className={`px-3 py-2 border-r text-sm ${
                  currentPage === number 
                    ? 'bg-blue-50 text-blue-600 font-medium' 
                    : 'hover:bg-gray-50 cursor-pointer'
                }`}
              >
                {number}
              </button>
            ))}
            
            <button 
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-2 text-sm ${
                currentPage === totalPages ? 'text-gray-400' : 'hover:bg-gray-50 cursor-pointer'
              }`}
            >
              Next
            </button>
          </nav>
        </div>
      )}

      {limit && data?.properties && data.properties.length > limit && (
        <div className="text-center mt-8">
          <Link href="/properties">
            <span className="inline-block bg-blue-500 text-white py-2 px-6 rounded-full hover:bg-blue-600 cursor-pointer">
              View All Properties
            </span>
          </Link>
        </div>
      )}
    </div>
  );
}