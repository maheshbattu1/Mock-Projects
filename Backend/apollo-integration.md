# Apollo Client Integration Guide

This document provides guidance on how to integrate your FastAPI + Strawberry GraphQL backend with Apollo Client.

## Setup

### 1. Install Apollo Client in your frontend project

For React:
```bash
npm install @apollo/client graphql
```

For other frameworks:
- Vue: `npm install @vue/apollo-option graphql`
- Angular: `ng add apollo-angular`

### 2. Configure Apollo Client

Create an Apollo Client instance that connects to your backend:

```javascript
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

// Create a link to your backend
const httpLink = createHttpLink({
  uri: 'http://localhost:8080/graphql',
  // For production, use your deployed backend URL
  // uri: 'https://your-api.example.com/graphql',
});

// Create the Apollo Client
const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache()
});

export default client;
```

### 3. Set up Apollo Provider

#### React

```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from '@apollo/client';
import client from './apolloClient';
import App from './App';

ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById('root')
);
```

#### Vue

```javascript
import { createApp } from 'vue';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { createApolloProvider } from '@vue/apollo-option';
import App from './App.vue';

const apolloClient = new ApolloClient({
  uri: 'http://localhost:8080/graphql',
  cache: new InMemoryCache(),
});

const apolloProvider = createApolloProvider({
  defaultClient: apolloClient,
});

const app = createApp(App);
app.use(apolloProvider);
app.mount('#app');
```

## Using Apollo Client with Your API

### Fetch Users

```javascript
import { useQuery, gql } from '@apollo/client';

// Define your query
const GET_USERS = gql`
  query GetUsers {
    users {
      id
      name
      email
      age
      address
    }
  }
`;

// Use the query in a component
function UsersList() {
  const { loading, error, data } = useQuery(GET_USERS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h2>Users</h2>
      <ul>
        {data.users.map(user => (
          <li key={user.id}>
            {user.name} - {user.email}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Fetch a Single User

```javascript
const GET_USER = gql`
  query GetUser($id: Int!) {
    user(id: $id) {
      id
      name
      email
      age
      address
      items {
        id
        title
        description
      }
    }
  }
`;

function UserDetails({ userId }) {
  const { loading, error, data } = useQuery(GET_USER, {
    variables: { id: userId },
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!data.user) return <p>User not found</p>;

  return (
    <div>
      <h2>{data.user.name}</h2>
      <p>Email: {data.user.email}</p>
      {data.user.age && <p>Age: {data.user.age}</p>}
      {data.user.address && <p>Address: {data.user.address}</p>}
      
      <h3>User Items</h3>
      {data.user.items.length > 0 ? (
        <ul>
          {data.user.items.map(item => (
            <li key={item.id}>
              <strong>{item.title}</strong>
              <p>{item.description}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No items found</p>
      )}
    </div>
  );
}
```

### Create a New User

```javascript
import { useMutation, gql } from '@apollo/client';

const CREATE_USER = gql`
  mutation CreateUser($name: String!, $email: String!, $age: Int, $address: String) {
    createUser(
      userData: { 
        name: $name, 
        email: $email, 
        age: $age, 
        address: $address 
      }
    ) {
      success
      user {
        id
        name
        email
      }
      error
    }
  }
`;

function CreateUserForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    address: ''
  });
  
  const [createUser, { loading, error, data }] = useMutation(CREATE_USER);

  const handleSubmit = (e) => {
    e.preventDefault();
    createUser({ 
      variables: { 
        name: formData.name, 
        email: formData.email, 
        age: formData.age ? parseInt(formData.age) : null, 
        address: formData.address || null 
      } 
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      <h2>Create New User</h2>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {data?.createUser && (
        <div>
          {data.createUser.success ? (
            <p>User created successfully: {data.createUser.user.name}</p>
          ) : (
            <p>Error: {data.createUser.error}</p>
          )}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Name:</label>
          <input 
            type="text" 
            id="name" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            required 
          />
        </div>
        
        <div>
          <label htmlFor="email">Email:</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            value={formData.email} 
            onChange={handleChange} 
            required 
          />
        </div>
        
        <div>
          <label htmlFor="age">Age:</label>
          <input 
            type="number" 
            id="age" 
            name="age" 
            value={formData.age} 
            onChange={handleChange} 
          />
        </div>
        
        <div>
          <label htmlFor="address">Address:</label>
          <input 
            type="text" 
            id="address" 
            name="address" 
            value={formData.address} 
            onChange={handleChange} 
          />
        </div>
        
        <button type="submit" disabled={loading}>Create User</button>
      </form>
    </div>
  );
}
```

### Create a New Item

```javascript
import { useMutation, gql } from '@apollo/client';

const CREATE_ITEM = gql`
  mutation CreateItem($title: String!, $description: String!, $ownerId: Int!) {
    createItem(
      itemData: { 
        title: $title, 
        description: $description, 
        ownerId: $ownerId 
      }
    ) {
      success
      item {
        id
        title
        description
        owner {
          name
        }
      }
      error
    }
  }
`;

function CreateItemForm({ userId }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  
  const [createItem, { loading, error, data }] = useMutation(CREATE_ITEM);

  const handleSubmit = (e) => {
    e.preventDefault();
    createItem({ 
      variables: { 
        title: formData.title, 
        description: formData.description, 
        ownerId: userId
      } 
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      <h2>Create New Item</h2>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {data?.createItem && (
        <div>
          {data.createItem.success ? (
            <p>Item created successfully: {data.createItem.item.title}</p>
          ) : (
            <p>Error: {data.createItem.error}</p>
          )}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Title:</label>
          <input 
            type="text" 
            id="title" 
            name="title" 
            value={formData.title} 
            onChange={handleChange} 
            required 
          />
        </div>
        
        <div>
          <label htmlFor="description">Description:</label>
          <textarea 
            id="description" 
            name="description" 
            value={formData.description} 
            onChange={handleChange} 
            required 
          />
        </div>
        
        <button type="submit" disabled={loading}>Create Item</button>
      </form>
    </div>
  );
}
```

## Advanced Features

### Adding Authentication

If you implement authentication in your backend, you can set up Apollo Client to include the authentication token in all requests:

```javascript
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: 'http://localhost:8080/graphql',
});

const authLink = setContext((_, { headers }) => {
  // Get the authentication token from local storage if it exists
  const token = localStorage.getItem('token');
  
  // Return the headers to the context so httpLink can read them
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
```

### Handling Errors

Apollo Client provides tools for error handling and retries:

```javascript
import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';

const httpLink = createHttpLink({
  uri: 'http://localhost:8080/graphql',
});

// Log any GraphQL errors or network error that occurred
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    );

  if (networkError) console.log(`[Network error]: ${networkError}`);
});

const client = new ApolloClient({
  link: from([errorLink, httpLink]),
  cache: new InMemoryCache()
});
```

## Cache Management

Apollo Client's cache helps improve performance and user experience:

```javascript
// Update cache after mutation
const [createUser] = useMutation(CREATE_USER, {
  update(cache, { data: { createUser } }) {
    if (createUser.success) {
      cache.modify({
        fields: {
          users(existingUsers = []) {
            const newUserRef = cache.writeFragment({
              data: createUser.user,
              fragment: gql`
                fragment NewUser on User {
                  id
                  name
                  email
                }
              `
            });
            return [...existingUsers, newUserRef];
          }
        }
      });
    }
  }
});
```

## Further Resources

1. [Apollo Client Documentation](https://www.apollographql.com/docs/react/)
2. [GraphQL Documentation](https://graphql.org/learn/)
3. [React Hooks for Apollo](https://www.apollographql.com/docs/react/api/react/hooks/)