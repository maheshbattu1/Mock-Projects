import { gql } from '@apollo/client';

export const GET_PROPERTIES = gql`
  query Properties(
    $propertyType: PropertyType, 
    $listingType: ListingType,
    $minPrice: Float, 
    $maxPrice: Float,
    $minBedrooms: Int,
    $maxBedrooms: Int,
    $minBathrooms: Float,
    $maxBathrooms: Float,
    $city: String
  ) {
    properties(
      propertyType: $propertyType,
      listingType: $listingType,
      minPrice: $minPrice, 
      maxPrice: $maxPrice,
      minBedrooms: $minBedrooms,
      maxBedrooms: $maxBedrooms,
      minBathrooms: $minBathrooms,
      maxBathrooms: $maxBathrooms,
      city: $city
    ) {
      id
      title
      description
      propertyType
      listingType
      price
      area
      bedrooms
      bathrooms
      address
      city
      state
      status
      featured
      isPublished
      createdAt
      updatedAt
      owner {
        id
        name
        email
      }
      images {
        id
        imageUrl
        isPrimary
      }
    }
  }
`;

export const GET_PROPERTY = gql`
  query Property($id: Int!) {
    property(id: $id) {
      id
      title
      description
      propertyType
      listingType
      price
      area
      bedrooms
      bathrooms
      address
      city
      state
      zipCode
      status
      featured
      isPublished
      createdAt
      updatedAt
      owner {
        id
        name
        email
      }
      images {
        id
        imageUrl
        isPrimary
      }
    }
  }
`;

export const GET_USER_PROPERTIES = gql`
  query UserProperties($userId: Int!) {
    userProperties(userId: $userId) {
      id
      title
      description
      propertyType
      listingType
      price
      status
      featured
      createdAt
    }
  }
`;

export const GET_MY_PROPERTIES = gql`
  query MyProperties {
    myProperties {
      id
      title
      description
      propertyType
      listingType
      price
      area
      bedrooms
      bathrooms
      address
      city
      state
      status
      featured
      isPublished
      createdAt
      updatedAt
      images {
        id
        imageUrl
        isPrimary
      }
    }
  }
`;

export const ME_QUERY = gql`
  query Me {
    me {
      id
      name
      email
      phone
      age
      address
      isActive
      role
      createdAt
    }
  }
`;