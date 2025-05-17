'use client';

import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { CREATE_PROPERTY, ADD_PROPERTY_IMAGE } from '@/graphql/mutations';
import { PropertyStatus, ListingType } from '@/lib/types';

export default function PropertyForm({ existingProperty = null }) {
  const initialState = existingProperty || {
    title: '',
    description: '',
    price: '',
    address: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    propertyType: 'APARTMENT',
    city: '',
    state: '',
    zipCode: '',
    listingType: 'SELL',
    status: 'ACTIVE',
    imageUrl: '', 
    featured: false,
    isPublished: true, // Adding the missing isPublished field
  };
  
  const [formState, setFormState] = useState(initialState);
  
  const [createProperty, { loading: createLoading, error: createError }] = useMutation(CREATE_PROPERTY);
  const [addPropertyImage, { loading: imageLoading }] = useMutation(ADD_PROPERTY_IMAGE);
  
  const router = useRouter();
  const user = getUser();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState({
      ...formState,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError('');
    
    if (!user?.id) {
      setError("You need to be signed in to create a property listing");
      setProcessing(false);
      router.push('/signin');
      return;
    }
    
    try {
      // Step 1: First create the property
      const propertyResult = await createProperty({
        variables: {
          propertyData: {
            title: formState.title,
            description: formState.description,
            price: formState.price ? parseFloat(formState.price) : 0,
            address: formState.address,
            bedrooms: formState.bedrooms ? parseInt(formState.bedrooms, 10) : 0,
            bathrooms: formState.bathrooms ? parseInt(formState.bathrooms, 10) : 0,
            area: formState.area ? parseFloat(formState.area) : 0,
            // Force string values for enum fields - this fixes the serialization issue
            propertyType: `${formState.propertyType}`,
            listingType: `${formState.listingType}`,
            status: `${formState.status}`,
            city: formState.city || "City",
            state: formState.state || "State",
            featured: Boolean(formState.featured),
            isPublished: true,
          },
          ownerId: parseInt(user.id, 10)
        },
      });
      
      if (propertyResult.data.createProperty.success) {
        // Get the newly created property ID
        const newPropertyId = propertyResult.data.createProperty.property.id;
        
        // Step 2: If an image URL was provided, add it to the property
        if (formState.imageUrl) {
          try {
            await addPropertyImage({
              variables: {
                imageData: {
                  imageUrl: formState.imageUrl,
                  isPrimary: true,
                  propertyId: parseInt(newPropertyId, 10)
                },
                ownerId: parseInt(user.id, 10)
              }
            });
            // Successfully added image
          } catch (imageErr) {
            console.error('Error adding property image:', imageErr);
            // We don't want to block the process if image upload fails
            // Just log it and continue
          }
        }
        
        alert('Property listing created successfully!');
        router.push('/dashboard');
      } else {
        setError(`Error: ${propertyResult.data.createProperty.error || 'Failed to create property'}`);
      }
    } catch (err: any) {
      console.error('Error creating property:', err);
      // Extract more detailed error information if available
      const errorMessage = err.graphQLErrors?.[0]?.message || 
                          err.networkError?.result?.errors?.[0]?.message || 
                          'An error occurred while creating the property. Please try again.';
      setError(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const isLoading = createLoading || imageLoading || processing;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Create Property Listing</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Title</label>
          <input
            type="text"
            name="title"
            value={formState.title}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        <div>
          <label className="block mb-1 font-medium">Description</label>
          <textarea
            name="description"
            value={formState.description}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows={4}
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Price ($)</label>
            <input
              type="number"
              name="price"
              value={formState.price}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              min="0"
              step="0.01"
              required
            />
          </div>
          
          <div>
            <label className="block mb-1 font-medium">Area (sq ft)</label>
            <input
              type="number"
              name="area"
              value={formState.area}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              min="0"
              step="0.01"
              required
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block mb-1 font-medium">Address</label>
            <input
              type="text"
              name="address"
              value={formState.address}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block mb-1 font-medium">City</label>
            <input
              type="text"
              name="city"
              value={formState.city}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">State</label>
            <input
              type="text"
              name="state"
              value={formState.state}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Zip Code</label>
            <input
              type="text"
              name="zipCode"
              value={formState.zipCode}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block mb-1 font-medium">Bedrooms</label>
            <input
              type="number"
              name="bedrooms"
              value={formState.bedrooms}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              min="0"
              required
            />
          </div>
          
          <div>
            <label className="block mb-1 font-medium">Bathrooms</label>
            <input
              type="number"
              name="bathrooms"
              value={formState.bathrooms}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              min="0"
              step="0.5"
              required
            />
          </div>
          
          <div>
            <label className="block mb-1 font-medium">Property Type</label>
            <select
              name="propertyType"
              value={formState.propertyType}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="APARTMENT">Apartment</option>
              <option value="HOUSE">House</option>
              <option value="CONDO">Condo</option>
              <option value="TOWNHOUSE">Townhouse</option>
              <option value="LAND">Land</option>
              <option value="COMMERCIAL">Commercial</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Listing Type</label>
            <select
              name="listingType"
              value={formState.listingType}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="SELL">For Sale</option>
              <option value="RENT">For Rent</option>
            </select>
          </div>
          
          <div>
            <label className="block mb-1 font-medium">Status</label>
            <select
              name="status"
              value={formState.status}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="SOLD">Sold</option>
              <option value="RENTED">Rented</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block mb-1 font-medium">Image URL</label>
          <input
            type="url"
            name="imageUrl"
            value={formState.imageUrl}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
            className="w-full p-2 border rounded"
          />
          <p className="text-xs text-gray-500 mt-1">Optional: Add a main image for your property</p>
        </div>
        
        <div className="flex items-center mt-4">
          <input
            type="checkbox"
            id="featured"
            name="featured"
            checked={formState.featured}
            onChange={(e) => setFormState({...formState, featured: e.target.checked})}
            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
            Feature this property (will appear in featured section)
          </label>
        </div>
        
        <div className="mt-6">
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Listing'}
          </button>
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
      </form>
    </div>
  );
}