# Frontend Architecture Documentation

## Tech Stack

The frontend of Mock-Dwelzo is built with the following technologies:

| Technology | Purpose |
|------------|---------|
| **Next.js** | React framework for server-side rendering and static site generation |
| **TypeScript** | Statically typed JavaScript for improved developer experience |
| **Apollo Client** | GraphQL client for data fetching and state management |
| **Tailwind CSS** | Utility-first CSS framework for styling |
| **React Slick** | Carousel component for creating slideshows |
| **Jest** | Testing framework for unit and component tests |
| **React Testing Library** | Testing utilities for React components |

## Folder Structure & Purpose

```
FRONTEND/
└── frontend-app/
    ├── app/                    # Next.js app router pages and layouts
    │   ├── admin/              # Admin dashboard and management
    │   ├── create-property/    # Property creation flow
    │   ├── dashboard/          # User dashboard
    │   ├── login/              # Authentication
    │   ├── properties/         # Property listings and details
    │   ├── signin/             # Sign in page
    │   ├── signup/             # Sign up page    │   ├── globals.css         # Global styles
    │   ├── layout.tsx          # Root layout component
    │   ├── page.tsx            # Homepage component
    │   └── slider.css          # Styles for property slider component    ├── components/             # Reusable React components
    ├── graphql/                # GraphQL queries, mutations, fragments
    ├── lib/                    # Utility functions and helpers
    ├── public/                 # Static assets
    │   └── mostDemandable.json # Data for property slider component
    ├── next.config.js          # Next.js configuration
    ├── tailwind.config.js      # Tailwind CSS configuration
    ├── package.json            # Project dependencies
    └── tsconfig.json           # TypeScript configuration
```

### Key Files & Their Purpose

| File/Directory | Purpose |
|----------------|---------|
| **app/layout.tsx** | Root layout with global providers and structure |
| **app/page.tsx** | Homepage component and entry point |
| **components/ApolloWrapper.tsx** | Apollo Client provider setup |
| **components/AuthLayout.tsx** | Layout wrapper for auth-protected pages |
| **components/Button.tsx** | Reusable button component |
| **components/Header.tsx** | Global navigation header |
| **components/MostDemandedHomes.tsx** | Auto-scrolling property slider for homepage |
| **components/SliderArrow.tsx** | Custom navigation arrows for property slider |
| **components/PropertySkeleton.tsx** | Loading placeholders for property items |

## Integration with Backend

### GraphQL API

The frontend communicates with the backend primarily through GraphQL. The Apollo Client is configured to connect to the FastAPI GraphQL endpoint. Here's how the integration works:

1. **Apollo Client Setup**: The Apollo Client is initialized in `components/ApolloWrapper.tsx` with the backend GraphQL endpoint.

2. **Query Structure**: All GraphQL queries and mutations are stored in the `graphql/` directory, organized by feature/entity.

3. **Request Flow**:
   - Components use Apollo Client hooks (`useQuery`, `useMutation`) to fetch data
   - Requests include JWT authentication tokens in headers when authenticated
   - The backend validates tokens and processes requests
   - Responses are cached according to Apollo cache policies

### Authentication Flow

1. **User Login/Registration**:
   - User credentials are sent to the backend authentication endpoints
   - Backend validates and returns JWT tokens
   - Tokens are stored in local storage or cookies for persistence

2. **Protected Routes**:
   - `AuthLayout.tsx` wraps protected routes
   - Checks for valid tokens before rendering
   - Redirects to login page if authentication fails

3. **Token Refresh**:
   - Auto-refresh of tokens is handled through Apollo Client middleware
   - Silent token refresh happens in the background

### Apollo Client Configuration

```typescript
// From components/ApolloWrapper.tsx
const client = new ApolloClient({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:8000/graphql',
  cache: new InMemoryCache(),
  headers: {
    // Include authentication token if available
    authorization: getAuthToken() ? `Bearer ${getAuthToken()}` : '',
  },
  // Error handling and token refresh logic
  defaultOptions: {
    // Query and mutation options...
  }
});
```

### Data Fetching Patterns

1. **Server Components**:
   - Use direct GraphQL fetching with fetch API
   - Pre-fetch critical data during server rendering

2. **Client Components**:
   - Use Apollo Client hooks for reactive data
   - Handle loading, error, and success states

3. **Forms and Mutations**:
   - Form data is collected and validated with client-side validation
   - Mutations are executed through Apollo Client
   - UI is updated based on mutation results

4. **Optimistic Updates**:
   - UI is updated immediately before server confirmation
   - Rolled back if the server returns an error

5. **Image Upload**:
   - Images are uploaded directly to the backend
   - Backend handles S3 storage and returns URLs

## Deployment

### Production Deployment

#### Prerequisites

- Node.js 16+ environment
- Access to hosting platform (Vercel, Netlify, AWS, etc.)
- Environment variables configured for production

#### Vercel Deployment (Recommended)

1. **Connect repository to Vercel**:
   - Link GitHub/GitLab/Bitbucket repository
   - Configure build settings:
     - Build command: `npm run build`
     - Output directory: `.next`

2. **Configure environment variables**:
   - Add all variables from `.env.example` with production values
   - Set `NEXT_PUBLIC_GRAPHQL_ENDPOINT` to production API URL

3. **Deploy**:
   - Vercel will automatically build and deploy on push to main branch
   - Configure preview deployments for pull requests

#### Manual Deployment

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Start the production server**:
   ```bash
   npm run start
   ```

3. **Or export as static site** (if not using server-side features):
   ```bash
   next export
   ```

4. **Serve with Nginx or other web server**:
   - Configure proper caching headers
   - Set up SSL
   - Configure routing

### CI/CD Pipeline

A typical CI/CD pipeline for the frontend should include:

1. **Linting and Testing**:
   ```bash
   npm run lint
   npm run test
   ```

2. **Type Checking**:
   ```bash
   tsc --noEmit
   ```

3. **Build**:
   ```bash
   npm run build
   ```

4. **Deployment**:
   - Deploy to staging environment for testing
   - Deploy to production after approval

### Performance Considerations

- Enable static site generation where possible
- Utilize Incremental Static Regeneration for dynamic content
- Configure proper caching strategies
- Optimize image loading with Next.js Image component
- Implement code splitting to reduce bundle size

## Integration with Backend

### GraphQL API
- Frontend queries and mutations in `graphql/` directory align with backend's GraphQL schema
- Key operations include user authentication, property management, and data fetching

### Authentication Flow
- Authentication is handled in `lib/auth.ts` (storing tokens, checking user sessions)
- `AuthLayout.tsx` component redirects unauthenticated users to login page
- Protected routes like dashboard use AuthLayout to enforce authentication

### Apollo Client Configuration
- Apollo Client is set up in `ApolloWrapper.tsx`
- Configured to include access tokens in headers for authenticated requests
- Manages GraphQL operations, caching, and state

### Data Fetching
- Components use GraphQL queries to fetch data from the backend
- Implements error handling and loading states
- Examples: MostDemandedHomes.tsx and UserCard.tsx
| **components/PropertiesTable.tsx** | Table for displaying property listings |
| **graphql/** | GraphQL operation definitions |
| **lib/apollo-client.ts** | Apollo Client configuration |
| **lib/auth.ts** | Authentication utilities |

## Code Flow

The application follows this typical flow:

1. **Initialization**:
   - Next.js initializes the application
   - `app/layout.tsx` sets up global providers (Apollo, Auth)
   - Root layout renders common elements (Header, Footer)

2. **Authentication**:
   - User logs in through `/signin` or `/signup` pages
   - JWT token is stored in localStorage or secure cookie
   - `ApolloWrapper.tsx` adds auth token to GraphQL requests

3. **Data Fetching**:
   - Components use Apollo Client hooks (`useQuery`, `useMutation`)
   - Data is fetched from the backend GraphQL API
   - Server components may fetch data during server-side rendering

4. **Rendering**:
   - Pages render with data from Apollo Client cache
   - Tailwind CSS provides styling
   - Components handle user interactions

5. **State Management**:
   - Apollo Client cache serves as main state store
   - React state handles UI-specific state
   - Form state managed with controlled components

6. **Navigation**:
   - Next.js handles client-side navigation
   - `AuthLayout` protects routes requiring authentication
   - Admin routes check for admin role

## Pros and Cons

### Pros

1. **Performance**:
   - Next.js provides server-side rendering for fast initial load
   - Apollo Client caches GraphQL responses locally
   - Optimized bundle sizes with automatic code splitting

2. **Developer Experience**:
   - TypeScript provides type safety and autocompletion
   - Component-based architecture promotes reusability
   - Hot module replacement for quick development iterations

3. **User Experience**:
   - Fast page transitions with client-side navigation
   - Responsive design with Tailwind CSS
   - Optimized images and assets

4. **Maintainability**:
   - Clear folder structure separates concerns
   - Consistent coding patterns
   - Comprehensive test coverage

### Cons

1. **Complexity**:
   - Apollo Client has a learning curve
   - TypeScript requires type definitions maintenance
   - Next.js App Router introduces new patterns to learn

2. **Build Time**:
   - TypeScript compilation adds to build time
   - Large projects may experience slower development server startup

3. **Apollo Cache Management**:
   - Cache normalization and updates can be complex
   - Manual cache manipulation sometimes required

4. **SEO Limitations**:
   - Dynamic content may require special handling for SEO
   - SSR/SSG configuration needs careful planning

## Key Features

1. **Property Search and Filtering**:
   - Search by location, price, property type
   - Filtering and sorting options
   - Map-based property browsing

2. **Featured Properties Slider**:
   - Auto-scrolling carousel display of most demanded properties
   - Responsive design that adapts to screen sizes
   - Smooth transitions with React Slick
   - Loading skeleton placeholders for better UX
   - Custom navigation arrows

3. **User Authentication**:
   - Sign up, sign in, password reset
   - Social authentication options
   - Role-based access control

3. **Property Management**:
   - Create, edit, delete property listings
   - Image upload and management
   - Property status tracking

4. **User Dashboard**:
   - Saved properties
   - Viewing history
   - User profile management

5. **Admin Features**:
   - User management
   - Property approval workflow
   - Analytics and reporting

## Component Design Patterns

The frontend follows these key design patterns:

1. **Composition over Inheritance**:
   - Small, focused components composed together
   - Higher-order components used sparingly

2. **Container/Presentational Pattern**:
   - Container components handle data fetching and logic
   - Presentational components focus on UI rendering

3. **Hooks for State and Effects**:
   - Custom hooks encapsulate reusable logic
   - React hooks manage component state and side effects

4. **Render Props and Composition**:
   - Flexible component APIs through render props
   - Component composition for complex UIs

## Component Implementation Examples

### Property Slider Implementation

The MostDemandedHomes component implements an auto-scrolling carousel with the following features:

```typescript
// Slider configuration
const settings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 3,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 3000,
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1,
      },
    },
    {
      breakpoint: 640,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
      },
    },
  ],
};
```

Key implementation details:
- Uses React Slick for carousel functionality
- Implements loading skeletons for better UX
- Dynamically fetches property data from JSON file
- Includes responsive design for different screen sizes
- Custom navigation arrows through SliderArrow component

## Data Flow

1. **Apollo Client GraphQL Data Flow**:
   - Components request data using GraphQL queries
   - Apollo Client checks cache for existing data
   - If not in cache, request is sent to GraphQL server
   - Response is cached and provided to components
   - Cache is updated when mutations occur

2. **Form Data Flow**:
   - Forms collect user input
   - Validation occurs on input change or submission
   - Form data is sent to backend via GraphQL mutations
   - UI updates based on mutation response

## Environment Setup Requirements

To run the frontend, you need:

1. Node.js 16+ installed
2. Backend API running (see Backend documentation)
3. Environment variables in `.env.local`:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_GRAPHQL_URL=http://localhost:8000/graphql
   ```

## Running the Application

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

4. Run production build:
   ```bash
   npm start
   ```

5. Run tests:
   ```bash
   npm test
   ```

## Common Issues and Troubleshooting

### 1. Network Connection Errors

If you encounter `Failed to load resource: net::ERR_CONNECTION_REFUSED` or `Failed to fetch` errors:
- Check if the backend server is running
- Verify the GraphQL endpoint URL in `ApolloWrapper.tsx` 
- Ensure environment variables are set correctly (`NEXT_PUBLIC_GRAPHQL_URL`)
- Check for CORS configuration issues in the backend

### 2. Apollo Client Errors

For GraphQL-related errors:
- Check the GraphQL query syntax
- Verify that your query matches the schema on the backend
- Inspect the network tab in browser dev tools for detailed error responses
- Verify authentication token is being included in requests

### 3. Component Rendering Issues

If components are not rendering as expected:
- Check for loading states and error handling
- Verify data is being fetched correctly
- Inspect component props in React DevTools
- Check for CSS conflicts or missing styles

### 4. Image Loading Problems

For image-related issues:
- Verify image URLs in the data files are accessible
- Use Next.js Image component for optimized loading
- Implement error fallbacks for broken images
- Check console for 404 errors related to image assets

## Testing Strategy

1. **Unit Tests**:
   - Test individual utility functions
   - Isolated component testing

2. **Component Tests**:
   - Test component rendering and interaction
   - Mock Apollo Client responses

3. **Integration Tests**:
   - Test multiple components working together
   - Test data flow between components

4. **End-to-End Tests**:
   - Test complete user flows
   - Simulate real user interactions

## Best Practices

1. **Code Structure**:
   - Consistent naming conventions
   - Component co-location (CSS, tests alongside components)
   - Clear separation of concerns

2. **Performance**:
   - Lazy loading for routes and large components
   - Memoization of expensive computations
   - Image optimization

3. **Accessibility**:
   - Semantic HTML
   - ARIA attributes where needed
   - Keyboard navigation support

4. **Security**:
   - Sanitize user inputs
   - Protect against XSS attacks
   - Secure handling of authentication tokens

## Extending the Frontend

When adding new features:

1. Create necessary GraphQL operations in `graphql/` directory
2. Add new components in `components/` directory
3. Create new pages in the appropriate `app/` directory
4. Update tests to cover new functionality
