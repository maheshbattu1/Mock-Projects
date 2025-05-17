# Mock-Dwelzo Frontend

This is the frontend application for the Mock-Dwelzo real estate platform, built with Next.js and TypeScript.

## Getting Started

### Prerequisites

- Node.js 16 or later
- npm or yarn
- Backend API running (see main project README)

### Development Setup

1. Install dependencies:

```bash
npm install
# or
yarn install
```

2. Set up environment variables:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```
NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://localhost:8000/graphql
NEXT_PUBLIC_API_URL=http://localhost:8000
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Key Features

- Property listing and search
- User authentication and profiles
- Property management for owners
- Admin dashboard
- Responsive design for mobile and desktop

## Project Structure

Refer to the [Frontend Architecture Documentation](../ARCHITECTURE.md) for detailed information about the project structure and architectural decisions.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

## Integration with Backend

This frontend connects to the Mock-Dwelzo backend API through GraphQL using Apollo Client. See the [Backend Documentation](../../Backend/ARCHITECTURE.md) for API details.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
