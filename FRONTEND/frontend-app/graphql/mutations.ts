// graphql/mutations.ts
"use client"
import { gql } from '@apollo/client';

// This mutation isn't used and doesn't match the backend schema
/*
export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      success
      message
    }
  }
`;
*/

export const SIGNUP_MUTATION = gql`
  mutation Signup($name: String!, $email: String!, $password: String!, $phone: String, $age: Int, $address: String) {
    signup(userData: {
      name: $name,
      email: $email,
      password: $password,
      phone: $phone,
      age: $age,
      address: $address
    }) {
      success
      message
      token
      user {
        id
        name
        email
      }
    }
  }
`;

export const SIGNIN_MUTATION = gql`
  mutation Signin($email: String!, $password: String!) {
    signin(signinData: { email: $email, password: $password }) {
      success
      message
      token
      user {
        id
        name
        email
      }
    }
  }
`;

export const DELETE_PROPERTY = gql`
  mutation DeleteProperty($id: Int!, $ownerId: Int!) {
    deleteProperty(id: $id, ownerId: $ownerId) {
      success
      error
    }
  }
`;

export const CREATE_PROPERTY = gql`
  mutation CreateProperty($propertyData: PropertyInput!, $ownerId: Int!) {
    createProperty(propertyData: $propertyData, ownerId: $ownerId) {
      success
      property {
        id
        title
        description
        price
        address
        city
        state
      }
      error
    }
  }
`;

export const UPDATE_PROPERTY = gql`
  mutation UpdateProperty($id: Int!, $propertyData: PropertyInput!, $ownerId: Int!) {
    updateProperty(id: $id, propertyData: $propertyData, ownerId: $ownerId) {
      success
      property {
        id
        title
        description
        price
        address
        city
        state
      }
      error
    }
  }
`;

export const ADD_PROPERTY_IMAGE = gql`
  mutation AddPropertyImage($imageData: PropertyImageInput!, $ownerId: Int!) {
    addPropertyImage(imageData: $imageData, ownerId: $ownerId) {
      success
      image {
        id
        imageUrl
        isPrimary
      }
      error
    }
  }
`;

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout {
      success
      message
    }
  }
`;
