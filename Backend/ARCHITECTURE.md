# Backend Architecture Documentation

## Tech Stack

The backend of Mock-Dwelzo is built with the following technologies:

| Technology | Purpose |
|------------|---------|
| **FastAPI** | High-performance web framework for building APIs with Python |
| **Strawberry GraphQL** | Type-safe GraphQL library for Python |
| **PostgreSQL** | Relational database for storing property and user data |
| **SQLAlchemy** | ORM (Object-Relational Mapping) for database operations |
| **Redis** | In-memory data store for caching and session management |
| **AWS S3** | Cloud storage for property images |
| **JWT** | Authentication using JSON Web Tokens |

## Features

- FastAPI for high-performance REST endpoints
- Strawberry GraphQL for GraphQL schema and resolvers
- PostgreSQL database with SQLAlchemy ORM
- Redis caching for improved performance 
- AWS S3 integration for property image storage
- User authentication with JWT
- Rate limiting for API protection
- Comprehensive caching system with monitoring tools

## Setup & Installation

### Prerequisites

- Python 3.8+
- PostgreSQL installed and running
- Redis server for caching
- AWS account with S3 bucket (for production)

### Installation Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/Mock-Dwelzo.git
   cd Mock-Dwelzo/Backend
   ```

2. **Create a virtual environment**:
   ```bash
   python -m venv venv
   .\venv\Scripts\Activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**:
   - Copy `.env.example` to `.env`
   - Update the values with your database credentials and S3 settings

5. **Initialize the database**:
   ```bash
   python init_db.py
   ```

6. **Run the application**:
   ```bash
   python main.py
   ```

7. **Access the API**:
   - GraphQL playground: `http://localhost:8000/graphql`
   - API documentation: `http://localhost:8000/docs`

## Deployment

### Production Prerequisites

- Linux server (Ubuntu 20.04 LTS recommended)
- Docker and Docker Compose
- Domain name with SSL certificate
- AWS account with configured IAM permissions for S3
- PostgreSQL database (can be managed service or self-hosted)
- Redis instance (can be managed service or self-hosted)

### Deployment Options

#### Docker Deployment

1. **Build the Docker image**:
   ```bash
   docker build -t mock-dwelzo-backend .
   ```

2. **Run with Docker Compose**:
   Create a `docker-compose.yml` file with services for:
   - Backend API
   - PostgreSQL (if not using managed service)
   - Redis (if not using managed service)

3. **Set up environment variables**:
   - Create a production `.env` file
   - Use Docker secrets or environment variables for sensitive information

4. **Configure Nginx as reverse proxy**:
   - Set up SSL termination
   - Configure caching headers
   - Forward requests to the backend container

#### Traditional Deployment

1. **Set up Python environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

2. **Configure Gunicorn**:
   ```bash
   gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
   ```

3. **Set up systemd service**:
   Create a service file for automatic startup and management

4. **Configure Nginx**:
   - Set up as reverse proxy
   - Configure SSL
   - Set appropriate headers

### Monitoring and Maintenance

- Use the included Redis monitoring tools (`redis_monitor.py` and `fastapi_cache_monitor.py`)
- Set up logging to a centralized service
- Configure health check endpoints
- Implement backup strategy for database

## Folder Structure & Purpose

```
Backend/
├── auth/                      # Authentication and authorization
├── db/                        # Database and Redis configuration
├── middleware/                # Custom middleware (rate limiting, etc.)
├── models/                    # SQLAlchemy data models
├── routes/                    # API endpoints (REST)
├── schema/                    # GraphQL schema definitions
├── services/                  # External service integrations (S3, etc.)
├── utils/                     # Utility functions and helpers
├── main.py                    # Application entry point
├── requirements.txt           # Python dependencies
├── init_db.py                 # Database initialization script
└── .env                       # Environment variables (not in version control)
```

### Key Files & Their Purpose

| File/Directory | Purpose |
|----------------|---------|
| **auth/auth_utils.py** | JWT token generation, validation, password hashing |
| **auth/admin_utils.py** | Admin role verification utilities |
| **db/database.py** | Database connection and session management |
| **db/redis_config.py** | Redis connection setup and configuration |
| **db/redis_utils.py** | Redis operations (get, set, delete) |
| **middleware/rate_limiter.py** | API rate limiting to prevent abuse |
| **models/models.py** | SQLAlchemy models for database tables |
| **routes/image_upload.py** | REST endpoints for S3 image operations |
| **routes/cache_admin.py** | Admin endpoints for cache management |
| **schema/schema.py** | GraphQL schema with queries and mutations |
| **services/s3_service.py** | AWS S3 integration for image storage |
| **utils/cache_decorators.py** | Decorators for Redis caching |
| **utils/cache_metrics.py** | Tracking cache performance metrics |
| **main.py** | Application startup, middleware setup, route registration |
| **redis_monitor.py** | Utility for monitoring Redis cache status |
| **fastapi_cache_monitor.py** | Tool for monitoring FastAPI's cache |

## Code Flow

The application follows this typical request flow:

1. **Request Initialization**:
   - Client sends a request to the FastAPI server
   - Middleware processes the request (CORS, rate limiting)

2. **Authentication**:
   - Token is extracted from Authorization header
   - JWT is verified using `auth_utils.py`
   - User identity is established through `get_current_user(token, db)` function
   - Token validation includes checking Redis for stored session tokens

3. **Request Handling**:
   - For GraphQL: Request is routed to Strawberry schema processor
   - For REST: Request is routed to appropriate router function
   - Cache is checked for existing response (Redis)

4. **Data Processing**:
   - SQLAlchemy queries the PostgreSQL database
   - Results are transformed to GraphQL/REST response format
   - For image uploads: Files are processed and sent to S3

5. **Response Generation**:
   - Response is cached in Redis (if cacheable)
   - Data is returned to client as JSON

6. **Background Processing**:
   - Cache statistics are updated
   - Rate limiting counters are adjusted

## Pros and Cons

### Pros

1. **Performance**:
   - FastAPI provides high throughput
   - Redis caching reduces database load
   - GraphQL allows clients to request only needed fields

2. **Developer Experience**:
   - Type hints throughout the codebase
   - Automatic API documentation via Swagger/OpenAPI
   - Modular architecture for easy maintenance

3. **Scalability**:
   - Stateless design allows horizontal scaling
   - Redis can be configured as a distributed cache
   - S3 handles large files independently of application servers

4. **Security**:
   - JWT-based authentication
   - Role-based access control
   - Rate limiting prevents abuse

### Cons

1. **Complexity**:
   - Multiple layers (GraphQL + REST) increase codebase complexity
   - Redis adds another infrastructure component to maintain
   - Requires understanding of multiple technologies

2. **Cache Invalidation**:
   - Keeping cache and database in sync is challenging
   - Risk of serving stale data if not properly managed

3. **Development Dependencies**:
   - Requires local PostgreSQL and Redis for development
   - AWS credentials needed for S3 functionality

4. **Learning Curve**:
   - Strawberry GraphQL has a steeper learning curve than REST-only
   - Understanding SQLAlchemy ORM relationships takes time

## Common Issues and Troubleshooting

### 1. GraphQL Authentication Errors

If you encounter the error `'Session' object has no attribute 'rsplit'` or similar authentication issues:
- Check the parameter order in `get_current_user` function calls in schema.py
- Ensure parameters are passed in the correct order: `get_current_user(token, db)` not `get_current_user(db, token)`
- Verify token format in the Authorization header (should be "Bearer {token}")

### 2. Connection Errors

If you see `Failed to load resource: net::ERR_CONNECTION_REFUSED` or `Failed to fetch` errors:
- Verify the backend server is running on the expected port (8000 by default)
- Check CORS configuration in main.py to allow requests from frontend origin
- Ensure environment variables are correctly set in frontend app for API endpoints

### 3. Redis Connection Issues

If Redis connection fails:
- Check if Redis server is running (`redis-cli ping` should return "PONG")
- Verify Redis connection parameters in .env file
- For Windows users, ensure Redis Windows service is running

### 4. Database Connection Problems

If database connections fail:
- Run `python test_db_connection.py` to verify database connectivity
- Check PostgreSQL service status
- Verify database credentials in .env file

## Environment Setup Requirements

To run the backend, you need:

1. Python 3.8+ installed
2. PostgreSQL database
3. Redis server (or Docker container)
4. AWS S3 bucket and credentials
5. Environment variables set in `.env` file:
   ```
   DATABASE_URL=postgresql://username:password@localhost/dbname
   REDIS_HOST=localhost
   REDIS_PORT=6379
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_REGION=us-east-1
   S3_BUCKET_NAME=your-bucket-name
   SECRET_KEY=your_jwt_secret
   ```

## Running the Application

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Initialize the database:
   ```bash
   python init_db.py
   ```

3. Start the server:
   ```bash
   python main.py
   ```

4. Access the GraphQL playground at http://localhost:8000/graphql
   
5. Access the OpenAPI documentation at http://localhost:8000/docs

## Monitoring and Debugging

1. Redis cache monitoring:
   ```bash
   python redis_monitor.py
   ```

2. FastAPI cache metrics:
   ```bash
   python fastapi_cache_monitor.py
   ```

3. Database schema recreation (caution - data loss):
   ```bash
   python recreate_tables.py
   ```

## Extending the Backend

When adding new features:

1. Add SQLAlchemy models in `models/models.py`
2. Update GraphQL schema in `schema/schema.py`
3. Add REST endpoints in `routes/` directory if needed
4. Run `recreate_tables.py` to update database schema
