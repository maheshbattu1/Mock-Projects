# Mock-Dwelzo

A modern real estate platform with FastAPI backend and Next.js frontend.

## Project Structure

This repository contains two main components:

- **Backend**: A FastAPI application with GraphQL, PostgreSQL, Redis, and AWS S3 integration
- **Frontend**: A Next.js application with Apollo Client for GraphQL integration

For detailed documentation about each component:
- [Backend Architecture Documentation](Backend/ARCHITECTURE.md)
- [Frontend Architecture Documentation](FRONTEND/ARCHITECTURE.md)

## Backend Features

- **FastAPI** with **Strawberry GraphQL** for API endpoints
- **PostgreSQL** database integration via SQLAlchemy
- **Redis** caching system for improved performance
- **AWS S3** integration for property image storage
- JWT-based authentication
- Rate limiting middleware

## Frontend Features

- **Next.js** with TypeScript for type-safe development
- **Apollo Client** for GraphQL data fetching
- **Tailwind CSS** for styling
- Responsive design for mobile and desktop
- Property listing and management interface

## Setup & Installation

### Prerequisites

- Python 3.8+ for backend
- Node.js 16+ for frontend
- PostgreSQL database
- Redis server
- AWS account with S3 bucket (for production)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd Backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   .\venv\Scripts\Activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials and other settings
   ```

5. Run the server:
   ```bash
   python main.py
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd FRONTEND/frontend-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your backend API URL and other settings
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Access the application:
   ```
   http://localhost:3000
   ```

## Deployment

See detailed deployment instructions in:
- [Backend Deployment Guide](Backend/ARCHITECTURE.md#deployment)
- [Frontend Deployment Guide](FRONTEND/ARCHITECTURE.md#deployment)

## Development Workflow

### Git Repository Setup

1. Initialize the repository:
   ```bash
   git init
   ```

2. Add pre-commit hook for code quality:
   ```bash
   cp pre-commit-hook .git/hooks/pre-commit
   chmod +x .git/hooks/pre-commit
   ```

3. Stage and commit files:
   ```bash
   git add .
   git commit -m "Initial commit of Mock-Dwelzo platform"
   ```

4. Connect to remote repository:
   ```bash
   git remote add origin https://github.com/your-username/Mock-Dwelzo.git
   git push -u origin main
   ```

### Docker Development Environment

You can use Docker Compose to run the entire stack:

```bash
docker-compose up -d
```

This will start:
- Backend API on port 8000
- Frontend on port 3000
- PostgreSQL database on port 5432
- Redis on port 6379

### Testing

1. Backend tests:
   ```bash
   cd Backend
   python -m pytest
   ```

2. Frontend tests:
   ```bash
   cd FRONTEND/frontend-app
   npm test
   ```

## Additional Documentation

- [GraphQL Integration Guide](Backend/graphql-integration-guide.md)
- [Backend Architecture](Backend/ARCHITECTURE.md)
- [Frontend Architecture](FRONTEND/ARCHITECTURE.md)

## Getting Started

### Backend Setup

1. Navigate to the Backend directory:
   ```
   cd Backend
   ```

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Configure environment variables:
   ```
   cp .env.example .env
   ```
   Then edit `.env` with your database and AWS credentials.

4. Run the development server:
   ```
   python main.py
   ```

### Frontend Setup

1. Navigate to the Frontend directory:
   ```
   cd FRONTEND/frontend-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

## Monitoring Tools

The backend includes several monitoring tools:

- **Redis Monitor**: `python redis_monitor.py`
- **FastAPI Cache Monitor**: `python fastapi_cache_monitor.py`
- **Cache Manager**: `python utils/cache_manager.py stats`
