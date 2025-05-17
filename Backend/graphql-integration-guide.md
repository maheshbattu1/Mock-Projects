# GraphQL Integration Setup Guide

This document provides detailed steps for integrating our FastAPI backend with frontend applications using GraphQL.

## Backend GraphQL Setup

The backend uses Strawberry GraphQL to define the GraphQL schema and resolvers. Here's the key setup:

## Key Components

1. **Schema Definition**: Located in `schema/schema.py`
   - Contains GraphQL types, queries, mutations, and subscriptions
   - Uses Strawberry's type-safe approach with Python type hints

2. **Database Models**: Located in `models/models.py` 
   - SQLAlchemy models that map to database tables
   - Used by resolvers to interact with the database

3. **FastAPI Integration**: In `main.py`
   - Mounts the GraphQL endpoint at `/graphql`
   - Configures CORS and authentication middleware

## Frontend Integration

### Setting up Apollo Client

1. **Install Apollo Client**:
   ```bash
   npm install @apollo/client graphql
   ```

2. **Create Apollo Client**:
   Create a file like `apolloClient.js` or use the existing `components/ApolloWrapper.tsx`:

   ```typescript
   import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
   import { setContext } from '@apollo/client/link/context';

   const httpLink = createHttpLink({
     uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:8000/graphql',
   });

   const authLink = setContext((_, { headers }) => {
     // Get authentication token from local storage or cookies
     const token = localStorage.getItem('token');
     return {
       headers: {
         ...headers,
         authorization: token ? `Bearer ${token}` : "",
       }
     };
   });

   const client = new ApolloClient({
     link: authLink.concat(httpLink),
     cache: new InMemoryCache()
   });

   export default client;
   ```

3. **Provide Apollo Client to your app**:

   ```jsx
   import { ApolloProvider } from '@apollo/client';
   import client from './apolloClient';

   function App() {
     return (
       <ApolloProvider client={client}>
         {/* Your app components */}
       </ApolloProvider>
     );
   }
   ```

### Creating Queries and Mutations

1. **Define GraphQL operations**:

   ```graphql
   // queries.js or .ts
   import { gql } from '@apollo/client';

   export const GET_PROPERTIES = gql`
     query GetProperties {
       properties {
         id
         title
         price
         location
         imageUrl
       }
     }
   `;

   export const GET_PROPERTY = gql`
     query GetProperty($id: ID!) {
       property(id: $id) {
         id
         title
         description
         price
         location
         imageUrl
         features
         owner {
           id
           name
           email
         }
       }
     }
   `;
   ```

2. **Use queries in components**:

   ```jsx
   import { useQuery } from '@apollo/client';
   import { GET_PROPERTIES } from './queries';

   function PropertyList() {
     const { loading, error, data } = useQuery(GET_PROPERTIES);

     if (loading) return <p>Loading...</p>;
     if (error) return <p>Error: {error.message}</p>;

     return (
       <div>
         {data.properties.map(property => (
           <div key={property.id}>
             <h2>{property.title}</h2>
             <p>{property.location}</p>
             <p>${property.price}</p>
           </div>
         ))}
       </div>
     );
   }
   ```

3. **Handle mutations**:

   ```jsx
   import { useMutation } from '@apollo/client';
   import { CREATE_PROPERTY } from './mutations';

   function AddProperty() {
     const [createProperty, { data, loading, error }] = useMutation(CREATE_PROPERTY);

     const handleSubmit = (event) => {
       event.preventDefault();
       createProperty({ 
         variables: { 
           input: {
             title: "New Property",
             description: "Description",
             price: 500000,
             location: "New York, NY"
           } 
         } 
       });
     };

     return (
       <form onSubmit={handleSubmit}>
         {/* Form fields */}
         <button type="submit">Add Property</button>
       </form>
     );
   }
   ```

## Authentication Flow

1. **Login mutation**:

   ```graphql
   const LOGIN_MUTATION = gql`
     mutation Login($email: String!, $password: String!) {
       login(email: $email, password: $password) {
         token
         user {
           id
           name
           email
         }
       }
     }
   `;
   ```

2. **Storing the token**:

   ```javascript
   const [login, { data }] = useMutation(LOGIN_MUTATION);

   const handleLogin = async () => {
     const response = await login({ 
       variables: { email, password } 
     });
     
     const token = response.data.login.token;
     localStorage.setItem('token', token);
     
     // Force Apollo Client to use the new token
     client.resetStore();
   };
   ```

## Error Handling

1. **Global error handling**:

   ```javascript
   import { onError } from "@apollo/client/link/error";

   const errorLink = onError(({ graphQLErrors, networkError }) => {
     if (graphQLErrors)
       graphQLErrors.forEach(({ message, locations, path }) =>
         console.error(
           `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
         )
       );
     if (networkError) console.error(`[Network error]: ${networkError}`);
   });

   // Add this to your link chain
   const client = new ApolloClient({
     link: from([errorLink, authLink.concat(httpLink)]),
     cache: new InMemoryCache()
   });
   ```

2. **Component-level error handling**:

   ```jsx
   const { loading, error, data } = useQuery(GET_PROPERTIES);
   
   if (error) {
     if (error.graphQLErrors) {
       // Handle specific GraphQL errors
     } else if (error.networkError) {
       // Handle network errors
     }
     return <ErrorDisplay error={error} />;
   }
   ```

## Performance Optimization

1. **Cache policies**:

   ```javascript
   const client = new ApolloClient({
     link: authLink.concat(httpLink),
     cache: new InMemoryCache({
       typePolicies: {
         Property: {
           fields: {
             price: {
               // Always fetch the latest price from the server
               read(price) {
                 return price;
               }
             }
           }
         }
       }
     })
   });
   ```

2. **Query batching**:

   ```javascript
   import { BatchHttpLink } from "@apollo/client/link/batch-http";

   const batchHttpLink = new BatchHttpLink({
     uri: "http://localhost:8000/graphql",
     batchMax: 5, // Maximum number of operations to batch
     batchInterval: 20 // Wait 20ms for batching
   });
   ```

## Testing

1. **Mock Apollo Provider**:

   ```jsx
   import { MockedProvider } from '@apollo/client/testing';

   const mocks = [
     {
       request: {
         query: GET_PROPERTIES,
       },
       result: {
         data: {
           properties: [
             { id: '1', title: 'House 1', price: 100000 },
             { id: '2', title: 'House 2', price: 200000 },
           ],
         },
       },
     },
   ];

   // In your test
   render(
     <MockedProvider mocks={mocks} addTypename={false}>
       <PropertyList />
     </MockedProvider>
   );
   ```
