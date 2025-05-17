from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from strawberry.fastapi import GraphQLRouter
from schema.schema import schema, CustomContext
from sqlalchemy.orm import Session
from db.database import get_db, engine
from db.redis_config import init_redis_cache
from middleware.rate_limiter import RateLimitMiddleware
from routes.image_upload import router as image_router
from routes.cache_admin import router as cache_admin_router
from models.models import Base
import os
import traceback
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create a FastAPI app
app = FastAPI(title="Backend API", description="FastAPI + Strawberry GraphQL + PostgreSQL Backend")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
    expose_headers=["Content-Type"]
)

# Add rate limiting middleware
app.add_middleware(
    RateLimitMiddleware,
    rate_limit=100,  # 100 requests per minute
    window=60        # 1 minute window
)

# Try to create database tables, with error handling
try:
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully.")
except Exception as e:
    print(f"Error creating database tables: {e}")
    print(traceback.format_exc())

# Create a context dependency for GraphQL
async def get_context(request: Request):
    return CustomContext(request=request)

# Create GraphQL router with context
graphql_app = GraphQLRouter(
    schema,
    context_getter=get_context,
)

# Add GraphQL route
app.include_router(graphql_app, prefix="/graphql")

# Add image upload routes
app.include_router(image_router, prefix="/api/images", tags=["images"])

# Add cache admin routes
app.include_router(cache_admin_router, prefix="/api/cache", tags=["cache"])

# Initialize Redis cache
try:
    init_redis_cache(app)
except Exception as e:
    print(f"Warning: Redis cache initialization failed: {e}")
    print("The application will continue to run without caching.")
    print("To enable caching, please ensure Redis is running:")
    print("  docker run --name my-redis -p 6379:6379 -d redis")

@app.get("/")
async def root():
    return {"message": "Welcome to the FastAPI + Strawberry GraphQL + PostgreSQL Backend"}

@app.get("/health")
async def health_check():
    try:
        # Try to get a database connection
        db = next(get_db())
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"message": f"An error occurred: {str(exc)}"},
    )

if __name__ == "__main__":
    import uvicorn
    debug = os.getenv("DEBUG", "False").lower() == "true"
    uvicorn.run("main:app", host="localhost", port=8000, reload=debug)